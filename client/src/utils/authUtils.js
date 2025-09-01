
// Common authentication utilities
export const clearAllAuthData = () => {
  // Clear all possible token storage locations
  localStorage.removeItem('token')
  localStorage.removeItem('candidateToken')
  localStorage.removeItem('employerToken')
  localStorage.removeItem('adminToken')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('candidateToken')
  sessionStorage.removeItem('employerToken')
  sessionStorage.removeItem('adminToken')
  
  // Clear user data
  localStorage.removeItem('user')
  localStorage.removeItem('userData')
  sessionStorage.removeItem('user')
  sessionStorage.removeItem('userData')
  
  // Clear onboarding flags (but preserve completion status)
  localStorage.removeItem('showOnboarding')
  localStorage.removeItem('onboardingStep')
  // Keep onboardingCompleted flag - don't remove it during logout
  
  // Clear role context and auth state
  localStorage.removeItem('roleContext')
  localStorage.removeItem('authState')
  localStorage.removeItem('isAuthenticated')
  sessionStorage.removeItem('roleContext')
  sessionStorage.removeItem('authState')
  sessionStorage.removeItem('isAuthenticated')
  
  // Clear any other auth-related data
  localStorage.removeItem('refreshToken')
  sessionStorage.removeItem('refreshToken')
  localStorage.removeItem('authExpiry')
  sessionStorage.removeItem('authExpiry')
  
  // Clear remember me and auto-login flags
  localStorage.removeItem('rememberMe')
  localStorage.removeItem('autoLogin')
  
  // Clear any cached API responses that might contain auth data
  localStorage.removeItem('apiCache')
  sessionStorage.removeItem('apiCache')
  
  console.log('All authentication data cleared to prevent infinite loops')
}



export const performLogout = async (navigate = null) => {
  try {
    console.log('AuthUtils: Starting logout process')
    
    // Clear candidate context data FIRST
    if (window.candidateContext?.clearData) {
      console.log('AuthUtils: Clearing candidate context data')
      window.candidateContext.clearData()
    }
    
    // Clear all authentication data
    clearAllAuthData()
    
    // Clear any additional browser data to prevent infinite loops
    if (window.history?.replaceState) {
      window.history.replaceState(null, '', '/login')
    }
    
    console.log('AuthUtils: Logout completed - all auth data cleared')
    
    // Navigate to login page without page refresh if navigate function provided
    if (navigate && typeof navigate === 'function') {
      navigate('/login', { replace: true })
    } else {
      // Fallback to window.location.href only if navigate is not available
      window.location.href = '/login'
    }
    
  } catch (error) {
    console.error('AuthUtils: Logout error:', error)
    // Even on error, still clear data and redirect
    clearAllAuthData()
    if (navigate && typeof navigate === 'function') {
      navigate('/login', { replace: true })
    } else {
      window.location.href = '/login'
    }
  }
}
