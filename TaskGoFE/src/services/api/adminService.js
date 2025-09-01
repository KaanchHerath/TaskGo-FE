import axiosInstance from './axiosConfig';

/**
 * Fetch comprehensive dashboard statistics
 * @returns {Promise<Object>} Dashboard stats data
 */
export const getDashboardStats = async () => {
  const response = await axiosInstance.get('/admin/dashboard/stats');
  return response.data?.data;
};

/**
 * Fetch task statistics with charts data
 * @returns {Promise<Object>} Task statistics data
 */
export const getTaskStats = async () => {
  const response = await axiosInstance.get('/admin/dashboard/tasks/stats');
  return response.data?.data;
};

/**
 * Fetch user statistics with registration trends
 * @returns {Promise<Object>} User statistics data
 */
export const getUserStats = async () => {
  const response = await axiosInstance.get('/admin/dashboard/users/stats');
  return response.data?.data;
};

/**
 * Fetch payment statistics
 * @returns {Promise<Object>} Payment statistics data
 */
export const getPaymentStats = async () => {
  const response = await axiosInstance.get('/admin/dashboard/payments/stats');
  return response.data?.data;
};

/**
 * Fetch recent activity feed
 * @param {number} limit - Number of activities to fetch
 * @returns {Promise<Array>} Recent activities
 */
export const getRecentActivity = async (limit = 10) => {
  const response = await axiosInstance.get(`/admin/dashboard/recent-activity?limit=${limit}`);
  return response.data?.data;
};

/**
 * Fetch pending taskers for approval
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Pending taskers with pagination
 */
export const getPendingTaskers = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await axiosInstance.get(`/admin/taskers/pending?${params}`);
  const body = response.data || {};
  return {
    taskers: body.data || [],
    pagination: body.pagination || { page: 1, limit: 0, total: 0, totalPages: 0 },
  };
};

/**
 * Approve a tasker
 * @param {string} taskerId - Tasker ID
 * @param {Object} approvalData - Approval data
 * @returns {Promise<Object>} Approval result
 */
export const approveTasker = async (taskerId, approvalData = {}) => {
  const response = await axiosInstance.post(`/admin/taskers/${taskerId}/approve`, approvalData);
  return response.data?.data;
};

/**
 * Reject a tasker
 * @param {string} taskerId - Tasker ID
 * @param {Object} rejectionData - Rejection data
 * @returns {Promise<Object>} Rejection result
 */
export const rejectTasker = async (taskerId, rejectionData = {}) => {
  const response = await axiosInstance.post(`/admin/taskers/${taskerId}/reject`, rejectionData);
  return response.data?.data;
};

/**
 * Get tasker approval statistics
 * @returns {Promise<Object>} { stats: { pending, approved, rejected, total }, recentActivities }
 */
export const getApprovalStatsAdmin = async () => {
  const response = await axiosInstance.get('/admin/taskers/approval-stats');
  return response.data?.data;
};

/**
 * Fetch users with filters and pagination
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Users with pagination
 */
export const getUsers = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await axiosInstance.get(`/admin/users?${params}`);
  const body = response.data || {};
  return {
    users: body.data || [],
    pagination: body.pagination || { page: 1, limit: 0, total: 0, totalPages: 0 },
    total: (body.pagination && body.pagination.total) || 0
  };
};

/**
 * Get user details by ID
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export const getUserDetails = async (userId) => {
  const response = await axiosInstance.get(`/admin/users/${userId}`);
  return response.data?.data?.user;
};

/**
 * Suspend or unsuspend a user
 * @param {string} userId 
 * @param {Object} suspensionData 
 * @returns {Promise<Object>} 
 */
export const suspendUser = async (userId, suspensionData = {}) => {
  const response = await axiosInstance.put(`/admin/users/${userId}/suspend`, suspensionData);
  return response.data;
};

/**
 * Delete a user
 * @param {string} userId 
 * @returns {Promise<Object>} 
 */
export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/admin/users/${userId}`);
  return response.data;
};

/**
 * Fetch tasks with filters and pagination
 * @param {Object} filters
 * @returns {Promise<Object>} 
 */
export const getTasks = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await axiosInstance.get(`/admin/tasks?${params}`);
  return response.data;
};

/**
 * Get task details by ID
 * @param {string} taskId 
 * @returns {Promise<Object>} 
 */
export const getTaskDetails = async (taskId) => {
  const response = await axiosInstance.get(`/admin/tasks/${taskId}`);
  return response.data;
};

/**
 * Update task status
 * @param {string} taskId - Task ID
 * @param {Object} statusData - Status update data
 * @returns {Promise<Object>} Update result
 */
export const updateTaskStatus = async (taskId, statusData = {}) => {
  // Backend expects PUT on /api/admin/tasks/:taskId/status
  const response = await axiosInstance.put(`/admin/tasks/${taskId}/status`, statusData);
  return response.data;
};

/**
 * Clear dashboard cache
 * @returns {Promise<Object>} Cache clearing result
 */
export const clearDashboardCache = async () => {
  const response = await axiosInstance.post('/admin/dashboard/clear-cache');
  return response.data;
}; 