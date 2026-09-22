import React, { useState, useEffect, useMemo } from 'react';
import { getAllStores, createStore, deleteStore } from '../api';

// Exported helper function to evaluate open/closed status
export const isStoreOpen = (openTimeStr, closeTimeStr) => {
  // If no time strings exist in DB, treat store as closed by default
  if (!openTimeStr || !closeTimeStr) return false;

  const pktDate = new Date();
  const pktHour = parseInt(
    pktDate.toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hourCycle: 'h23', hour: '2-digit' }),
    10
  );
  const pktMinute = parseInt(
    pktDate.toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', minute: '2-digit' }),
    10
  );
  const currentMinutes = pktHour * 60 + pktMinute;

  // Extract hours and minutes reliably
  const openParts = openTimeStr.split(':').map(Number);
  const closeParts = closeTimeStr.split(':').map(Number);

  if (openParts.length < 2 || closeParts.length < 2) return false;

  const openMinutes = openParts[0] * 60 + openParts[1];
  const closeMinutes = closeParts[0] * 60 + closeParts[1];

  // Standard daytime operating hours (e.g., 09:00 to 13:00 or 09:00 to 21:00)
  if (openMinutes < closeMinutes) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  // Overnight operating hours (e.g., 18:00 to 02:00)
  return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
};

// Helper function to format time strings for 12-hour AM/PM UI display
const formatTo12Hour = (timeStr, fallbackDisplay = 'N/A') => {
  if (!timeStr) return fallbackDisplay;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return fallbackDisplay;

  const period = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 || 12;
  const displayMinutes = m < 10 ? `0${m}` : m;
  return `${displayHours}:${displayMinutes} ${period}`;
};

const getUserInfoFromStorage = () => {
  try {
    const rawData = localStorage.getItem('user');
    if (!rawData) return { activeUserId: null, userRole: '', rawRole: '' };

    const parsed = JSON.parse(rawData);
    const targetObj = parsed?.user || parsed;

    const activeUserId = targetObj?.userId || targetObj?.id || targetObj?._id || null;
    let role = targetObj?.role || targetObj?.userType || '';

    if (Array.isArray(role)) role = role[0] || '';

    if (!role && targetObj?.token) {
      try {
        const base64Url = targetObj.token.split('.')[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);
          role = decoded?.role || decoded?.roles || decoded?.authorities || '';
          if (Array.isArray(role)) role = role[0] || '';
        }
      } catch (tokenErr) {
        console.error('Error decoding JWT token:', tokenErr);
      }
    }

    const cleanRole = String(role).trim().toLowerCase().replace(/^role_/, '');
    return { activeUserId, userRole: cleanRole, rawRole: role };
  } catch (err) {
    console.error('Error parsing user from localStorage:', err);
    return { activeUserId: null, userRole: '', rawRole: '' };
  }
};

function Dashboard({ onSelectStore }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreDescription, setNewStoreDescription] = useState('');
  const [newStoreType, setNewStoreType] = useState('');
  const [newStoreImage, setNewStoreImage] = useState('');

  const [newOpenTime, setNewOpenTime] = useState('09:00');
  const [newCloseTime, setNewCloseTime] = useState('21:00');

  const [failedImages, setFailedImages] = useState({});
  const [, setTick] = useState(0);

  const { activeUserId, userRole } = getUserInfoFromStorage();

  // Updated role checks: Included 'manager' alongside 'admin' and 'owner'
  const isStaffOrManagement = userRole === 'admin' || userRole === 'owner' || userRole === 'manager';
  const canCreateStore = isStaffOrManagement;

  useEffect(() => {
    let isMounted = true;

    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await getAllStores();
        if (isMounted) {
          setStores(response.data || []);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch stores:', err);
        if (isMounted) setError('Could not load stores from backend.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStores();

    // Re-render every 60 seconds to automatically flip stores to "Closed" at closing time
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredStores = useMemo(() => {
    return stores.filter(
      (s) =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.storeType?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stores, searchQuery]);

  const handleAddStore = async (e) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    if (!canCreateStore) {
      alert('You do not have permission to create a store.');
      return;
    }

    try {
      if (!activeUserId) {
        alert('No active user session found. Please log in again.');
        return;
      }

      setSubmitting(true);
      const payload = {
        name: newStoreName.trim(),
        description: newStoreDescription.trim(),
        storeType: newStoreType.trim(),
        imageUrl: newStoreImage.trim(),
        opentime: newOpenTime,
        closedtime: newCloseTime,
      };

      const response = await createStore(activeUserId, payload);
      setStores((prev) => [...prev, response.data]);
      closeModal();
    } catch (err) {
      console.error('Error creating store:', err);
      alert('Failed to create store.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStore = async (e, storeId, storeOwnerId) => {
    e.stopPropagation();

    // Admins, managers, or the store owner can delete stores
    const canDeleteThisStore =
      userRole === 'admin' ||
      userRole === 'manager' ||
      String(activeUserId) === String(storeOwnerId);

    if (!canDeleteThisStore) {
      alert('You do not have permission to delete this store.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        await deleteStore(storeId);
        setStores((prev) => prev.filter((s) => (s.id || s._id) !== storeId));
      } catch (err) {
        console.error('Error deleting store:', err);
        alert('Failed to delete store.');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewStoreName('');
    setNewStoreDescription('');
    setNewStoreType('');
    setNewStoreImage('');
    setNewOpenTime('09:00');
    setNewCloseTime('21:00');
  };

  const handleImageError = (storeId) => {
    setFailedImages((prev) => ({ ...prev, [storeId]: true }));
  };

  return (
    <div className="min-h-screen w-full flex" style={{ backgroundColor: '#F5F8FB' }}>
      {/* Sidebar Navigation */}
      <div
        className="hidden md:flex md:w-56 shrink-0 flex-col justify-between py-6 px-4 relative"
        style={{
          backgroundColor: '#1D4E89',
          backgroundImage: 'linear-gradient(160deg, #1D4E89 0%, #163D6D 60%, #102C50 100%)',
        }}
      >
        <div className="relative">
          <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-sm tracking-wide text-white font-mono">stockline</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-200/20 text-amber-300 font-mono">
              v2.0
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            <div className="px-3 py-2 rounded text-sm text-white bg-white/10 font-sans cursor-pointer">
              Dashboard
            </div>
          </nav>
        </div>

        {userRole && (
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded text-white bg-white/10 font-mono border border-white/10 self-start">
            ROLE: {userRole}
          </span>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 px-6 sm:px-10 py-8 overflow-y-auto">
        {/* CUSTOMER PROMOTIONAL BANNERS - Hidden for Admin, Owner, AND Manager */}
        {!isStaffOrManagement && (
          <div className="space-y-6 mb-8">
            <div className="bg-amber-100 border border-amber-200 text-amber-900 text-xs sm:text-sm px-4 py-2.5 rounded-lg flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <span className="font-medium">Flash Deal:</span> Free delivery on all food & grocery orders over $25 today!
              </div>
              <span className="text-xs bg-amber-200/60 font-semibold px-2 py-0.5 rounded text-amber-900 hidden sm:inline-block">
                Limited Time
              </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
              <div className="relative z-10 max-w-lg">
                <span className="text-[11px] font-semibold uppercase tracking-widest bg-white/10 text-blue-200 px-3 py-1 rounded-full border border-white/10">
                  Verified Local Partners
                </span>
                <h1 className="text-2xl sm:text-4xl font-bold mt-3 leading-tight">
                  Craving Something Fresh?
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Explore verified menus, order directly from local outlets, and get instant updates delivered straight to your door.
                </p>
              </div>

              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute right-8 top-1/2 -translate-y-1/2 text-7xl opacity-20 hidden lg:block select-none">
                🏬
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center text-xl shrink-0">
                  🚀
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Fast Delivery</h4>
                  <p className="text-[11px] text-slate-500">Direct from local outlets</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center text-xl shrink-0">
                  🛡️
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Verified Quality</h4>
                  <p className="text-[11px] text-slate-500">100% authentic stock</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center text-xl shrink-0">
                  💳
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Secure Checkout</h4>
                  <p className="text-[11px] text-slate-500">Encrypted payment flow</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Title & Toolbar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl text-slate-900 font-medium">
              {isStaffOrManagement ? 'Manage Stores' : 'Available Stores'}
            </h2>
            <p className="text-sm text-slate-500">
              {isStaffOrManagement
                ? 'Every store you manage, in one place.'
                : 'Choose a store to start exploring items.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-700"
            />
            {canCreateStore && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium transition"
              >
                + Add new store
              </button>
            )}
          </div>
        </div>

        {loading && <p className="text-sm text-slate-500">Loading stores...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && filteredStores.length === 0 && (
          <div className="p-8 text-center text-slate-500 bg-white border border-dashed rounded-lg">
            No stores found.
          </div>
        )}

        {/* Store Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStores.map((store) => {
            const storeId = store.id || store._id;
            const ownerId =
              store.ownerId ||
              store.userId ||
              store.owner?._id ||
              store.owner?.id ||
              store.user?.id ||
              store.user?._id ||
              'N/A';

            const ownerName = store.ownerName || store.user?.name || store.user?.username || 'N/A';
            const hasImage = store.imageUrl && !failedImages[storeId];

            const canDeleteStore =
              userRole === 'admin' ||
              userRole === 'manager' ||
              String(activeUserId) === String(ownerId);

            const openTimeVal = store.opentime || store.openTime || null;
            const closeTimeVal = store.closedtime || store.closeTime || null;

            const openStatus = isStoreOpen(openTimeVal, closeTimeVal);

            const displayOpenTime = formatTo12Hour(openTimeVal, 'N/A');
            const displayCloseTime = formatTo12Hour(closeTimeVal, 'N/A');

            return (
              <div
                key={storeId}
                onClick={() => onSelectStore(store)}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer relative flex flex-col"
              >
                {/* Delete Button */}
                {canDeleteStore && (
                  <button
                    onClick={(e) => handleDeleteStore(e, storeId, ownerId)}
                    className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-700 text-white w-6 h-6 rounded-full text-xs z-10 flex items-center justify-center shadow"
                    title="Delete Store"
                  >
                    ✕
                  </button>
                )}

                {/* Image / Fallback Icon */}
                {hasImage ? (
                  <img
                    src={store.imageUrl}
                    alt={store.name}
                    className="w-full h-48 object-cover object-center"
                    onError={() => handleImageError(storeId)}
                  />
                ) : (
                  <div className="h-48 bg-slate-100 flex items-center justify-center text-3xl">
                    {store.icon || '🏬'}
                  </div>
                )}

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Title & Operating Hours Badge */}
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <h3 className="font-medium text-slate-900 truncate">{store.name}</h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        openStatus
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {openStatus ? 'Open Now' : 'Closed'}
                    </span>
                  </div>

                  {/* Store Category Tag */}
                  {store.storeType && (
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded self-start mb-2">
                      {store.storeType}
                    </span>
                  )}

                  {/* Store Description */}
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                    {store.description || 'No description provided.'}
                  </p>

                  {/* Footer Meta */}
                  <div className="text-xs text-slate-500 mt-auto pt-2 border-t border-slate-100 flex justify-between items-center">
                    <span>Owner: {ownerName}</span>
                    <span className="text-[10px] text-slate-400">
                      {displayOpenTime} - {displayCloseTime}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Store Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Add new store</h3>
            <form onSubmit={handleAddStore} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Store Name"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={newStoreImage}
                onChange={(e) => setNewStoreImage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Store Type"
                value={newStoreType}
                onChange={(e) => setNewStoreType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              />

              {/* Operating Hours Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newOpenTime}
                    onChange={(e) => setNewOpenTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newCloseTime}
                    onChange={(e) => setNewCloseTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                </div>
              </div>

              <textarea
                placeholder="Description"
                value={newStoreDescription}
                onChange={(e) => setNewStoreDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm resize-none"
                rows={3}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded text-sm text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-800 text-white rounded text-sm font-medium hover:bg-blue-900 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;