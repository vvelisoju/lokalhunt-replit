import api from '../api'

export const getProfile = async () => {
  try {
    const response = await api.get('/branch-admin/profile');
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Error fetching branch admin profile:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to fetch profile'
    };
  }
};

export const updateProfile = async (profileData) => {
  try {
    // Try the unified profile endpoint first, then fallback to branch admin specific
    let response;
    try {
      response = await api.put('/profile', profileData);
    } catch (error) {
      // Fallback to branch-admin specific endpoint  
      response = await api.put('/branch-admins/profile', profileData);
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to update profile' 
    };
  }
}

export const updatePassword = async (passwordData) => {
  try {
    // Try the unified profile endpoint first, then fallback to branch admin specific
    let response;
    try {
      response = await api.put('/profile/password', passwordData);
    } catch (error) {
      // Fallback to branch-admin specific endpoint
      response = await api.put('/branch-admins/profile/password', passwordData);
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating password:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to update password' 
    };
  }
}