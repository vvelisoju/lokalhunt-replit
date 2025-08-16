import api from '../api'

// Get all cities
export const getCities = async () => {
  try {
    const response = await api.get('/public/cities')
    return { success: true, data: response.data.data }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to load cities' 
    }
  }
}

// Get cities by state
export const getCitiesByState = async (stateId) => {
  try {
    const response = await api.get(`/public/cities?stateId=${stateId}`)
    return { success: true, data: response.data.data }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to load cities' 
    }
  }
}