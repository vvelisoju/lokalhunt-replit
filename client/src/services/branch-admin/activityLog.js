import api from '../api';

export const getActivityLog = async (params = {}) => {
  try {
    const response = await api.get('/branch-admins/activity-logs', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch activity logs'
    };
  }
};

export const getActivityLogDetail = async (logId) => {
  try {
    const response = await api.get(`/branch-admins/activity-logs/${logId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch activity log details'
    };
  }
};

export const exportActivityLog = async (params = {}) => {
  try {
    const response = await api.get('/branch-admins/activity-logs/export', { 
      params,
      responseType: 'blob'
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to export activity logs'
    };
  }
};