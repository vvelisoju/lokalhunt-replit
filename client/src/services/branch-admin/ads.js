import api from '../api';

export const getAds = async (params = {}) => {
  try {
    const response = await api.get('/branch-admins/ads', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch ads'
    };
  }
};

export const getAd = async (adId) => {
  try {
    const response = await api.get(`/branch-admins/ads/${adId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch ad details'
    };
  }
};

export const approveAd = async (adId) => {
  try {
    const response = await api.post(`/branch-admins/ads/${adId}/approve`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Approve ad error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to approve ad'
    };
  }
};

export const rejectAd = async (adId, notes) => {
  try {
    const response = await api.post(`/branch-admins/ads/${adId}/reject`, { notes });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Reject ad error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to reject ad'
    };
  }
};

export const bulkApproveAds = async (adIds) => {
  try {
    const response = await api.patch('/branch-admins/ads/bulk-approve', { adIds });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to bulk approve ads'
    };
  }
};

export const bulkRejectAds = async (adIds, notes) => {
  try {
    const response = await api.patch('/branch-admins/ads/bulk-reject', { adIds, notes });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to bulk reject ads'
    };
  }
};