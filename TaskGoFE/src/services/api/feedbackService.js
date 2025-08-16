import axiosInstance from './axiosConfig';

/**
 * Fetch recent reviews for dashboard display
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of reviews to fetch
 * @param {string} options.type - Feedback type filter
 * @returns {Promise<Object>} Recent reviews data
 */
export const getRecentReviews = async (options = {}) => {
  try {
    const { limit = 10, type } = options;
    const params = { limit };
    if (type) params.type = type;
    
    const response = await axiosInstance.get('/feedback/recent-reviews', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    throw error;
  }
};

/**
 * Create feedback for a completed task
 * @param {Object} feedbackData - Feedback data
 * @returns {Promise<Object>} Created feedback data
 */
export const createFeedback = async (feedbackData) => {
  try {
    const response = await axiosInstance.post('/feedback', feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw error;
  }
};

/**
 * Get feedback for a specific user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} User feedback data
 */
export const getUserFeedback = async (userId, options = {}) => {
  try {
    const response = await axiosInstance.get(`/feedback/user/${userId}`, { params: options });
    return response.data;
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    throw error;
  }
};

/**
 * Get user rating summary
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User rating summary data
 */
export const getUserRatingSummary = async (userId) => {
  try {
    const response = await axiosInstance.get(`/feedback/rating-summary/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user rating summary:', error);
    throw error;
  }
};

export const feedbackService = {
  getRecentReviews,
  createFeedback,
  getUserFeedback,
  getUserRatingSummary
};

export default feedbackService;
