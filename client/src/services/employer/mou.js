
import api from '../api'

export const getMous = async () => {
  try {
    const response = await api.get('/employers/mous')
    return { success: true, data: response.data }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch MOUs' 
    }
  }
}

export const createMou = async (mouData) => {
  try {
    const response = await api.post('/employers/mous', mouData)
    return { success: true, data: response.data }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to create MOU' 
    }
  }
}
