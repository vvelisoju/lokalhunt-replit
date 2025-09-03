import api from './api'

export const authService = {
  // Login user
  async login(credentials) {
    console.log('AuthService: Making login request to /auth/login')
    try {
      const response = await api.post('/auth/login', credentials)
      console.log('AuthService: Login response:', response.data)
      
      // If login successful and we have user data, try to send device token
      if (response.data && (response.data.success || response.data.data)) {
        const responseData = response.data.data || response.data;
        
        if (responseData.token && responseData.user) {
          // Store token and user data
          localStorage.setItem('token', responseData.token);
          localStorage.setItem('user', JSON.stringify(responseData.user));
          api.defaults.headers.common['Authorization'] = `Bearer ${responseData.token}`;
          
          // Try to send device token if available
          this.sendStoredDeviceToken();
        }
      }
      
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
      
      // Handle successful verification - should return user data and token
      if (response.data && (response.data.success || response.data.data)) {
        const responseData = response.data.data || response.data;
        
        // Store token and user data if provided
        if (responseData.token && responseData.user) {
          localStorage.setItem('token', responseData.token);
          localStorage.setItem('user', JSON.stringify(responseData.user));
          // Set auth header for subsequent requests
          api.defaults.headers.common['Authorization'] = `Bearer ${responseData.token}`;
          console.log('AuthService: Token and user data stored successfully');
          
          // Try to send device token if available
          this.sendStoredDeviceToken();
        }
        
        return response.data;
      }
      
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
    try {
      console.log('AuthService: Making profile update request to /auth/profile');
      const response = await api.put('/auth/profile', profileData);
      console.log('AuthService: Profile update response:', response.data);
      
      // Handle different response formats
      if (response.data) {
        return {
          success: true,
          status: 'success',
          data: response.data.data || response.data,
          message: response.data.message || 'Profile updated successfully'
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('AuthService: Profile update request failed:', error);
      
      // Return a consistent error format
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update profile'
      };
    }
  },

  // Logout
  logout() {
    this.removeToken()
    this.removeUserData()
    return { success: true }
  },

  // Resend OTP for email or phone verification
  async resendOTP(data) {
    try {
      // Handle both old string format and new object format for backward compatibility
      const requestData = typeof data === 'string' ? { email: data } : data;
      const response = await api.post('/auth/resend-otp', requestData)
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

  // Reset password with OTP - now using unified verify-otp endpoint
  async resetPassword(email, otp, password, confirmPassword) {
    try {
      const response = await api.post('/auth/verify-otp', {
        email,
        otp,
        password,
        confirmPassword,
        isForgotPassword: true
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
  },

  // Send forgot password OTP via mobile
  async forgotPasswordMobile(phone) {
    try {
      const response = await api.post('/auth/forgot-password-mobile', { phone })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Forgot password mobile error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send reset SMS'
      }
    }
  },

  // Reset password with mobile OTP - now using unified verify-otp endpoint
  async resetPasswordMobile(phone, otp, password, confirmPassword) {
    try {
      const response = await api.post('/auth/verify-otp', {
        phone,
        otp,
        password,
        confirmPassword,
        isForgotPassword: true
      })
      
      // Handle different response formats
      const responseData = response.data || {}
      
      // Check for success in various formats
      if (responseData.status === 'success' || 
          responseData.success === true || 
          (responseData.message && responseData.message.toLowerCase().includes('successfully'))) {
        return {
          success: true,
          status: 'success',
          data: responseData,
          message: responseData.message || 'Password reset successfully'
        }
      }
      
      // Default success response for 200 status
      return {
        success: true,
        data: responseData,
        message: responseData.message || 'Password reset successfully'
      }
    } catch (error) {
      console.error('Reset password mobile error:', error)
      
      // Check if the error response actually contains a success message
      const errorData = error.response?.data
      if (errorData?.message && errorData.message.toLowerCase().includes('successfully')) {
        return {
          success: true,
          status: 'success',
          data: errorData,
          message: errorData.message
        }
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset failed'
      }
    }
  },

  // Change password for authenticated users
  async changePassword(passwordData) {
    try {
      console.log('AuthService: Making change password request to /auth/change-password');
      const response = await api.put('/auth/change-password', passwordData);
      console.log('AuthService: Change password response:', response.data);
      
      // Handle different response formats
      if (response.data) {
        return {
          success: true,
          status: 'success',
          data: response.data.data || response.data,
          message: response.data.message || 'Password changed successfully'
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('AuthService: Change password request failed:', error);
      
      // Return a consistent error format
      throw new Error(error.response?.data?.message || error.message || 'Failed to change password');
    }
  },

  // Send stored device token to backend (for mobile apps)
  async sendStoredDeviceToken() {
    try {
      // Check if we're in a mobile environment and have a stored token
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedToken = localStorage.getItem('push_device_token');
        if (storedToken) {
          console.log('📱 Sending stored device token to backend after login');
          
          let platform = 'web';
          if (window.Capacitor) {
            try {
              const { Capacitor } = await import('@capacitor/core');
              if (Capacitor.isNativePlatform()) {
                platform = Capacitor.getPlatform();
              }
            } catch (e) {
              console.log('Capacitor not available, using web platform');
            }
          }

          const response = await api.post('/auth/device-token', {
            deviceToken: storedToken,
            platform
          });

          if (response.data) {
            console.log('✅ Device token sent successfully after login:', response.data.message);
            return true;
          }
        } else {
          console.log('📱 No stored device token found');
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Error sending stored device token:', error);
      // Don't throw error as this is not critical for login flow
      return false;
    }
  }
}