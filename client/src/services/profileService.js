import api from './api';

export const profileService = {
  // Get current user profile
  async getProfile() {
    try {
      const response = await api.get('/profile');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get profile'
      };
    }
  },

  // Update profile (basic info)
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Failed to update profile'
      };
    }
  },

  // Update password
  async updatePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating password:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Failed to update password'
      };
    }
  },

  // Delete profile
  async deleteProfile() {
    try {
      const response = await api.delete('/profile');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Delete profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete profile'
      };
    }
  }
};

export default profileService;