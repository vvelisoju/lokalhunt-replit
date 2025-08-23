
import { makeRoleAwareRequest } from '../api';

export const subscriptionService = {
  // Get all available plans
  getPlans: async () => {
    const response = await makeRoleAwareRequest('/subscriptions/plans');
    return response;
  },

  // Get current employer's subscription
  getCurrentSubscription: async () => {
    const response = await makeRoleAwareRequest('/subscriptions/current');
    return response;
  },

  // Create new subscription
  createSubscription: async (subscriptionData) => {
    const response = await makeRoleAwareRequest('/subscriptions', {
      method: 'POST',
      data: subscriptionData
    });
    return response;
  },

  // Cancel subscription
  cancelSubscription: async () => {
    const response = await makeRoleAwareRequest('/subscriptions/cancel', {
      method: 'PATCH'
    });
    return response;
  },

  // Get subscription history
  getSubscriptionHistory: async () => {
    const response = await makeRoleAwareRequest('/subscriptions/history');
    return response;
  },

  // Check limits
  checkLimits: async (action) => {
    const response = await makeRoleAwareRequest(`/subscriptions/check-limits?action=${action}`);
    return response;
  }
};
