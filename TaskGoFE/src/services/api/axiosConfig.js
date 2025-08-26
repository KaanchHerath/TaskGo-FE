import axios from 'axios';
import { APP_CONFIG } from '../../config/appConfig';
import { getToken, setToken, clearToken } from '../../utils/auth';

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
    const token = getToken();
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
          // Check if this is a login attempt (no token in request)
          const hasAuthHeader = error.config.headers.Authorization;
          if (!hasAuthHeader) {
            // Don't redirect, just let the error propagate to the component
            console.error('Login failed - invalid credentials');
            break;
          }
          
          // Attempt refresh once per request for authenticated requests
          if (!error.config.__isRetryRequest) {
            const originalRequest = error.config;
            originalRequest.__isRetryRequest = true;
            return fetch(`${API_URL.replace('/api','')}/api/auth/refresh`, {
              method: 'POST',
              credentials: 'include'
            })
              .then((res) => {
                if (!res.ok) throw new Error('Refresh failed');
                return res.json();
              })
              .then((data) => {
                if (data?.token) {
                  setToken(data.token);
                  originalRequest.headers.Authorization = `Bearer ${data.token}`;
                  return axiosInstance(originalRequest);
                }
                throw new Error('No token in refresh');
              })
              .catch(() => {
                console.error('Unauthorized - refresh failed');
                clearToken();
                window.location.href = '/login';
              });
          }
          console.error('Unauthorized');
          clearToken();
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