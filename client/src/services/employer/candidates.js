
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
    // Ensure we're sending the correct status value
    const validStatuses = [
      'APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 
      'INTERVIEW_COMPLETED', 'HIRED', 'HOLD', 'REJECTED'
    ];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    const response = await api.patch(`/employers/allocations/${allocationId}`, {
      status,
      notes: notes || ''
    })
    return { success: true, data: response.data }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to update candidate status' 
    }
  }
}
