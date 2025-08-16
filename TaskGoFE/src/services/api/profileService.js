import axiosInstance from './axiosConfig';

/**
 * Get user's profile information
 * @returns {Promise<Object>} User profile data
 */
export const getProfile = async () => {
  const response = await axiosInstance.get('/users/profile');
  return response.data;
};

/**
 * Update user's profile information
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile data
 */
export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put('/users/profile', profileData);
  return response.data;
};

/**
 * Change user's password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success message
 */
export const changePassword = async (currentPassword, newPassword) => {
  const response = await axiosInstance.put('/users/change-password', {
    currentPassword,
    newPassword
  });
  return response.data;
};

/**
 * Helper function to build profile update payload
 * @param {Object} formData - Form data from the UI
 * @param {string} userRole - User's role (customer/tasker)
 * @returns {Object} Formatted profile update payload
 */
export const buildProfileUpdatePayload = (formData, userRole) => {
  const payload = {
    fullName: formData.fullName,
    phone: formData.phone
  };

  if (userRole === 'tasker') {
    payload.taskerProfile = {
      bio: formData.bio,
      experience: formData.experience,
      skills: formData.skills,
      area: formData.area,
      hourlyRate: formData.hourlyRate,
      advancePaymentAmount: formData.advancePaymentAmount,
      isAvailable: formData.isAvailable
    };
  } else if (userRole === 'customer') {
    payload.customerProfile = {
      province: formData.province,
      bio: formData.bio
    };
  }

  return payload;
}; 