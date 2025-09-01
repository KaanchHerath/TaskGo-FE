import axiosInstance from './axiosConfig';

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await axiosInstance.put('/users/change-password', {
      currentPassword,
      newPassword,
      confirmPassword: newPassword // Backend validation requires this
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Get approval status for taskers
export const getApprovalStatus = async () => {
  try {
    const response = await axiosInstance.get('/users/approval-status');
    return response.data;
  } catch (error) {
    console.error('Error fetching approval status:', error);
    throw error;
  }
}; 