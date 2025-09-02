import api, { makeRoleAwareRequest } from '../api'

// Get employer profile
const getProfile = async () => {
  try {
    const response = await makeRoleAwareRequest(api, '/employers/profile')
    return { success: true, data: response.data || response }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch profile'
    }
  }
}
// Update profile
const updateProfile = async (profileData) => {
  try {
    const response = await makeRoleAwareRequest(api, '/employers/profile', {
      method: 'PUT',
      data: profileData
    })
    return { success: true, data: response.data || response }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update profile'
    }
  }
}

// Update password
const updatePassword = async (passwordData) => {
  try {
    const response = await makeRoleAwareRequest(api, '/employers/profile/password', {
      method: 'PUT',
      data: passwordData
    })
    return { success: true, data: response.data || response }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update password'
    }
  }
}

// Upload avatar
const uploadAvatar = async (avatarFile) => {
  try {
    const formData = new FormData()
    formData.append('avatar', avatarFile)

    const response = await makeRoleAwareRequest(api, '/employers/profile/avatar', {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return { success: true, data: response.data || response }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to upload avatar'
    }
  }
}

// Delete account
const deleteAccount = async (confirmationData) => {
  try {
    const response = await makeRoleAwareRequest(api, '/employers/profile/delete', {
      method: 'DELETE',
      data: confirmationData
    })
    return { success: true, data: response.data || response }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete account'
    }
  }
}

// Get dashboard stats
const getDashboardStats = async () => {
  try {
    const response = await makeRoleAwareRequest(api, '/employers/dashboard/stats')
    return { success: true, data: response.data || response }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch dashboard stats'
    }
  }
}

// Keep the object export for backward compatibility
export const employerProfileService = {
  getProfile,
  updateProfile,
  updatePassword,
  uploadAvatar,
  deleteAccount,
  getDashboardStats
}