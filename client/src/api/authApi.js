import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer token to all outgoing requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecopulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not already on login page, remove expired token
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('ecopulse_token');
      }
    }
    return Promise.reject(error);
  }
);

export const registerStudent = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const loginStudent = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const fetchProfile = async () => {
  const response = await API.get('/auth/profile');
  return response.data;
};

export default API;
