import axiosInstance from './axiosConfig';

export const jobService = {
  getJobs: async (params) => {
    try {
      const response = await axiosInstance.get('/tasks', { params });
      return response.data;
    } catch (error) {
      console.error('Error in getJobs:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.response?.data
      });
      throw error;
    }
  },
  
  getJobById: async (id) => {
    if (!id) {
      throw new Error('Job ID is required');
    }
    try {
      const response = await axiosInstance.get(`/tasks/${id}`); // Correct endpoint
      return response.data;
    } catch (error) {
      console.error('Error in getJobById:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.response?.data
      });
      throw error;
    }
  }
};