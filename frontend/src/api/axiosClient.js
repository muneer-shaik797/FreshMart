import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Bearer token into outgoing requests
axiosClient.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('freshmart_auth');
    if (authData) {
      try {
        const { token } = JSON.parse(authData);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Failed to parse auth token', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for responses
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: clear auth on explicit token invalidation
      if (window.location.pathname.startsWith('/checkout') || window.location.pathname.startsWith('/admin')) {
        // preserve context or redirect
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
