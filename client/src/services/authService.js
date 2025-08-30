import api from './api'

export const authService = {
  // Login user
  async login(credentials) {
    console.log('AuthService: Making login request to /auth/login')
    try {
      const response = await api.post('/auth/login', credentials)
      console.log('AuthService: Login response:', response.data)
      return response.data
    } catch (error) {
      console.error('AuthService: Login request failed:', error)
      throw error
    }
  },

  // Register user
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Get user profile - use auth endpoint that works for all roles
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