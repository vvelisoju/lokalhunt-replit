import api from '../api'

export const getEmployerDetails = async (employerId) => {
  try {
    const response = await api.get(`/branch-admins/employers/${employerId}`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error getting employer details:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to get employer details' 
    }
  }
}

export const approveAd = async (adId) => {
  try {
    const response = await api.post(`/branch-admins/ads/${adId}/approve`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error approving ad:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to approve ad' 
    }
  }
}

export const rejectAd = async (adId, reason) => {
  try {
    const response = await api.post(`/branch-admins/ads/${adId}/reject`, { reason })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error rejecting ad:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to reject ad' 
    }
  }
}

// Additional employer management functions
export const getEmployer = async (employerId) => {
  return getEmployerDetails(employerId)
}

export const approveEmployer = async (employerId) => {
  try {
    const response = await api.post(`/branch-admins/employers/${employerId}/approve`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error approving employer:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to approve employer' 
    }
  }
}

export const rejectEmployer = async (employerId, reason) => {
  try {
    const response = await api.post(`/branch-admins/employers/${employerId}/reject`, { reason })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error rejecting employer:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to reject employer' 
    }
  }
}

export const blockEmployer = async (employerId, reason) => {
  try {
    const response = await api.post(`/branch-admins/employers/${employerId}/block`, { reason })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error blocking employer:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to block employer' 
    }
  }
}

export const unblockEmployer = async (employerId) => {
  try {
    const response = await api.post(`/branch-admins/employers/${employerId}/unblock`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error unblocking employer:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to unblock employer' 
    }
  }
}

export const getEmployers = async (params = {}) => {
  try {
    const response = await api.get('/branch-admins/employers', { params })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error getting employers:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to get employers' 
    }
  }
}

// Create new employer
export const createEmployer = async (employerData) => {
  try {
    const response = await api.post('/branch-admins/employers', employerData)
    return { success: true, data: response.data.data }
  } catch (error) {
    console.error('Error creating employer:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to create employer' 
    }
  }
}

// Update employer
export const updateEmployer = async (employerId, employerData) => {
  try {
    const response = await api.put(`/branch-admins/employers/${employerId}`, employerData)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating employer:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to update employer' 
    }
  }
}

// Delete employer
export const deleteEmployer = async (employerId) => {
  try {
    const response = await api.delete(`/branch-admins/employers/${employerId}`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error deleting employer:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to delete employer' 
    }
  }
}