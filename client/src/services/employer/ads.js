import { makeRoleAwareRequest } from '../api'

export const createAd = async (adData) => {
  try {
    const response = await makeRoleAwareRequest('/employers/ads', {
      method: 'POST',
      data: adData
    })
    return { success: true, data: response }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to create ad' 
    }
  }
}

export const updateAd = async (adId, adData) => {
  try {
    const response = await makeRoleAwareRequest(`/employers/ads/${adId}`, {
      method: 'PUT',
      data: adData
    })
    return { success: true, data: response }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update ad' 
    }
  }
}

export const getAds = async (params = {}) => {
  try {
    const response = await makeRoleAwareRequest('/employers/ads', {
      params
    })
    return { success: true, data: response }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch ads' 
    }
  }
}

export const getAd = async (adId) => {
  try {
    const response = await makeRoleAwareRequest(`/employers/ads/${adId}`)
    return { success: true, data: response }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch ad' 
    }
  }
}

export const submitForApproval = async (adId) => {
  try {
    const response = await makeRoleAwareRequest(`/employers/ads/${adId}/submit`, {
      method: 'PATCH'
    })
    return { success: true, data: response }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to submit ad for approval' 
    }
  }
}

export const archiveAd = async (adId) => {
  try {
    const response = await makeRoleAwareRequest(`/employers/ads/${adId}/archive`, {
      method: 'PATCH'
    })
    return { success: true, data: response }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to archive ad' 
    }
  }
}