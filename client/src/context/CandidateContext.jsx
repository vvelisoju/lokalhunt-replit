import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { candidateApi } from '../services/candidateApi'
import { useToast } from '../components/ui/Toast'

const CandidateContext = createContext()

const initialState = {
  profile: null,
  applications: [],
  bookmarks: [],
  loading: false,
  error: null,
  profileLoaded: false,
  applicationsLoaded: false,
  bookmarksLoaded: false
}

const candidateReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_PROFILE':
      return { ...state, profile: action.payload, loading: false, profileLoaded: true }
    case 'SET_APPLICATIONS':
      return { ...state, applications: action.payload, loading: false, applicationsLoaded: true }
    case 'SET_BOOKMARKS':
      return { ...state, bookmarks: action.payload, loading: false, bookmarksLoaded: true }
    case 'ADD_BOOKMARK':
      return { ...state, bookmarks: [...state.bookmarks, action.payload] }
    case 'REMOVE_BOOKMARK':
      return { ...state, bookmarks: state.bookmarks.filter(b => b.id !== action.payload) }
    case 'UPDATE_APPLICATION_STATUS':
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.id ? { ...app, status: action.payload.status } : app
        )
      }
    case 'CLEAR_DATA':
      return initialState
    case 'CLEAR_PROFILE':
      return { ...state, profile: null, profileLoaded: false }
    default:
      return state
  }
}

export const CandidateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(candidateReducer, initialState)
  const { success: showSuccess, error: showError } = useToast()

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error })
    if (error) {
      showError(error)
    }
  }

  // Profile operations
  const fetchProfile = useCallback(async () => {
    if (state.profileLoaded && state.profile) return
    try {
      setLoading(true)
      const response = await candidateApi.getProfile()
      console.log('Full profile API response:', response)
      // Handle API response structure - check different possible structures
      let profile = null
      if (response?.data?.data) {
        // Standard wrapped response: { data: { data: profile } }
        profile = response.data.data
      } else if (response?.data?.success && response?.data) {
        // Success response: { data: { success: true, data: profile } }
        profile = response.data.data || response.data
      } else if (response?.data) {
        // Direct response: { data: profile }
        profile = response.data
      }
      console.log('Extracted profile data:', profile)
      dispatch({ type: 'SET_PROFILE', payload: profile })
    } catch (error) {
      console.error('Profile fetch error:', error)
      setError(error.message)
    }
  }, [state.profileLoaded, state.profile])

  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true)
      const response = await candidateApi.updateProfile(profileData)
      console.log('Update profile API response:', response)
      // Handle API response structure - check different possible structures
      let updatedProfile = null
      if (response?.data?.data) {
        // Standard wrapped response: { data: { data: profile } }
        updatedProfile = response.data.data
      } else if (response?.data?.success && response?.data) {
        // Success response: { data: { success: true, data: profile } }
        updatedProfile = response.data.data || response.data
      } else if (response?.data) {
        // Direct response: { data: profile }
        updatedProfile = response.data
      }
      console.log('Extracted updated profile data:', updatedProfile)
      dispatch({ type: 'SET_PROFILE', payload: updatedProfile })
      showSuccess('Profile updated successfully')
      return updatedProfile
    } catch (error) {
      setError(error.message)
      throw error
    }
  }, [showSuccess])

  // Applications operations
  const fetchApplications = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      const response = await candidateApi.getApplications(params)
      if (response.data && Array.isArray(response.data)) {
        dispatch({ type: 'SET_APPLICATIONS', payload: response.data })
        console.log('Applications fetched successfully:', response.data.length, 'applications')
        return response.data
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Handle nested data structure
        dispatch({ type: 'SET_APPLICATIONS', payload: response.data.data })
        console.log('Applications fetched successfully:', response.data.data.length, 'applications')
        return response.data.data
      } else {
        console.warn('Invalid applications response structure:', response)
        dispatch({ type: 'SET_APPLICATIONS', payload: [] })
        return []
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      setError(error.message)
      dispatch({ type: 'SET_APPLICATIONS', payload: [] })
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const applyToJob = async (jobId) => {
    try {
      await candidateApi.applyToJob(jobId)
      showSuccess('Application submitted successfully')
      fetchApplications() // Refresh applications
      fetchBookmarks() // Refresh bookmarks to update hasApplied status
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  // Bookmarks operations
  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true)
      const response = await candidateApi.getBookmarks()
      // Handle API response structure: { success: true, data: [...], message: "..." }
      const bookmarks = response?.data?.data || response?.data || []
      console.log('Bookmarks API response:', response, 'extracted bookmarks:', bookmarks)
      dispatch({ type: 'SET_BOOKMARKS', payload: Array.isArray(bookmarks) ? bookmarks : [] })
    } catch (error) {
      console.error('Fetch bookmarks error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const addBookmark = async (jobId) => {
    try {
      const response = await candidateApi.addBookmark(jobId)
      const bookmark = response?.data || {}
      dispatch({ type: 'ADD_BOOKMARK', payload: bookmark })
      showSuccess('Job bookmarked successfully')
      return bookmark
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const removeBookmark = async (jobId) => {
    try {
      await candidateApi.removeBookmark(jobId)
      // Refetch bookmarks to get updated list from server
      fetchBookmarks()
      showSuccess('Bookmark removed successfully')
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  // Resume operations
  const uploadResume = async (file) => {
    try {
      setLoading(true)
      const resume = await candidateApi.uploadResume(file)
      // Update profile with new resume
      if (state.profile) {
        dispatch({
          type: 'SET_PROFILE',
          payload: { ...state.profile, resume }
        })
      }
      showSuccess('Resume uploaded successfully')
      return resume
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const deleteResume = async () => {
    try {
      await candidateApi.deleteResume()
      // Update profile to remove resume
      if (state.profile) {
        dispatch({
          type: 'SET_PROFILE',
          payload: { ...state.profile, resume: null }
        })
      }
      showSuccess('Resume deleted successfully')
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const clearData = () => {
    dispatch({ type: 'CLEAR_DATA' })
  }

  // Make clearData globally accessible for logout
  useEffect(() => {
    window.candidateContext = { clearData }
    return () => {
      delete window.candidateContext
    }
  }, [])

  const value = useMemo(() => ({
    ...state,
    fetchProfile,
    updateProfile,
    fetchApplications,
    applyToJob,
    fetchBookmarks,
    addBookmark,
    removeBookmark,
    uploadResume,
    deleteResume,
    clearData,
    dispatch
  }), [
    state,
    fetchProfile,
    updateProfile,
    fetchApplications,
    fetchBookmarks
  ])

  return (
    <CandidateContext.Provider value={value}>
      {children}
    </CandidateContext.Provider>
  )
}

// Custom hook to use the candidate context
const useCandidate = () => {
  const context = useContext(CandidateContext);
  if (context === undefined) {
    throw new Error('useCandidate must be used within a CandidateProvider');
  }
  return context;
};

export { useCandidate };