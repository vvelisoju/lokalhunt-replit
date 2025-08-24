
import React, { useState, useEffect } from 'react'
import { 
  PencilIcon, 
  PlusIcon,
  DocumentArrowDownIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  CameraIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { useCandidateAuth } from '../../hooks/useCandidateAuth'
import { useCandidate } from '../../context/CandidateContext'
import { candidateApi, getImageUrl } from '../../services/candidateApi'
import Button from '../../components/ui/Button'
import EditAboutModal from '../../components/profile/EditAboutModal'
import EditExperienceModal from '../../components/profile/EditExperienceModal'
import EditEducationModal from '../../components/profile/EditEducationModal'
import EditSkillsModal from '../../components/profile/EditSkillsModal'
import EditPreferencesModal from '../../components/profile/EditPreferencesModal'
import EditProfileModal from '../../components/profile/EditProfileModal'
import FileUploadModal from '../../components/ui/FileUploadModal'
import { ObjectUploader } from '../../components/ObjectUploader.jsx'
import axios from 'axios'

const LinkedInProfile = () => {
  const { user } = useCandidateAuth()
  const { profile, fetchProfile, updateProfile, loading, dispatch } = useCandidate()
  const [profileData, setProfileData] = useState(null)
  
  // Modal states
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showExperienceModal, setShowExperienceModal] = useState(false)
  const [showEducationModal, setShowEducationModal] = useState(false)
  const [showSkillsModal, setShowSkillsModal] = useState(false)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false)
  const [showCoverModal, setShowCoverModal] = useState(false)
  
  // Edit states
  const [editingExperience, setEditingExperience] = useState(null)
  const [editingEducation, setEditingEducation] = useState(null)
  const [experienceIndex, setExperienceIndex] = useState(-1)
  const [educationIndex, setEducationIndex] = useState(-1)
  
  // Open to work state - initialize from profile data
  const [openToWork, setOpenToWork] = useState(profileData?.profileData?.openToWork || false)

  useEffect(() => {
    if (user && !profile && !loading) {
      console.log('Fetching profile for user:', user)
      fetchProfile()
    }
  }, [user, profile, loading])

  // Update open to work state when profile data changes
  useEffect(() => {
    if (profileData?.profileData?.openToWork !== undefined) {
      setOpenToWork(profileData.profileData.openToWork)
    }
  }, [profileData?.profileData?.openToWork])

  // Upload handlers for ObjectUploader
  const handleGetUploadParameters = async () => {
    try {
      const response = await candidateApi.getUploadUrl()
      console.log('Upload URL response:', response)
      
      if (!response?.data?.data?.uploadURL) {
        throw new Error('Failed to get upload URL from response')
      }
      
      return {
        method: 'PUT',
        url: response.data.data.uploadURL,
      }
    } catch (error) {
      console.error('Error getting upload parameters:', error)
      throw error
    }
  }

  const handleGetProfileImageUploadParameters = async () => {
    try {
      console.log('🖼️ [PROFILE IMAGE] Getting upload parameters...')
      const response = await candidateApi.getProfileImageUploadUrl()
      console.log('🖼️ [PROFILE IMAGE] Upload URL API response:', response)
      
      if (!response?.data?.data?.uploadURL) {
        console.error('🖼️ [PROFILE IMAGE] Missing uploadURL in response:', response)
        throw new Error('Failed to get profile image upload URL from response')
      }
      
      const uploadURL = response.data.data.uploadURL
      const publicURL = response.data.data.publicURL
      
      console.log('📡 [PROFILE IMAGE] Generated upload URL:', uploadURL)
      console.log('🌐 [PROFILE IMAGE] Expected public URL after upload:', publicURL)
      
      // Store public URL in global scope for use after upload
      window._profileImagePublicURL = publicURL
      
      return uploadURL
    } catch (error) {
      console.error('💥 [PROFILE IMAGE] Error getting upload parameters:', error)
      console.error('💥 [PROFILE IMAGE] Full error details:', error.response || error)
      throw error
    }
  }

  const handleGetCoverImageUploadParameters = async () => {
    try {
      console.log('🎨 [COVER IMAGE] Getting upload parameters...')
      const response = await candidateApi.getCoverImageUploadUrl()
      console.log('🎨 [COVER IMAGE] Upload URL API response:', response)
      
      if (!response?.data?.data?.uploadURL) {
        console.error('🎨 [COVER IMAGE] Missing uploadURL in response:', response)
        throw new Error('Failed to get cover image upload URL from response')
      }
      
      const uploadURL = response.data.data.uploadURL
      const publicURL = response.data.data.publicURL
      
      console.log('📡 [COVER IMAGE] Generated upload URL:', uploadURL)
      console.log('🌐 [COVER IMAGE] Expected public URL after upload:', publicURL)
      
      // Store public URL in global scope for use after upload
      window._coverImagePublicURL = publicURL
      
      return uploadURL
    } catch (error) {
      console.error('💥 [COVER IMAGE] Error getting upload parameters:', error)
      console.error('💥 [COVER IMAGE] Full error details:', error.response || error)
      throw error
    }
  }

  const handleProfilePhotoComplete = async (result) => {
    try {
      console.log('🖼️ PROFILE PHOTO UPLOAD COMPLETE - Full result:', JSON.stringify(result, null, 2))
      
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0]
        console.log('📁 Uploaded file details:', JSON.stringify(uploadedFile, null, 2))
        
        // Use the stored public URL from when we got the upload parameters
        let photoURL = window._profileImagePublicURL
        
        // Fallback to constructing URL from upload URL if public URL not available
        if (!photoURL) {
          photoURL = uploadedFile.uploadURL?.split('?')[0] // Remove query parameters
        }
        
        console.log('🌐 PUBLIC PROFILE PHOTO URL (FINAL):', photoURL)
        console.log('📋 Profile photo URL (copy this to test):', photoURL)
        
        // Update profile with the photo URL
        const updateResponse = await candidateApi.updateProfilePhoto({ photoURL })
        console.log('✅ Profile update API response:', updateResponse)
        
        // Update local state immediately for smooth transition
        setProfileData(prev => ({
          ...prev,
          profilePhoto: photoURL
        }))
        
        // Clear the cached profile state and refresh
        if (dispatch) {
          dispatch({ type: 'CLEAR_PROFILE' })
        }
        setTimeout(() => {
          fetchProfile()
        }, 100) // Small delay for smooth transition
        
        console.log('🎉 Profile photo upload completed successfully - PUBLIC URL:', photoURL)
        
        // Clean up the global variable
        delete window._profileImagePublicURL
      } else {
        console.error('❌ No successful upload found in result:', result)
      }
    } catch (error) {
      console.error('💥 Error completing profile photo upload:', error)
      // Don't show alert, just log the error
    }
  }

  const handleCoverPhotoComplete = async (result) => {
    try {
      console.log('🎨 COVER PHOTO UPLOAD COMPLETE - Full result:', JSON.stringify(result, null, 2))
      
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0]
        console.log('📁 Uploaded file details:', JSON.stringify(uploadedFile, null, 2))
        
        // Use the stored public URL from when we got the upload parameters
        let photoURL = window._coverImagePublicURL
        
        // Fallback to constructing URL from upload URL if public URL not available
        if (!photoURL) {
          photoURL = uploadedFile.uploadURL?.split('?')[0] // Remove query parameters
        }
        
        console.log('🌐 PUBLIC COVER PHOTO URL (FINAL):', photoURL)
        console.log('📋 Cover photo URL (copy this to test):', photoURL)
        
        // Update profile with the photo URL
        const updateResponse = await candidateApi.updateCoverPhoto({ photoURL })
        console.log('✅ Cover update API response:', updateResponse)
        
        // Update local state immediately for smooth transition
        setProfileData(prev => ({
          ...prev,
          coverPhoto: photoURL
        }))
        
        // Clear the cached profile state and refresh
        if (dispatch) {
          dispatch({ type: 'CLEAR_PROFILE' })
        }
        setTimeout(() => {
          fetchProfile()
        }, 100) // Small delay for smooth transition
        
        console.log('🎉 Cover photo upload completed successfully - PUBLIC URL:', photoURL)
        
        // Clean up the global variable
        delete window._coverImagePublicURL
      } else {
        console.error('❌ No successful upload found in result:', result)
      }
    } catch (error) {
      console.error('💥 Error completing cover photo upload:', error)
      // Don't show alert, just log the error
    }
  }

  useEffect(() => {
    if (profile) {
      console.log('Profile data received in component:', profile)
      console.log('Profile user data:', profile?.user)
      console.log('Profile profileData field:', profile?.profileData)
      console.log('Job preferences structure:', profile?.profileData?.jobPreferences)
      console.log('Profile photo URL:', profile?.profilePhoto)
      console.log('Cover photo URL:', profile?.coverPhoto)
      console.log('Processed profile photo URL:', getImageUrl(profile?.profilePhoto))
      console.log('Processed cover photo URL:', getImageUrl(profile?.coverPhoto))
      setProfileData(profile)
      // Set openToWork status from the fetched profile data
      const openToWorkStatus = profile?.openToWork || profile?.profileData?.openToWork || false
      console.log('Profile loaded:', { 
        profileOpenToWork: profile?.openToWork, 
        profileDataOpenToWork: profile?.profileData?.openToWork, 
        finalStatus: openToWorkStatus 
      })
      setOpenToWork(openToWorkStatus)
    }
  }, [profile])

  const handleGenerateResume = () => {
    // TODO: Implement resume generation
    console.log('Generate resume from profile data')
  }

  // Resume upload handlers
  const handleGetResumeUploadParameters = async () => {
    try {
      const response = await candidateApi.getUploadUrl()
      console.log('Resume upload URL response:', response)
      
      if (!response?.data?.data?.uploadURL) {
        throw new Error('Failed to get resume upload URL from response')
      }
      
      return response.data.data.uploadURL
    } catch (error) {
      console.error('Error getting resume upload parameters:', error)
      throw error
    }
  }

  const handleResumeUploadComplete = async (result) => {
    try {
      console.log('📄 RESUME UPLOAD COMPLETE - Full result:', JSON.stringify(result, null, 2))
      
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0]
        console.log('📁 Uploaded file details:', JSON.stringify(uploadedFile, null, 2))
        
        const resumeURL = uploadedFile.uploadURL.split('?')[0] // Remove query parameters
        console.log('🌐 PUBLIC RESUME URL:', resumeURL)
        console.log('📋 Resume URL (copy this):', resumeURL)
        
        // Update profile with the resume URL
        const updateData = { 
          resumeUrl: resumeURL, 
          resumeFileName: uploadedFile.name || 'resume.pdf' 
        }
        const updateResponse = await candidateApi.updateProfile(updateData)
        console.log('✅ Resume update API response:', updateResponse)
        
        // Refresh profile data
        if (dispatch) {
          dispatch({ type: 'CLEAR_PROFILE' })
        }
        setTimeout(() => {
          fetchProfile()
        }, 100)
        
        console.log('🎉 Resume upload completed successfully - PUBLIC URL:', resumeURL)
      } else {
        console.error('❌ No successful upload found in result:', result)
      }
    } catch (error) {
      console.error('💥 Error completing resume upload:', error)
    }
  }

  // About section handlers
  const handleSaveAbout = async (summary) => {
    const updatedProfile = {
      ...profileData,
      profileData: {
        ...profileData?.profileData,
        summary: summary
      }
    }
    const result = await updateProfile(updatedProfile)
    // Use the returned profile data to ensure consistency
    if (result) {
      setProfileData(result)
    } else {
      setProfileData(updatedProfile)
    }
    // Refresh profile from context to ensure data sync
    await fetchProfile()
  }

  // Experience section handlers
  const handleAddExperience = () => {
    setEditingExperience(null)
    setExperienceIndex(-1)
    setShowExperienceModal(true)
  }

  const handleEditExperience = (experience, index) => {
    setEditingExperience(experience)
    setExperienceIndex(index)
    setShowExperienceModal(true)
  }

  const handleSaveExperience = async (experienceData) => {
    const currentExperience = profileData?.experience || []
    let updatedExperience

    if (experienceIndex >= 0) {
      // Edit existing experience
      updatedExperience = [...currentExperience]
      updatedExperience[experienceIndex] = experienceData
    } else {
      // Add new experience
      updatedExperience = [...currentExperience, experienceData]
    }

    const updatedProfile = {
      ...profileData,
      experience: updatedExperience
    }
    
    await updateProfile(updatedProfile)
    setProfileData(updatedProfile)
  }

  const handleDeleteExperience = async (index) => {
    const updatedExperience = profileData?.experience?.filter((_, i) => i !== index) || []
    const updatedProfile = {
      ...profileData,
      experience: updatedExperience
    }
    
    await updateProfile(updatedProfile)
    setProfileData(updatedProfile)
  }

  // Education section handlers
  const handleAddEducation = () => {
    setEditingEducation(null)
    setEducationIndex(-1)
    setShowEducationModal(true)
  }

  const handleEditEducation = (education, index) => {
    setEditingEducation(education)
    setEducationIndex(index)
    setShowEducationModal(true)
  }

  const handleSaveEducation = async (educationData) => {
    const currentEducation = profileData?.education || []
    let updatedEducation

    if (educationIndex >= 0) {
      // Edit existing education
      updatedEducation = [...currentEducation]
      updatedEducation[educationIndex] = educationData
    } else {
      // Add new education
      updatedEducation = [...currentEducation, educationData]
    }

    const updatedProfile = {
      ...profileData,
      education: updatedEducation
    }
    
    await updateProfile(updatedProfile)
    setProfileData(updatedProfile)
  }

  const handleDeleteEducation = async (index) => {
    const updatedEducation = profileData?.education?.filter((_, i) => i !== index) || []
    const updatedProfile = {
      ...profileData,
      education: updatedEducation
    }
    
    await updateProfile(updatedProfile)
    setProfileData(updatedProfile)
  }

  // Skills section handlers
  const handleSaveSkills = async (skillsData) => {
    const updatedProfile = {
      ...profileData,
      skills: skillsData
    }
    const result = await updateProfile(updatedProfile)
    // Use the returned profile data instead of local data to ensure consistency
    if (result) {
      setProfileData(result)
    }
  }

  // Preferences section handlers
  const handleSavePreferences = async (preferencesData) => {
    console.log('Saving job preferences:', preferencesData)
    const updatedProfile = {
      ...profileData,
      jobPreferences: preferencesData
    }
    console.log('Updated profile object for preferences:', updatedProfile)
    const result = await updateProfile(updatedProfile)
    console.log('Preferences save result:', result)
    // Use the returned profile data instead of local data to ensure consistency
    if (result) {
      setProfileData(result)
    }
    // Refresh profile from context to ensure data sync
    await fetchProfile()
  }

  // Profile section handlers
  const handleSaveProfile = async (profileFormData) => {
    console.log('Saving profile with data:', profileFormData)
    const updatedProfile = {
      ...profileData,
      firstName: profileFormData.firstName,
      lastName: profileFormData.lastName,
      email: profileFormData.email,
      phone: profileFormData.phone,
      profileData: {
        ...profileData?.profileData,
        firstName: profileFormData.firstName,
        lastName: profileFormData.lastName,
        headline: profileFormData.headline,
        location: profileFormData.location,
        phone: profileFormData.phone
      }
    }
    console.log('Updated profile object:', updatedProfile)
    const result = await updateProfile(updatedProfile)
    console.log('Update result:', result)
    // Use the returned profile data to ensure consistency
    if (result) {
      setProfileData(result)
    } else {
      setProfileData(updatedProfile)
    }
    // Refresh profile from context to ensure data sync
    await fetchProfile()
  }

  // Open to work toggle - using dedicated API
  const handleToggleOpenToWork = async () => {
    const newStatus = !openToWork
    try {
      // Call dedicated Open to Work API endpoint
      const response = await candidateApi.updateOpenToWorkStatus(newStatus)
      if (response.data) {
        setOpenToWork(newStatus)
        // Also update the local profile data to keep UI consistent
        setProfileData(prev => ({
          ...prev,
          openToWork: newStatus
        }))
      }
    } catch (error) {
      console.error('Failed to update Open to Work status:', error)
      alert('Failed to update status. Please try again.')
    }
  }

  // File upload handlers - Real API integration
  const handleProfilePictureUpload = async (file) => {
    try {
      // Get upload URL from backend
      const uploadUrlResponse = await candidateApi.getUploadUrl()
      const { uploadURL } = uploadUrlResponse.data
      
      // Upload file directly to object storage
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage')
      }
      
      // Update profile with the uploaded file URL
      const response = await candidateApi.updateProfilePhoto(uploadURL, file.name, file.size)
      const updatedProfile = response.data
      
      setProfileData(updatedProfile)
      // Refresh profile data from context
      await fetchProfile()
    } catch (error) {
      console.error('Failed to upload profile picture:', error)
      alert('Failed to upload profile picture. Please try again.')
    }
  }

  const handleCoverUpload = async (file) => {
    try {
      // Get upload URL from backend
      const uploadUrlResponse = await candidateApi.getUploadUrl()
      const { uploadURL } = uploadUrlResponse.data
      
      // Upload file directly to object storage
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage')
      }
      
      // Update profile with the uploaded file URL
      const response = await candidateApi.updateCoverPhoto(uploadURL, file.name, file.size)
      const updatedProfile = response.data
      
      setProfileData(updatedProfile)
      // Refresh profile data from context
      await fetchProfile()
    } catch (error) {
      console.error('Failed to upload cover photo:', error)
      // Don't show alert, just log the error
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Profile Header */}
      <div className="bg-white shadow-sm overflow-hidden">
        {/* Cover Banner - Mobile Optimized */}
        <div className="h-32 sm:h-48 relative overflow-hidden">
          {profileData?.coverPhoto ? (
            <img 
              src={getImageUrl(profileData.coverPhoto)} 
              alt="Cover" 
              className="w-full h-full object-cover transition-all duration-500"
              key={profileData.coverPhoto}
            />
          ) : (
            <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 transition-all duration-500"></div>
          )}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={10485760}
              onGetUploadParameters={handleGetCoverImageUploadParameters}
              onComplete={handleCoverPhotoComplete}
              buttonClassName="bg-white bg-opacity-90 backdrop-blur-sm text-gray-700 p-1 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-opacity-100 transition-all duration-200 shadow-lg"
            >
              <span className="hidden sm:inline">📷 Enhance cover</span>
              <span className="sm:hidden text-xs">📷</span>
            </ObjectUploader>
          </div>
        </div>

        {/* Profile Section - Mobile Optimized */}
        <div className="px-3 sm:px-6 pb-3 sm:pb-4">
          {/* Profile Picture and Basic Info */}
          <div className="flex items-end gap-3 sm:gap-6 -mt-12 sm:-mt-20 mb-3 sm:mb-4">
            {/* Profile Picture */}
            <div className="relative flex-shrink-0">
              {profileData?.profilePhoto ? (
                <img 
                  src={getImageUrl(profileData.profilePhoto)} 
                  alt="Profile" 
                  className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white object-cover shadow-xl ring-2 ring-gray-200"
                  key={profileData.profilePhoto}
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl font-bold text-white shadow-xl ring-2 ring-gray-200">
                  {profileData?.firstName?.[0] || profileData?.user?.firstName?.[0] || profileData?.profileData?.firstName?.[0] || profileData?.user?.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              
              {/* Open to Work Badge */}
              {openToWork && (
                <div className="absolute -top-1 -right-1 sm:top-0 sm:right-0 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-lg ring-2 ring-white">
                  <span className="hidden sm:inline">🟢 Open to Work</span>
                  <span className="sm:hidden">🟢</span>
                </div>
              )}
              
              {/* Camera Icon - Smaller in mobile */}
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760}
                onGetUploadParameters={handleGetProfileImageUploadParameters}
                onComplete={handleProfilePhotoComplete}
                buttonClassName="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 bg-white p-1 sm:p-1.5 rounded-full shadow-lg hover:shadow-xl transition-all"
                allowedFileTypes={['image/*']}
                uploadType="image"
              >
                <CameraIcon className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-gray-600" />
              </ObjectUploader>
            </div>
          </div>

          {/* Name and Title - Mobile Optimized */}
          <div className="mb-3">
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  {profileData?.firstName && profileData?.lastName
                    ? `${profileData.firstName} ${profileData.lastName}`
                    : profileData?.user?.firstName && profileData?.user?.lastName
                      ? `${profileData.user.firstName} ${profileData.user.lastName}`
                      : profileData?.profileData?.firstName && profileData?.profileData?.lastName
                        ? `${profileData.profileData.firstName} ${profileData.profileData.lastName}`
                        : profileData?.user?.name || user?.name || 'Your Name'
                  }
                </h1>
                <p className="text-base sm:text-lg text-gray-700 mb-2 leading-tight">
                  {profileData?.profileData?.headline || 
                   profileData?.headline || 
                   profileData?.profileData?.jobTitle || 
                   profileData?.jobTitle || 
                   profileData?.profileData?.currentRole ||
                   'Your Professional Title'}
                </p>
              </div>
              <button 
                onClick={() => setShowEditProfileModal(true)}
                className="text-gray-500 hover:text-blue-600 transition-all duration-200 p-2 hover:bg-blue-50 rounded-full ml-2 flex-shrink-0"
                title="Edit Profile"
              >
                <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 hover:scale-110" />
              </button>
            </div>

            {/* Contact Info - Mobile Stack */}
            <div className="space-y-1 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />
                <span className="truncate">
                  {profileData?.profileData?.location || 
                   profileData?.location || 
                   profileData?.city || 
                   profileData?.user?.location ||
                   'Your Location'}
                </span>
              </div>
              {(profileData?.email || profileData?.user?.email) && (
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2 flex-shrink-0 text-xs">📧</span>
                  <span className="truncate">{profileData?.email || profileData?.user?.email}</span>
                </div>
              )}
              {(profileData?.profileData?.phone || profileData?.phone) && (
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2 flex-shrink-0 text-xs">📱</span>
                  <span className="truncate">{profileData?.profileData?.phone || profileData?.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-3">
            <Button 
              variant={openToWork ? "outline" : "primary"}
              onClick={handleToggleOpenToWork}
              className={`px-4 sm:px-6 py-2 rounded-full font-medium transition-all duration-200 text-sm sm:text-base ${
                openToWork 
                  ? "border-red-300 text-red-600 hover:bg-red-50" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {openToWork ? 'Remove Open to Work' : 'Set Open to Work'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="px-2 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4 max-w-4xl mx-auto">
        
        {/* About Section */}
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                About
                <div className="ml-2 w-6 sm:w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
              </h2>
              <button 
                onClick={() => setShowAboutModal(true)}
                className="text-gray-500 hover:text-blue-600 transition-all duration-200 p-1.5 sm:p-2 hover:bg-blue-50 rounded-full"
                title="Edit About"
              >
                <PencilIcon className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
              </button>
            </div>
            <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {profileData?.profileData?.summary ? (
                <div className="whitespace-pre-wrap">{profileData.profileData.summary}</div>
              ) : (
                <button 
                  onClick={() => setShowAboutModal(true)}
                  className="text-gray-500 hover:text-blue-600 cursor-pointer text-left transition-colors text-sm"
                >
                  Add a summary about yourself, your experience, and career goals. This helps recruiters understand your background.
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                Experience
                <div className="ml-2 w-5 sm:w-6 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
              </h2>
              <button 
                onClick={handleAddExperience}
                className="text-gray-500 hover:text-blue-600 transition-all duration-200 p-1.5 sm:p-2 hover:bg-blue-50 rounded-full"
                title="Add Experience"
              >
                <PlusIcon className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {profileData?.experience?.length > 0 ? (
                profileData.experience.map((exp, index) => (
                  <div key={index} className="flex gap-2 sm:gap-3 group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                      <BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">{exp.role}</h3>
                          <p className="text-blue-600 font-medium text-sm truncate">{exp.company} • {exp.employmentType || 'Full-time'}</p>
                          <p className="text-gray-600 text-xs sm:text-sm">{exp.duration}</p>
                          <div className="flex items-center text-gray-600 text-xs sm:text-sm mt-1">
                            <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{exp.location || user?.city?.name || 'Location'}</span>
                          </div>
                          {exp.description && (
                            <p className="text-gray-700 mt-2 leading-relaxed text-sm line-clamp-3">{exp.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button 
                            onClick={() => handleEditExperience(exp, index)}
                            className="text-gray-500 hover:text-blue-600 transition-colors p-1"
                            title="Edit Experience"
                          >
                            <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteExperience(index)}
                            className="text-gray-500 hover:text-red-600 transition-colors p-1"
                            title="Delete Experience"
                          >
                            <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <BuildingOfficeIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No experience added yet</p>
                  <Button variant="outline" className="mt-3 text-sm" onClick={handleAddExperience}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Education</h2>
              <button 
                onClick={handleAddEducation}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 sm:p-2"
                title="Add Education"
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {profileData?.education?.length > 0 ? (
                profileData.education.map((edu, index) => (
                  <div key={index} className="flex gap-2 sm:gap-3 group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <AcademicCapIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">{edu.institution}</h3>
                          <p className="text-gray-700 text-sm">{edu.degree}{edu.field ? ` - ${edu.field}` : ''}</p>
                          <p className="text-gray-600 text-xs sm:text-sm">
                            {edu.startYear && edu.endYear ? `${edu.startYear} - ${edu.endYear}` : edu.year}
                          </p>
                          {edu.grade && (
                            <p className="text-gray-600 text-xs sm:text-sm">Grade: {edu.grade}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button 
                            onClick={() => handleEditEducation(edu, index)}
                            className="text-gray-500 hover:text-blue-600 transition-colors p-1"
                            title="Edit Education"
                          >
                            <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteEducation(index)}
                            className="text-gray-500 hover:text-red-600 transition-colors p-1"
                            title="Delete Education"
                          >
                            <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <AcademicCapIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No education added yet</p>
                  <Button variant="outline" className="mt-3 text-sm" onClick={handleAddEducation}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skills Section - Mobile Grid */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
              <button 
                onClick={() => setShowSkillsModal(true)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 sm:p-2"
                title="Edit Skills"
              >
                <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {(profileData?.skills?.length > 0 || (profileData?.ratings && Object.keys(profileData.ratings).length > 0)) ? (
                <>
                  {/* Display skills array if available */}
                  {profileData?.skills?.map((skill, index) => (
                    <div key={index} className="p-2 sm:p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 text-xs sm:text-sm">{skill.name}</h3>
                        <span className="text-xs text-gray-600">{skill.rating}/5</span>
                      </div>
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${(skill.rating / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Display ratings object if skills array is not available */}
                  {(!profileData?.skills || profileData.skills.length === 0) && profileData?.ratings && 
                    Object.entries(profileData.ratings).map(([skill, rating]) => (
                      <div key={skill} className="p-2 sm:p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 text-xs sm:text-sm">{skill}</h3>
                          <span className="text-xs text-gray-600">{rating}/5</span>
                        </div>
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${(rating / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No skills added yet</p>
                  <Button variant="outline" className="mt-3 text-sm" onClick={() => setShowSkillsModal(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Skills
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resume Section - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                Resume
                <div className="ml-2 w-6 sm:w-8 h-0.5 bg-gradient-to-r from-green-500 to-teal-500 rounded"></div>
              </h2>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {profileData?.resumeUrl ? (
                <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <DocumentArrowDownIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">Resume uploaded</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {profileData.resumeFileName || 'resume.pdf'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => window.open(profileData.resumeUrl, '_blank')}
                      className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
                    >
                      View
                    </Button>
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={10485760} // 10MB
                      onGetUploadParameters={handleGetResumeUploadParameters}
                      onComplete={handleResumeUploadComplete}
                      allowedFileTypes={['application/pdf', '.pdf']}
                      uploadType="resume"
                      buttonClassName="text-blue-600 hover:bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm"
                    >
                      Update
                    </ObjectUploader>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <DocumentArrowDownIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
                  <p className="mb-4 text-sm">Upload your resume to help employers</p>
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={10485760} // 10MB
                    onGetUploadParameters={handleGetResumeUploadParameters}
                    onComplete={handleResumeUploadComplete}
                    allowedFileTypes={['application/pdf', '.pdf']}
                    uploadType="resume"
                    buttonClassName="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm inline-flex items-center"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Upload Resume
                  </ObjectUploader>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Preferences Section - Mobile Cards */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Job Preferences</h2>
              <button 
                onClick={() => setShowPreferencesModal(true)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 sm:p-2"
                title="Edit Preferences"
              >
                <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {(profileData?.jobPreferences || profileData?.profileData?.jobPreferences) ? (
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {((profileData?.jobPreferences?.jobTypes || profileData?.profileData?.jobPreferences?.jobTypes)?.length > 0) && (
                    <div className="p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">Job Types</h4>
                      <div className="flex flex-wrap gap-1">
                        {(profileData?.jobPreferences?.jobTypes || profileData?.profileData?.jobPreferences?.jobTypes).map((type, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {((profileData?.jobPreferences?.preferredLocations || profileData?.profileData?.jobPreferences?.preferredLocations)?.length > 0) && (
                    <div className="p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">Preferred Locations</h4>
                      <div className="flex flex-wrap gap-1">
                        {(profileData?.jobPreferences?.preferredLocations || profileData?.profileData?.jobPreferences?.preferredLocations).map((location, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                            {location}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(profileData?.jobPreferences?.workType || profileData?.profileData?.jobPreferences?.workType) && (
                    <div className="p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">Work Type</h4>
                      <span className="px-2 sm:px-3 py-1 sm:py-2 bg-orange-100 text-orange-800 text-xs sm:text-sm rounded-full font-medium capitalize">
                        {profileData?.jobPreferences?.workType || profileData?.profileData?.jobPreferences?.workType}
                      </span>
                    </div>
                  )}
                  
                  {((profileData?.jobPreferences?.salaryRange?.min || profileData?.jobPreferences?.salaryRange?.max) || 
                    (profileData?.profileData?.jobPreferences?.salaryRange?.min || profileData?.profileData?.jobPreferences?.salaryRange?.max)) && (
                    <div className="p-2 sm:p-3 bg-gray-50 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">Expected Salary Range</h4>
                      <div className="bg-white p-2 sm:p-3 rounded-lg border">
                        <span className="text-sm sm:text-base font-semibold text-gray-800">
                          ₹{(profileData?.jobPreferences?.salaryRange?.min || profileData?.profileData?.jobPreferences?.salaryRange?.min) ? 
                            Number(profileData?.jobPreferences?.salaryRange?.min || profileData?.profileData?.jobPreferences?.salaryRange?.min).toLocaleString() : '0'} - 
                          ₹{(profileData?.jobPreferences?.salaryRange?.max || profileData?.profileData?.jobPreferences?.salaryRange?.max) ? 
                            Number(profileData?.jobPreferences?.salaryRange?.max || profileData?.profileData?.jobPreferences?.salaryRange?.max).toLocaleString() : 'Open'} /month
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {(profileData?.jobPreferences?.noticePeriod || profileData?.profileData?.jobPreferences?.noticePeriod) && (
                    <div className="p-2 sm:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">Notice Period</h4>
                      <span className="px-2 sm:px-3 py-1 sm:py-2 bg-yellow-100 text-yellow-800 text-xs sm:text-sm rounded-full font-medium">
                        {profileData?.jobPreferences?.noticePeriod || profileData?.profileData?.jobPreferences?.noticePeriod}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No job preferences added yet</p>
                  <Button variant="outline" className="mt-3 text-sm" onClick={() => setShowPreferencesModal(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Job Preferences
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* All Modals */}
      <EditAboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        currentSummary={profileData?.profileData?.summary}
        onSave={handleSaveAbout}
      />

      <EditExperienceModal
        isOpen={showExperienceModal}
        onClose={() => setShowExperienceModal(false)}
        experience={editingExperience}
        onSave={handleSaveExperience}
        isEditing={experienceIndex >= 0}
      />

      <EditEducationModal
        isOpen={showEducationModal}
        onClose={() => setShowEducationModal(false)}
        education={editingEducation}
        onSave={handleSaveEducation}
        isEditing={educationIndex >= 0}
      />

      <FileUploadModal
        isOpen={showProfilePictureModal}
        onClose={() => setShowProfilePictureModal(false)}
        onUpload={handleProfilePictureUpload}
        title="Upload Profile Picture"
        acceptedTypes="image/*"
      />

      <FileUploadModal
        isOpen={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        onUpload={handleCoverUpload}
        title="Upload Cover Photo"
        acceptedTypes="image/*"
      />

      <EditSkillsModal
        isOpen={showSkillsModal}
        onClose={() => setShowSkillsModal(false)}
        skills={profileData?.skills || profileData?.ratings}
        onSave={handleSaveSkills}
      />

      <EditPreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        preferences={profileData?.jobPreferences || profileData?.profileData?.jobPreferences}
        onSave={handleSavePreferences}
      />

      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        profileData={profileData}
        onSave={handleSaveProfile}
      />
    </div>
  )
}

export default LinkedInProfile
