
import api from '../api'

export const branchAdminSubscriptionService = {
  // Get employer's subscription as Branch Admin
  getEmployerSubscription: async (employerId) => {
    try {
      const response = await api.get(`/subscriptions/current?employerId=${employerId}`)
      return { success: true, data: response.data.data || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch employer subscription'
      }
    }
  },

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

  // Create subscription for employer as Branch Admin
  createEmployerSubscription: async (employerId, subscriptionData) => {
    try {
      const response = await api.post('/subscriptions', {
        ...subscriptionData,
        employerId
      })
      return { success: true, data: response.data.data || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create subscription'
      }
    }
  },

  // Cancel employer subscription as Branch Admin
  cancelEmployerSubscription: async (employerId) => {
    try {
      const response = await api.patch('/subscriptions/cancel', { employerId })
      return { success: true, data: response.data.data || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel subscription'
      }
    }
  },

  // Get employer subscription history as Branch Admin
  getEmployerSubscriptionHistory: async (employerId) => {
    try {
      const response = await api.get(`/subscriptions/history?employerId=${employerId}`)
      return { success: true, data: response.data.data || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch subscription history'
      }
    }
  },

  // Get pending subscriptions for branch admin
  getPendingSubscriptions: async (params = {}) => {
    try {
      const response = await api.get('/subscriptions/pending', { params })
      return { success: true, data: response.data.data || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch pending subscriptions'
      }
    }
  },

  // Approve subscription
  approveSubscription: async (subscriptionId) => {
    try {
      const response = await api.patch(`/subscriptions/${subscriptionId}/approve`)
      return { success: true, data: response.data.data || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to approve subscription'
      }
    }
  },

  // Reject subscription
  rejectSubscription: async (subscriptionId, reason) => {
    try {
      const response = await api.patch(`/subscriptions/${subscriptionId}/reject`, { reason })
      return { success: true, data: response.data.data || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reject subscription'
      }
    }
  }
}

export default branchAdminSubscriptionService
