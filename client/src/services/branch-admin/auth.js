import api from '../api'

export const getProfile = async () => {
  try {
    const response = await api.get('/branch-admins/profile')
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error getting profile:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to get profile' 
    }
  }
}

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/branch-admins/profile', profileData)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to update profile' 
    }
  }
}

export const updatePassword = async (passwordData) => {
  try {
    const response = await api.put('/branch-admins/profile/password', passwordData)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating password:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to update password' 
    }
  }
}