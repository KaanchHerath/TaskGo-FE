import axiosInstance from './axiosConfig';
import { useMemo } from 'react';
import { PROVINCES, DISTRICTS } from '../../config/locations';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

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

// ============================================================================
// PUBLIC TASK OPERATIONS (Available to all users)
// ============================================================================

/**
 * Get all available tasks with filters and pagination
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Tasks data with pagination
 */
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

    const response = await axiosInstance.get(`/tasks?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Get a single task by ID
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Task data
 */
export const getTask = async (taskId) => {
  try {
    const response = await axiosInstance.get(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
};

/**
 * Get category statistics
 * @returns {Promise<Object>} Category statistics
 */
export const getCategoryStats = async () => {
  try {
    const response = await axiosInstance.get('/tasks/category-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching category stats:', error);
    throw error;
  }
};

// Memoized version of getCategoryStats for use in components
export const useCategoryStats = () => {
  return useMemo(() => getCategoryStats, []);
};

// ============================================================================
// CUSTOMER OPERATIONS (Task creation and management)
// ============================================================================

/**
 * Create a new task
 * @param {Object} taskData - Task data
 * @returns {Promise<Object>} Created task data
 */
export const createTask = async (taskData) => {
  try {
    const response = await axiosInstance.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Create a targeted task for a specific tasker
 * @param {Object} taskData - Task data
 * @param {string} targetedTaskerId - Target tasker ID
 * @returns {Promise<Object>} Created targeted task data
 */
export const createTargetedTask = async (taskData, targetedTaskerId) => {
  try {
    const targetedTaskData = {
      ...taskData,
      targetedTasker: targetedTaskerId,
      isTargeted: true
    };
    const response = await axiosInstance.post('/tasks', targetedTaskData);
    return response.data;
  } catch (error) {
    console.error('Error creating targeted task:', error);
    throw error;
  }
};

/**
 * Get applications for a task (task owner only)
 * @param {string} taskId - Task ID
 * @param {string} status - Optional status filter
 * @returns {Promise<Object>} Applications data
 */
export const getTaskApplications = async (taskId, status = '') => {
  try {
    const params = status ? `?status=${status}` : '';
    const response = await axiosInstance.get(`/tasks/${taskId}/applications${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task applications:', error);
    throw error;
  }
};

/**
 * Select a tasker for a task
 * @param {string} taskId - Task ID
 * @param {string} taskerId - Tasker ID
 * @param {string} agreedTime - Agreed time
 * @param {number} agreedPayment - Agreed payment
 * @returns {Promise<Object>} Updated task data
 */
export const selectTasker = async (taskId, taskerId, agreedTime, agreedPayment) => {
  try {
    const response = await axiosInstance.post(`/tasks/${taskId}/select-tasker`, {
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

/**
 * Complete a task with rating and review (customer)
 * @param {string} taskId - Task ID
 * @param {number} rating - Rating (1-5)
 * @param {string} review - Review text
 * @returns {Promise<Object>} Completed task data
 */
export const completeTask = async (taskId, rating, review) => {
  try {
    const response = await axiosInstance.post(`/tasks/${taskId}/complete`, {
      rating,
      review
    });
    return response.data;
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
};

/**
 * Get tasks by customer ID
 * @param {string} customerId - Customer ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Customer tasks data
 */
export const getTasksByCustomerId = async (customerId, options = {}) => {
  try {
    const { status, page = 1, limit = 10 } = options;
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    params.append('page', page);
    params.append('limit', limit);

    const response = await axiosInstance.get(`/tasks/customer/${customerId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks by customer ID:', error);
    throw error;
  }
};

// ============================================================================
// TASKER OPERATIONS (Task applications and completion)
// ============================================================================

/**
 * Apply for a task
 * @param {string} taskId - Task ID
 * @param {Object} applicationData - Application data
 * @returns {Promise<Object>} Application data
 */
export const applyForTask = async (taskId, applicationData) => {
  try {
    const response = await axiosInstance.post(`/tasks/${taskId}/apply`, applicationData);
    return response.data;
  } catch (error) {
    console.error('Error applying for task:', error);
    throw error;
  }
};

/**
 * Confirm time and payment (tasker)
 * @param {string} taskId - Task ID
 * @param {string} confirmedTime - Confirmed time
 * @param {number} confirmedPayment - Confirmed payment
 * @returns {Promise<Object>} Updated application data
 */
export const confirmTime = async (taskId, confirmedTime, confirmedPayment) => {
  try {
    const response = await axiosInstance.post(`/tasks/${taskId}/confirm-time`, {
      confirmedTime,
      confirmedPayment
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming time:', error);
    throw error;
  }
};

/**
 * Confirm schedule (tasker)
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Updated task data
 */
export const confirmSchedule = async (taskId) => {
  try {
    const response = await axiosInstance.post(`/tasks/${taskId}/confirm-schedule`);
    return response.data;
  } catch (error) {
    console.error('Error confirming schedule:', error);
    throw error;
  }
};

/**
 * Mark task as complete (tasker)
 * @param {string} taskId - Task ID
 * @param {Object} completionData - Completion data
 * @returns {Promise<Object>} Updated task data
 */
export const taskerCompleteTask = async (taskId, completionData) => {
  try {
    const response = await axiosInstance.post(`/tasks/${taskId}/tasker-complete`, completionData);
    return response.data;
  } catch (error) {
    console.error('Error marking task complete:', error);
    throw error;
  }
};

// ============================================================================
// SHARED OPERATIONS (Both customer and tasker)
// ============================================================================

/**
 * Mark scheduled task as complete (customer or tasker)
 * @param {string} taskId - Task ID
 * @param {Object} completionData - Completion data
 * @returns {Promise<Object>} Updated task data
 */
export const markTaskComplete = async (taskId, completionData) => {
  try {
    const response = await axiosInstance.post(`/tasks/${taskId}/mark-complete`, completionData);
    return response.data;
  } catch (error) {
    console.error('Error marking task complete:', error);
    throw error;
  }
};

/**
 * Cancel scheduled task (customer or tasker)
 * @param {string} taskId - Task ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Updated task data
 */
export const cancelScheduledTask = async (taskId, reason) => {
  try {
    const response = await axiosInstance.post(`/tasks/${taskId}/cancel-schedule`, {
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Error canceling scheduled task:', error);
    throw error;
  }
};

// ============================================================================
// FILE UPLOAD OPERATIONS
// ============================================================================

/**
 * Upload task photos
 * @param {File[]} files - Array of photo files
 * @returns {Promise<Object>} Upload response with photo URLs
 */
export const uploadTaskPhotos = async (files) => {
  try {
    const formData = new FormData();
    
    // Append multiple files
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }
    
    const response = await axiosInstance.post('/tasks/upload-photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading task photos:', error);
    throw error;
  }
};

/**
 * Upload completion photo
 * @param {File} file - Photo file
 * @returns {Promise<Object>} Upload response with photo URL
 */
export const uploadCompletionPhoto = async (file) => {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await axiosInstance.post('/tasks/upload-completion-photo', formData, {
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

// ============================================================================
// USER-SPECIFIC OPERATIONS 
// ============================================================================

/**
 * Get current user's tasks
 * @param {string} status - Optional status filter
 * @returns {Promise<Object>} User's tasks data
 */
export const getMyTasks = async (status = '') => {
  try {
    const params = status ? `?status=${status}` : '';
    const response = await axiosInstance.get(`/tasks/my-tasks${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my tasks:', error);
    throw error;
  }
};

/**
 * Get current user's applications (tasker only)
 * @param {string} status - Optional status filter
 * @returns {Promise<Object>} User's applications data
 */
export const getMyApplications = async (status = '') => {
  try {
    const params = status ? `?status=${status}` : '';
    const response = await axiosInstance.get(`/tasks/my-applications${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my applications:', error);
    throw error;
  }
};

/**
 * Get available tasks for taskers (alias for getTasks with better naming)
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Available tasks data
 */
export const getAvailableTasks = async (filters = {}) => {
  return getTasks(filters);
};

/**
 * Get the 3 most recent tasks for the current user (sorted by createdAt descending)
 * @returns {Promise<Object>} Recent tasks data
 */
export const getMyRecentTasks = async () => {
  const data = await getMyTasks();
  const allTasks = data.data || [];
  // Sort by createdAt descending and take the first 3
  const recentTasks = allTasks
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);
  return { data: recentTasks };
};

// ============================================================================
// ALIASES FOR BACKWARD COMPATIBILITY
// ============================================================================

export const getUserTasks = getMyTasks;
export const getTaskerTasks = getMyTasks;
export const getTaskerApplications = getMyApplications;

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export const taskService = {
  // Constants
  TASK_CATEGORIES,
  
  // Public operations
  getTasks,
  getTask,
  getCategoryStats,
  useCategoryStats,
  
  // Customer operations
  createTask,
  createTargetedTask,
  getTaskApplications,
  selectTasker,
  completeTask,
  getTasksByCustomerId,
  
  // Tasker operations
  applyForTask,
  confirmTime,
  confirmSchedule,
  taskerCompleteTask,
  
  // Shared operations
  markTaskComplete,
  cancelScheduledTask,
  
  // File uploads
  uploadTaskPhotos,
  uploadCompletionPhoto,
  
  // User-specific operations
  getMyTasks,
  getMyApplications,
  getAvailableTasks,
  getMyRecentTasks,
  
  // Aliases
  getUserTasks,
  getTaskerTasks,
  getTaskerApplications
}; 