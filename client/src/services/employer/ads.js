import api, { makeRoleAwareRequest } from "../api";

// Individual functions for named exports
export const getAds = async (params = {}) => {
  try {
    const response = await makeRoleAwareRequest(api, "/employers/ads", {
      params,
    });
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch ads",
    };
  }
};

export const createAd = async (adData) => {
  try {
    const response = await makeRoleAwareRequest(api, "/employers/ads", {
      method: "POST",
      data: adData,
    });
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create ad",
    };
  }
};

export const getAdById = async (adId) => {
  try {
    const response = await makeRoleAwareRequest(api, `/employers/ads/${adId}`);
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch ad",
    };
  }
};

export const updateAd = async (adId, adData) => {
  try {
    const response = await makeRoleAwareRequest(api, `/employers/ads/${adId}`, {
      method: "PUT",
      data: adData,
    });
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update ad",
    };
  }
};

export const deleteAd = async (adId) => {
  try {
    const response = await makeRoleAwareRequest(api, `/employers/ads/${adId}`, {
      method: "DELETE",
    });
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete ad",
    };
  }
};

export const submitForApproval = async (adId) => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      `/employers/ads/${adId}/submit`,
      {
        method: "PATCH",
      },
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to submit ad for approval",
    };
  }
};

// Close an ad
export const closeAd = async (adId) => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      `/employers/ads/${adId}/archive`,
      {},
      { method: "PATCH" }
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to close ad",
    };
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      "/employers/dashboard/stats"
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch dashboard stats",
    };
  }
};

// Reopen a closed ad
export const reopenAd = async (adId) => {
  try {
    const response = await makeRoleAwareRequest(api, `/employers/ads/${adId}/reopen`, {
      method: "PATCH",
    });
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to reopen ad",
    };
  }
};

// Archive an ad (legacy - now redirects to close)
export const archiveAd = async (adId) => {
  return await closeAd(adId);
};

// Add alias for backward compatibility
export const getAd = getAdById;

// Keep the object export for backward compatibility
export const employerAdsService = {
  getAds,
  createAd,
  getAdById,
  getAd,
  updateAd,
  deleteAd,
  submitForApproval,
  archiveAd,
  closeAd,
  reopenAd,
};