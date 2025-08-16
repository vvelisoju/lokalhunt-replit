import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import SharedJobCard from '../components/ui/JobCard'
import JobFilters from '../components/ui/JobFilters'
import { 
  MagnifyingGlassIcon, 
  MapPinIcon,
  BriefcaseIcon,
  UsersIcon,
  UserGroupIcon,
  StarIcon,
  ClockIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { candidateApi } from '../services/candidateApi'
import { publicApi } from '../services/publicApi'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/ui/Loader'

const Jobs = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)
  const [totalJobs, setTotalJobs] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [jobsPerPage] = useState(12)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    category: '',
    jobType: [],
    experience: [],
    gender: '',
    education: [],
    salaryRange: '',
    sortBy: 'newest'
  })

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'salary-high', label: 'Salary: High to Low' },
    { value: 'salary-low', label: 'Salary: Low to High' },
    { value: 'relevance', label: 'Most Relevant' }
  ]

  // Memoized API parameters to prevent unnecessary re-renders
  const apiParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: jobsPerPage,
      search: filters.search,
      location: filters.location,
      category: filters.category,
      jobType: filters.jobType.join(','),
      experience: filters.experience.join(','),
      salaryRange: filters.salaryRange,
      sortBy: filters.sortBy
    }

    // Remove empty parameters
    Object.keys(params).forEach(key => {
      if (!params[key] || params[key] === '') {
        delete params[key]
      }
    })

    return params
  }, [currentPage, jobsPerPage, filters])

  // Load jobs when component mounts or filters change
  useEffect(() => {
    const loadJobs = async () => {
      if (isAuthenticated === null || isAuthenticated === undefined) return
      
      try {
        setLoading(true)
        let response
        
        if (isAuthenticated && user?.role === 'CANDIDATE') {
          response = await candidateApi.searchJobsWithStatus(apiParams)
        } else {
          response = await publicApi.searchJobs(apiParams)
        }
        
        const responseData = response.data?.data || response.data || response
        const jobs = responseData?.jobs || []
        const total = responseData?.total || 0
        
        setJobs(jobs)
        setTotalJobs(total)
      } catch (error) {
        console.error('Error loading jobs:', error)
        setJobs([])
        setTotalJobs(0)
      } finally {
        setLoading(false)
      }
    }
    
    loadJobs()
  }, [currentPage, jobsPerPage, filters.search, filters.location, filters.category, filters.sortBy, isAuthenticated, user?.role])

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset page when filters change
    
    // Update URL params
    const newSearchParams = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '' && !(Array.isArray(value) && value.length === 0)) {
        if (Array.isArray(value)) {
          newSearchParams.set(key, value.join(','))
        } else {
          newSearchParams.set(key, value)
        }
      }
    })
    setSearchParams(newSearchParams)
  }, [setSearchParams])

  const handleJobCardClick = (jobId) => {
    navigate(`/jobs/${jobId}`)
  }

  const handleApply = async (jobId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    if (user?.role !== 'CANDIDATE') {
      toast.error('Only candidates can apply to jobs')
      return
    }

    try {
      setApplying(jobId)
      const response = await candidateApi.applyToJob(jobId)
      
      if (response.status === 201 || response.data?.status === 'success') {
        toast.success('Application submitted successfully!')
        // Update the job in the list to show applied status
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, hasApplied: true } : job
        ))
      } else {
        toast.error(response.data?.message || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error applying to job:', error)
      if (error.response?.status === 409) {
        toast.error('You have already applied to this job')
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, hasApplied: true } : job
        ))
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit application')
      }
    } finally {
      setApplying(null)
    }
  }

  const handleBookmark = async (jobId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    if (user?.role !== 'CANDIDATE') {
      toast.error('Only candidates can bookmark jobs')
      return
    }

    try {
      const job = jobs.find(j => j.id === jobId)
      if (job?.isBookmarked) {
        await candidateApi.removeBookmark(jobId)
        toast.success('Job removed from bookmarks')
      } else {
        await candidateApi.addBookmark(jobId)
        toast.success('Job bookmarked successfully')
      }
      
      // Update the job in the list instantly
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job
      ))
    } catch (error) {
      console.error('Error bookmarking job:', error)
      toast.error('Failed to bookmark job')
    }
  }

  const formatSalary = (salaryMin, salaryMax) => {
    if (!salaryMin && !salaryMax) return 'Salary not disclosed'
    if (salaryMin && salaryMax) {
      return `₹${salaryMin.toLocaleString()} - ₹${salaryMax.toLocaleString()}`
    }
    if (salaryMin) return `₹${salaryMin.toLocaleString()}+`
    if (salaryMax) return `Up to ₹${salaryMax.toLocaleString()}`
    return 'Salary not disclosed'
  }

  // Remove the local JobCard component and use the shared one
  const JobCardSkeleton = () => (
    <div className="bg-white border border-gray-200 p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-10 h-10 bg-gray-200 rounded"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="flex space-x-4 mb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="w-5 h-5 bg-gray-200 rounded"></div>
          <div className="w-16 h-8 bg-gray-200 rounded"></div>
          <div className="w-20 h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
        {/* Shared Job Filters Component */}
        <JobFilters 
          filters={filters} 
          onFiltersChange={handleFiltersChange}
          showAdvancedFilters={true}
        />

        {/* Main Content Layout */}
        <div className="flex flex-col gap-4">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-medium text-gray-900">
                Total jobs found: <span className="text-blue-600 font-semibold">{totalJobs}</span>
              </h2>
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="text-sm text-gray-700">Sort:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFiltersChange({ ...filters, sortBy: e.target.value })}
                className="py-2 px-3 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Jobs List */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => {
                // Transform job data for shared JobCard
                const jobData = {
                  id: job.id,
                  title: job.title || 'No Title',
                  company: job.company,
                  companyName: job.company?.name || 'Unknown Company',
                  location: typeof job.location === 'string' 
                    ? job.location 
                    : job.location?.name 
                      ? `${job.location.name}, ${job.location.state || ''}`.trim().replace(/,$/, '')
                      : 'Location not specified',
                  jobType: job.jobType || 'Full Time',
                  salary: typeof job.salary === 'string' 
                    ? job.salary
                    : job.salary && typeof job.salary === 'object'
                      ? (job.salary.min && job.salary.max 
                          ? `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}`
                          : job.salary.min 
                            ? `₹${job.salary.min.toLocaleString()}+`
                            : 'Not disclosed')
                      : job.categorySpecificFields?.salaryRange && typeof job.categorySpecificFields.salaryRange === 'string'
                        ? job.categorySpecificFields.salaryRange
                        : 'Not disclosed',
                  description: job.description || '',
                  skills: Array.isArray(job.skills) ? job.skills : (job.categorySpecificFields?.requiredSkills || []),
                  postedAt: job.postedAt || job.createdAt,
                  createdAt: job.createdAt,
                  applicationCount: typeof job.applicationCount === 'number' ? job.applicationCount : 0,
                  isBookmarked: Boolean(job.isBookmarked),
                  hasApplied: Boolean(job.hasApplied),
                  experienceLevel: job.experienceLevel
                }

                return (
                  <SharedJobCard 
                    key={job.id} 
                    job={jobData} 
                    variant="default"
                    onApply={handleApply}
                    onBookmark={handleBookmark}
                    loading={{
                      apply: applying === job.id,
                      bookmark: false
                    }}
                    onClick={() => handleJobCardClick(job.id)}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Login Required</h3>
            <p className="text-gray-600 mb-6">You need to be logged in to apply for jobs.</p>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg text-center hover:bg-primary-700"
              >
                Login
              </Link>
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
      
      <Footer />
    </div>
  )
}

export default Jobs
