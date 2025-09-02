import api, { makeRoleAwareRequest } from "../api";

// Individual functions for named exports
export const getCandidates = async (params = {}) => {
  try {
    const response = await makeRoleAwareRequest(api, "/employers/candidates", {
      params,
    });
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch candidates",
    };
  }
};

export const getCandidateById = async (candidateId) => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      `/employers/candidates/${candidateId}`,
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch candidate",
    };
  }
};

export const getAdCandidates = async (adId, params = {}) => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      `/employers/ads/${adId}/candidates`,
      { params },
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch ad candidates",
    };
  }
};

export const updateApplicationStatus = async (
  applicationId,
  status,
  notes = "",
) => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      `/employers/applications/${applicationId}/status`,
      {
        method: "PATCH",
        data: { status, notes },
      },
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to update application status",
    };
  }
};

export const updateCandidateStatus = async (
  allocationId,
  status,
  notes = "",
) => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      `/employers/allocations/${allocationId}`,
      {
        method: "PATCH",
        data: { status, notes },
      },
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to update candidate status",
    };
  }
};

export const bulkUpdateApplications = async (
  applicationIds,
  status,
  notes = "",
) => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      "/employers/applications/bulk-update",
      {
        method: "PATCH",
        data: { applicationIds, status, notes },
      },
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to bulk update applications",
    };
  }
};

export const shortlistCandidate = async (candidateId, adId, notes = "") => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      "/employers/candidates/shortlist",
      {
        method: "POST",
        data: { candidateId, adId, notes },
      },
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to shortlist candidate",
    };
  }
};

export const rejectCandidate = async (candidateId, adId, notes = "") => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      "/employers/candidates/reject",
      {
        method: "POST",
        data: { candidateId, adId, notes },
      },
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to reject candidate",
    };
  }
};

export const scheduleInterview = async (candidateId, adId, interviewData) => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      "/employers/candidates/schedule-interview",
      {
        method: "POST",
        data: { candidateId, adId, ...interviewData },
      },
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to schedule interview",
    };
  }
};

export const hireCandidate = async (candidateId, adId, hiringData) => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      "/employers/candidates/hire",
      {
        method: "POST",
        data: { candidateId, adId, ...hiringData },
      },
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to hire candidate",
    };
  }
};

export const getCandidateAnalytics = async (params = {}) => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      "/employers/candidates/analytics",
      { params },
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to fetch candidate analytics",
    };
  }
};

// Keep the object export for backward compatibility
export const employerCandidatesService = {
  getCandidates,
  getCandidateById,
  getAdCandidates,
  updateApplicationStatus,
  updateCandidateStatus,
  bulkUpdateApplications,
  shortlistCandidate,
  rejectCandidate,
  scheduleInterview,
  hireCandidate,
  getCandidateAnalytics,
};
