import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Loader from '../components/ui/Loader'
import Button from '../components/ui/Button'
import { 
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ClockIcon,
  StarIcon as StarOutlineIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { publicApi } from '../services/publicApi'
import { candidateApi } from '../services/candidateApi'
import { useAuth } from '../context/AuthContext'

const JobDetail = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  
  // Get the 'from' parameter to determine where to go back
  const searchParams = new URLSearchParams(location.search)
  const from = searchParams.get('from')
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [bookmarking, setBookmarking] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    loadJobDetail()
  }, [id])

  const loadJobDetail = async () => {
    try {
      setLoading(true)
      
      // Get job details from public API
      const response = await publicApi.getJobById(id)
      
      if (response) {
        const jobData = response.data || response
        setJob(jobData)
        
        // If user is authenticated, check bookmark and application status from job data
        if (isAuthenticated && user?.role === 'CANDIDATE') {
          setIsBookmarked(jobData.isBookmarked || false)
          setHasApplied(jobData.hasApplied || false)
        }
      } else {
        toast.error('Job not found')
        navigate('/jobs')
      }
    } catch (error) {
      console.error('Error loading job details:', error)
      toast.error('Failed to load job details')
      navigate('/jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyToJob = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to apply for jobs')
      navigate('/login')
      return
    }

    if (user?.role !== 'CANDIDATE') {
      toast.error('Only candidates can apply for jobs')
      return
    }

    setApplying(true)
    try {
      const response = await candidateApi.applyToJob(id)
      console.log('Apply response:', response)
      
      // Handle different response formats
      if (response.status === 201 || response.data?.status === 'success' || response.success) {
        toast.success('Application submitted successfully!')
        setHasApplied(true)
      } else if (response.status === 409 || response.response?.status === 409) {
        toast.error('You have already applied to this job')
        setHasApplied(true) // Update UI state to reflect reality
      } else {
        toast.error(response.data?.message || response.message || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error applying to job:', error)
      if (error.response?.status === 409) {
        toast.error('You have already applied to this job')
        setHasApplied(true)
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit application')
      }
    } finally {
      setApplying(false)
    }
  }

  const handleBookmarkJob = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to bookmark jobs')
      navigate('/login')
      return
    }

    if (user?.role !== 'CANDIDATE') {
      toast.error('Only candidates can bookmark jobs')
      return
    }

    setBookmarking(true)
    try {
      if (isBookmarked) {
        await candidateApi.removeBookmark(id)
        toast.success('Job removed from bookmarks')
        setIsBookmarked(false)
      } else {
        await candidateApi.addBookmark(id)
        toast.success('Job bookmarked successfully')
        setIsBookmarked(true)
      }
    } catch (error) {
      console.error('Error bookmarking job:', error)
      toast.error('Failed to bookmark job')
    } finally {
      setBookmarking(false)
    }
  }

  const formatSalary = (salaryMin, salaryMax) => {
    if (!salaryMin && !salaryMax) return 'Salary not disclosed'
    if (salaryMin && salaryMax) {
      return `₹${salaryMin.toLocaleString()} - ₹${salaryMax.toLocaleString()}`
    }
    if (salaryMin) return `₹${salaryMin.toLocaleString()}+`
    return `Up to ₹${salaryMax.toLocaleString()}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently posted'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays <= 7) return `${diffDays} days ago`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const getJobTypeBadge = (jobType) => {
    const badgeClasses = {
      FULL_TIME: 'bg-blue-100 text-blue-800',
      PART_TIME: 'bg-green-100 text-green-800',
      CONTRACT: 'bg-purple-100 text-purple-800',
      FREELANCE: 'bg-yellow-100 text-yellow-800',
      REMOTE: 'bg-indigo-100 text-indigo-800',
      INTERNSHIP: 'bg-pink-100 text-pink-800'
    }
    
    const labels = {
      FULL_TIME: 'Full Time',
      PART_TIME: 'Part Time',
      CONTRACT: 'Contract',
      FREELANCE: 'Freelance',
      REMOTE: 'Remote',
      INTERNSHIP: 'Internship'
    }
    
    return {
      class: badgeClasses[jobType] || 'bg-gray-100 text-gray-800',
      label: labels[jobType] || jobType
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader />
        </div>
        <Footer />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
            <p className="text-gray-600 mb-8">The job you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/jobs')}>
              Back to Jobs
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const handleBackNavigation = () => {
    switch(from) {
      case 'applications':
        navigate('/candidate/applications')
        break
      case 'bookmarks':
        navigate('/candidate/bookmarks')
        break
      default:
        navigate('/jobs')
        break
    }
  }

  const jobTypeBadge = getJobTypeBadge(job.jobType?.toUpperCase())
  const salary = formatSalary(job.categorySpecificFields?.salaryRange?.min, job.categorySpecificFields?.salaryRange?.max)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={handleBackNavigation}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-all hover:translate-x-[-2px] group mb-8"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:mr-3 transition-all" />
          <span className="font-medium">
            {from === 'applications' ? 'Back to Applied Jobs' : 
             from === 'bookmarks' ? 'Back to Bookmarks' : 
             'Back to Jobs'}
          </span>
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 min-w-0 mb-6 lg:mb-0">
              <div className="flex items-start">
                {job.company?.logo && (
                  <img
                    src={job.company.logo}
                    alt={job.company?.name}
                    className="w-16 h-16 rounded-lg object-cover mr-4 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                      {job.company?.name || 'Company Name'}
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      {job.location || 'Location not specified'}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      {formatDate(job.postedAt)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${jobTypeBadge.class}`}>
                      <BriefcaseIcon className="h-4 w-4 mr-1" />
                      {jobTypeBadge.label}
                    </span>
                    {job.categorySpecificFields?.experienceLevel && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {job.categorySpecificFields.experienceLevel}
                      </span>
                    )}
                    {job.vacancies && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        {job.vacancies} {job.vacancies === 1 ? 'Position' : 'Positions'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
              <Button
                onClick={handleBookmarkJob}
                variant="outline"
                disabled={bookmarking || !isAuthenticated}
                className={`flex items-center transition-all duration-200 ${isBookmarked ? 'border-yellow-400 bg-yellow-50' : ''}`}
              >
                {isBookmarked ? (
                  <StarSolidIcon className="h-5 w-5 mr-2 text-yellow-500" />
                ) : (
                  <StarOutlineIcon className="h-5 w-5 mr-2" />
                )}
                {bookmarking ? 'Saving...' : (isBookmarked ? 'Bookmarked' : 'Bookmark')}
              </Button>
              
              <Button
                onClick={handleApplyToJob}
                disabled={applying || hasApplied || !isAuthenticated}
                className={`flex items-center px-6 py-3 text-lg font-medium transition-all duration-200 ${
                  hasApplied ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                {applying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Applying...
                  </>
                ) : hasApplied ? (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Applied
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Apply Now
                  </>
                )}
              </Button>
              
              {!isAuthenticated && (
                <p className="text-sm text-gray-500 mt-2">
                  Please <span className="text-primary-600 font-medium">sign in</span> to apply or bookmark jobs
                </p>
              )}
            </div>
          </div>

          {/* Job Stats and Info */}
          <div className="border-t border-gray-200 mt-6 pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center">
                  <CurrencyRupeeIcon className="h-6 w-6 text-green-600 mr-2" />
                  <div>
                    <p className="text-xs text-green-600 font-medium">Salary</p>
                    <p className="font-bold text-green-800 text-lg">{salary}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center">
                  <UserGroupIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Applications</p>
                    <p className="font-bold text-blue-800 text-lg">{job.applicationCount || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center">
                  <CalendarIcon className="h-6 w-6 text-purple-600 mr-2" />
                  <div>
                    <p className="text-xs text-purple-600 font-medium">Posted</p>
                    <p className="font-bold text-purple-800 text-sm">{formatDate(job.postedAt)}</p>
                  </div>
                </div>
              </div>
              
              {job.categorySpecificFields?.experienceLevel && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center">
                    <BriefcaseIcon className="h-6 w-6 text-orange-600 mr-2" />
                    <div>
                      <p className="text-xs text-orange-600 font-medium">Experience</p>
                      <p className="font-bold text-orange-800 text-sm">{job.categorySpecificFields.experienceLevel}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-4"></div>
            Job Description
          </h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            {job.description ? (
              <div dangerouslySetInnerHTML={{ __html: job.description }} />
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500 italic">No detailed description available for this position.</p>
              </div>
            )}
          </div>
        </div>

        {/* Skills and Requirements */}
        {job.skills && job.skills.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full mr-4"></div>
              Required Skills
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {job.skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-3 text-center hover:shadow-md transition-all duration-200"
                >
                  <span className="text-sm font-semibold text-blue-800">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Company Information */}
        {job.company && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-4"></div>
              About the Company
            </h2>
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-start">
                {job.company.logo && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden mr-6 flex-shrink-0 shadow-lg border-2 border-white">
                    <img
                      src={job.company.logo}
                      alt={job.company.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{job.company.name}</h3>
                  {job.company.description && (
                    <p className="text-gray-700 mb-6 leading-relaxed">{job.company.description}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {job.company.industry && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                        <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Industry</span>
                        <span className="text-gray-900 font-semibold">{job.company.industry}</span>
                      </div>
                    )}
                    {job.company.size && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                        <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Company Size</span>
                        <span className="text-gray-900 font-semibold">{job.company.size}</span>
                      </div>
                    )}
                    {job.company.website && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                        <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Website</span>
                        <a
                          href={job.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 font-semibold break-all"
                        >
                          {job.company.website}
                        </a>
                      </div>
                    )}
                    {job.company.location && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                        <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Location</span>
                        <span className="text-gray-900 font-semibold">{job.company.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default JobDetail