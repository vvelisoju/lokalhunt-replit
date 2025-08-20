import api from './api'

// Helper function to convert object storage paths to proper image URLs
export const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path // Already a full URL
  if (path.startsWith('/objects/')) {
    // Convert internal object path to server URL
    // In production, use the current domain but with port 5000 for server
    // In development, API calls go through Vite proxy, but direct image requests need the real server URL
    if (window.location.hostname.includes('replit.dev')) {
      // Production: Use the Replit server URL
      const serverUrl = window.location.origin.replace('3000', '5000')
      return `${serverUrl}${path}`
    } else {
      // Development: Use localhost
      return `http://localhost:5000${path}`
    }
  }
  return path
}

export const candidateApi = {
  // Authentication
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),

  // Profile management
  getProfile: () => api.get('/candidates/profile'),
  updateProfile: (profileData) => api.put('/candidates/profile', profileData),
  getProfileCompletion: () => api.get('/candidates/profile/completion'),

  // Applications
  getApplications: (params = {}) => api.get('/candidates/applications', { params }),
  applyToJob: (jobId) => api.post(`/candidates/applications/${jobId}`),
  getApplicationById: (applicationId) => api.get(`/candidates/applications/${applicationId}`),
  withdrawApplication: (applicationId) => api.delete(`/candidates/applications/${applicationId}`),

  // Bookmarks
  getBookmarks: (params = {}) => api.get('/candidates/bookmarks', { params }),
  addBookmark: (jobId) => api.post(`/candidates/bookmarks/${jobId}`),
  removeBookmark: (jobId) => api.delete(`/candidates/bookmarks/${jobId}`),

  // Resume management (using object storage)
  uploadResume: async (file) => {
    try {
      // Step 1: Get upload URL
      const uploadResponse = await api.get('/candidates/upload-url')
      const uploadURL = uploadResponse.data.uploadURL

      // Step 2: Upload file to object storage
      const fileUploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!fileUploadResponse.ok) {
        throw new Error('Failed to upload file to storage')
      }

      // Step 3: Update resume URL in database
      const response = await api.post('/candidates/resume', {
        resumeUrl: uploadURL,
        fileName: file.name,
        fileSize: file.size
      })

      return response.data
    } catch (error) {
      console.error('Resume upload failed:', error)
      throw error
    }
  },
  getResume: () => api.get('/candidates/resume'),
  deleteResume: () => api.delete('/candidates/resume'),

  // Job search
  searchJobs: (params = {}) => api.get('/jobs', { params }),
  searchJobsWithStatus: (params = {}) => api.get('/candidates/jobs/search', { params }),
  getJobById: (jobId) => api.get(`/candidates/jobs/${jobId}`),
  getJobWithStatus: (jobId) => api.get(`/candidates/jobs/${jobId}`),

  // Skills and categories
  getSkills: () => api.get('/skills'),
  getJobCategories: () => api.get('/job-categories'),
  getCities: () => api.get('/cities'),

  // Dashboard data
  getDashboardStats: () => api.get('/candidates/dashboard/stats'),
  getRecentApplications: () => api.get('/candidates/dashboard/recent-applications'),
  getRecommendedJobs: () => api.get('/candidates/dashboard/recommended-jobs'),

  // Messages (if applicable)
  getMessages: (params = {}) => api.get('/candidates/messages', { params }),
  markMessageAsRead: (messageId) => api.put(`/candidates/messages/${messageId}/read`),

  // File upload
  getUploadUrl: () => api.get('/candidates/upload-url'),
  updateProfilePhoto: (data) => api.put('/candidates/profile-photo', data),
  updateCoverPhoto: (data) => api.put('/candidates/cover-photo', data),

  // Open to Work status management
  updateOpenToWorkStatus: (openToWork) => api.patch('/candidates/profile/open-to-work', { openToWork }),
  getOpenToWorkStatus: () => api.get('/candidates/profile/open-to-work'),

  // Application management
  withdrawApplication: (applicationId) => api.delete(`/candidates/applications/${applicationId}`),

  // Get candidate applications
  async getCandidateApplications() {
    const response = await candidateApi.get('/applications')
    return response.data
  },

  // Logout candidate
  async logout() {
    try {
      const response = await candidateApi.post('/auth/logout')
      return response.data
    } catch (error) {
      // Don't throw error on logout - proceed with client cleanup
      console.log('Logout API call failed, proceeding with client-side cleanup')
      return null
    }
  },
}