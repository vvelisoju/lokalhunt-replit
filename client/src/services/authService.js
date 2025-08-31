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

  // Register user - initial registration step
  async register(userData) {
    console.log('AuthService: Making register request to /auth/register')
    try {
      const response = await api.post('/auth/register', userData)
      console.log('AuthService: Register response:', response.data)
      return response.data
    } catch (error) {
      console.error('AuthService: Register request failed:', error)
      
      // For registration, we want to handle specific error cases
      if (error.response?.status === 409) {
        return {
          success: false,
          status: 409,
          message: 'User with this email already exists'
        }
      }
      
      // Re-throw other errors to be handled by the component
      throw error
    }
  },

  // Verify OTP and complete registration
  async verifyOTP(verificationData) {
    console.log('AuthService: Making OTP verification request to /auth/verify-otp')
    try {
      const response = await api.post('/auth/verify-otp', verificationData)
      console.log('AuthService: OTP verification response:', response.data)
      return response.data
    } catch (error) {
      console.error('AuthService: OTP verification request failed:', error)
      throw error
    }
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

  // Logout
  logout() {
    this.removeToken()
    this.removeUserData()
    return { success: true }
  },

  // Resend OTP for email verification
  async resendOTP(email) {
    try {
      const response = await api.post('/auth/resend-otp', { email })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to resend OTP'
      }
    }
  },

  // Send forgot password OTP
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send reset email'
      }
    }
  },

  // Reset password with OTP
  async resetPassword(email, otp, password, confirmPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        otp,
        password,
        confirmPassword
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Reset password error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset failed'
      }
    }
  }
}