import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
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

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
};

// Transactions API
export const transactionsAPI = {
  // Get all transactions with filters
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add sorting
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);
    
    // Add filters
    if (params.status) queryParams.append('status', params.status);
    if (params.gateway) queryParams.append('gateway', params.gateway);
    if (params.school_id) queryParams.append('school_id', params.school_id);
    
    const queryString = queryParams.toString();
    return api.get(`/api/transactions${queryString ? `?${queryString}` : ''}`);
  },

  // Get transactions by school
  getBySchool: (schoolId, params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);
    
    const queryString = queryParams.toString();
    return api.get(`/api/transactions/school/${schoolId}${queryString ? `?${queryString}` : ''}`);
  },

  // Get transaction status by custom order ID
  getStatus: (customOrderId) => 
    api.get(`/api/transactions/transaction-status/${customOrderId}`),

  // Get transaction statistics
  getStats: () => api.get('/api/transactions/stats'),
};

// Schools API (if needed)
export const schoolsAPI = {
  getAll: () => api.get('/api/schools'), // Assuming this endpoint exists
};

export default api;
