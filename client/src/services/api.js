import axios from 'axios'

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api'),
  timeout: 10000,
  withCredentials: true, // Enable credentials for CORS
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      // Clear token and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(error)
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

export default api