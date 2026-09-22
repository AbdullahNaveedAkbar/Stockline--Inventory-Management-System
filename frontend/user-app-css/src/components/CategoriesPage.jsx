import React, { useState, useEffect } from 'react';
import { getCategoriesByStore, createCategory, deleteCategory } from '../api';

// Helper function to check user role safely from LocalStorage
const getUserRole = () => {
  try {
    const rawData = localStorage.getItem('user');
    if (!rawData) return '';

    const parsed = JSON.parse(rawData);
    const targetObj = parsed?.user || parsed;
    let role = targetObj?.role || targetObj?.roles || targetObj?.userType || '';

    if (Array.isArray(role)) role = role[0] || '';

    return String(role).trim().toLowerCase().replace(/^role_/, '');
  } catch (err) {
    console.error('Failed to parse user role from storage:', err);
    return '';
  }
};

function CategoriesPage({ selectedStore, onSelectCategory, onBack }) {
  const [storeCategories, setStoreCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Role detection: Grant edit permissions to Admin AND Manager
  const userRole = getUserRole();
  const canManageCategories = userRole === 'admin' || userRole === 'manager';

  useEffect(() => {
    if (selectedStore?.id) {
      fetchCategories();
    }
  }, [selectedStore]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategoriesByStore(selectedStore.id);
      setStoreCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // CREATE Category (Admin & Manager)
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!canManageCategories) return;
    if (!newCategoryName.trim()) return;

    try {
      const categoryPayload = { name: newCategoryName.trim() };
      await createCategory(selectedStore.id, categoryPayload);
      fetchCategories();
      closeModal();
    } catch (error) {
      console.error('Failed to add category:', error);
      alert('Failed to add category. Please check backend connections.');
    }
  };

  // DELETE Category (Admin & Manager)
  const handleDeleteCategory = async (e, category) => {
    e.stopPropagation();
    if (!canManageCategories) return;
    if (!window.confirm(`Delete category "${category.name}"?`)) return;

    try {
      await deleteCategory(category.id || category._id);
      setStoreCategories(storeCategories.filter((cat) => (cat.id || cat._id) !== (category.id || category._id)));
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewCategoryName('');
  };

  return (
    <div className="min-h-screen w-full flex" style={{ backgroundColor: '#F5F8FB' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');

        .sl-nav-item {
          transition: background-color 120ms ease, color 120ms ease;
        }
        .sl-nav-item.active {
          background-color: rgba(255, 255, 255, 0.12);
        }
        .sl-nav-item.clickable:hover {
          background-color: rgba(255, 255, 255, 0.08);
        }
        .sl-category-row {
          background-color: #FFFFFF;
          border: 1.5px solid #DCE5EF;
          transition: border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease;
        }
        .sl-category-row:hover {
          border-color: #1D4E89;
          box-shadow: 0 6px 20px rgba(29, 78, 137, 0.1);
          transform: translateY(-1px);
        }
        .sl-delete-btn {
          opacity: 0;
          background-color: #FFFFFF;
          border: 1.5px solid #EFC7C4;
          color: #B3261E;
          transition: opacity 120ms ease, background-color 120ms ease, color 120ms ease;
        }
        .sl-category-row:hover .sl-delete-btn {
          opacity: 1;
        }
        .sl-delete-btn:hover {
          background-color: #B3261E;
          color: #FFFFFF;
        }
        .sl-add-btn {
          background-color: #1D4E89;
          transition: background-color 120ms ease, transform 120ms ease;
        }
        .sl-add-btn:hover {
          background-color: #163D6D;
        }
        .sl-add-btn:active {
          transform: translateY(1px);
        }
        .sl-field-input {
          background-color: #FFFFFF;
          border: 1.5px solid #D3DEEA;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .sl-field-input:focus {
          outline: none;
          border-color: #1D4E89;
          box-shadow: 0 0 0 3px rgba(29, 78, 137, 0.14);
        }
        .sl-cancel-btn {
          background-color: #FFFFFF;
          border: 1.5px solid #D3DEEA;
          transition: background-color 120ms ease;
        }
        .sl-cancel-btn:hover {
          background-color: #F5F8FB;
        }
        .sl-back-link {
          transition: opacity 120ms ease;
        }
        .sl-back-link:hover {
          opacity: 0.7;
        }
      `}</style>

      {/* Sidebar */}
      <div
        className="hidden md:flex md:w-56 shrink-0 flex-col justify-between py-6 px-4"
        style={{ backgroundColor: '#1D4E89' }}
      >
        <div>
          <div className="flex items-center gap-2 px-2 mb-8">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-sm border shrink-0"
              style={{ borderColor: 'rgba(255,255,255,0.4)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L21 7.5V16.5L12 21L3 16.5V7.5L12 3Z" stroke="#FFFFFF" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M3 7.5L12 12L21 7.5" stroke="#FFFFFF" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M12 12V21" stroke="#FFFFFF" strokeWidth="1.4" />
              </svg>
            </div>
            <span className="text-sm tracking-wide" style={{ color: '#FFFFFF', fontFamily: "'IBM Plex Mono', monospace" }}>
              stockline
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              onClick={onBack}
              className="sl-nav-item clickable flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm w-full text-left"
              style={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'Inter', sans-serif" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="1" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" />
                <rect x="13" y="3" width="8" height="8" rx="1" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" />
                <rect x="3" y="13" width="8" height="8" rx="1" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" />
                <rect x="13" y="13" width="8" height="8" rx="1" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" />
              </svg>
              Dashboard
            </button>
            <div
              className="sl-nav-item active flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm"
              style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h18M3 18h10" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Categories
            </div>
          </nav>
        </div>

        <div
          className="text-xs tracking-wide px-2 uppercase"
          style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {userRole || 'USER'} / CATEGORIES
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 px-6 sm:px-10 py-8">
        <button
          onClick={onBack}
          className="sl-back-link flex items-center gap-1.5 text-sm mb-5"
          style={{ color: '#1D4E89', fontFamily: "'Inter', sans-serif" }}
        >
          <span aria-hidden="true">←</span> Back to stores
        </button>

        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2
              className="text-2xl mb-1"
              style={{ color: '#0F2F52', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
            >
              {selectedStore?.name} — Categories
            </h2>
            <p className="text-sm" style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}>
              Group products so they're easy to find and count.
            </p>
          </div>

          {/* Render "+ Add new category" button for Admin and Manager */}
          {canManageCategories && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="sl-add-btn px-4 py-2.5 rounded-sm text-sm font-medium"
              style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
            >
              + Add new category
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}>
            Loading categories…
          </p>
        ) : storeCategories.length === 0 ? (
          <div
            className="rounded-sm px-6 py-10 text-center max-w-md"
            style={{ border: '1.5px dashed #D3DEEA', fontFamily: "'Inter', sans-serif" }}
          >
            <p className="text-sm" style={{ color: '#5C6B7A' }}>
              No categories yet. {canManageCategories ? 'Add one to start grouping products.' : 'No categories available for this store.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-2xl">
            {storeCategories.map((category) => (
              <div
                key={category.id || category._id}
                onClick={() => onSelectCategory(category)}
                className="sl-category-row flex items-center justify-between rounded-sm px-5 py-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 6.5C3 5.67 3.67 5 4.5 5H9L11 7H19.5C20.33 7 21 7.67 21 8.5V17.5C21 18.33 20.33 19 19.5 19H4.5C3.67 19 3 18.33 3 17.5V6.5Z"
                      stroke="#1D4E89"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    className="text-sm"
                    style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                  >
                    {category.name}
                  </span>
                </div>

                {/* Render Delete button for Admin and Manager */}
                {canManageCategories && (
                  <button
                    onClick={(e) => handleDeleteCategory(e, category)}
                    className="sl-delete-btn px-3 py-1.5 rounded-sm text-xs font-medium"
                    title="Delete category"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal (Protected for Admin & Manager) */}
      {isModalOpen && canManageCategories && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(15, 47, 82, 0.45)' }}
        >
          <div className="w-full max-w-sm rounded-sm p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <h3
              className="text-lg mb-5"
              style={{ color: '#0F2F52', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
            >
              Add category to {selectedStore?.name}
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label
                  className="block text-xs mb-1.5"
                  style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Category name
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Tools & Hardware, Shoes and Clothes"
                  className="sl-field-input w-full px-3.5 py-2.5 text-sm rounded-sm"
                  style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="sl-cancel-btn px-4 py-2 rounded-sm text-sm"
                  style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sl-add-btn px-4 py-2 rounded-sm text-sm font-medium"
                  style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
                >
                  Save category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesPage;