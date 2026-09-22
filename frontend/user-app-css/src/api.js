import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT Bearer Token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ---------------- USER API ----------------
export const getAllUsers = () => API.get('/users');
export const createUser = (user) => API.post('/users', user);
export const updateUser = (id, user) => API.put(`/users/${id}`, user);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// ---------------- STORE API ----------------
export const getAllStores = () => API.get('/stores');
export const getStoreById = (id) => API.get(`/stores/${id}`);
export const createStore = (userId, store) => API.post(`/stores/user/${userId}`, store);
export const updateStore = (id, store) => API.put(`/stores/${id}`, store);
export const deleteStore = (id) => API.delete(`/stores/${id}`);

// ---------------- CATEGORY API ----------------
export const getAllCategories = () => API.get('/categories');
export const getCategoriesByStore = (storeId) => API.get(`/categories/store/${storeId}`);
export const createCategory = (storeId, category) => API.post(`/categories/store/${storeId}`, category);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// ---------------- PRODUCT API ----------------
export const getAllProducts = () => API.get('/products');
export const getProductById = (id) => API.get(`/products/${id}`);
export const getProductsByCategory = (categoryId) => API.get(`/products/category/${categoryId}`);
export const getProductsByStore = (storeId) => API.get(`/products/store/${storeId}`);
export const createProduct = (categoryId, product) => API.post(`/products/category/${categoryId}`, product);
export const updateProduct = (id, product) => API.put(`/products/${id}`, product);
export const updateStock = (id, stock) => API.patch(`/products/${id}/stock?stock=${stock}`);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const getLowStockAlerts = (threshold = 10) => API.get(`/products/alerts/low-stock?threshold=${threshold}`);
export const getAllproductbyline = () => API.get('/products/store');

// ---------------- ORDER API ----------------
export const createOrder = (storeId, orderRequest) => API.post(`/stores/${storeId}/orders`, orderRequest);
export const getOrdersByStore = (storeId) => API.get(`/stores/${storeId}/orders`);
export const getOrderById = (orderId) => API.get(`/orders/${orderId}`);

// ---------------- ANALYTICS API ----------------
export const getDailyAnalytics = (date) => {
  const params = date ? { date } : {};
  return API.get('/analytics/daily', { params });
};

// ---------------- ROLE HELPERS ----------------
export const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.role || 'ROLE_CUSTOMER';
};

export const isAdmin = () => {
  const role = getUserRole();
  return role === 'ADMIN' || role === 'ROLE_ADMIN';
};

export const isManager = () => {
  const role = getUserRole();
  return role === 'MANAGER' || role === 'ROLE_MANAGER';
};

export const isCustomer = () => {
  const role = getUserRole();
  return role === 'CUSTOMER' || role === 'ROLE_CUSTOMER';
};

// Returns true for ADMIN or MANAGER (for Edit, Delete, Add Category/Product/Store buttons)
export const canManage = () => isAdmin() || isManager();

export default API;