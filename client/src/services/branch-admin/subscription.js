
import { makeRoleAwareRequest } from '../api';

export const branchAdminSubscriptionService = {
  // Get employer's subscription as Branch Admin
  getEmployerSubscription: async (employerId) => {
    const response = await makeRoleAwareRequest(`/subscriptions/current?employerId=${employerId}`);
    return response;
  },

  // Get all available plans
  getPlans: async () => {
    const response = await makeRoleAwareRequest('/subscriptions/plans');
    return response;
  },

  // Create subscription for employer as Branch Admin
  createEmployerSubscription: async (employerId, subscriptionData) => {
    const response = await makeRoleAwareRequest('/subscriptions', {
      method: 'POST',
      data: {
        ...subscriptionData,
        employerId
      }
    });
    return response;
  },

  // Cancel employer subscription as Branch Admin
  cancelEmployerSubscription: async (employerId) => {
    const response = await makeRoleAwareRequest('/subscriptions/cancel', {
      method: 'PATCH',
      data: { employerId }
    });
    return response;
  },

  // Get employer subscription history as Branch Admin
  getEmployerSubscriptionHistory: async (employerId) => {
    const response = await makeRoleAwareRequest(`/subscriptions/history?employerId=${employerId}`);
    return response;
  },

  // Get pending subscriptions for branch admin
  getPendingSubscriptions: async (params = {}) => {
    const response = await makeRoleAwareRequest('/subscriptions/pending', {
      params
    });
    return response;
  },

  // Approve subscription (Branch Admin only)
  approveSubscription: async (subscriptionId) => {
    const response = await makeRoleAwareRequest(`/subscriptions/subscriptions/${subscriptionId}/approve`, {
      method: 'POST'
    });
    return response;
  },

  // Reject subscription (Branch Admin only)
  rejectSubscription: async (subscriptionId, reason) => {
    const response = await makeRoleAwareRequest(`/subscriptions/subscriptions/${subscriptionId}/reject`, {
      method: 'POST',
      data: { reason }
    });
    return response;
  }
};
