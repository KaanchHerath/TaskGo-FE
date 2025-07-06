import { APP_CONFIG } from '../../config/appConfig';

const API_BASE_URL = APP_CONFIG.API.BASE_URL;

/**
 * Get user's profile information
 * @returns {Promise<Object>} User profile data
 */
export const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch profile');
  }

  return await response.json();
};

/**
 * Update user's profile information
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile data
 */
export const updateProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }

  return await response.json();
};

/**
 * Change user's password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success message
 */
export const changePassword = async (currentPassword, newPassword) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      currentPassword,
      newPassword
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to change password');
  }

  return await response.json();
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