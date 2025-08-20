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
      console.log('AuthContext: Starting login process')

      const response = await authService.login(credentials)
      console.log('AuthContext: Login response received:', response)

      if (response.success || response.data) {
        const { user, token } = response.data || response
        if (token && user) {
          localStorage.setItem('token', token)
          setUser(user)
          setIsAuthenticated(true)
          console.log('AuthContext: Login successful, user set:', user)
          return { success: true, user }
        }
      }

      console.log('AuthContext: Login failed:', response.error || 'No user data received')
      // Don't clear authentication state immediately on failure
      return { success: false, error: response.error || 'Login failed' }
    } catch (error) {
      console.error('AuthContext: Login error:', error)

      let errorMessage = 'Login failed'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid credentials'
      } else if (error.message) {
        errorMessage = error.message
      }

      // Don't modify authentication state on error - let component handle it
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
    sessionStorage.removeItem('token') // Also clear sessionStorage just in case
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuthStatus,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}