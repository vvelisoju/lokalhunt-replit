import api, { makeRoleAwareRequest } from "../api";

// Get all companies for the employer
const getCompanies = async (params = {}) => {
  try {
    const response = await makeRoleAwareRequest(api, "/employers/companies", {
      params,
    });
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch companies",
    };
  }
};

// Get company by ID
const getCompanyById = async (companyId) => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      `/employers/companies/${companyId}`,
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch company",
    };
  }
};

// Create new company
const createCompany = async (companyData) => {
  try {
    const response = await makeRoleAwareRequest(api, "/employers/companies", {
      method: "POST",
      data: companyData,
    });
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create company",
    };
  }
};

// Update company
const updateCompany = async (companyId, companyData) => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      `/employers/companies/${companyId}`,
      {
        method: "PUT",
        data: companyData,
      },
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update company",
    };
  }
};

// Delete company
const deleteCompany = async (companyId) => {
  try {
    const response = await makeRoleAwareRequest(
      api,
      `/employers/companies/${companyId}`,
      {
        method: "DELETE",
      },
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete company",
    };
  }
};

// Upload company logo
const uploadCompanyLogo = async (companyId, logoFile) => {
  try {
    const formData = new FormData();
    formData.append("logo", logoFile);

    const response = await makeRoleAwareRequest(
      api,
      `/employers/companies/${companyId}/logo`,
      {
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return { success: true, data: response.data || response };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to upload logo",
    };
  }
};

// Named exports for all functions
export {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  uploadCompanyLogo,
};

// Keep the object export for backward compatibility
export const employerCompaniesService = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  uploadCompanyLogo,
};