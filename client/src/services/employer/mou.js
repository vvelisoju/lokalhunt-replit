import api, { makeRoleAwareRequest } from '../api'

// Individual functions for named exports
export const getMous = async (params = {}) => {
  try {
    const response = await makeRoleAwareRequest(api, '/employers/mous', { params })
    return { success: true, data: response.data || response }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch MOUs'
    }
  }
}

export const createMou = async (mouData) => {
  try {
    const response = await makeRoleAwareRequest(api, '/employers/mous', {
      method: 'POST',
      data: mouData
    })
    return { success: true, data: response.data || response }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create MOU'
    }
  }
}

export const updateMou = async (mouId, mouData) => {
  try {
    const response = await makeRoleAwareRequest(api, `/employers/mous/${mouId}`, {
      method: 'PUT',
      data: mouData
    })
    return { success: true, data: response.data || response }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update MOU'
    }
  }
}

export const deleteMou = async (mouId) => {
  try {
    const response = await makeRoleAwareRequest(api, `/employers/mous/${mouId}`, {
      method: 'DELETE'
    })
    return { success: true, data: response.data || response }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete MOU'
    }
  }
}

// Keep the object export for backward compatibility
export const employerMouService = {
  getMous,
  createMou,
  updateMou,
  deleteMou
}