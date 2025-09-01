import api from '../api'

export const getProfile = async () => {
  try {
    const response = await api.get('/employers/profile')
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch profile'
    }
  }
}

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/employers/profile', profileData)
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update profile'
    }
  }
}

export const updatePassword = async (passwordData) => {
  try {
    const response = await api.put('/employers/change-password', passwordData)
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update password'
    }
  }
}