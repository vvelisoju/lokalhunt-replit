import api from '../api'

export const getEmployerProfile = async () => {
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

export const updateEmployerProfile = async (profileData) => {
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