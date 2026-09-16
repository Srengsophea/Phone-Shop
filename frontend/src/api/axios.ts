import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

// Request interceptor: attach token and guest session ID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('phonehub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  let sessionId = localStorage.getItem('phonehub_guest_session');
  if (!sessionId) {
    sessionId = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('phonehub_guest_session', sessionId);
  }
  config.headers['X-Guest-Session-Id'] = sessionId;

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      localStorage.removeItem('phonehub_token');
    }
    return Promise.reject(error);
  }
);

export default api;
