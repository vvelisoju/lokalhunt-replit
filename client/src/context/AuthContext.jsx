import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { profileService } from '../services/profileService'
import api from '../services/api' // Import default export

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        // Set auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        // Always use the universal auth profile endpoint - works for all user roles
        const response = await api.get('/auth/profile')
        console.log('AuthContext: Auth profile response:', response.data)
        
        if (response.data && (response.data.status === 'success' || response.data.success !== false)) {
          const userData = response.data.data || response.data
          console.log('AuthContext: Setting user data:', userData)
          setUser(userData)
          setIsAuthenticated(true)
        } else {
          throw new Error('Invalid profile response')
        }
      } else {
        // No token found
        console.log('AuthContext: No token found')
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear all auth data on failure
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Starting login process with:', { email: credentials.email })

      const response = await authService.login(credentials)
      console.log('AuthContext: Raw login response:', response)

      // Check for successful response structure
      if (response && (response.success || response.data)) {
        const responseData = response.data || response
        const { user, token } = responseData

        console.log('AuthContext: Extracted data:', { user, token: token ? 'present' : 'missing' })

        if (token && user) {
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          // Set auth header for subsequent requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          setUser(user)
          setIsAuthenticated(true)
          console.log('AuthContext: Login successful, user set:', user)
          return { success: true, user }
        } else {
          console.error('AuthContext: Missing token or user data:', { token: !!token, user: !!user })
          return { success: false, error: 'Invalid response from server' }
        }
      }

      console.log('AuthContext: Login failed - invalid response structure')
      return { success: false, error: response.error || response.message || 'Login failed' }
    } catch (error) {
      console.error('AuthContext: Login error:', error)

      let errorMessage = 'Login failed'

      if (error.response) {
        // Server responded with error
        const { status, data } = error.response
        console.log('AuthContext: Server error response:', { status, data })

        if (data?.message) {
          errorMessage = data.message
        } else if (status === 401) {
          errorMessage = 'Invalid email or password'
        } else if (status === 403) {
          errorMessage = 'Account is deactivated'
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        } else {
          errorMessage = `Server error (${status})`
        }
      } else if (error.request) {
        // Network error
        console.log('AuthContext: Network error:', error.request)
        errorMessage = 'Unable to connect to server. Please check your connection.'
      } else {
        // Other error
        console.log('AuthContext: Other error:', error.message)
        errorMessage = error.message || 'Unexpected error occurred'
      }

      return { success: false, error: errorMessage }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      console.log('Auth service response:', response)
      const { user, token } = response.data || response
      localStorage.setItem('token', token)
      setUser(user)
      setIsAuthenticated(true)
      return { success: true, user }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed'
      }
    }
  }

  const logout = async (navigate = null) => {
    try {
      console.log('AuthContext: Starting logout process')
      
      // Try to call logout endpoint, but don't fail if it doesn't exist
      await authService.logout()
    } catch (error) {
      // Ignore API errors during logout - still proceed with client-side cleanup
      console.log('Logout API call failed, proceeding with client-side cleanup')
    }

    // Import and use common logout function
    const { clearAllAuthData } = await import('../utils/authUtils')

    // CRITICAL: Clear candidate context FIRST before clearing auth data
    if (window.candidateContext?.clearData) {
      console.log('AuthContext: Clearing candidate context data')
      window.candidateContext.clearData()
    }

    // Clear all storage to prevent loops
    console.log('AuthContext: Clearing all auth data from storage')
    clearAllAuthData()

    // THEN reset local auth state
    console.log('AuthContext: Resetting auth state')
    setUser(null)
    setIsAuthenticated(false)

    // Small delay to ensure state is updated before navigation
    await new Promise(resolve => setTimeout(resolve, 100))

    console.log('AuthContext: Logout complete, navigating to login')
    
    // Finally navigate
    if (navigate && typeof navigate === 'function') {
      navigate('/login', { replace: true })
    } else {
      window.location.href = '/login'
    }
  }

  const updateUser = (userData) => {
    setUser(userData);
  };

  const refreshUser = async () => {
    try {
      const response = await profileService.getProfile();
      if (response && response.success) {
        const userData = response.data?.data ? response.data.data.user : response.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Role-aware navigation helper
  const getDefaultDashboard = (role) => {
    switch (role) {
      case 'CANDIDATE':
        return '/candidate/dashboard'
      case 'EMPLOYER':
        return '/employer/dashboard'
      case 'BRANCH_ADMIN':
        return '/branch-admin/dashboard'
      case 'SUPER_ADMIN':
        return '/super-admin/dashboard'
      default:
        return '/candidate/dashboard'
    }
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role
  }

  // Check if user can access employer features (either as employer or admin)
  const canAccessEmployerFeatures = () => {
    return user?.role === 'EMPLOYER' || user?.role === 'BRANCH_ADMIN' || user?.role === 'SUPER_ADMIN'
  }

  // Updated fetchUserProfile to use the universal auth endpoint for all users
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      // Set auth header if not already set
      if (!api.defaults.headers.common['Authorization']) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }

      // Always use the universal auth profile endpoint - works for all roles
      console.log('AuthContext: Fetching user profile via /auth/profile')
      const response = await api.get('/auth/profile');
      console.log('AuthContext: Profile response:', response.data)
      
      if (response.data && (response.data.status === 'success' || response.data.success !== false)) {
        const userData = response.data.data || response.data;
        console.log('AuthContext: Setting fetched user data:', userData)
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else {
        throw new Error('Invalid profile response structure');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error.response?.status === 401) {
        console.log('AuthContext: 401 error, logging out user')
        logout();
      }
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuthStatus,
    updateUser,
    getDefaultDashboard,
    hasRole,
    canAccessEmployerFeatures,
    refreshUser,
    fetchUserProfile // Ensure fetchUserProfile is exposed if needed by other parts of the app
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}