import axiosInstance from './axiosConfig';

// Send a message
export const sendMessage = async (messageData) => {
  try {
    const response = await axiosInstance.post('/chat', messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages for a specific task and user
export const getMessages = async (taskId, userId, options = {}) => {
  try {
    const { page = 1, limit = 50 } = options;
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);

    const response = await axiosInstance.get(`/chat/${taskId}/${userId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Get unread message count
export const getUnreadCount = async () => {
  try {
    const response = await axiosInstance.get('/chat/unread-count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

// Mark messages as read for a specific task
export const markMessagesAsRead = async (taskId) => {
  try {
    const response = await axiosInstance.put(`/chat/${taskId}/mark-read`);
    return response.data;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Default export with all methods
export const chatService = {
  sendMessage,
  getMessages,
  getUnreadCount,
  markMessagesAsRead
};

export default chatService; 