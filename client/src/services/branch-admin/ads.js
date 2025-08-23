import api from '../api';

export const getAds = async (params = {}) => {
  try {
    const queryString = new URLSearchParams();

    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, value);
      }
    });

    console.log('Making API call to:', `/branch-admins/ads?${queryString.toString()}`);
    const response = await api.get(`/branch-admins/ads?${queryString.toString()}`);
    console.log('API Response:', response.data);
    
    // Ensure we return a consistent structure
    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        data: response.data.data,
        total: response.data.data?.total || 0,
        pages: response.data.data?.pages || 1
      };
    } else {
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching ads:', error);
    console.error('Error response:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch ads',
      data: { data: [], total: 0, pages: 1 }
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

export const getPendingAds = async (params = {}) => {
  try {
    const queryString = new URLSearchParams();

    // Add all params to query string, ensuring proper handling of search
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, value.toString().trim());
      }
    });

    console.log('Making API call to:', `/branch-admins/ads/pending?${queryString.toString()}`);
    const response = await api.get(`/branch-admins/ads/pending?${queryString.toString()}`);
    console.log('API Response:', response.data);
    
    // Ensure we return a consistent structure
    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        data: {
          ads: response.data.data || [],
          pagination: response.data.pagination || {
            total: 0,
            pages: 1,
            currentPage: 1,
            totalPages: 1
          }
        }
      };
    } else {
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching pending ads:', error);
    console.error('Error response:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch pending ads',
      data: { ads: [], pagination: { total: 0, pages: 1, currentPage: 1, totalPages: 1 } }
    };
  }
};