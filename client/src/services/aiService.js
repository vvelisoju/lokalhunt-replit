import axios from 'axios';

// Dynamically determine API base URL
let API_BASE_URL = import.meta.env.VITE_API_URL

if (!API_BASE_URL) {
  if (typeof window !== 'undefined') {
    // Check if we're in Replit environment
    const hostname = window.location.hostname
    if (hostname.includes('.replit.dev')) {
      // In Replit, server runs on port 5000, client on different port
      // Remove any existing port and add port 5000
      const baseHostname = hostname.split(':')[0]
      API_BASE_URL = `${window.location.protocol}//${baseHostname}:5000/api`
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Local development - check if we have a production API URL in env
      if (import.meta.env.VITE_API_URL) {
        API_BASE_URL = import.meta.env.VITE_API_URL
        if (!API_BASE_URL.endsWith('/api')) {
          API_BASE_URL = `${API_BASE_URL}/api`
        }
      } else {
        // Fallback to local server
        API_BASE_URL = 'http://localhost:5000/api'
      }
    } else {
      // Production or other environments
      API_BASE_URL = `${window.location.origin}/api`
    }
  } else {
    // Fallback for SSR or development
    API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    if (API_BASE_URL && !API_BASE_URL.endsWith('/api')) {
      API_BASE_URL = `${API_BASE_URL}/api`
    }
  }
} else {
  // Ensure API path is appended if not already present
  if (!API_BASE_URL.endsWith('/api')) {
    API_BASE_URL = `${API_BASE_URL}/api`
  }
}

// Debug logging for AI Service API configuration
console.log('AI Service API Configuration:', {
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
  isReplit: typeof window !== 'undefined' && window.location.hostname.includes('.replit.dev'),
  finalApiUrl: API_BASE_URL
})

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for AI operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('AI Service API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

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
export const { generateJobDescription } = aiService;