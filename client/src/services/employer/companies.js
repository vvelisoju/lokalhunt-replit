import { makeRoleAwareRequest } from '../api'

export const createCompany = async (companyData) => {
  try {
    const response = await makeRoleAwareRequest('/employers/companies', {
      method: 'POST',
      data: companyData
    })
    return { success: true, data: response }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to create company' 
    }
  }
}

export const getCompanies = async () => {
  try {
    const response = await makeRoleAwareRequest('/employers/companies')
    return { success: true, data: response }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch companies' 
    }
  }
}

export const getCompany = async (companyId) => {
  try {
    const response = await makeRoleAwareRequest(`/employers/companies/${companyId}`)
    return { success: true, data: response }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch company' 
    }
  }
}

export const updateCompany = async (companyId, companyData) => {
  try {
    const response = await makeRoleAwareRequest(`/employers/companies/${companyId}`, {
      method: 'PUT',
      data: companyData
    })
    return { success: true, data: response }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update company' 
    }
  }
}