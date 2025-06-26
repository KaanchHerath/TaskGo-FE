import axiosInstance from './axiosConfig';

// Task categories for the dropdown
export const TASK_CATEGORIES = [
  'Home Maintenance',
  'Cleaning',
  'Moving',
  'Handyman',
  'Gardening',
  'Painting',
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Assembly',
  'Delivery',
  'Personal Assistant',
  'Pet Care',
  'Tutoring',
  'Other'
];

// Sri Lankan districts for area selection (kept the same export name for backward compatibility)
export const CANADIAN_PROVINCES = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Moneragala',
  'Ratnapura',
  'Kegalle'
];

// Create a new task
export const createTask = async (taskData) => {
  try {
    const response = await axiosInstance.post('/v1/tasks', taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Create a targeted task for a specific tasker
export const createTargetedTask = async (taskData, targetedTaskerId) => {
  try {
    const targetedTaskData = {
      ...taskData,
      targetedTasker: targetedTaskerId,
      isTargeted: true
    };
    const response = await axiosInstance.post('/v1/tasks', targetedTaskData);
    return response.data;
  } catch (error) {
    console.error('Error creating targeted task:', error);
    throw error;
  }
};

// Get all tasks with filters
export const getTasks = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.area) params.append('area', filters.area);
    if (filters.minPayment) params.append('minPayment', filters.minPayment);
    if (filters.maxPayment) params.append('maxPayment', filters.maxPayment);
    if (filters.status) params.append('status', filters.status);
    if (filters.tags) params.append('tags', filters.tags);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await axiosInstance.get(`/v1/tasks?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Get single task
export const getTask = async (taskId) => {
  try {
    const response = await axiosInstance.get(`/v1/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
};

// Apply for a task
export const applyForTask = async (taskId, applicationData) => {
  try {
    const response = await axiosInstance.post(`/v1/tasks/${taskId}/apply`, applicationData);
    return response.data;
  } catch (error) {
    console.error('Error applying for task:', error);
    throw error;
  }
};

// Get applications for a task (task owner only)
export const getTaskApplications = async (taskId, status = '') => {
  try {
    const params = status ? `?status=${status}` : '';
    const response = await axiosInstance.get(`/v1/tasks/${taskId}/applications${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task applications:', error);
    throw error;
  }
};

// Select tasker for task
export const selectTasker = async (taskId, taskerId, agreedTime, agreedPayment) => {
  try {
    const response = await axiosInstance.post(`/v1/tasks/${taskId}/select-tasker`, {
      taskerId,
      agreedTime,
      agreedPayment
    });
    return response.data;
  } catch (error) {
    console.error('Error selecting tasker:', error);
    throw error;
  }
};

// Confirm time and payment (tasker)
export const confirmTime = async (taskId, confirmedTime, confirmedPayment) => {
  try {
    const response = await axiosInstance.post(`/v1/tasks/${taskId}/confirm-time`, {
      confirmedTime,
      confirmedPayment
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming time:', error);
    throw error;
  }
};

// Confirm schedule (tasker)
export const confirmSchedule = async (taskId) => {
  try {
    const response = await axiosInstance.post(`/v1/tasks/${taskId}/confirm-schedule`);
    return response.data;
  } catch (error) {
    console.error('Error confirming schedule:', error);
    throw error;
  }
};

// Complete task (customer)
export const completeTask = async (taskId, rating, review) => {
  try {
    const response = await axiosInstance.post(`/v1/tasks/${taskId}/complete`, {
      rating,
      review
    });
    return response.data;
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
};

// Tasker complete task
export const taskerCompleteTask = async (taskId, completionData) => {
  try {
    const response = await axiosInstance.post(`/v1/tasks/${taskId}/tasker-complete`, completionData);
    return response.data;
  } catch (error) {
    console.error('Error marking task complete:', error);
    throw error;
  }
};

// Mark scheduled task as complete (customer or tasker)
export const markTaskComplete = async (taskId, completionData) => {
  try {
    const response = await axiosInstance.post(`/v1/tasks/${taskId}/mark-complete`, completionData);
    return response.data;
  } catch (error) {
    console.error('Error marking task complete:', error);
    throw error;
  }
};

// Cancel scheduled task (customer or tasker)
export const cancelScheduledTask = async (taskId, reason) => {
  try {
    const response = await axiosInstance.post(`/v1/tasks/${taskId}/cancel-schedule`, {
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Error canceling scheduled task:', error);
    throw error;
  }
};

// Upload completion photos
export const uploadCompletionPhoto = async (file) => {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await axiosInstance.post('/v1/tasks/upload-completion-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading completion photo:', error);
    throw error;
  }
};

// Get user's tasks
export const getMyTasks = async (status = '') => {
  try {
    const params = status ? `?status=${status}` : '';
    const response = await axiosInstance.get(`/v1/tasks/my-tasks${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my tasks:', error);
    throw error;
  }
};

// Get tasks by customer ID
export const getTasksByCustomerId = async (customerId, options = {}) => {
  try {
    const { status, page = 1, limit = 10 } = options;
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    params.append('page', page);
    params.append('limit', limit);

    const response = await axiosInstance.get(`/v1/tasks/customer/${customerId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks by customer ID:', error);
    throw error;
  }
};

// Get user's applications
export const getMyApplications = async (status = '') => {
  try {
    const params = status ? `?status=${status}` : '';
    const response = await axiosInstance.get(`/v1/tasks/my-applications${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my applications:', error);
    throw error;
  }
};

// Alias methods for dashboard consistency
export const getUserTasks = getMyTasks;
export const getTaskerTasks = getMyTasks;
export const getTaskerApplications = getMyApplications;

// Default export with all methods
export const taskService = {
  createTask,
  getTasks,
  getTask,
  applyForTask,
  getTaskApplications,
  selectTasker,
  confirmTime,
  confirmSchedule,
  completeTask,
  taskerCompleteTask,
  getMyTasks,
  getMyApplications,
  getUserTasks,
  getTaskerTasks,
  getTaskerApplications,
  TASK_CATEGORIES,
  CANADIAN_PROVINCES,
  getTasksByCustomerId
}; 