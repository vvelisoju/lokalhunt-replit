import api from '../api';

export const getBranchStats = async () => {
  try {
    const response = await api.get('/branch-admins/stats');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch branch statistics'
    };
  }
};

export const getQuickActions = async () => {
  try {
    const response = await api.get('/branch-admins/quick-actions');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch quick actions'
    };
  }
};