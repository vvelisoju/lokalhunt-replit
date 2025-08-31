
import api from './api'

export const publicProfileService = {
  // Get public candidate profile
  async getCandidateProfile(candidateId) {
    try {
      const response = await api.get(`/public/candidates/${candidateId}/profile`)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      console.error('Get candidate profile error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Profile not found or not public'
      }
    }
  }
}

export default publicProfileService
