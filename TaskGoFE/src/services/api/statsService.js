import axiosInstance from './axiosConfig';

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/stats/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Get task statistics
export const getTaskStats = async () => {
  try {
    const response = await axiosInstance.get('/stats/tasks');
    return response.data;
  } catch (error) {
    console.error('Error fetching task stats:', error);
    throw error;
  }
};

// Get user statistics
export const getUserStats = async () => {
  try {
    const response = await axiosInstance.get('/stats/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

// Get tasker statistics
export const getTaskerStats = async (taskerId) => {
  try {
    console.log('Calling getTaskerStats with taskerId:', taskerId);
    const response = await axiosInstance.get(`/stats/tasker/${taskerId}`);
    console.log('getTaskerStats response:', response);
    console.log('getTaskerStats response.data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasker stats:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
}; 