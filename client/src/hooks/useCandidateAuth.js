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
      // Removed setError(null) as it's not defined in the original hook.
      // Assuming `toast` is imported and used for error display.

      const response = await candidateApi.login(credentials)
      const { token, user: userData } = response.data

      localStorage.setItem('candidateToken', token)
      // Handle nested user data structure
      const user = userData?.data ? userData.data : userData
      console.log('Candidate login - user data:', user)
      setUser(user)
      setIsAuthenticated(true)
      showSuccess('Logged in successfully')

      // Removed the logic related to authService.candidateLogin and token/user storage
      // as it was not present in the original `useCandidateAuth` hook provided.
      // The existing logic for `candidateApi.login` is preserved.

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
      // Removed setError(null) as it's not defined in the original hook.

      const response = await candidateApi.register(userData)
      const { token, user: newUser } = response.data

      localStorage.setItem('candidateToken', token)
      // Handle nested user data structure
      const user = newUser?.data ? newUser.data : newUser
      console.log('Candidate register - user data:', user)
      setUser(user)
      setIsAuthenticated(true)
      showSuccess('Account created successfully')

      // Set onboarding flags for new user
      localStorage.setItem('showOnboarding', 'true')
      localStorage.setItem('onboardingStep', '1')
      localStorage.removeItem('onboardingCompleted') // Ensure it's not set
      
      console.log('Registration complete - onboarding flags set:', {
        showOnboarding: localStorage.getItem('showOnboarding'),
        onboardingStep: localStorage.getItem('onboardingStep')
      })

      // Added isNewUser flag to return value
      return { success: true, user: user, isNewUser: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      showError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async (navigate = null) => {
    try {
      // Import clear function
      const { clearAllAuthData } = await import('../utils/authUtils')
      
      // CRITICAL: Clear storage first to prevent loops
      clearAllAuthData()
      
      // THEN reset local state
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false)
      
      // Clear candidate context if available
      if (window.candidateContext?.clearData) {
        window.candidateContext.clearData()
      }
      
      // Small delay to ensure state is updated before navigation
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Finally navigate
      if (navigate && typeof navigate === 'function') {
        navigate('/login', { replace: true })
      } else {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback: force clear everything and redirect
      localStorage.clear()
      sessionStorage.clear()
      if (navigate && typeof navigate === 'function') {
        navigate('/login', { replace: true })
      } else {
        window.location.href = '/login'
      }
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