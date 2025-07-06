import axiosInstance from './axiosConfig';

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} Auth response
 */
export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    
    // Handle rate limit errors specifically
    if (error.response?.status === 429) {
      const retryAfter = error.response.data?.retryAfter || 900; // 15 minutes default
      const minutes = Math.ceil(retryAfter / 60);
      throw new Error(`Too many login attempts. Please try again in ${minutes} minutes.`);
    }
    
    // Handle other specific errors
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    throw error;
  }
};

/**
 * Register a new customer
 * @param {Object} data - Registration data
 * @returns {Promise<Object>} Auth response
 */
export const registerCustomer = async (data) => {
  try {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  } catch (error) {
    console.error('Error registering customer:', error);
    throw error;
  }
};

/**
 * Register a new tasker (multipart/form-data)
 * @param {FormData} formData - Registration data
 * @returns {Promise<Object>} Auth response
 */
export const registerTasker = async (formData) => {
  try {
    const response = await axiosInstance.post('/auth/register-tasker', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error registering tasker:', error);
    throw error;
  }
};

/**
 * Register user (generic - same as registerCustomer)
 * @param {Object} userData - Registration data
 * @returns {Promise<Object>} Auth response
 */
export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Reset rate limit (development only)
 * @returns {Promise<Object>} Reset response
 */
export const resetRateLimit = async () => {
  try {
    const response = await axiosInstance.post('/auth/reset-rate-limit');
    return response.data;
  } catch (error) {
    console.error('Error resetting rate limit:', error);
    throw error;
  }
}; 