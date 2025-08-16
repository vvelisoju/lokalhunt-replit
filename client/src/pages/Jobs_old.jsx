import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { 
  MagnifyingGlassIcon, 
  MapPinIcon,
  BriefcaseIcon,
  UsersIcon,
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
  
  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    jobType: [],
    experience: [],
    salaryRange: '',
    sortBy: 'newest'
  })

  // Categories and other filter data
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [skills, setSkills] = useState([])

  const jobTypes = [
    { id: 'REMOTE', label: 'Remote', value: 'REMOTE' },
    { id: 'FREELANCE', label: 'Freelance', value: 'FREELANCE' },
    { id: 'CONTRACT', label: 'Contract Base', value: 'CONTRACT' },
    { id: 'PART_TIME', label: 'Part Time', value: 'PART_TIME' },
    { id: 'FULL_TIME', label: 'Full Time', value: 'FULL_TIME' },
    { id: 'INTERNSHIP', label: 'Internship', value: 'INTERNSHIP' }
  ]

  const experienceLevels = [
    { id: 'ENTRY', label: 'Entry Level (0-2 years)', value: 'ENTRY' },
    { id: 'MID', label: 'Mid Level (2-5 years)', value: 'MID' },
    { id: 'SENIOR', label: 'Senior Level (5+ years)', value: 'SENIOR' },
    { id: 'EXECUTIVE', label: 'Executive Level', value: 'EXECUTIVE' }
  ]

  const salaryRanges = [
    { id: '0-25000', label: '₹0 - ₹25,000', value: '0-25000' },
    { id: '25000-50000', label: '₹25,000 - ₹50,000', value: '25000-50000' },
    { id: '50000-100000', label: '₹50,000 - ₹1,00,000', value: '50000-100000' },
    { id: '100000+', label: '₹1,00,000+', value: '100000+' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'salary-high', label: 'Salary: High to Low' },
    { value: 'salary-low', label: 'Salary: Low to High' },
    { value: 'relevance', label: 'Most Relevant' }
  ]

  // Refs for preventing multiple API calls and debouncing
  const mountedRef = useRef(true)
  const loadingRef = useRef(false)
  const searchTimeoutRef = useRef(null)
  const lastParamsRef = useRef('')

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

  // Debounced load jobs function
  const debouncedLoadJobs = useCallback(async (params, isSearching = false) => {
    // Clear existing timeout for search debouncing
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // If it's a search operation, debounce it
    if (isSearching && filters.search) {
      searchTimeoutRef.current = setTimeout(() => {
        loadJobsInternal(params)
      }, 400) // 400ms debounce
      return
    }

    // For non-search operations, load immediately
    loadJobsInternal(params)
  }, [filters.search])

  const loadJobsInternal = useCallback(async (params) => {
    // Prevent duplicate API calls
    const paramsString = JSON.stringify(params)
    if (loadingRef.current || lastParamsRef.current === paramsString) {
      return
    }

    loadingRef.current = true
    lastParamsRef.current = paramsString

    try {
      setLoading(true)

      // Use candidate API for authenticated users to get bookmark/application status
      // Otherwise use public API
      let response
      if (isAuthenticated === true && user?.role === 'CANDIDATE') {
        response = await candidateApi.searchJobsWithStatus(params)
      } else {
        response = await publicApi.searchJobs(params)
      }
      
      if (mountedRef.current) {
        const jobs = response.data?.jobs || []
        setJobs(jobs)
        setTotalJobs(response.data?.total || 0)
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
      if (mountedRef.current) {
        setJobs([])
        setTotalJobs(0)
      }
    } finally {
      loadingRef.current = false
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [isAuthenticated, user?.role])

  // Single useEffect that loads jobs when necessary
  useEffect(() => {
    // Only load jobs if authentication state is determined
    if (isAuthenticated !== null && isAuthenticated !== undefined) {
      const isSearchOperation = filters.search !== lastParamsRef.current?.search
      debouncedLoadJobs(apiParams, isSearchOperation)
    }
  }, [apiParams, isAuthenticated, user?.role, debouncedLoadJobs])

  // Load filter data on mount
  useEffect(() => {
    loadFilterData()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])



  const loadFilterData = async () => {
    try {
      // Load categories and cities for filters using public API
      const [categoriesRes, citiesRes] = await Promise.all([
        publicApi.getCategories().catch(() => ({ data: [] })),
        publicApi.getCities().catch(() => ({ data: [] }))
      ])

      setCategories(categoriesRes.data || [])
      setLocations(citiesRes.data || [])
    } catch (error) {
      console.error('Error loading filter data:', error)
    }
  }

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'jobType' || filterType === 'experience') {
      setFilters(prev => ({
        ...prev,
        [filterType]: prev[filterType].includes(value)
          ? prev[filterType].filter(item => item !== value)
          : [...prev[filterType], value]
      }))
    } else {
      setFilters(prev => ({
        ...prev,
        [filterType]: value
      }))
    }

    // Reset to first page when filters change
    setCurrentPage(1)

    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams)
    if (value && filterType !== 'jobType' && filterType !== 'experience') {
      newSearchParams.set(filterType, value)
    } else if (!value || value === '') {
      newSearchParams.delete(filterType)
    }
    setSearchParams(newSearchParams)
  }

  const clearAllFilters = () => {
    setFilters({
      search: '',
      location: '',
      category: '',
      jobType: [],
      experience: [],
      salaryRange: '',
      sortBy: 'newest'
    })
    setCurrentPage(1)
    setSearchParams(new URLSearchParams())
  }

  // Optimized Apply function with instant UI updates
  const handleApplyToJob = useCallback(async (jobId, event) => {
    event.stopPropagation() // Prevent card click navigation

    // Check authentication first
    if (!isAuthenticated) {
      toast.error('Please log in to apply for jobs')
      setShowLoginModal(true)
      return
    }
    
    if (!isAuthenticated) {
      toast.error('Please log in to apply for jobs')
      return
    }

    if (user?.role !== 'CANDIDATE') {
      toast.error('Only candidates can apply for jobs')
      return
    }

    setApplying(jobId)
    try {
      const response = await candidateApi.applyToJob(jobId)
      if (response.status === 'success') {
        toast.success('Application submitted successfully!')
        // Update the job in the list to show applied status
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, hasApplied: true } : job
        ))
      } else {
        toast.error(response.message || 'Failed to submit application')
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
  }, [isAuthenticated, user?.role])

  const handleJobCardClick = (jobId) => {
    navigate(`/jobs/${jobId}`)
  }

  const handleBookmarkJob = useCallback(async (jobId, event) => {
    event.stopPropagation() // Prevent card click navigation
    
    if (!isAuthenticated) {
      toast.error('Please log in to bookmark jobs')
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
  }, [isAuthenticated, user?.role, jobs])

  // Memoized JobCard component to prevent unnecessary re-renders
  const JobCard = React.memo(({ job }) => (
    <div 
      key={job.id}
      onClick={() => handleJobCardClick(job.id)}
      className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer p-6"
    >
      {/* Company Logo and Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {job.company?.logo ? (
              <img src={job.company.logo} alt={job.company?.name} className="w-full h-full object-cover" />
            ) : (
              <BriefcaseIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">{job.title}</h3>
            <p className="text-gray-600 text-sm">{job.company?.name}</p>
          </div>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={(e) => handleBookmarkJob(job.id, e)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          disabled={!isAuthenticated || user?.role !== 'CANDIDATE'}
        >
          {job.isBookmarked ? (
            <StarSolidIcon className="w-5 h-5 text-yellow-500" />
          ) : (
            <StarIcon className="w-5 h-5 text-gray-400 hover:text-yellow-500" />
          )}
        </button>
      </div>

      {/* Job Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <UsersIcon className="w-4 h-4 mr-2" />
          <span>{job.vacancies || job.numberOfPositions || 1} Vacancy</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <CurrencyRupeeIcon className="w-4 h-4 mr-2" />
          <span>
            {job.categorySpecificFields?.salaryMin && job.categorySpecificFields?.salaryMax 
              ? formatSalary(job.categorySpecificFields.salaryMin, job.categorySpecificFields.salaryMax)
              : 'Salary not disclosed'
            }
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <MapPinIcon className="w-4 h-4 mr-2" />
          <span>{job.location?.name ? `${job.location.name}${job.location.state ? `, ${job.location.state}` : ''}` : 'Location not specified'}</span>
        </div>
      </div>

      {/* Posted Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-500">
          <ClockIcon className="w-4 h-4 mr-1" />
          <span>Recently posted</span>
        </div>

        {/* Apply Button */}
        <div>
          {job.hasApplied ? (
            <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
              Applied
            </span>
          ) : (
            <Button
              onClick={(e) => handleApplyToJob(job.id, e)}
              disabled={applying === job.id}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
            >
              {applying === job.id ? 'Applying...' : 'Apply Now'}
            </Button>
          )}
        </div>
      </div>
    </div>
  ))

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

  // Loading skeleton component
  const JobCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded"></div>
    </div>
  )

  const totalPages = Math.ceil(totalJobs / jobsPerPage)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                  Search Filter
                </h2>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear All
                </button>
              </div>

              {/* Job Title Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by job title..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="City or location..."
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Job Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type
                </label>
                <div className="space-y-2">
                  {jobTypes.map((type) => (
                    <label key={type.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.jobType.includes(type.value)}
                        onChange={() => handleFilterChange('jobType', type.value)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Experience
                </label>
                <div className="space-y-2">
                  {experienceLevels.map((level) => (
                    <label key={level.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.experience.includes(level.value)}
                        onChange={() => handleFilterChange('experience', level.value)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range
                </label>
                <select
                  value={filters.salaryRange}
                  onChange={(e) => handleFilterChange('salaryRange', e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Any Salary</option>
                  {salaryRanges.map((range) => (
                    <option key={range.id} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-lg font-medium text-gray-900">
                  Total jobs found: <span className="text-primary-600">{totalJobs}</span>
                </h2>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-700">Sort:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Jobs Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
                      {/* Status Badges */}
                      <div className="absolute top-4 right-4 flex flex-col items-end space-y-2">
                        {job.featured && (
                          <div className="relative">
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">
                              Featured
                            </span>
                            <StarSolidIcon className="h-4 w-4 text-orange-500 absolute -top-1 -right-1" />
                          </div>
                        )}
                        {job.hasApplied && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                            Applied
                          </span>
                        )}
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={(e) => handleBookmarkJob(job.id, e)}
                        className="absolute top-4 left-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        title={job.isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                      >
                        {job.isBookmarked ? (
                          <StarSolidIcon className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <StarIcon className="h-5 w-5 text-gray-400 hover:text-yellow-500 transition-colors" />
                        )}
                      </button>

                      {/* Company Logo and Basic Info */}
                      <div className="flex items-start mb-4 mt-6">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          {job.company?.logo ? (
                            <img 
                              src={job.company.logo} 
                              alt={job.company.name}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <BriefcaseIcon className="h-6 w-6 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-2">
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">{job.company?.name}</p>
                          {job.categorySpecificFields?.employmentType && (
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${jobTypeBadge.class}`}>
                              {jobTypeBadge.label}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                          <UsersIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{job.vacancies || 1} Vacancy</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <CurrencyRupeeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{salaryDisplay}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">
                            {job.location?.name || job.company?.city?.name || 'Location not specified'}
                          </span>
                        </div>

                        {job.categorySpecificFields?.experience && (
                          <div className="flex items-center text-sm text-gray-600">
                            <BriefcaseIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              {job.categorySpecificFields.experience} experience
                            </span>
                          </div>
                        )}

                        {job.description && (
                          <div className="text-sm text-gray-600">
                            <p className="line-clamp-2 leading-relaxed">
                              {job.description}
                            </p>
                          </div>
                        )}

                        {job.categorySpecificFields?.skills && job.categorySpecificFields.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {job.categorySpecificFields.skills.slice(0, 3).map((skill, index) => (
                              <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                            {job.categorySpecificFields.skills.length > 3 && (
                              <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded text-xs">
                                +{job.categorySpecificFields.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        {job.validUntil && (
                          <div className="flex items-center text-sm text-gray-500">
                            <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>Valid until {new Date(job.validUntil).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{formatDate(job.createdAt)}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => handleApplyToJob(job.id, e)}
                        disabled={job.hasApplied || applying === job.id}
                        className={`w-full py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
                          job.hasApplied
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : applying === job.id
                            ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 active:transform active:scale-95'
                        }`}
                      >
                        {applying === job.id ? 'Applying...' : job.hasApplied ? 'Applied' : 'Apply Now'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                  const page = currentPage <= 3 ? index + 1 : currentPage - 2 + index
                  if (page > totalPages) return null
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login Required"
      >
        <div className="text-center py-4">
          <BriefcaseIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Please log in to apply for this job
          </h3>
          <p className="text-gray-600 mb-6">
            You need to be logged in to apply for jobs and track your applications.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => setShowLoginModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowLoginModal(false)
                navigate('/login')
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Login
            </Button>
          </div>
        </div>
      </Modal>
      
      <Footer />
    </div>
  )
}

export default Jobs