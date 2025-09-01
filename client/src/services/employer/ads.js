import api from "../api";

export const createAd = async (adData) => {
  try {
    const response = await api.post('/employers/ads', adData)
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create ad'
    }
  }
}

export const updateAd = async (adId, adData) => {
  try {
    const response = await api.put(`/employers/ads/${adId}`, adData)
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update ad'
    }
  }
}

export const getAds = async (params = {}) => {
  try {
    const response = await api.get('/employers/ads', {
      params
    })
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch ads'
    }
  }
}

export const getAd = async (adId) => {
  try {
    const response = await api.get(`/employers/ads/${adId}`)
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch ad'
    }
  }
}

export const submitForApproval = async (adId) => {
  try {
    const response = await api.patch(`/employers/ads/${adId}/submit`)
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to submit ad for approval'
    }
  }
}

export const archiveAd = async (adId) => {
  try {
    const response = await api.patch(`/employers/ads/${adId}/archive`)
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to archive ad'
    }
  }
}