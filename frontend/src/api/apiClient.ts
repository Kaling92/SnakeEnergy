// @ts-nocheck
import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}`;

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT from localStorage on every request automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear token and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/Login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
