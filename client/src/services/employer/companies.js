import api from '../api'

export const createCompany = async (companyData) => {
  try {
    const response = await api.post('/employers/companies', companyData)
    return { success: true, data: response.data }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to create company' 
    }
  }
}

export const getCompanies = async () => {
  try {
    const response = await api.get('/employers/companies')
    return { success: true, data: response.data }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch companies' 
    }
  }
}

export const getCompany = async (companyId) => {
  try {
    const response = await api.get(`/employers/companies/${companyId}`)
    return { success: true, data: response.data }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch company' 
    }
  }
}

export const updateCompany = async (companyId, companyData) => {
  try {
    const response = await api.put(`/employers/companies/${companyId}`, companyData)
    return { success: true, data: response.data }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update company' 
    }
  }
}