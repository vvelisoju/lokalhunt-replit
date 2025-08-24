import api from './api'

// Helper function to convert object storage paths to proper URLs
export const getImageUrl = (path) => {
  if (!path) return null

  // If it's already a full URL, return as-is
  if (path.startsWith('http')) return path

  // Get the server URL - always use the current origin for Replit
  const getServerUrl = () => {
    // For Replit deployments, use the current origin
    if (window.location.hostname.includes('replit.dev')) {
      return window.location.origin
    } else {
      // Development: Use localhost on port 5000
      return 'http://localhost:5000'
    }
  }

  const serverUrl = getServerUrl()

  // Handle server-served files (already in correct format with /api/public/)
  if (path.startsWith('/api/public/')) {
    return `${serverUrl}${path}`
  }

  // Handle any path starting with /api/
  if (path.startsWith('/api/')) {
    return `${serverUrl}${path}`
  }

  // Handle Google Cloud Storage paths - convert to server endpoint
  if (path.includes('/profiles/') || path.includes('/covers/') || path.includes('/resumes/')) {
    if (path.includes('/profiles/')) {
      // Convert to profile image endpoint: /api/public/images/profiles/userId/fileName
      return `${serverUrl}/api/public/images${path}`
    } else if (path.includes('/covers/')) {
      // Convert to cover image endpoint: /api/public/images/covers/userId/fileName
      return `${serverUrl}/api/public/images${path}`
    } else if (path.includes('/resumes/')) {
      // Convert to resume file endpoint: /api/public/files/resumes/userId/fileName
      return `${serverUrl}/api/public/files${path}`
    }
  }

  // Handle internal object paths (fallback for Replit object storage)
  if (path.startsWith('/objects/')) {
    return `${serverUrl}${path}`
  }

  // If it's a relative path, treat it as a server-served file
  return `${serverUrl}${path.startsWith('/') ? path : `/${path}`}`
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
  toggleBookmark: async (jobId) => {
    try {
      const response = await api.post(`/candidates/bookmarks/${jobId}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  },

  // Resume management (using object storage)
  uploadResume: async (file) => {
    try {
      console.log('📁 Starting resume upload process for file:', file.name, 'Size:', file.size)

      // Step 1: Get upload URL from our backend
      const uploadUrlResponse = await api.get('/candidates/upload-url')
      console.log('📡 Upload URL response:', uploadUrlResponse)

      if (!uploadUrlResponse?.data?.data?.uploadURL) {
        throw new Error('Failed to get upload URL from response')
      }

      const uploadURL = uploadUrlResponse.data.data.uploadURL
      console.log('🔗 Got upload URL:', uploadURL)

      // Step 2: Upload file to object storage
      const fileUploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!fileUploadResponse.ok) {
        const errorText = await fileUploadResponse.text()
        throw new Error(`Failed to upload file to storage: ${errorText}`)
      }

      console.log('✅ File uploaded to storage successfully')

      // Step 3: Update resume URL in database with proper metadata
      const response = await api.post('/candidates/resume', {
        resumeUrl: uploadURL.split('?')[0], // Remove query parameters for clean URL
        fileName: file.name,
        fileSize: file.size
      })

      console.log('✅ Resume metadata saved to database:', response.data)
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
  getJobWithStatus: async (jobId) => {
    try {
      const response = await api.get(`/candidates/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job with status:', error);
      throw error;
    }
  },

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
  getProfileImageUploadUrl: () => api.get('/candidates/profile-image-upload-url'),
  getCoverImageUploadUrl: () => api.get('/candidates/cover-image-upload-url'),
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