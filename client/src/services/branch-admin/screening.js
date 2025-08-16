import api from '../api';

export const getCandidatesToScreen = async (params = {}) => {
  try {
    const response = await api.get('/branch-admins/screening/candidates', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch candidates to screen'
    };
  }
};

export const getCandidateScreeningDetail = async (candidateId) => {
  try {
    const response = await api.get(`/branch-admins/screening/candidates/${candidateId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch candidate screening details'
    };
  }
};

export const updateScreeningStatus = async (allocationId, status, notes = '') => {
  try {
    const response = await api.patch(`/branch-admins/screening/allocations/${allocationId}`, {
      screeningStatus: status,
      screeningNotes: notes
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update screening status'
    };
  }
};

export const rateCandidate = async (candidateId, rating, notes = '') => {
  try {
    const response = await api.post(`/branch-admins/screening/candidates/${candidateId}/rate`, {
      rating,
      notes
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to rate candidate'
    };
  }
};

export const getScreeningHistory = async (candidateId) => {
  try {
    const response = await api.get(`/branch-admins/screening/candidates/${candidateId}/history`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch screening history'
    };
  }
};