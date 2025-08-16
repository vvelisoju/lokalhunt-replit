import api from './api'

export const jobService = {
  // Get all jobs with filters
  async getJobs(params = {}) {
    const response = await api.get('/candidate/ads/discover', { params })
    return response.data
  },

  // Get job by ID
  async getJobById(id) {
    const response = await api.get(`/candidate/ads/${id}`)
    return response.data.data
  },

  // Apply to job
  async applyToJob(jobId) {
    const response = await api.post(`/candidate/ads/${jobId}/apply`)
    return response.data.data
  },

  // Get user applications
  async getMyApplications(params = {}) {
    const response = await api.get('/candidate/applications', { params })
    return response.data
  },

  // Bookmark job
  async bookmarkJob(jobId) {
    const response = await api.post(`/candidate/ads/${jobId}/bookmark`)
    return response.data.data
  },

  // Remove bookmark
  async removeBookmark(jobId) {
    const response = await api.delete(`/candidate/ads/${jobId}/bookmark`)
    return response.data
  },

  // Get bookmarked jobs
  async getBookmarkedJobs(params = {}) {
    const response = await api.get('/candidate/ads/bookmarks', { params })
    return response.data
  }
}