import api from '../api'

export const getAdCandidates = async (adId) => {
  try {
    const response = await api.get(`/employers/ads/${adId}/candidates`)
    return { success: true, data: response.data }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch ad candidates' 
    }
  }
}

export const getAllCandidates = async () => {
  try {
    const response = await api.get('/employers/candidates')
    return { success: true, data: response.data }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch candidates' 
    }
  }
}

export const updateCandidateStatus = async (allocationId, status, notes = '') => {
  try {
    const response = await api.patch(`/employers/allocations/${allocationId}`, {
      status,
      notes
    })
    return { success: true, data: response.data }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update candidate status' 
    }
  }
}