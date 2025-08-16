import api from '../api';

export const getMous = async (employerId = null) => {
  try {
    const params = employerId ? { employerId } : {};
    const response = await api.get('/branch-admins/mous', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch MOUs'
    };
  }
};

export const getMou = async (mouId) => {
  try {
    const response = await api.get(`/branch-admins/mous/${mouId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch MOU details'
    };
  }
};

export const createMou = async (employerId, mouData) => {
  try {
    const response = await api.post('/branch-admins/mous', {
      employerId,
      ...mouData
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to create MOU'
    };
  }
};

export const updateMou = async (mouId, mouData) => {
  try {
    const response = await api.put(`/branch-admins/mous/${mouId}`, mouData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update MOU'
    };
  }
};

export const activateMou = async (mouId) => {
  try {
    const response = await api.patch(`/branch-admins/mous/${mouId}/activate`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to activate MOU'
    };
  }
};

export const deactivateMou = async (mouId, notes = '') => {
  try {
    const response = await api.patch(`/branch-admins/mous/${mouId}/deactivate`, { notes });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to deactivate MOU'
    };
  }
};