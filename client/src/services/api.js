import axios from 'axios'

// Dynamically determine API base URL
let API_BASE_URL = import.meta.env.VITE_API_URL

if (!API_BASE_URL) {
  if (typeof window !== 'undefined') {
    // Check if we're in Replit environment
    const hostname = window.location.hostname
    if (hostname.includes('.replit.dev')) {
      // In Replit, server runs on port 5000, client on different port
      // Remove any existing port and add port 5000
      const baseHostname = hostname.split(':')[0]
      API_BASE_URL = `${window.location.protocol}//${baseHostname}:5000/api`
    } else if (hostname === 'localhost') {
      // Local development - server on port 5000
      API_BASE_URL = 'http://localhost:5000/api'
    } else {
      // Production or other environments
      API_BASE_URL = `${window.location.origin}/api`
    }
  } else {
    // Fallback for SSR or development
    API_BASE_URL = 'http://localhost:5000/api'
  }
} else {
  // Ensure API path is appended if not already present
  if (!API_BASE_URL.endsWith('/api')) {
    API_BASE_URL = `${API_BASE_URL}/api`
  }
}

// Debug logging for API configuration
console.log('API Configuration:', {
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
  port: typeof window !== 'undefined' ? window.location.port : 'N/A',
  protocol: typeof window !== 'undefined' ? window.location.protocol : 'N/A',
  isReplit: typeof window !== 'undefined' && window.location.hostname.includes('.replit.dev'),
  finalApiUrl: API_BASE_URL
})

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Enable credentials for CORS
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasAuth: !!token
    })
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    })
    return response
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    })

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('candidateToken')
      // Only redirect if not already on login page to prevent loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Helper function to make requests with consistent response handling
export const makeRequest = async (url, options = {}) => {
  try {
    const response = await api({
      url,
      method: options.method || 'GET',
      data: options.data,
      params: options.params,
      ...options
    })
    return response.data
  } catch (error) {
    throw error
  }
}

// Role-aware API request helper - uses unified employer endpoints with employerId in request
export const makeRoleAwareRequest = async (endpoint, options = {}, roleContext = null) => {
  // Get role context from localStorage if not provided
  if (!roleContext) {
    try {
      const savedContext = localStorage.getItem('roleContext')
      if (savedContext) {
        roleContext = JSON.parse(savedContext)
      }
    } catch (error) {
      console.error('Error parsing role context:', error)
    }
  }

  // For Branch Admin viewing employer data, inject employerId in request
  const isBranchAdminEmployerPath = window.location.pathname.startsWith('/branch-admin/employers/')
  let targetEmployerId = null

  if (isBranchAdminEmployerPath) {
    // Always use employerId from current URL when in branch admin employer context
    const pathMatch = window.location.pathname.match(/\/branch-admin\/employers\/([^/]+)/)
    if (pathMatch) {
      targetEmployerId = pathMatch[1]
      console.log('API Service: Using employerId from URL path:', targetEmployerId)
    }
  } else {
    // Fall back to role context only when not in branch admin employer path
    targetEmployerId = roleContext?.targetEmployer?.id
  }

  // Add employerId to request when Branch Admin is viewing employer data
  const requestOptions = { ...options }

  if (isBranchAdminEmployerPath && targetEmployerId) {
    // Add employerId to query params for GET requests
    if (!options.method || options.method === 'GET') {
      requestOptions.params = {
        ...options.params,
        employerId: targetEmployerId
      }
    } else {
      // Add employerId to request body for POST/PUT/PATCH requests
      requestOptions.data = {
        ...options.data,
        employerId: targetEmployerId
      }
    }
  }

  return makeRequest(endpoint, requestOptions)
}

export default api