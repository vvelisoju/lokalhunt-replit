// Authentication hook for mobile app
import { useState, useEffect, createContext, useContext } from 'react'
import { tokenStorage } from '../utils/storage'
import { apiHelpers } from '../utils/api'
import { API_ENDPOINTS, USER_ROLES } from '../utils/constants'

// Auth Context
const AuthContext = createContext({})

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const storedToken = await tokenStorage.getToken()
      if (storedToken) {
        setToken(storedToken)
        // Verify token and get user info
        const userData = await apiHelpers.get('/auth/verify')
        setUser(userData.data)
      }
    } catch (error) {
      await logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await apiHelpers.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      })

      const { token: newToken, user: userData } = response.data
      
      await tokenStorage.setToken(newToken)
      await tokenStorage.setUserRole(userData.role)
      
      setToken(newToken)
      setUser(userData)
      
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await apiHelpers.post(API_ENDPOINTS.AUTH.REGISTER, userData)
      
      const { token: newToken, user: newUser } = response.data
      
      await tokenStorage.setToken(newToken)
      await tokenStorage.setUserRole(newUser.role)
      
      setToken(newToken)
      setUser(newUser)
      
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      }
    }
  }

  const logout = async () => {
    await tokenStorage.removeToken()
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isCandidate: user?.role === USER_ROLES.CANDIDATE,
    isEmployer: user?.role === USER_ROLES.EMPLOYER,
    isBranchAdmin: user?.role === USER_ROLES.BRANCH_ADMIN
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Main hook
export const useAuth = () => {
  return useAuthContext()
}