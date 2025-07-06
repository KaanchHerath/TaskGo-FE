import axios from 'axios';
import { APP_CONFIG } from '../../config/appConfig';

const API_URL = `${APP_CONFIG.API.BASE_URL}/api`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: APP_CONFIG.API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
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

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      switch (error.response.status) {
        case 400:
          console.error('Bad Request:', error.response.data);
          break;
        case 401:
          // Handle unauthorized - redirect to login
          console.error('Unauthorized');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 404:
          console.error('Not Found');
          break;
        default:
          console.error('Server Error:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;