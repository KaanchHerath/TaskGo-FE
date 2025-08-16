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

    // Normalize error so caller can inspect status and payload
    if (error.response) {
      const normalized = new Error(error.response.data?.message || 'Login failed');
      normalized.status = error.response.status;
      normalized.data = error.response.data;
      throw normalized;
    }

    throw new Error('Network error while logging in');
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

 