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

    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Create a normalized error object
      const normalized = new Error(data?.message || 'Login failed');
      normalized.status = status;
      normalized.data = data;
      normalized.errorType = data?.errorType;
      
      throw normalized;
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - no response from server');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred');
    }
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

    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data: responseData } = error.response;
      
      // Create a normalized error object
      const normalized = new Error(responseData?.message || 'Registration failed');
      normalized.status = status;
      normalized.data = responseData;
      normalized.errorType = responseData?.errorType;
      normalized.field = responseData?.field;
      
      throw normalized;
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - no response from server');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred during registration');
    }
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

    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data: responseData } = error.response;
      
      // Create a normalized error object
      const normalized = new Error(responseData?.message || 'Tasker registration failed');
      normalized.status = status;
      normalized.data = responseData;
      normalized.errorType = responseData?.errorType;
      normalized.field = responseData?.field;
      
      throw normalized;
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - no response from server');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred during tasker registration');
    }
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

    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data: responseData } = error.response;
      
      // Create a normalized error object
      const normalized = new Error(responseData?.message || 'User registration failed');
      normalized.status = status;
      normalized.data = responseData;
      normalized.errorType = responseData?.errorType;
      normalized.field = responseData?.field;
      
      throw normalized;
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - no response from server');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred during user registration');
    }
  }
};

 