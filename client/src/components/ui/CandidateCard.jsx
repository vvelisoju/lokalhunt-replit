import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  EyeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  UserIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  HandRaisedIcon,
  PauseIcon,
  EnvelopeIcon,
  PencilIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Button from './Button'
import Modal from './Modal'
import { toast } from 'react-hot-toast'

const CandidateCard = ({ 
  candidate, 
  onSelect, 
  isSelected, 
  variant = "default", 
  showPremiumBadge = false,
  onStatusUpdate,
  className = "",
  loading = {}
}) => {
  const navigate = useNavigate()
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [selectedAction, setSelectedAction] = useState('')
  const [notes, setNotes] = useState('')
  const [internalLoading, setInternalLoading] = useState({})
  const [editingJobStatus, setEditingJobStatus] = useState(null)
  const [jobStatusLoading, setJobStatusLoading] = useState({})
  const [selectedJobId, setSelectedJobId] = useState(null)

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Applied':
      case 'APPLIED':
      case 'ALLOCATED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Shortlisted':
      case 'SHORTLISTED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'InterviewScheduled':
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'InterviewCompleted':
      case 'INTERVIEW_COMPLETED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'Hired':
      case 'HIRED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Rejected':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Hold':
      case 'HOLD':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'APPLIED':
      case 'ALLOCATED':
        return 'APPLIED'
      case 'SHORTLISTED':
        return 'SHORTLISTED'
      case 'INTERVIEW_SCHEDULED':
        return 'INTERVIEW'
      case 'INTERVIEW_COMPLETED':
        return 'INTERVIEWED'
      case 'HIRED':
        return 'HIRED'
      case 'REJECTED':
        return 'REJECTED'
      case 'HOLD':
        return 'ON HOLD'
      default:
        return status?.toUpperCase() || 'UNKNOWN'
    }
  }

  const getStatusOptions = () => [
    { value: 'APPLIED', label: 'Applied' },
    { value: 'SHORTLISTED', label: 'Shortlisted' },
    { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
    { value: 'INTERVIEW_COMPLETED', label: 'Interview Completed' },
    { value: 'HIRED', label: 'Hired' },
    { value: 'HOLD', label: 'Hold' },
    { value: 'REJECTED', label: 'Rejected' }
  ]

  const getCurrentStatus = () => {
    // Get status of selected job application
    if (selectedJobId && candidate.allocations && candidate.allocations.length > 0) {
      const selectedAllocation = candidate.allocations.find(allocation => allocation.id === selectedJobId)
      if (selectedAllocation) {
        return selectedAllocation.status
      }
    }

    // Fallback to most recent allocation status
    if (candidate.allocations && candidate.allocations.length > 0) {
      const latestAllocation = candidate.allocations[0]
      return latestAllocation.status
    }
    return 'ALLOCATED'
  }

  const getAllJobApplications = () => {
    if (!candidate.allocations || candidate.allocations.length === 0) {
      return []
    }

    return candidate.allocations.map(allocation => ({
      id: allocation.id,
      jobTitle: allocation.ad?.title || 'Unknown Job',
      status: allocation.status,
      adId: allocation.adId
    }))
  }

  // Initialize selected job with latest application
  React.useEffect(() => {
    const applications = getAllJobApplications()
    if (applications.length > 0 && !selectedJobId) {
      setSelectedJobId(applications[0].id)
    }
  }, [candidate.allocations, selectedJobId])

  const getActionButtons = (status) => {
    const allActions = [
      {
        label: 'Shortlist',
        action: 'SHORTLISTED',
        variant: 'primary',
        icon: CheckIcon,
        color: 'bg-yellow-600 hover:bg-yellow-700'
      },
      {
        label: 'Interview',
        action: 'INTERVIEW_SCHEDULED',
        variant: 'primary',
        icon: ClockIcon,
        color: 'bg-purple-600 hover:bg-purple-700'
      },
      {
        label: 'Hired',
        action: 'HIRED',
        variant: 'primary',
        icon: CheckIcon,
        color: 'bg-green-600 hover:bg-green-700'
      },
      {
        label: 'Hold',
        action: 'HOLD',
        variant: 'secondary',
        icon: PauseIcon,
        color: 'bg-orange-600 hover:bg-orange-700 text-white'
      },
      {
        label: 'Reject',
        action: 'REJECTED',
        variant: 'secondary',
        icon: XMarkIcon,
        color: 'bg-red-600 hover:bg-red-700 text-white',
        requiresNotes: true
      }
    ]

    // Define allowed transitions based on current status
    const allowedTransitions = {
      'APPLIED': ['SHORTLISTED', 'HOLD', 'REJECTED'],
      'ALLOCATED': ['SHORTLISTED', 'HOLD', 'REJECTED'],
      'SHORTLISTED': ['INTERVIEW_SCHEDULED', 'HIRED', 'HOLD', 'REJECTED'],
      'INTERVIEW_SCHEDULED': ['INTERVIEW_COMPLETED', 'HIRED', 'HOLD', 'REJECTED'],
      'INTERVIEW_COMPLETED': ['HIRED', 'HOLD', 'REJECTED'],
      'HIRED': ['HOLD', 'REJECTED'],
      'HOLD': ['HIRED', 'REJECTED'],
      'REJECTED': [] // No transitions from rejected
    }

    const currentStatus = status || 'APPLIED'
    const allowedActions = allowedTransitions[currentStatus] || []

    return allActions.filter(action => allowedActions.includes(action.action))
  }

  // Get available actions based on selected application status
  const getAvailableActions = () => {
    const applications = getAllJobApplications()
    if (applications.length === 0) return []

    // Get the selected application or fall back to latest
    let targetApplication = applications.find(app => app.id === selectedJobId)
    if (!targetApplication) {
      targetApplication = applications[0]
    }

    return getActionButtons(targetApplication.status)
  }

  const handleActionClick = (actionData) => {
    setSelectedAction(actionData)
    if (actionData.requiresNotes) {
      setNotes('')
      setShowNotesModal(true)
    } else {
      handleStatusUpdate(actionData.action, '')
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    if (!candidate.allocations || candidate.allocations.length === 0) {
      console.error('No allocations found for candidate')
      return
    }

    // Use selected allocation or fall back to first allocation
    let allocation = candidate.allocations.find(alloc => alloc.id === selectedJobId)
    if (!allocation) {
      allocation = candidate.allocations[0]
    }

    setInternalLoading(prev => ({ ...prev, [newStatus]: true }))

    try {
      // Validate status before sending
      const validStatuses = [
        'APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED',
        'INTERVIEW_COMPLETED', 'HIRED', 'HOLD', 'REJECTED'
      ];

      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
      }

      await onStatusUpdate(allocation.id, newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setInternalLoading(prev => ({ ...prev, [newStatus]: false }))
    }
  }

  const handleJobStatusUpdate = async (allocationId, newStatus) => {
    setJobStatusLoading(prev => ({ ...prev, [allocationId]: true }))

    try {
      // Validate status before sending
      const validStatuses = [
        'APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED',
        'INTERVIEW_COMPLETED', 'HIRED', 'HOLD', 'REJECTED'
      ];

      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
      }

      await onStatusUpdate(allocationId, newStatus)
      // Removed toast notifications for dropdown updates
      setEditingJobStatus(null)
    } catch (error) {
      console.error('Error updating job status:', error)
      toast.error('Failed to update job application status')
    } finally {
      setJobStatusLoading(prev => ({ ...prev, [allocationId]: false }))
    }
  }

  const handleConfirmAction = () => {
    if (selectedAction.requiresNotes && !notes.trim()) {
      toast.error('Please provide a reason')
      return
    }
    handleStatusUpdate(selectedAction.action, notes)
  }

  const handleViewProfile = () => {
    // Always navigate to employer candidate profile view, don't use onViewProfile callback
    const candidateId = candidate.id || candidate.user?.id
    if (candidateId) {
      navigate(`/employer/candidate/${candidateId}/profile`)
    } else {
      toast.error('Unable to view profile - candidate ID not found')
    }
  }

  const currentStatus = getCurrentStatus()
  const actionButtons = getAvailableActions()
  const jobApplications = getAllJobApplications()

  return (
    <>
      <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 hover:border-blue-300 w-full ${className}`}>
        <div className="p-4 lg:p-6">
          {/* Mobile-First Layout */}
          <div className="flex flex-col space-y-2">

            {/* Header Section - Candidate Info with Job Applications on Right */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6 space-y-2 lg:space-y-0">
              {/* Left Side - Candidate Info - Optimized for Mobile */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start space-x-3 lg:space-x-4 mb-2 lg:mb-3">
                  <img
                    className="h-12 w-12 lg:h-16 lg:w-16 rounded-full object-cover border-2 border-gray-100 flex-shrink-0"
                    src={candidate.user?.profileImage || `https://ui-avatars.com/api/?name=${candidate.user?.name}&background=1976d2&color=fff`}
                    alt={candidate.user?.name || 'Candidate'}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate leading-tight lg:leading-normal">
                      {candidate.user?.name || 'Unknown'}
                    </h3>
                    <p className="text-sm lg:text-base text-gray-600 font-medium truncate mt-0.5 lg:mt-1">
                      {candidate.currentJobTitle || 'No job title'}
                    </p>
                    {/* Compact Info Row */}
                    <div className="flex items-center space-x-4 lg:space-x-6 mt-1 lg:mt-2 text-xs lg:text-sm text-gray-500">
                      {candidate.user?.phone && (
                        <div className="flex items-center space-x-1 lg:space-x-1.5">
                          <PhoneIcon className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                          <span className="truncate">{candidate.user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1 lg:space-x-1.5">
                        <BriefcaseIcon className="h-3 w-3 lg:h-4 lg:w-4" />
                        <span>{candidate.experience || 0}y</span>
                      </div>
                      {(candidate.profile_data?.gender || candidate.gender) && (
                        <div className="flex items-center space-x-1 lg:space-x-1.5">
                          <UserIcon className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span className="capitalize">{(candidate.profile_data?.gender || candidate.gender).charAt(0)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Job Applications - Compact Mobile Layout */}
              {jobApplications.length > 0 && (
                <div className="lg:w-96 lg:flex-shrink-0">
                  <div className="flex items-center justify-between mb-1 lg:mb-2">
                    <h4 className="text-xs lg:text-sm font-medium text-gray-700">Applications</h4>
                    <span className="inline-flex items-center px-1.5 py-0.5 lg:px-2 lg:py-1 rounded text-xs lg:text-sm font-medium bg-blue-100 text-blue-800">
                      {jobApplications.length}
                    </span>
                  </div>
                  <div className="space-y-1 lg:space-y-2 max-h-24 lg:max-h-36 overflow-y-auto">
                    {jobApplications.map((application) => (
                      <div
                        key={application.id}
                        className={`flex items-center justify-between p-1.5 lg:p-3 rounded-lg cursor-pointer transition-colors text-xs lg:text-sm ${
                          selectedJobId === application.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedJobId(application.id)}
                      >
                        <span className="font-medium text-gray-900 truncate flex-1 mr-1 lg:mr-2">
                          {application.jobTitle}
                          {selectedJobId === application.id && (
                            <span className="ml-1 text-xs lg:text-sm text-blue-600 font-medium lg:inline hidden">(Selected)</span>
                          )}
                        </span>
                        <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
                          {editingJobStatus === application.id ? (
                            <div className="relative">
                              <select
                                value={application.status}
                                onChange={(e) => handleJobStatusUpdate(application.id, e.target.value)}
                                disabled={jobStatusLoading[application.id]}
                                className="text-xs lg:text-sm font-medium rounded border px-1 py-0.5 lg:px-2 lg:py-1 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                onBlur={() => setEditingJobStatus(null)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              >
                                {getStatusOptions().map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              {jobStatusLoading[application.id] && (
                                <div className="absolute right-0.5 top-1/2 transform -translate-y-1/2">
                                  <div className="w-2 h-2 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              <span className={`px-1.5 py-0.5 lg:px-2 lg:py-1 text-xs lg:text-sm font-medium rounded border ${getStatusBadgeColor(application.status)}`}>
                                {getStatusDisplayName(application.status)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingJobStatus(application.id)
                                }}
                                className="p-0.5 lg:p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Edit status"
                              >
                                <PencilIcon className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information - Compact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 lg:gap-2 text-xs lg:text-sm">
              <div className="flex items-center space-x-1 lg:space-x-2 text-gray-600">
                <EnvelopeIcon className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                <span className="truncate">{candidate.user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-1 lg:space-x-2 text-gray-600">
                <MapPinIcon className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                <span className="truncate">{candidate.currentLocation || 'N/A'}</span>
              </div>
            </div>

            {/* Skills - Compact */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="space-y-1 lg:space-y-2">
                <h4 className="text-xs lg:text-sm font-medium text-gray-700">Skills</h4>
                <div className="flex flex-wrap gap-1 lg:gap-1.5">
                  {candidate.skills.slice(0, 6).map((skill, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 lg:px-2 lg:py-1 bg-blue-50 text-blue-700 text-xs lg:text-sm rounded border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                  {candidate.skills.length > 6 && (
                    <span className="px-1.5 py-0.5 lg:px-2 lg:py-1 bg-gray-100 text-gray-600 text-xs lg:text-sm rounded">
                      +{candidate.skills.length - 6}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="border-t border-gray-100">
          {/* Mobile-First Design - Compact Actions */}
          <div className="block lg:hidden">
            <div className="p-3 space-y-3">
              {/* Top Row - Quick Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (candidate.user?.phone) {
                      window.open(`tel:${candidate.user.phone}`, '_self')
                    } else {
                      toast.error('Phone number not available')
                    }
                  }}
                  className="flex items-center justify-center p-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white shadow-sm active:scale-95 transition-all duration-150 flex-1"
                  title="Call candidate"
                >
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">Call</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleViewProfile}
                  className="flex items-center justify-center p-2.5 rounded-lg bg-gray-600 hover:bg-gray-700 text-white shadow-sm active:scale-95 transition-all duration-150 flex-1"
                  title="View profile"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">View</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (candidate.resumeUrl) {
                      const link = document.createElement('a')
                      link.href = candidate.resumeUrl
                      link.download = `${candidate.user?.name || 'candidate'}_resume.pdf`
                      link.target = '_blank'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    } else {
                      toast.error('Resume not available for download')
                    }
                  }}
                  disabled={!candidate.resumeUrl}
                  className={`flex items-center justify-center p-2.5 rounded-lg shadow-sm active:scale-95 transition-all duration-150 flex-1 ${
                    candidate.resumeUrl 
                      ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={candidate.resumeUrl ? "Download resume" : "Resume not available"}
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">Resume</span>
                </Button>
              </div>

              {/* Bottom Row - Status Actions */}
              {actionButtons.length > 0 && (
                <div className="grid grid-cols-2 gap-1">
                  {actionButtons.map((actionData, index) => {
                    const Icon = actionData.icon
                    const isLoading = loading[actionData.action] || internalLoading[actionData.action]
                    const currentStatus = getCurrentStatus()
                    const isCurrentStatus = actionData.action === currentStatus

                    return (
                      <Button
                        key={index}
                        onClick={() => handleActionClick(actionData)}
                        isLoading={isLoading}
                        disabled={isCurrentStatus}
                        className={`flex items-center justify-center p-2.5 rounded-lg text-white font-medium shadow-sm active:scale-95 transition-all duration-150 text-xs ${
                          isCurrentStatus
                            ? 'bg-gray-400 cursor-not-allowed opacity-60'
                            : actionData.color
                        }`}
                        title={isCurrentStatus ? `Already ${actionData.label}` : actionData.label}
                      >
                        <Icon className="h-3 w-3 mr-1.5" />
                        <span className="text-xs font-medium">{actionData.label}</span>
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Desktop View - Original Layout */}
          <div className="hidden lg:block px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Quick Actions */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (candidate.user?.phone) {
                      window.open(`tel:${candidate.user.phone}`, '_self')
                    } else {
                      toast.error('Phone number not available')
                    }
                  }}
                  className="flex-shrink-0 p-3 text-sm"
                  title="Call candidate"
                >
                  <PhoneIcon className="h-4 w-4 mr-1.5" />
                  <span>Call</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewProfile}
                  className="flex items-center gap-2"
                >
                  <EyeIcon className="h-4 w-4" />
                  View Profile
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (candidate.resumeUrl) {
                      const link = document.createElement('a')
                      link.href = candidate.resumeUrl
                      link.download = `${candidate.user?.name || 'candidate'}_resume.pdf`
                      link.target = '_blank'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    } else {
                      toast.error('Resume not available for download')
                    }
                  }}
                  disabled={!candidate.resumeUrl}
                  className={`flex items-center gap-2 ${
                    !candidate.resumeUrl ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={candidate.resumeUrl ? "Download resume" : "Resume not available"}
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  Download Resume
                </Button>
              </div>

              {/* Status Actions */}
              <div className="flex items-center space-x-2 flex-wrap">
                {actionButtons.slice(0, 3).map((actionData, index) => {
                  const Icon = actionData.icon
                  const isLoading = loading[actionData.action] || internalLoading[actionData.action]
                  const currentStatus = getCurrentStatus()
                  const isCurrentStatus = actionData.action === currentStatus

                  return (
                    <Button
                      key={index}
                      size="sm"
                      onClick={() => handleActionClick(actionData)}
                      isLoading={isLoading}
                      disabled={isCurrentStatus}
                      className={`flex-shrink-0 text-white text-sm px-3 py-2 ${
                        isCurrentStatus
                          ? 'bg-gray-400 cursor-not-allowed opacity-50'
                          : actionData.color
                      }`}
                      title={isCurrentStatus ? `Already ${actionData.label}` : actionData.label}
                    >
                      <Icon className="h-4 w-4 mr-1.5" />
                      <span className="text-sm">{actionData.label}</span>
                    </Button>
                  )
                })}

                {actionButtons.length > 3 && (
                  <div className="flex space-x-2">
                    {actionButtons.slice(3).map((actionData, index) => {
                      const Icon = actionData.icon
                      const isLoading = loading[actionData.action] || internalLoading[actionData.action]
                      const currentStatus = getCurrentStatus()
                      const isCurrentStatus = actionData.action === currentStatus

                      return (
                        <Button
                          key={index + 3}
                          size="sm"
                          onClick={() => handleActionClick(actionData)}
                          isLoading={isLoading}
                          disabled={isCurrentStatus}
                          className={`flex-shrink-0 text-white text-sm p-3 ${
                            isCurrentStatus
                              ? 'bg-gray-400 cursor-not-allowed opacity-50'
                              : actionData.color
                          }`}
                          title={isCurrentStatus ? `Already ${actionData.label}` : actionData.label}
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Modal for actions requiring explanation */}
      <Modal isOpen={showNotesModal} onClose={() => setShowNotesModal(false)}>
        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            {selectedAction?.label} Candidate
          </h3>
          <p className="text-gray-600 mb-4">
            Please provide a reason for this action:
          </p>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter reason..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
            rows={4}
            required
          />

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setShowNotesModal(false)
                setSelectedAction('')
                setNotes('')
              }}
              className="w-full sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={!notes.trim()}
              className="w-full sm:flex-1"
            >
              Confirm {selectedAction?.label}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default CandidateCard