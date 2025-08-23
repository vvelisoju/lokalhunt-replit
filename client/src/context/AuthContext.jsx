import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

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
        const response = await authService.getProfile()
        const userData = response.data || response
        setUser(userData)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
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

  const logout = async () => {
    try {
      // Try to call logout endpoint, but don't fail if it doesn't exist
      await authService.logout()
    } catch (error) {
      // Ignore API errors during logout - still proceed with client-side cleanup
      console.log('Logout API call failed, proceeding with client-side cleanup')
    }

    // Always clear client-side state regardless of API response
    localStorage.removeItem('token')
    localStorage.removeItem('candidateToken') // Also clear candidate token
    sessionStorage.removeItem('token') // Also clear sessionStorage just in case
    setUser(null)
    setIsAuthenticated(false)
    
    // Don't reload the page - let the component handle navigation
    console.log('Logout completed - user state cleared')
  }

  const updateUser = (userData) => {
    setUser(userData);
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
    canAccessEmployerFeatures
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}