import api from '../api'

// Get dashboard stats for a specific employer (Branch Admin view)
export const getEmployerDashboardStats = async (employerId) => {
  try {
    const response = await api.get(`/branch-admins/employers/${employerId}/dashboard-stats`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error getting employer dashboard stats:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to get dashboard stats' 
    }
  }
}

// Get profile for a specific employer (Branch Admin view)
export const getEmployerProfile = async (employerId) => {
  try {
    const response = await api.get(`/branch-admins/employers/${employerId}/profile`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error getting employer profile:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to get profile' 
    }
  }
}

// Get ads for a specific employer (Branch Admin view)
export const getEmployerAds = async (employerId, params = {}) => {
  try {
    const response = await api.get(`/branch-admins/employers/${employerId}/ads-list`, { 
      params 
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error getting employer ads:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to get ads' 
    }
  }
}

// Get specific ad details for an employer (Branch Admin view)
export const getEmployerAdDetails = async (employerId, adId) => {
  try {
    const response = await api.get(`/branch-admins/employers/${employerId}/ads-detail/${adId}`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error getting employer ad details:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to get ad details' 
    }
  }
}

// Get candidates for a specific ad (Branch Admin view)
export const getEmployerAdCandidates = async (employerId, adId, params = {}) => {
  try {
    const response = await api.get(`/employers/ads/${adId}/candidates`, { 
      params: { ...params, employerId } 
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error getting employer ad candidates:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to get candidates' 
    }
  }
}

// Get MOUs for a specific employer (Branch Admin view)
export const getEmployerMous = async (employerId) => {
  try {
    const response = await api.get(`/employers/mous`, { 
      params: { employerId } 
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error getting employer MOUs:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to get MOUs' 
    }
  }
}

// Get candidates for a specific employer (Branch Admin view)
export const getEmployerCandidates = async (employerId, params = {}) => {
  try {
    const response = await api.get(`/employers/candidates`, { 
      params: { ...params, employerId } 
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error getting employer candidates:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to get candidates' 
    }
  }
}

// Search candidates for a specific employer (Branch Admin view)
export const searchEmployerCandidates = async (employerId, params = {}) => {
  try {
    const response = await api.get(`/employers/candidates/search`, { 
      params: { ...params, employerId } 
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error searching employer candidates:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to search candidates' 
    }
  }
}

// Get bookmarked candidates for a specific employer (Branch Admin view)
export const getEmployerBookmarkedCandidates = async (employerId, params = {}) => {
  try {
    const response = await api.get(`/employers/candidates/bookmarks`, { 
      params: { ...params, employerId } 
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error getting employer bookmarked candidates:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to get bookmarked candidates' 
    }
  }
}

// Get companies for a specific employer (Branch Admin view)
export const getEmployerCompanies = async (employerId) => {
  try {
    const response = await api.get(`/branch-admins/employers/${employerId}/companies-list`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error getting employer companies:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to get companies' 
    }
  }
}

// Get specific company details for an employer (Branch Admin view)
export const getEmployerCompanyDetails = async (employerId, companyId) => {
  try {
    const response = await api.get(`/branch-admins/employers/${employerId}/companies-detail/${companyId}`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error getting employer company details:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to get company details' 
    }
  }
}

// Get subscription for a specific employer (Branch Admin view)
export const getEmployerSubscription = async (employerId) => {
  try {
    // This would be a placeholder until subscription endpoints are implemented
    const response = await api.get(`/employers/subscription`, { 
      params: { employerId } 
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error getting employer subscription:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to get subscription' 
    }
  }
}