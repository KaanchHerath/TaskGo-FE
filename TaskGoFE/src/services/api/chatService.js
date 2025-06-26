import axiosInstance from './axiosConfig';

// Send a new chat message
export const sendMessage = async (messageData) => {
  try {
    const response = await axiosInstance.post('/v1/chat', messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get conversation between two users for a specific task
export const getConversation = async (taskId, userId, options = {}) => {
  try {
    const { page = 1, limit = 50 } = options;
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);

    const response = await axiosInstance.get(`/v1/chat/${taskId}/${userId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

// Get unread message count for the authenticated user
export const getUnreadCount = async () => {
  try {
    const response = await axiosInstance.get('/v1/chat/unread-count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

// Mark messages as read for a specific task
export const markMessagesAsRead = async (taskId) => {
  try {
    const response = await axiosInstance.put(`/v1/chat/${taskId}/mark-read`);
    return response.data;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Default export with all methods
export const chatService = {
  sendMessage,
  getConversation,
  getUnreadCount,
  markMessagesAsRead
};

export default chatService; 