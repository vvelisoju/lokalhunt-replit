import { useState, useEffect } from 'react'
import { candidateApi } from '../services/candidateApi'
import { useToast } from '../components/ui/Toast'
import { toast } from 'react-hot-toast'

export const useCandidateAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { success: showSuccess, error: showError } = useToast()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check for both candidateToken and main token
      let token = localStorage.getItem('candidateToken') || localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      // Ensure candidateToken exists for API calls
      if (!localStorage.getItem('candidateToken') && localStorage.getItem('token')) {
        localStorage.setItem('candidateToken', localStorage.getItem('token'))
      }

      // Verify token with backend - try candidate profile first, fallback to general auth
      try {
        const response = await candidateApi.getProfile()
        // Handle nested response structure
        const userData = response.data?.data ? response.data.data : response.data
        console.log('Candidate auth - user data:', userData)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (candidateError) {
        // If candidate profile fails, try general auth profile
        try {
          const authResponse = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (authResponse.ok) {
            const userData = await authResponse.json()
            // Only set authenticated if user is a candidate
            if (userData.data?.role === 'CANDIDATE') {
              // Handle nested data structure
              const user = userData.data?.data ? userData.data.data : userData.data
              console.log('Candidate auth fallback - user data:', user)
              setUser(user)
              setIsAuthenticated(true)
            } else {
              setLoading(false)
              return
            }
          } else {
            throw new Error('Auth failed')
          }
        } catch (authError) {
          throw candidateError // Use original candidate error
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Token invalid or expired
      localStorage.removeItem('candidateToken')
      localStorage.removeItem('token')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await candidateApi.login(credentials)
      const { token, user: userData } = response.data

      localStorage.setItem('candidateToken', token)
      // Handle nested user data structure
      const user = userData?.data ? userData.data : userData
      console.log('Candidate login - user data:', user)
      setUser(user)
      setIsAuthenticated(true)
      showSuccess('Logged in successfully')

      return { success: true, user: user }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      showError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await candidateApi.register(userData)
      const { token, user: newUser } = response.data

      localStorage.setItem('candidateToken', token)
      // Handle nested user data structure
      const user = newUser?.data ? newUser.data : newUser
      console.log('Candidate register - user data:', user)
      setUser(user)
      setIsAuthenticated(true)
      showSuccess('Account created successfully')

      return { success: true, user: user }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      showError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Clear all possible token storage locations
      localStorage.removeItem('candidateToken')
      localStorage.removeItem('token')
      sessionStorage.removeItem('candidateToken')
      sessionStorage.removeItem('token')

      // Reset state
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false)

      // Clear candidate context data
      if (window.candidateContext?.clearData) {
        window.candidateContext.clearData()
      }

      // Redirect to login
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, still redirect to login
      window.location.href = '/login'
    }
  }

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }))
  }

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus
  }
}