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
  PauseIcon
} from '@heroicons/react/24/outline'
import Button from './Button'
import Modal from './Modal'
import { toast } from 'react-hot-toast'

const CandidateCard = ({ 
  candidate, 
  onStatusUpdate, 
  onViewProfile,
  loading = {},
  className = '' 
}) => {
  const navigate = useNavigate()
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [selectedAction, setSelectedAction] = useState('')
  const [notes, setNotes] = useState('')
  const [internalLoading, setInternalLoading] = useState({})

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Applied':
      case 'APPLIED':
      case 'ALLOCATED':
        return 'bg-blue-100 text-blue-800'
      case 'Shortlisted':
      case 'SHORTLISTED':
        return 'bg-yellow-100 text-yellow-800'
      case 'InterviewScheduled':
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW':
        return 'bg-purple-100 text-purple-800'
      case 'InterviewCompleted':
      case 'INTERVIEW_COMPLETED':
        return 'bg-indigo-100 text-indigo-800'
      case 'Hired':
      case 'HIRED':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'Hold':
      case 'HOLD':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCurrentStatus = () => {
    // Get the most recent allocation status
    if (candidate.allocations && candidate.allocations.length > 0) {
      const latestAllocation = candidate.allocations[0]
      return latestAllocation.status
    }
    return 'ALLOCATED'
  }

  const getActionButtons = (status) => {
    switch (status) {
      case 'Applied':
      case 'APPLIED':
      case 'ALLOCATED':
        return [
          { 
            label: 'Shortlist', 
            action: 'SHORTLISTED', 
            variant: 'primary',
            icon: CheckIcon,
            color: 'bg-green-600 hover:bg-green-700'
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

      case 'Shortlisted':
      case 'SHORTLISTED':
        return [
          { 
            label: 'Interview Scheduled', 
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

      case 'InterviewScheduled':
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW':
        return [
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

      case 'Hold':
      case 'HOLD':
        return [
          { 
            label: 'Hired', 
            action: 'HIRED', 
            variant: 'primary',
            icon: CheckIcon,
            color: 'bg-green-600 hover:bg-green-700'
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

      case 'Hired':
      case 'HIRED':
      case 'Rejected':
      case 'REJECTED':
        // No actions available for final states
        return []

      default:
        return []
    }
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

    const allocation = candidate.allocations[0] // Use the first allocation
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

  const handleConfirmAction = () => {
    if (selectedAction.requiresNotes && !notes.trim()) {
      toast.error('Please provide a reason')
      return
    }
    handleStatusUpdate(selectedAction.action, notes)
  }

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(candidate)
    } else {
      // Navigate to candidate profile page
      navigate(`/candidate/${candidate.user?.id}/profile`)
    }
  }

  const currentStatus = getCurrentStatus()
  const actionButtons = getActionButtons(currentStatus)

  return (
    <>
      <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-300 ${className}`}>
        <div className="p-6">
          {/* Candidate Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <img
                className="h-16 w-16 rounded-full object-cover border-2 border-gray-100"
                src={candidate.user?.profileImage || `https://ui-avatars.com/api/?name=${candidate.user?.name}&background=1976d2&color=fff`}
                alt={candidate.user?.name || 'Candidate'}
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {candidate.user?.name || 'Unknown'}
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                  {candidate.currentJobTitle || 'No job title'}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  {candidate.user?.phone && (
                    <div className="flex items-center space-x-1">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{candidate.user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <BriefcaseIcon className="h-4 w-4" />
                    <span>{candidate.experience || 0} years exp</span>
                  </div>
                  {(candidate.profile_data?.gender || candidate.gender) && (
                    <div className="flex items-center space-x-1">
                      <UserIcon className="h-4 w-4" />
                      <span className="capitalize">{(candidate.profile_data?.gender || candidate.gender).toLowerCase()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(currentStatus)}`}>
              {currentStatus.replace('_', ' ').replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </div>

          {/* Contact & Location */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium w-20">Email:</span>
              <span className="text-gray-900">{candidate.user?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium w-20">Location:</span>
              <div className="flex items-center space-x-1">
                <MapPinIcon className="h-4 w-4" />
                <span className="text-gray-900">{candidate.currentLocation || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1">
                {candidate.skills.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                  >
                    {skill}
                  </span>
                ))}
                {candidate.skills.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                    +{candidate.skills.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* View Profile - Always Available */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleViewProfile}
              className="flex-shrink-0"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              View Profile
            </Button>

            {/* Status-Based Actions */}
            {actionButtons.map((actionData, index) => {
              const Icon = actionData.icon
              const isLoading = loading[actionData.action] || internalLoading[actionData.action]
              return (
                <Button
                  key={index}
                  size="sm"
                  onClick={() => handleActionClick(actionData)}
                  isLoading={isLoading}
                  className={`flex-shrink-0 text-white ${actionData.color}`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {actionData.label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Notes Modal for actions requiring explanation */}
      <Modal isOpen={showNotesModal} onClose={() => setShowNotesModal(false)}>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {selectedAction?.label} Candidate
          </h3>
          <p className="text-gray-600 mb-4">
            Please provide a reason for this action:
          </p>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter reason..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
            required
          />

          <div className="flex space-x-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setShowNotesModal(false)
                setSelectedAction('')
                setNotes('')
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={!notes.trim()}
              className="flex-1"
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