import api, { makeRoleAwareRequest } from "../api";

// Get current subscription
export const getCurrentSubscription = async () => {
  try {
    const response = await makeRoleAwareRequest(api, "/subscriptions/current");
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch subscription",
    };
  }
};

// Get all subscriptions
export const getSubscriptions = async (params = {}) => {
  try {
    const response = await makeRoleAwareRequest(api, "/subscriptions", {
      params,
    });
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch subscriptions",
    };
  }
};

// Create new subscription
export const createSubscription = async (subscriptionData) => {
  try {
    const response = await makeRoleAwareRequest(api, "/subscriptions", {
      method: "POST",
      data: subscriptionData,
    });
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create subscription",
    };
  }
};

// Update subscription
export const updateSubscription = async (subscriptionId, subscriptionData) => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      `/subscriptions/${subscriptionId}`,
      {
        method: "PUT",
        data: subscriptionData,
      },
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update subscription",
    };
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId) => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      `/subscriptions/${subscriptionId}/cancel`,
      {
        method: "PATCH",
      },
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to cancel subscription",
    };
  }
};

// Get all available plans
const getPlans = async () => {
  try {
    const response = await makeRoleAwareRequest(api, "/subscriptions/plans");
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch plans",
    };
  }
};

// Get subscription history
const getSubscriptionHistory = async () => {
  try {
    const response = await makeRoleAwareRequest(api, "/subscriptions/history");
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to fetch subscription history",
    };
  }
};

// Check limits
const checkLimits = async (action) => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      `/subscriptions/check-limits`,
      {
        params: { action },
      },
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to check limits",
    };
  }
};

// Check if employer has specific plan
export const hasActivePlan = async (planName) => {
  try {
    const result = await getCurrentSubscription();
    if (result.success && result.data) {
      return (
        result.data.plan?.name === planName && result.data.status === "ACTIVE"
      );
    }
    return false;
  } catch (error) {
    console.error("Error checking plan status:", error);
    return false;
  }
};

// Check if employer has HR-Assist plan
export const hasHRAssistPlan = async () => {
  return await hasActivePlan("HR-Assist");
};

export const subscriptionService = {
  getCurrentSubscription,
  getSubscriptions,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getPlans,
  getSubscriptionHistory,
  checkLimits,
  hasActivePlan,
  hasHRAssistPlan,
};

// Named exports for individual functions
export { getPlans, getSubscriptionHistory, checkLimits };

export default subscriptionService;
