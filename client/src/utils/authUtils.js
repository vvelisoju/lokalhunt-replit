// Common authentication utilities
export const clearAllAuthData = () => {
  console.log('AuthUtils: Clearing all authentication data')

  // Clear localStorage
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('candidateToken')
  localStorage.removeItem('candidateUser')
  localStorage.removeItem('employerToken')
  localStorage.removeItem('employerUser')
  localStorage.removeItem('branchAdminToken')
  localStorage.removeItem('branchAdminUser')

  // Clear sessionStorage as well (in case something is stored there)
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
  sessionStorage.removeItem('candidateToken')
  sessionStorage.removeItem('candidateUser')
  sessionStorage.removeItem('employerToken')
  sessionStorage.removeItem('employerUser')
  sessionStorage.removeItem('branchAdminToken')
  sessionStorage.removeItem('branchAdminUser')

  // Clear any cached API state
  try {
    // Import and clear API defaults
    import('../services/api.js').then(({ default: api }) => {
      delete api.defaults.headers.common["Authorization"];
    }).catch(() => {
      // Ignore import errors
    });
  } catch (error) {
    console.log('AuthUtils: Could not clear API headers:', error);
  }

  console.log('AuthUtils: All auth data cleared')
}



export const performLogout = async (navigate = null) => {
  try {
    console.log('AuthUtils: Starting logout process')

    // Set logout redirect flag to prevent loading loops
    sessionStorage.setItem('logout_redirect', 'true');

    // Clear candidate context data FIRST
    if (window.candidateContext?.clearData) {
      console.log('AuthUtils: Clearing candidate context data')
      window.candidateContext.clearData()
    }

    // Clear all authentication data
    clearAllAuthData()

    // CRITICAL: Force clear any remaining auth state from memory
    if (window.authContext) {
      console.log('AuthUtils: Forcing auth context reset')
      window.authContext.setUser?.(null)
      window.authContext.setIsAuthenticated?.(false)
      window.authContext.setLoading?.(false)
    }

    // Clear any additional browser data to prevent infinite loops
    if (window.history?.replaceState) {
      window.history.replaceState(null, '', '/login')
    }

    console.log('AuthUtils: Logout completed - all auth data cleared')

    // Navigate to login page without page refresh if navigate function provided
    if (navigate && typeof navigate === 'function') {
      navigate('/login', { replace: true, state: { source: 'logout', fromLogout: true } })
    } else {
      // Fallback to window.location.href only if navigate is not available
      window.location.href = '/login'
    }

  } catch (error) {
    console.error('AuthUtils: Logout error:', error)
    // Even on error, still clear data and redirect
    clearAllAuthData()
    sessionStorage.setItem('logout_redirect', 'true');
    if (navigate && typeof navigate === 'function') {
      navigate('/login', { replace: true, state: { source: 'logout', fromLogout: true } })
    } else {
      window.location.href = '/login'
    }
  }
}