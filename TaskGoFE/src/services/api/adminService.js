import axiosInstance from './axiosConfig';

/**
 * Fetch dashboard statistics
 * @returns {Promise<Object>} Dashboard stats data
 */
export const getDashboardStats = async () => {
  const response = await axiosInstance.get('/stats/dashboard');
  return response.data;
}; 