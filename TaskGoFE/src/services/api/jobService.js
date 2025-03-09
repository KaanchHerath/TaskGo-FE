import axiosInstance from './axiosConfig';

export const jobService = {
  getJobs: async (params) => {
    try {
      const response = await axiosInstance.get('/jobs', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};