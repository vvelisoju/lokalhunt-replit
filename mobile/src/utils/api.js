// API utilities for mobile app
import { tokenStorage } from './storage'

// Mobile API URL configuration
const getApiUrl = () => {
  if (__DEV__) {
    // Use the Replit server URL for development
    return 'https://ee2f5811-628a-444d-b83f-2bffaa9c3561-00-3d22d0btftv4b.janeway.replit.dev:5000/api'
  }
  return 'https://your-app.replit.dev/api' // Production
}

// Base request function for mobile
export const makeRequest = async (url, options = {}) => {
  const baseURL = getApiUrl()
  const token = await tokenStorage.getToken()
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  }
  
  if (config.method !== 'GET' && options.data) {
    config.body = JSON.stringify(options.data)
  }
  
  try {
    const response = await fetch(`${baseURL}${url}`, config)
    
    if (response.status === 401) {
      await tokenStorage.removeToken()
      throw new Error('Authentication required')
    }
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed')
    }
    
    return data
  } catch (error) {
    throw error
  }
}

// API helpers
export const apiHelpers = {
  get: (url, options = {}) => makeRequest(url, { ...options, method: 'GET' }),
  post: (url, data, options = {}) => makeRequest(url, { ...options, method: 'POST', data }),
  put: (url, data, options = {}) => makeRequest(url, { ...options, method: 'PUT', data }),
  patch: (url, data, options = {}) => makeRequest(url, { ...options, method: 'PATCH', data }),
  delete: (url, options = {}) => makeRequest(url, { ...options, method: 'DELETE' })
}