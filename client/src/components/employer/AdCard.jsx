import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  MapPinIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  PencilIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-700 border border-gray-300',
  PENDING_APPROVAL: 'bg-amber-50 text-amber-700 border border-amber-200',
  APPROVED: 'bg-green-50 text-green-700 border border-green-200',
  ARCHIVED: 'bg-red-50 text-red-700 border border-red-200'
}

const statusIcons = {
  DRAFT: '📝',
  PENDING_APPROVAL: '⏳',
  APPROVED: '✅',
  ARCHIVED: '🗄️'
}

const AdCard = ({ ad, onSubmit, onArchive }) => {
  const navigate = useNavigate()

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not specified'
    if (!max) return `₹${min?.toLocaleString()}+ per month`
    return `₹${min?.toLocaleString()} - ₹${max?.toLocaleString()} per month`
  }

  const handleViewCandidates = () => {
    navigate(`/employer/candidates?adId=${ad.id}&adTitle=${encodeURIComponent(ad.title)}`)
  }

  const handleEdit = () => {
    navigate(`/employer/ads/${ad.id}/edit`)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-200 overflow-hidden">
      {/* Header with Status */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {ad.title}
            </h3>
            <p className="text-sm text-gray-600">{ad.company?.name}</p>
          </div>
          <div className="flex items-center space-x-3 ml-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusColors[ad.status]}`}>
              <span>{statusIcons[ad.status]}</span>
              <span>{ad.status.replace('_', ' ')}</span>
            </span>
            <button 
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Ad"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {ad.description}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{ad.location?.name || ad.city}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{ad.employmentType?.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 col-span-2">
            <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{formatSalary(ad.salaryMin, ad.salaryMax)}</span>
          </div>
        </div>

        {/* Candidates and Valid Until */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <button
            onClick={handleViewCandidates}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <UserGroupIcon className="h-4 w-4 mr-2" />
            {ad._count?.allocations || 0} Candidates
          </button>
          <div className="flex items-center text-xs text-gray-500">
            <ClockIcon className="h-3 w-3 mr-1" />
            Valid until {formatDate(ad.validUntil)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          {ad.status === 'DRAFT' && (
            <button
              onClick={() => onSubmit(ad.id)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit for Approval
            </button>
          )}
          {(ad.status === 'APPROVED' || ad.status === 'ARCHIVED') && (
            <button
              onClick={() => onArchive(ad.id)}
              className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
            >
              Archive
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdCard