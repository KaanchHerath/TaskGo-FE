import axiosInstance from './axiosConfig';

/**
 * Initialize advance payment for a task
 * @param {string} taskId - Task ID
 * @param {string} applicationId - Application ID (optional)
 * @returns {Promise<Object>} Payment data
 */
export const initiateAdvancePayment = async (taskId, applicationId = null) => {
  try {
    const response = await axiosInstance.post('/payments/initiate-advance', {
      taskId,
      applicationId
    });
    return response.data;
  } catch (error) {
    console.error('Error initiating advance payment:', error);
    throw error;
  }
};

/**
 * Get payment history for a task
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Payment history
 */
export const getTaskPayments = async (taskId) => {
  try {
    const response = await axiosInstance.get(`/payments/task/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task payments:', error);
    throw error;
  }
};

/**
 * Get user's payment history
 * @returns {Promise<Object>} User's payment history
 */
export const getMyPayments = async () => {
  try {
    const response = await axiosInstance.get('/payments/my-payments');
    return response.data;
  } catch (error) {
    console.error('Error fetching my payments:', error);
    throw error;
  }
};

/**
 * Release advance payment to tasker (admin/system function)
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Release result
 */
export const releaseAdvancePayment = async (taskId) => {
  try {
    const response = await axiosInstance.post('/payments/release-advance', {
      taskId
    });
    return response.data;
  } catch (error) {
    console.error('Error releasing advance payment:', error);
    throw error;
  }
};

/**
 * Create PayHere payment form and redirect to payment gateway
 * @param {Object} paymentData - Payment data from backend
 * @param {string} paymentUrl - PayHere payment URL
 */
export const redirectToPayHere = (paymentData, paymentUrl) => {
  // Create a form element
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = paymentUrl;
  form.target = '_self';

  // Add payment data as hidden fields
  Object.keys(paymentData).forEach(key => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = paymentData[key];
    form.appendChild(input);
  });

  // Add form to document and submit
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

/**
 * Handle payment return from PayHere
 * @param {Object} params - URL parameters from PayHere return
 * @returns {Promise<Object>} Payment result
 */
export const handlePaymentReturn = async (params) => {
  try {
    const response = await axiosInstance.get('/payments/return', { params });
    return response.data;
  } catch (error) {
    console.error('Error handling payment return:', error);
    throw error;
  }
};

/**
 * Handle payment cancellation from PayHere
 * @param {Object} params - URL parameters from PayHere cancel
 * @returns {Promise<Object>} Cancellation result
 */
export const handlePaymentCancel = async (params) => {
  try {
    const response = await axiosInstance.get('/payments/cancel', { params });
    return response.data;
  } catch (error) {
    console.error('Error handling payment cancel:', error);
    throw error;
  }
}; 