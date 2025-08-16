import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import FormInput from '../../components/ui/FormInput'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Modal from '../../components/ui/Modal'
import { getAllCandidates, updateCandidateStatus } from '../../services/employer/candidates'
import { getAds } from '../../services/employer/ads'
import { toast } from 'react-hot-toast'

const Candidates = () => {
  const [searchParams] = useSearchParams()
  const [candidates, setCandidates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showCandidateModal, setShowCandidateModal] = useState(false)
  
  // Get ad filter from URL params
  const adIdFilter = searchParams.get('adId')
  const adTitleFilter = searchParams.get('adTitle')
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [experienceFilter, setExperienceFilter] = useState('')
  const [selectedAd, setSelectedAd] = useState(adIdFilter || '')
  
  // State for ads dropdown
  const [approvedAds, setApprovedAds] = useState([])

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'ALLOCATED', label: 'Allocated' },
    { value: 'SHORTLISTED', label: 'Shortlisted' },
    { value: 'INTERVIEW', label: 'Interview' },
    { value: 'HIRED', label: 'Hired' },
    { value: 'REJECTED', label: 'Rejected' }
  ]

  const experienceOptions = [
    { value: '', label: 'All Experience' },
    { value: '0-1', label: '0-1 years' },
    { value: '1-3', label: '1-3 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10+', label: '10+ years' }
  ]

  useEffect(() => {
    loadCandidates()
    loadApprovedAds()
  }, [])

  const loadCandidates = async () => {
    setIsLoading(true)
    try {
      const result = await getAllCandidates()
      if (result.success) {
        let allCandidates = result.data.candidates || []
        
        // If we have an ad filter, only show candidates for that specific ad
        if (selectedAd) {
          allCandidates = allCandidates.filter(candidate => {
            return candidate.allocations && candidate.allocations.some(allocation => allocation.adId === selectedAd)
          })
        }
        
        setCandidates(allCandidates)
      } else {
        toast.error('Failed to load candidates')
      }
    } catch (error) {
      console.error('Error loading candidates:', error)
      toast.error('Failed to load candidates')
    } finally {
      setIsLoading(false)
    }
  }

  const loadApprovedAds = async () => {
    try {
      const result = await getAds({ status: 'APPROVED', limit: 100 })
      if (result.success) {
        const ads = result.data.data.ads || []
        setApprovedAds([
          { value: '', label: 'All Ads' },
          ...ads.map(ad => ({
            value: ad.id,
            label: ad.title
          }))
        ])
      }
    } catch (error) {
      console.error('Error loading approved ads:', error)
    }
  }

  const handleStatusUpdate = async (candidateId, status, notes = '') => {
    try {
      const result = await updateCandidateStatus(candidateId, status, notes)
      if (result.success) {
        toast.success('Candidate status updated successfully')
        // Update local state
        setCandidates(prev => prev.map(candidate => 
          candidate.id === candidateId 
            ? { ...candidate, status, notes }
            : candidate
        ))
      } else {
        toast.error(result.error || 'Failed to update candidate status')
      }
    } catch (error) {
      console.error('Error updating candidate status:', error)
      toast.error('Failed to update candidate status')
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'ALLOCATED':
        return 'bg-blue-100 text-blue-800'
      case 'SHORTLISTED':
        return 'bg-yellow-100 text-yellow-800'
      case 'INTERVIEW':
        return 'bg-purple-100 text-purple-800'
      case 'HIRED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.currentJobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || candidate.status === statusFilter
    const matchesSkill = !skillFilter || (candidate.skills && candidate.skills.some(skill => 
      skill.toLowerCase().includes(skillFilter.toLowerCase())
    ))
    
    const matchesAd = !selectedAd || (candidate.allocations && candidate.allocations.some(allocation => allocation.adId === selectedAd))
    
    return matchesSearch && matchesStatus && matchesSkill && matchesAd
  })

  // Update candidates when ad filter changes
  useEffect(() => {
    loadCandidates()
  }, [selectedAd])

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate)
    setShowCandidateModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                <UserGroupIcon className="h-7 w-7 lg:h-8 lg:w-8 mr-3 text-blue-600" />
                Candidates
                {adTitleFilter && (
                  <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    for "{adTitleFilter}"
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">
                {adTitleFilter 
                  ? `Viewing candidates allocated to the "${adTitleFilter}" job posting`
                  : "Manage and view all candidates in your talent pool"
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 bg-white px-3 py-2 rounded-lg border">
                <UserGroupIcon className="h-4 w-4 inline mr-1" />
                {filteredCandidates.length} candidates
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 mb-6 lg:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <h3 className="font-medium text-gray-900">Filter Candidates</h3>
            {selectedAd && adTitleFilter && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Filtered by: {adTitleFilter}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <FormInput
              label="Search candidates"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or job title..."
              icon={MagnifyingGlassIcon}
            />
            <Select
              label="Job Ad"
              value={selectedAd}
              onChange={(e) => setSelectedAd(e.target.value)}
              options={approvedAds}
            />
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
            <FormInput
              label="Skills"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="Filter by skills..."
            />
            <Select
              label="Experience"
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              options={experienceOptions}
            />
          </div>
        </div>

        {/* Candidates Grid */}
        {filteredCandidates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-300">
              <div className="p-6">
                {/* Candidate Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={candidate.user?.profileImage || `https://ui-avatars.com/api/?name=${candidate.user?.name}&background=1976d2&color=fff`}
                      alt={candidate.user?.name || 'Candidate'}
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {candidate.user?.name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {candidate.currentJobTitle || 'No job title'}
                      </p>
                    </div>
                  </div>
                  {candidate.status && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(candidate.status)}`}>
                      {candidate.status}
                    </span>
                  )}
                </div>

                {/* Candidate Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{candidate.user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Experience:</span>
                    <span className="ml-2">{candidate.experience || 'N/A'} years</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">{candidate.currentLocation || 'N/A'}</span>
                  </div>
                </div>

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                          +{candidate.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewCandidate(candidate)}
                    className="flex-1"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No candidates match your current search criteria.
            </p>
          </div>
        )}

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={showCandidateModal}
          onClose={() => {
            setShowCandidateModal(false)
            setSelectedCandidate(null)
          }}
          title="Candidate Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Candidate Header */}
            <div className="flex items-center space-x-4">
              <img
                className="h-16 w-16 rounded-full object-cover"
                src={selectedCandidate.user?.profileImage || `https://ui-avatars.com/api/?name=${selectedCandidate.user?.name}&background=1976d2&color=fff`}
                alt={selectedCandidate.user?.name || 'Candidate'}
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedCandidate.user?.name || 'Unknown'}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedCandidate.currentJobTitle || 'No job title'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedCandidate.user?.email || 'N/A'}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Experience</h4>
                <p className="text-sm text-gray-900">{selectedCandidate.experience || 'N/A'} years</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Location</h4>
                <p className="text-sm text-gray-900">{selectedCandidate.currentLocation || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Salary</h4>
                <p className="text-sm text-gray-900">₹{selectedCandidate.expectedSalary || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                {selectedCandidate.status ? (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(selectedCandidate.status)}`}>
                    {selectedCandidate.status}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">No status</span>
                )}
              </div>
            </div>

            {/* Skills */}
            {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {selectedCandidate.bio && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Bio</h4>
                <p className="text-sm text-gray-900">{selectedCandidate.bio}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
      </div>
    </div>
  )
}

export default Candidates