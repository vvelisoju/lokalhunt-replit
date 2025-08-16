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
import { ObjectUploader } from '../../components/ObjectUploader'
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

  const handleProfilePhotoComplete = async (result) => {
    try {
      console.log('Profile photo upload complete:', result)
      
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0]
        const photoURL = uploadedFile.uploadURL.split('?')[0] // Remove query parameters
        console.log('Profile photo URL:', photoURL)
        
        // Update profile with the photo URL
        const updateResponse = await candidateApi.updateProfilePhoto({ photoURL })
        console.log('Profile update response:', updateResponse)
        
        // Update local state immediately for smooth transition
        setProfileData(prev => ({
          ...prev,
          profilePhoto: photoURL.split('?')[0]
        }))
        
        // Clear the cached profile state and refresh
        if (dispatch) {
          dispatch({ type: 'CLEAR_PROFILE' })
        }
        setTimeout(() => {
          fetchProfile()
        }, 100) // Small delay for smooth transition
        
        console.log('Profile photo upload completed successfully')
      } else {
        console.error('No successful upload found in result')
      }
    } catch (error) {
      console.error('Error completing profile photo upload:', error)
      // Don't show alert, just log the error
    }
  }

  const handleCoverPhotoComplete = async (result) => {
    try {
      console.log('Cover photo upload complete:', result)
      
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0]
        const photoURL = uploadedFile.uploadURL.split('?')[0] // Remove query parameters
        console.log('Cover photo URL:', photoURL)
        
        // Update profile with the photo URL
        const updateResponse = await candidateApi.updateCoverPhoto({ photoURL })
        console.log('Cover update response:', updateResponse)
        
        // Update local state immediately for smooth transition
        setProfileData(prev => ({
          ...prev,
          coverPhoto: photoURL.split('?')[0]
        }))
        
        // Clear the cached profile state and refresh
        if (dispatch) {
          dispatch({ type: 'CLEAR_PROFILE' })
        }
        setTimeout(() => {
          fetchProfile()
        }, 100) // Small delay for smooth transition
        
        console.log('Cover photo upload completed successfully')
      } else {
        console.error('No successful upload found in result')
      }
    } catch (error) {
      console.error('Error completing cover photo upload:', error)
      // Don't show alert, just log the error
    }
  }

  useEffect(() => {
    if (profile) {
      console.log('Profile data received in component:', profile)
      console.log('Profile user data:', profile?.user)
      console.log('Profile profileData field:', profile?.profileData)
      console.log('Job preferences structure:', profile?.profileData?.jobPreferences)
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
    <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen">
      {/* Profile Header Banner */}
      <div className="bg-white shadow-sm overflow-hidden mb-4">
        {/* Cover Banner */}
        <div className="h-48 relative overflow-hidden border-b-4 border-white shadow-lg">
          {profileData?.coverPhoto ? (
            <img 
              src={getImageUrl(profileData.coverPhoto)} 
              alt="Cover" 
              className="w-full h-full object-cover transition-all duration-500"
              key={profileData.coverPhoto} // Force re-render when cover photo changes
            />
          ) : (
            <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 transition-all duration-500"></div>
          )}
          <div className="absolute top-4 right-4">
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={10485760}
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleCoverPhotoComplete}
              buttonClassName="bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-30 transition-all duration-200"
            >
              📷 Enhance cover image
            </ObjectUploader>
          </div>
        </div>

        {/* Profile Section */}
        <div className="px-6 pb-4">
          {/* Profile Picture and Basic Info */}
          <div className="flex items-end gap-6 -mt-20 mb-4">
            {/* Profile Picture with Hiring Badge */}
            <div className="relative">
              {profileData?.profilePhoto ? (
                <img 
                  src={getImageUrl(profileData.profilePhoto)} 
                  alt="Profile" 
                  className="w-40 h-40 rounded-full border-4 border-white object-cover shadow-xl ring-2 ring-gray-200"
                  key={profileData.profilePhoto}
                />
              ) : (
                <div className="w-40 h-40 rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl ring-2 ring-gray-200">
                  {profileData?.firstName?.[0] || profileData?.user?.firstName?.[0] || profileData?.profileData?.firstName?.[0] || profileData?.user?.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              

              
              {/* Camera Icon */}
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760}
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleProfilePhotoComplete}
                buttonClassName="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <CameraIcon className="h-4 w-4 text-gray-600" />
              </ObjectUploader>
            </div>


          </div>

          {/* Name and Title */}
          <div className="mb-3">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profileData?.firstName && profileData?.lastName
                  ? `${profileData.firstName} ${profileData.lastName}`
                  : profileData?.user?.firstName && profileData?.user?.lastName
                    ? `${profileData.user.firstName} ${profileData.user.lastName}`
                    : profileData?.profileData?.firstName && profileData?.profileData?.lastName
                      ? `${profileData.profileData.firstName} ${profileData.profileData.lastName}`
                      : profileData?.user?.name || user?.name || 'Your Name'
                }
              </h1>
              <button 
                onClick={() => setShowEditProfileModal(true)}
                className="text-gray-500 hover:text-blue-600 transition-all duration-200 p-2 hover:bg-blue-50 rounded-full"
                title="Edit Profile"
              >
                <PencilIcon className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
              </button>
            </div>
            <p className="text-lg text-gray-700 mb-2">
              {profileData?.profileData?.headline || 
               profileData?.headline || 
               profileData?.profileData?.jobTitle || 
               profileData?.jobTitle || 
               profileData?.profileData?.currentRole ||
               'Your Professional Title'}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span>
                {profileData?.profileData?.location || 
                 profileData?.location || 
                 profileData?.city || 
                 profileData?.user?.location ||
                 'Your Location'}
              </span>
              {(profileData?.email || profileData?.user?.email) && (
                <span>{profileData?.email || profileData?.user?.email}</span>
              )}
              {(profileData?.profileData?.phone || profileData?.phone) && (
                <span>{profileData?.profileData?.phone || profileData?.phone}</span>
              )}
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant={openToWork ? "outline" : "primary"}
              onClick={handleToggleOpenToWork}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                openToWork 
                  ? "border-red-300 text-red-600 hover:bg-red-50" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {openToWork ? 'Remove Open to Work' : 'Set Open to Work'}
            </Button>
            {openToWork && (
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                Open to Work
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4 p-4">
        
        {/* About Section */}
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                About
                <div className="ml-3 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
              </h2>
              <button 
                onClick={() => setShowAboutModal(true)}
                className="text-gray-500 hover:text-blue-600 transition-all duration-200 p-2 hover:bg-blue-50 rounded-full"
                title="Edit About"
              >
                <PencilIcon className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
              </button>
            </div>
            <div className="text-gray-700 leading-relaxed">
              {profileData?.profileData?.summary ? (
                <div className="whitespace-pre-wrap">{profileData.profileData.summary}</div>
              ) : (
                <button 
                  onClick={() => setShowAboutModal(true)}
                  className="text-gray-500 hover:text-blue-600 cursor-pointer text-left transition-colors"
                >
                  Add a summary about yourself, your experience, and career goals. This section helps recruiters understand your background and what you're looking for.
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                Experience
                <div className="ml-3 w-6 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleAddExperience}
                  className="text-gray-500 hover:text-blue-600 transition-all duration-200 p-2 hover:bg-blue-50 rounded-full"
                  title="Add Experience"
                >
                  <PlusIcon className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {profileData?.experience?.length > 0 ? (
                profileData.experience.map((exp, index) => (
                  <div key={index} className="flex gap-3 group">
                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                      <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                          <p className="text-blue-600 font-medium">{exp.company} • {exp.employmentType || 'Full-time'}</p>
                          <p className="text-gray-600 text-sm">{exp.duration}</p>
                          <p className="text-gray-600 text-sm flex items-center mt-1">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {exp.location || user?.city?.name || 'Location'}
                          </p>
                          {exp.description && (
                            <p className="text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditExperience(exp, index)}
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                            title="Edit Experience"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteExperience(index)}
                            className="text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete Experience"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No experience added yet</p>
                  <Button variant="outline" className="mt-3" onClick={handleAddExperience}>
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
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Education</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleAddEducation}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  title="Add Education"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {profileData?.education?.length > 0 ? (
                profileData.education.map((edu, index) => (
                  <div key={index} className="flex gap-3 group">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <AcademicCapIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{edu.institution}</h3>
                          <p className="text-gray-700">{edu.degree}{edu.field ? ` - ${edu.field}` : ''}</p>
                          <p className="text-gray-600 text-sm">
                            {edu.startYear && edu.endYear ? `${edu.startYear} - ${edu.endYear}` : edu.year}
                          </p>
                          {edu.grade && (
                            <p className="text-gray-600 text-sm">Grade: {edu.grade}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditEducation(edu, index)}
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                            title="Edit Education"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteEducation(index)}
                            className="text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete Education"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AcademicCapIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No education added yet</p>
                  <Button variant="outline" className="mt-3" onClick={handleAddEducation}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowSkillsModal(true)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  title="Edit Skills"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(profileData?.skills?.length > 0 || (profileData?.ratings && Object.keys(profileData.ratings).length > 0)) ? (
                <>
                  {/* Display skills array if available */}
                  {profileData?.skills?.map((skill, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 text-sm">{skill.name}</h3>
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
                      <div key={skill} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 text-sm">{skill}</h3>
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
                <div className="text-center py-6 text-gray-500 col-span-full">
                  <p>No skills added yet</p>
                  <Button variant="outline" className="mt-3" onClick={() => setShowSkillsModal(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Skills
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Job Preferences Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Job Preferences</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowPreferencesModal(true)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  title="Edit Preferences"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">

              {(profileData?.jobPreferences || profileData?.profileData?.jobPreferences) ? (
                <div className="grid grid-cols-1 gap-3">
                  {((profileData?.jobPreferences?.jobTypes || profileData?.profileData?.jobPreferences?.jobTypes)?.length > 0) && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">Job Types</h4>
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
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">Preferred Locations</h4>
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
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Work Type</h4>
                      <span className="px-3 py-2 bg-orange-100 text-orange-800 text-sm rounded-full font-medium capitalize">
                        {profileData?.jobPreferences?.workType || profileData?.profileData?.jobPreferences?.workType}
                      </span>
                    </div>
                  )}
                  
                  {((profileData?.jobPreferences?.salaryRange?.min || profileData?.jobPreferences?.salaryRange?.max) || 
                    (profileData?.profileData?.jobPreferences?.salaryRange?.min || profileData?.profileData?.jobPreferences?.salaryRange?.max)) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Expected Salary Range</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <span className="text-lg font-semibold text-gray-800">
                          ₹{(profileData?.jobPreferences?.salaryRange?.min || profileData?.profileData?.jobPreferences?.salaryRange?.min) ? 
                            Number(profileData?.jobPreferences?.salaryRange?.min || profileData?.profileData?.jobPreferences?.salaryRange?.min).toLocaleString() : '0'} - 
                          ₹{(profileData?.jobPreferences?.salaryRange?.max || profileData?.profileData?.jobPreferences?.salaryRange?.max) ? 
                            Number(profileData?.jobPreferences?.salaryRange?.max || profileData?.profileData?.jobPreferences?.salaryRange?.max).toLocaleString() : 'Open'} per month
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {(profileData?.jobPreferences?.noticePeriod || profileData?.profileData?.jobPreferences?.noticePeriod) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Notice Period</h4>
                      <span className="px-3 py-2 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">
                        {profileData?.jobPreferences?.noticePeriod || profileData?.profileData?.jobPreferences?.noticePeriod}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No job preferences added yet</p>
                  <Button variant="outline" className="mt-3" onClick={() => setShowPreferencesModal(true)}>
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