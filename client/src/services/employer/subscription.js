
import api from '../api'

export const subscriptionService = {
  // Get all available plans
  getPlans: async () => {
    try {
      const response = await api.get('/subscriptions/plans')
      return { success: true, data: response.data.data || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch plans'
      }
    }
  },

  // Get current employer's subscription
  getCurrentSubscription: async () => {
    try {
      const response = await api.get('/subscriptions/current')
      return { success: true, data: response.data.data || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch current subscription'
      }
    }
  },

  // Create new subscription
  createSubscription: async (subscriptionData) => {
    try {
      const response = await api.post('/subscriptions', subscriptionData)
      return { success: true, data: response.data.data || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create subscription'
      }
    }
  },

  // Cancel subscription
  cancelSubscription: async () => {
    try {
      const response = await api.patch('/subscriptions/cancel')
      return { success: true, data: response.data.data || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel subscription'
      }
    }
  },

  // Get subscription history
  getSubscriptionHistory: async () => {
    try {
      const response = await api.get('/subscriptions/history')
      return { success: true, data: response.data.data || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch subscription history'
      }
    }
  },

  // Check limits
  checkLimits: async (action) => {
    try {
      const response = await api.get(`/subscriptions/check-limits?action=${action}`)
      return { success: true, data: response.data.data || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check limits'
      }
    }
  }
}

export default subscriptionService
