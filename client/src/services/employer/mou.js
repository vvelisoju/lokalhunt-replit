import { makeRoleAwareRequest } from '../api'

export const getMous = async () => {
  try {
    const response = await makeRoleAwareRequest('/employers/mous')
    return { success: true, data: response }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch MOUs' 
    }
  }
}

export const createMou = async (mouData) => {
  try {
    const response = await makeRoleAwareRequest('/employers/mous', {
      method: 'POST',
      data: mouData
    })
    return { success: true, data: response }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to create MOU' 
    }
  }
}