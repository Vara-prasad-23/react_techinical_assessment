import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication
export const login = (email, password) => 
  api.post('/auth/login', { email, password });

export const getProfile = () => 
  api.get('/auth/profile');

export const updateProfile = (data) => 
  api.put('/auth/profile', data);

// Products
export const getProducts = (params = {}) => 
  api.get('/products', { params });

export const getProduct = (id) => 
  api.get(`/products/${id}`);

// Categories
export const getCategories = () => 
  api.get('/categories');

export const getCategory = (id) => 
  api.get(`/categories/${id}`);

// Cart
export const getCart = () => 
  api.get('/cart');

export const addToCart = (productId, quantity = 1) => 
  api.post('/cart', { productId, quantity });

export const updateCartItem = (productId, quantity) => 
  api.put(`/cart/${productId}`, { quantity });

export const removeFromCart = (productId) => 
  api.delete(`/cart/${productId}`);

export const clearCart = () => 
  api.delete('/cart');

// Orders
export const getOrders = () => 
  api.get('/orders');

export const getOrder = (id) => 
  api.get(`/orders/${id}`);

export const createOrder = (orderData) => 
  api.post('/orders', orderData);

export const updateOrderStatus = (id, status) => 
  api.put(`/orders/${id}/status`, { status });

// Reviews
export const getReviews = (params = {}) => 
  api.get('/reviews', { params });

export const getReview = (id) => 
  api.get(`/reviews/${id}`);

export const createReview = (reviewData) => 
  api.post('/reviews', reviewData);

export const updateReview = (id, reviewData) => 
  api.put(`/reviews/${id}`, reviewData);

export const deleteReview = (id) => 
  api.delete(`/reviews/${id}`);

export default api;

