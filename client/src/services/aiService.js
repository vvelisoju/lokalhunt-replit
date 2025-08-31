import { createAxiosInstance } from './axiosFactory';

// Create AI service instance with longer timeout
const api = createAxiosInstance({
  serviceName: 'AI Service',
  timeout: 30000, // 30 seconds timeout for AI operations
  withCredentials: true,
  requireAuth: true
});

const aiService = {
  // Analyze resume content
  analyzeResume: async (resumeData) => {
    try {
      const response = await api.post('/ai/analyze-resume', { resumeData });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get job recommendations based on profile
  getJobRecommendations: async (profileData) => {
    try {
      const response = await api.post('/ai/recommend-jobs', { profileData });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Improve profile suggestions
  getProfileSuggestions: async (profileData) => {
    try {
      const response = await api.post('/ai/profile-suggestions', { profileData });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generate cover letter
  generateCoverLetter: async (jobData, profileData) => {
    try {
      const response = await api.post('/ai/generate-cover-letter', {
        jobData,
        profileData
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generate job description
  generateJobDescription: async (jobData) => {
    try {
      const response = await api.post('/ai/generate-job-description', jobData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default aiService;
export { aiService };