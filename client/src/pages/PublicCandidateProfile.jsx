
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Loader from '../components/ui/Loader'
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
  TrashIcon,
  ArrowLeftIcon,
  ShareIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'
import { publicApi } from '../services/publicApi'
import Button from '../components/ui/Button'

const getImageUrl = (imagePath) => {
  if (!imagePath) return null
  if (imagePath.startsWith('http')) return imagePath
  return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${imagePath}`
}

const PublicCandidateProfile = () => {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (candidateId) {
      loadCandidateProfile()
    }
  }, [candidateId])

  const loadCandidateProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      // Use public API to get candidate profile
      const response = await fetch(`/api/public/candidates/${candidateId}/profile`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Profile not found or not public')
      }

      const result = await response.json()
      setProfileData(result.data || result)
    } catch (error) {
      console.error('Error loading candidate profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Profile link copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader />
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Profile Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              This candidate profile is not available or not public.
            </p>
            <Button onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto bg-gray-50 pt-8">
        {/* Action Bar */}
        <div className="max-w-4xl mx-auto px-4 mb-6 print:hidden">
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <ShareIcon className="h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <PrinterIcon className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Header Banner */}
        <div className="bg-white shadow-sm overflow-hidden mb-4">
          {/* Cover Banner */}
          <div className="h-48 relative overflow-hidden border-b-4 border-white shadow-lg">
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
          </div>

          {/* Profile Section */}
          <div className="px-6 pb-4">
            {/* Profile Picture and Basic Info */}
            <div className="flex items-end gap-6 -mt-20 mb-4">
              {/* Profile Picture */}
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
                    {profileData?.firstName?.[0] || profileData?.user?.firstName?.[0] || profileData?.profileData?.firstName?.[0] || profileData?.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
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
                        : profileData?.user?.name || 'Professional Name'
                  }
                </h1>
              </div>
              <p className="text-lg text-gray-700 mb-2">
                {profileData?.profileData?.headline || 
                 profileData?.headline || 
                 profileData?.profileData?.jobTitle || 
                 profileData?.jobTitle || 
                 profileData?.profileData?.currentRole ||
                 'Professional Title'}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span>
                  {profileData?.profileData?.location || 
                   profileData?.location || 
                   profileData?.city || 
                   profileData?.user?.location ||
                   'Location'}
                </span>
                {(profileData?.email || profileData?.user?.email) && (
                  <span>{profileData?.email || profileData?.user?.email}</span>
                )}
                {(profileData?.profileData?.phone || profileData?.phone) && (
                  <span>{profileData?.profileData?.phone || profileData?.phone}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4 p-4">
          
          {/* About Section */}
          <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
            <div className="p-4">
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  About
                  <div className="ml-3 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                </h2>
              </div>
              <div className="text-gray-700 leading-relaxed">
                {profileData?.profileData?.summary ? (
                  <div className="whitespace-pre-wrap">{profileData.profileData.summary}</div>
                ) : (
                  <p className="text-gray-500 italic">No summary available</p>
                )}
              </div>
            </div>
          </div>

          {/* Experience Section */}
          <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
            <div className="p-4">
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  Experience
                  <div className="ml-3 w-6 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
                </h2>
              </div>
              
              <div className="space-y-4">
                {profileData?.experience?.length > 0 ? (
                  profileData.experience.map((exp, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                        <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                        <p className="text-blue-600 font-medium">{exp.company} • {exp.employmentType || 'Full-time'}</p>
                        <p className="text-gray-600 text-sm">{exp.duration}</p>
                        <p className="text-gray-600 text-sm flex items-center mt-1">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {exp.location || 'Location'}
                        </p>
                        {exp.description && (
                          <p className="text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No experience listed</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4">
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Education</h2>
              </div>
              
              <div className="space-y-4">
                {profileData?.education?.length > 0 ? (
                  profileData.education.map((edu, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        <AcademicCapIcon className="h-5 w-5 text-gray-600" />
                      </div>
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
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AcademicCapIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No education listed</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4">
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
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
                    <p>No skills listed</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Job Preferences Section */}
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-4">
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Job Preferences</h2>
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
                    <p>No job preferences specified</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}

export default PublicCandidateProfile
