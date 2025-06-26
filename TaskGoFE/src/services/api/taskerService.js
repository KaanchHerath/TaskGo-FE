import axiosInstance from './axiosConfig';

// Get all taskers with filtering and pagination
export const getAllTaskers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.skills) params.append('skills', filters.skills);
    if (filters.area) params.append('area', filters.area);
    if (filters.minRating) params.append('minRating', filters.minRating);
    if (filters.maxHourlyRate) params.append('maxHourlyRate', filters.maxHourlyRate);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await axiosInstance.get(`/v1/taskers?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching taskers:', error);
    throw error;
  }
};

// Get top rated taskers
export const getTopRatedTaskers = async (limit = 6) => {
  try {
    const response = await axiosInstance.get(`/v1/taskers/top-rated?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching top rated taskers:', error);
    throw error;
  }
};

// Get tasker by ID
export const getTaskerById = async (taskerId) => {
  try {
    const response = await axiosInstance.get(`/v1/taskers/${taskerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasker:', error);
    throw error;
  }
};

// Update tasker availability (protected route)
export const updateTaskerAvailability = async (availabilityData) => {
  try {
    const response = await axiosInstance.put('/v1/taskers/availability', availabilityData);
    return response.data;
  } catch (error) {
    console.error('Error updating tasker availability:', error);
    throw error;
  }
};

export default {
  getAllTaskers,
  getTopRatedTaskers,
  getTaskerById,
  updateTaskerAvailability
}; 