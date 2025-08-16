import api from './api'

export const authService = {
  // Login user
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Register user
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Get user profile
  async getProfile() {
    const response = await api.get('/auth/profile')
    return response.data
  },

  // Update profile
  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData)
    return response.data.data
  },

  // Logout (client-side only for JWT)
  logout() {
    localStorage.removeItem('token')
    return Promise.resolve()
  }
}