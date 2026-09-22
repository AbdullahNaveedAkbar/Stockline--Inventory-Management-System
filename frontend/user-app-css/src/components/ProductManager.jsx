import React, { useState, useEffect, useMemo } from 'react';
import {
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrder,
} from '../api';

import { isStoreOpen } from './Dashboard';

function ProductManager({ store, category, onBack, userRole = 'customer' }) {
  // 1. ROBUST ROLE NORMALIZATION (Supports Admin & Manager)
  const rawRole = typeof userRole === 'object' ? userRole?.name || userRole?.role || '' : String(userRole || '');
  const normalizedRole = rawRole.trim().toUpperCase();

  const isAdmin = normalizedRole === 'ROLE_ADMIN' || normalizedRole === 'ADMIN';
  const isManager = normalizedRole === 'ROLE_MANAGER' || normalizedRole === 'MANAGER';
  
  // Both Admin and Manager have management privileges (Add, Edit, Delete, Stock update)
  const canManage = isAdmin || isManager;

  const openTimeVal = store?.opentime || store?.openTime || null;
  const closeTimeVal = store?.closedtime || store?.closeTime || null;

  // Helper exported from Dashboard
  const openStatus = isStoreOpen(openTimeVal, closeTimeVal);

  const storeTitle = typeof store === 'object' ? (store?.name || 'Store') : String(store || 'Store');
  const categoryTitle = typeof category === 'object' ? (category?.name || 'Category') : String(category || 'Category');
  const categoryId = typeof category === 'object' ? category?.id : category;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Product Modal State (Admin / Manager)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  // Order Modal State (Customer / All Roles)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Form state (Product)
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  // FETCH Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProductsByCategory(categoryId);
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchProducts();
    }
  }, [categoryId]);

  // LIVE FILTERING
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLowStock = (canManage && showLowStockOnly) ? item.stock < 10 : true;
      return matchesSearch && matchesLowStock;
    });
  }, [products, searchTerm, showLowStockOnly, canManage]);

  // CREATE or UPDATE Product (Admin & Manager Guarded)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!canManage) {
      alert('Unauthorized action: Admin or Manager access required.');
      return;
    }
    if (!name || !price || !categoryId) return;

    const parsedStock = parseInt(stock, 10) || 0;
    const payload = {
      name,
      price: parseFloat(price) || 0,
      stock: parsedStock,
      imageUrl,
      description,
    };

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, payload);
      } else {
        await createProduct(categoryId, payload);
      }

      if (parsedStock < 10) {
        alert(`⚠️ Warning: Product "${name}" stock is low (${parsedStock} remaining).`);
      }

      fetchProducts();
      closeModal();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  // UPDATE Stock Directly (Admin & Manager Guarded)
  const handleUpdateStock = async (id, delta) => {
    if (!canManage) return;
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const updatedStock = Math.max(0, (product.stock || 0) + delta);
    const payload = { ...product, stock: updatedStock };

    try {
      const res = await updateProduct(id, payload);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? (res?.data || payload) : p))
      );

      if (updatedStock < 10) {
        alert(`⚠️ Low Stock Alert: Product "${product.name}" has only ${updatedStock} units left.`);
      }
    } catch (error) {
      console.error('Failed to update stock:', error);
      fetchProducts();
    }
  };

  // DELETE Product (Admin & Manager Guarded)
  const handleDeleteProduct = async (id) => {
    if (!canManage) return;
    if (!window.confirm('Delete this product?')) return;

    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  // PLACE ORDER (Available to Customers, Managers, & Admins)
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedProductForOrder) return;

    const currentStoreId = typeof store === 'object' ? (store?.id || store?._id) : store;

    if (!currentStoreId) {
      alert('❌ Error: Store ID is missing.');
      return;
    }

    const qty = parseInt(orderQuantity, 10) || 1;

    const orderRequest = {
      customerName: customerName.trim(),
      customerEmail: '',
      taxRate: 0.0,
      items: [
        {
          productId: Number(selectedProductForOrder.id),
          quantity: qty,
        },
      ],
    };

    try {
      const response = await createOrder(currentStoreId, orderRequest);
      fetchProducts();
      alert(`✅ Order Created Successfully! Order ID: ${response.data?.id || 'Saved'}`);
      closeOrderModal();
    } catch (error) {
      console.error('API Order Error Response:', error.response?.data || error.message);
      const backendError =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to process order.';
      alert(`❌ Order Error: ${backendError}`);
    }
  };

  const openAddModal = () => {
    if (!canManage) return;
    setEditingProductId(null);
    setName('');
    setPrice('');
    setStock('');
    setImageUrl('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    if (!canManage) return;
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(product.price);
    setStock(product.stock);
    setImageUrl(product.imageUrl || '');
    setDescription(product.description || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProductId(null);
    setName('');
    setPrice('');
    setStock('');
    setImageUrl('');
    setDescription('');
  };

  const openOrderModal = (product) => {
    setSelectedProductForOrder(product);
    setOrderQuantity(1);
    setCustomerName('');
    setOrderNotes('');
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedProductForOrder(null);
    setOrderQuantity(1);
    setCustomerName('');
    setOrderNotes('');
  };

  return (
    <div className="min-h-screen w-full flex" style={{ backgroundColor: '#F5F8FB' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');

        .sl-nav-item { transition: background-color 120ms ease, color 120ms ease; }
        .sl-nav-item.active { background-color: rgba(255, 255, 255, 0.12); }
        .sl-nav-item.clickable:hover { background-color: rgba(255, 255, 255, 0.08); }
        .sl-back-link { transition: opacity 120ms ease; }
        .sl-back-link:hover { opacity: 0.7; }
        .sl-add-btn { background-color: #1D4E89; transition: background-color 120ms ease, transform 120ms ease; }
        .sl-add-btn:hover { background-color: #163D6D; }
        .sl-add-btn:active { transform: translateY(1px); }
        .sl-field-input { background-color: #FFFFFF; border: 1.5px solid #D3DEEA; transition: border-color 120ms ease, box-shadow 120ms ease; }
        .sl-field-input:focus { outline: none; border-color: #1D4E89; box-shadow: 0 0 0 3px rgba(29, 78, 137, 0.14); }
        .sl-cancel-btn { background-color: #FFFFFF; border: 1.5px solid #D3DEEA; transition: background-color 120ms ease; }
        .sl-cancel-btn:hover { background-color: #F5F8FB; }
        .sl-table-card { background-color: #FFFFFF; border: 1.5px solid #DCE5EF; overflow: hidden; }
        .sl-table-row { border-bottom: 1px solid #EEF2F7; transition: background-color 120ms ease; }
        .sl-table-row:last-child { border-bottom: none; }
        .sl-table-row:hover { background-color: #F8FAFD; }
        .sl-table-row.low-stock { background-color: #FBF2F1; }
        .sl-table-row.low-stock:hover { background-color: #F7E9E9; }
        .sl-qty-btn { background-color: #FFFFFF; border: 1.5px solid #D3DEEA; transition: border-color 120ms ease, background-color 120ms ease; }
        .sl-qty-btn:hover { border-color: #1D4E89; background-color: #F5F8FB; }
        .sl-edit-btn { background-color: #EAF1F9; color: #1D4E89; border: 1px solid #C7DAEC; transition: background-color 120ms ease; }
        .sl-edit-btn:hover { background-color: #DCEAF6; }
        .sl-order-btn { background-color: #2E7D32; color: #FFFFFF; border: 1px solid #1B5E20; transition: background-color 120ms ease; }
        .sl-order-btn:hover { background-color: #1B5E20; }
        .sl-delete-btn-outline { background-color: #FFFFFF; color: #B3261E; border: 1px solid #EFC7C4; transition: background-color 120ms ease, color 120ms ease; }
        .sl-delete-btn-outline:hover { background-color: #B3261E; color: #FFFFFF; }
        .sl-checkbox { accent-color: #1D4E89; }
        .sl-order-btn:disabled {
          background-color: #A0AEC0 !important;
          border-color: #CBD5E0 !important;
          cursor: not-allowed !important;
          opacity: 0.6;
        }
      `}</style>

      {/* Sidebar */}
      <div className="hidden md:flex md:w-56 shrink-0 flex-col justify-between py-6 px-4" style={{ backgroundColor: '#1D4E89' }}>
        <div>
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="w-8 h-8 flex items-center justify-center rounded-sm border shrink-0" style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
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
            <button onClick={onBack} className="sl-nav-item clickable flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm w-full text-left" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'Inter', sans-serif" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h18M3 18h10" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Categories
            </button>
            <div className="sl-nav-item active flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm" style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L21 7.5V16.5L12 21L3 16.5V7.5L12 3Z" stroke="#FFFFFF" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              Products
            </div>
          </nav>
        </div>

        <div className="text-xs tracking-wide px-2" style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: "'IBM Plex Mono', monospace" }}>
          ROLE: {isAdmin ? 'ADMIN' : isManager ? 'MANAGER' : 'CUSTOMER'}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 px-6 sm:px-10 py-8">
        <button onClick={onBack} className="sl-back-link flex items-center gap-1.5 text-sm mb-5" style={{ color: '#1D4E89', fontFamily: "'Inter', sans-serif" }}>
          <span aria-hidden="true">←</span> Back to categories
        </button>

        <h2 className="text-2xl mb-1" style={{ color: '#0F2F52', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}>
          {storeTitle} <span style={{ color: '#8FA0B3' }}>/</span> {categoryTitle}
        </h2>
        <p className="text-sm mb-6" style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}>
          {canManage ? 'Manage products, update stock levels, edit inventory, or place orders.' : 'Browse available items and place orders.'}
        </p>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h3 className="text-base" style={{ color: '#0F2F52', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}>
            {canManage ? 'Inventory Management' : 'Available Products'}
          </h3>
          {/* Add Product Button - Admin & Manager */}
          {canManage && (
            <button onClick={openAddModal} className="sl-add-btn px-4 py-2.5 rounded-sm text-sm font-medium" style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
              + Add new product
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="relative flex-1" style={{ minWidth: '240px' }}>
            <span className="absolute left-3 top-1/2" style={{ transform: 'translateY(-50%)', fontSize: '0.85rem', color: '#8FA0B3' }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sl-field-input w-full pl-9 pr-9 py-2.5 rounded-sm text-sm"
              style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif" }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 text-sm" style={{ transform: 'translateY(-50%)', color: '#8FA0B3' }}>
                ✕
              </button>
            )}
          </div>

          {canManage && (
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}>
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="sl-checkbox cursor-pointer"
              />
              Show low stock only (&lt; 10)
            </label>
          )}
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}>
            Loading products…
          </p>
        ) : products.length === 0 ? (
          <div className="rounded-sm px-6 py-10 text-center max-w-md" style={{ border: '1.5px dashed #D3DEEA', fontFamily: "'Inter', sans-serif" }}>
            <p className="text-sm" style={{ color: '#5C6B7A' }}>
              No products found in this category.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-sm px-6 py-10 text-center" style={{ border: '1.5px solid #DCE5EF', backgroundColor: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
            <p className="text-sm mb-3" style={{ color: '#5C6B7A' }}>
              No products match your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setShowLowStockOnly(false);
              }}
              className="sl-add-btn px-4 py-2 rounded-sm text-sm font-medium"
              style={{ color: '#FFFFFF' }}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="sl-table-card rounded-sm">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F5F8FB', borderBottom: '1px solid #DCE5EF' }}>
                  {['Image', 'Product Name', 'Price', 'Stock', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs" style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((item) => (
                  <tr key={item.id} className={`sl-table-row ${canManage && item.stock < 10 ? 'low-stock' : ''}`}>
                    <td className="px-4 py-3 align-middle">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-sm"
                          style={{ border: '1px solid #DCE5EF' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center rounded-sm text-sm" style={{ backgroundColor: '#F5F8FB', border: '1px solid #DCE5EF', color: '#8FA0B3' }}>
                          📷
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm" style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                          {item.name}
                        </span>
                        {canManage && item.stock < 10 && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#FBEAE9', color: '#B3261E', border: '1px solid #EFC7C4' }}>
                            ⚠️ Low stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className="text-sm font-semibold" style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif" }}>
                        PKR {Number(item.price || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {canManage ? (
                        /* Admin and Manager stock controls */
                        <div className="flex items-center">
                          <button onClick={() => handleUpdateStock(item.id, -1)} className="sl-qty-btn w-7 h-7 rounded-sm text-sm font-semibold flex items-center justify-center" style={{ color: '#0F2F52' }}>
                            −
                          </button>
                          <span className="mx-3 text-sm font-semibold" style={{ minWidth: '22px', textAlign: 'center', color: item.stock < 10 ? '#B3261E' : '#0F2F52' }}>
                            {item.stock}
                          </span>
                          <button onClick={() => handleUpdateStock(item.id, 1)} className="sl-qty-btn w-7 h-7 rounded-sm text-sm font-semibold flex items-center justify-center" style={{ color: '#0F2F52' }}>
                            +
                          </button>
                        </div>
                      ) : (
                        /* Customer stock display */
                        <span className={`text-sm font-medium ${item.stock > 0 ? 'text-gray-700' : 'text-red-600'}`}>
                          {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        {/* Order button available to all roles */}
                        <button
                          onClick={() => openOrderModal(item)}
                          disabled={item.stock === 0 || !openStatus}
                          className="sl-order-btn px-3 py-1.5 rounded-sm text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {!openStatus ? '🔒 Store Closed' : '🛒 Order'}
                        </button>

                        {/* Admin & Manager Action Buttons */}
                        {canManage && (
                          <>
                            <button onClick={() => openEditModal(item)} className="sl-edit-btn px-3 py-1.5 rounded-sm text-xs font-medium">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteProduct(item.id)} className="sl-delete-btn-outline px-3 py-1.5 rounded-sm text-xs font-medium">
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin / Manager Product Modal */}
      {canManage && isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(15, 47, 82, 0.45)' }}>
          <div className="w-full max-w-sm rounded-sm p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <h3 className="text-lg mb-5" style={{ color: '#0F2F52', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}>
              {editingProductId ? 'Edit product' : 'Add new product'}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace" }}>
                  Product name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Copper Wire 5m"
                  className="sl-field-input w-full px-3.5 py-2.5 text-sm rounded-sm"
                  style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace" }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product specs or notes..."
                  className="sl-field-input w-full px-3.5 py-2.5 text-sm rounded-sm resize-none h-20"
                  style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace" }}>
                  Image URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="sl-field-input w-full px-3.5 py-2.5 text-sm rounded-sm"
                  style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace" }}>
                  Price (PKR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="sl-field-input w-full px-3.5 py-2.5 text-sm rounded-sm"
                  style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace" }}>
                  Initial stock
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)} 
                  placeholder="0"
                  className="sl-field-input w-full px-3.5 py-2.5 text-sm rounded-sm"
                  style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif" }}
                />
              </div> 

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal} className="sl-cancel-btn px-4 py-2 rounded-sm text-sm" style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}>
                  Cancel
                </button>
                <button type="submit" className="sl-add-btn px-4 py-2 rounded-sm text-sm font-medium" style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
                  {editingProductId ? 'Update product' : 'Save product'}
                </button>  
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer / Manager Order Modal */}
      {isOrderModalOpen && selectedProductForOrder && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(15, 47, 82, 0.45)' }}>
          <div className="w-full max-w-sm rounded-sm p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <h3 className="text-lg mb-1" style={{ color: '#0F2F52', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}>
              Place New Order
            </h3>
            <p className="text-xs mb-4" style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}>
              Ordering: <span className="font-semibold text-gray-800">{selectedProductForOrder.name}</span>
            </p>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace" }}>
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="sl-field-input w-full px-3.5 py-2.5 text-sm rounded-sm"
                  style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace" }}>
                  Order Quantity (In Stock: {selectedProductForOrder.stock})
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProductForOrder.stock}
                  required
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  className="sl-field-input w-full px-3.5 py-2.5 text-sm rounded-sm"
                  style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace" }}>
                  Notes / Instructions
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Delivery address or special requests..."
                  className="sl-field-input w-full px-3.5 py-2.5 text-sm rounded-sm resize-none h-16"
                  style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              <div className="p-3 rounded-sm flex justify-between items-center" style={{ backgroundColor: '#F5F8FB', border: '1px solid #DCE5EF' }}>
                <span className="text-xs font-mono text-gray-600">Total Price:</span>
                <span className="text-base font-semibold" style={{ color: '#0F2F52' }}>
                  PKR {((Number(selectedProductForOrder.price) || 0) * (parseInt(orderQuantity, 10) || 0)).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeOrderModal} className="sl-cancel-btn px-4 py-2 rounded-sm text-sm" style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}>
                  Cancel
                </button>
                <button type="submit" className="sl-order-btn px-4 py-2 rounded-sm text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManager;