import api from '../api';

export const getReports = async (params = {}) => {
  try {
    const response = await api.get('/branch-admins/reports', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch reports'
    };
  }
};

export const getBranchStatistics = async (dateRange = {}) => {
  try {
    const response = await api.get('/branch-admins/reports/statistics', { params: dateRange });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch branch statistics'
    };
  }
};

export const exportReportCSV = async (reportType, params = {}) => {
  try {
    const response = await api.get(`/branch-admins/reports/${reportType}/export`, { 
      params: { ...params, format: 'csv' },
      responseType: 'blob'
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to export CSV report'
    };
  }
};

export const exportReportPDF = async (reportType, params = {}) => {
  try {
    const response = await api.get(`/branch-admins/reports/${reportType}/export`, { 
      params: { ...params, format: 'pdf' },
      responseType: 'blob'
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to export PDF report'
    };
  }
};