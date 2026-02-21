import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE}/token/refresh/`, { refresh });
          localStorage.setItem('access_token', res.data.access);
          original.headers.Authorization = `Bearer ${res.data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  me: () => api.get('/auth/me/'),
  updateProfile: (data) => api.patch('/auth/update_profile/', data),
  changePassword: (data) => api.post('/auth/change_password/', data),
};

// Products
export const productsAPI = {
  list: (params) => api.get('/products/', { params }),
  detail: (slug) => api.get(`/products/${slug}/`),
  featured: () => api.get('/products/featured/'),
  byCategory: (slug, params) => api.get(`/products/category/${slug}/`, { params }),
  reviews: (slug) => api.get(`/products/${slug}/reviews/`),
  addReview: (slug, data) => api.post(`/products/${slug}/add_review/`, data),
};

// Categories
export const categoriesAPI = {
  list: () => api.get('/categories/'),
  all: () => api.get('/categories/all/'),
};

// Cart
export const cartAPI = {
  get: () => api.get('/cart/my_cart/'),
  add: (data) => api.post('/cart/add/', data),
  update: (itemId, quantity) => api.patch(`/cart/update/${itemId}/`, { quantity }),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}/`),
  clear: () => api.delete('/cart/clear/'),
};

// Orders
export const orderAPI = {
  list: () => api.get('/orders/my_orders/'),
  detail: (id) => api.get(`/orders/${id}/detail_order/`),
  create: (data) => api.post('/orders/create/', data),
  cancel: (id) => api.post(`/orders/${id}/cancel/`),
};

// Addresses
export const addressAPI = {
  list: () => api.get('/addresses/'),
  create: (data) => api.post('/addresses/', data),
  update: (id, data) => api.patch(`/addresses/${id}/`, data),
  delete: (id) => api.delete(`/addresses/${id}/`),
};

// Wishlist
export const wishlistAPI = {
  get: () => api.get('/wishlist/my_wishlist/'),
  toggle: (productId) => api.post('/wishlist/toggle/', { product_id: productId }),
};

// Banners
export const bannersAPI = {
  list: () => api.get('/banners/'),
};

// Flash Sales
export const flashSalesAPI = {
  list: () => api.get('/flash-sales/'),
};

// M-Pesa
export const mpesaAPI = {
  stkPush: (data) => api.post('/mpesa/stk-push/', data),
  status: (checkoutId) => api.get(`/mpesa/status/${checkoutId}/`),
};

// Coupons
export const couponAPI = {
  validate: (data) => api.post('/coupons/validate/', data),
};

// Stores
export const storesAPI = {
  list: (params) => api.get('/stores/', { params }),
  detail: (slug) => api.get(`/stores/${slug}/`),
  products: (slug) => api.get(`/stores/${slug}/products/`),
};

export default api;