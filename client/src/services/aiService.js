
import api from './api';

export const generateJobDescription = async (jobData) => {
  try {
    console.log('🤖 Calling AI Service with data:', jobData);
    const response = await api.post('/ai/generate-job-description', jobData);
    console.log('✅ AI Service Response:', response.data);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('❌ AI Service Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || 'Failed to generate job description'
    };
  }
};
