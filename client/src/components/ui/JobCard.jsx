import React from 'react'
import { Link } from 'react-router-dom'
import Button from './Button'
import { 
  MapPinIcon,
  BriefcaseIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  BookmarkIcon as BookmarkOutlineIcon,
  HeartIcon as HeartOutlineIcon
} from '@heroicons/react/24/outline'
import { 
  BookmarkIcon as BookmarkSolidIcon,
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid'

const JobCard = ({ 
  job, 
  variant = 'default', // 'default', 'application', 'bookmark'
  onApply, 
  onBookmark, 
  onWithdraw,
  onRemoveBookmark,
  className = '',
  showApplicationDate = false,
  showBookmarkDate = false,
  applicationStatus = null,
  applicationDate = null,
  bookmarkDate = null,
  loading = {}
}) => {
  // Helper function to get time ago string
  const getTimeAgo = (date) => {
    if (!date) return ''
    const now = new Date()
    const targetDate = new Date(date)
    const diffInHours = Math.floor((now - targetDate) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`
    
    return targetDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    if (!status) return null
    
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (status?.toLowerCase()) {
      case 'applied':
      case 'pending':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Applied
          </span>
        )
      case 'screened':
      case 'reviewed':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            Under Review
          </span>
        )
      case 'rated':
      case 'interview':
        return (
          <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
            Interview
          </span>
        )
      case 'allocated':
      case 'shortlisted':
      case 'approved':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Shortlisted
          </span>
        )
      case 'hired':
        return (
          <span className={`${baseClasses} bg-emerald-100 text-emerald-800`}>
            Hired
          </span>
        )
      case 'rejected':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            Rejected
          </span>
        )
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            Applied
          </span>
        )
    }
  }

  // Render actions based on variant
  const renderActions = () => {
    const actions = []

    switch (variant) {
      case 'application':
        // Applied Jobs page actions
        actions.push(
          <Link key="view" to={`/jobs/${job.id}?from=applications`}>
            <Button variant="outline" size="sm">
              View Job
            </Button>
          </Link>
        )
        if (applicationStatus === 'APPLIED') {
          actions.push(
            <Button 
              key="withdraw"
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:text-red-700"
              onClick={() => onWithdraw?.(job.id)}
              disabled={loading.withdraw}
            >
              {loading.withdraw ? 'Withdrawing...' : 'Withdraw'}
            </Button>
          )
        }
        break

      case 'bookmark':
        // Bookmarks page actions
        actions.push(
          <Link key="view" to={`/jobs/${job.id}?from=bookmarks`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
        )
        if (!job.hasApplied) {
          actions.push(
            <Button
              key="apply"
              size="sm"
              onClick={() => onApply?.(job.id)}
              disabled={loading.apply}
            >
              {loading.apply ? 'Applying...' : 'Apply Now'}
            </Button>
          )
        } else {
          actions.push(
            <Button
              key="applied"
              size="sm"
              variant="outline"
              disabled
            >
              Applied
            </Button>
          )
        }
        
        // Remove bookmark button
        actions.push(
          <Button
            key="remove-bookmark"
            variant="ghost"
            size="sm"
            onClick={() => onRemoveBookmark?.(job.id)}
            disabled={loading.bookmark}
            className="text-red-600 hover:text-red-700"
          >
            {loading.bookmark ? 'Removing...' : 'Remove'}
          </Button>
        )
        break

      case 'default':
      default:
        // Jobs page actions
        // View Job button
        actions.push(
          <Link key="view" to={`/jobs/${job.id}`}>
            <Button variant="outline" size="sm">
              View Job
            </Button>
          </Link>
        )
        
        if (!job.hasApplied) {
          actions.push(
            <Button
              key="apply"
              size="sm"
              onClick={() => onApply?.(job.id)}
              disabled={loading.apply}
            >
              {loading.apply ? 'Applying...' : 'Apply Now'}
            </Button>
          )
        } else {
          actions.push(
            <Button
              key="applied"
              size="sm"
              variant="outline"
              disabled
            >
              Applied
            </Button>
          )
        }
        
        actions.push(
          <Button
            key="bookmark"
            variant="ghost"
            size="sm"
            onClick={() => onBookmark?.(job.id)}
            disabled={loading.bookmark}
            className="text-gray-600 hover:text-blue-600"
          >
            {job.isBookmarked ? (
              <BookmarkSolidIcon className="h-5 w-5" />
            ) : (
              <BookmarkOutlineIcon className="h-5 w-5" />
            )}
          </Button>
        )
        break
    }

    return actions
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {typeof job.title === 'string' ? job.title : 'Job Title'}
            </h3>
            <p className="text-gray-600 text-sm font-medium">
              {job.company?.name || job.companyName || 'Company Name'}
            </p>
            {job.company?.industry && (
              <p className="text-gray-500 text-xs mt-0.5">
                {job.company.industry}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-1.5">
            {applicationStatus && getStatusBadge(applicationStatus)}
            {variant === 'bookmark' && onRemoveBookmark && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveBookmark(job.id)}
                className="text-red-600 hover:text-red-700 p-1"
                disabled={loading.bookmark}
              >
                <HeartSolidIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <MapPinIcon className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            <span className="truncate">
              {typeof job.location === 'string' 
                ? job.location 
                : job.locationName 
                  ? `${job.locationName}, ${job.locationState || ''}`.trim().replace(/,$/, '')
                  : job.location?.name 
                    ? `${job.location.name}, ${job.location.state || ''}`.trim().replace(/,$/, '')
                    : 'Location not specified'
              }
            </span>
          </div>
          <div className="flex items-center">
            <BriefcaseIcon className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            <span>{job.jobType || job.employmentType || 'Full Time'}</span>
          </div>
          {(job.salary || job.salaryRange) && (
            <div className="flex items-center">
              <CurrencyRupeeIcon className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
              <span className="font-medium text-green-600">
                {typeof job.salary === 'string' 
                  ? job.salary
                  : job.salary && typeof job.salary === 'object'
                    ? (job.salary.min && job.salary.max 
                        ? `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}`
                        : job.salary.min 
                          ? `₹${job.salary.min.toLocaleString()}+`
                          : 'Salary not disclosed')
                    : job.salaryRange?.min && job.salaryRange?.max 
                      ? `₹${job.salaryRange.min.toLocaleString()} - ₹${job.salaryRange.max.toLocaleString()}`
                      : 'Salary not disclosed'}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {job.description && typeof job.description === 'string' && (
          <p className="text-gray-700 text-sm line-clamp-2 mb-3">
            {job.description}
          </p>
        )}

        {/* Skills */}
        {Array.isArray(job.skills) && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {job.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
              >
                {typeof skill === 'string' ? skill : String(skill)}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 flex-1 min-w-0">
            {showApplicationDate && applicationDate ? (
              <div className="flex flex-col">
                <span>Applied {getTimeAgo(applicationDate)}</span>
                {(job.candidatesCount !== undefined || job.applicationCount !== undefined) && (
                  <span className="text-blue-600 font-medium">
                    {job.candidatesCount || job.applicationCount || 0} {(job.candidatesCount || job.applicationCount) === 1 ? 'applicant' : 'applicants'}
                  </span>
                )}
              </div>
            ) : showBookmarkDate && bookmarkDate ? (
              <div className="flex flex-col">
                <span>Saved {getTimeAgo(bookmarkDate)}</span>
                {(job.candidatesCount !== undefined || job.applicationCount !== undefined) && (
                  <span className="text-blue-600 font-medium">
                    {job.candidatesCount || job.applicationCount || 0} {(job.candidatesCount || job.applicationCount) === 1 ? 'applicant' : 'applicants'}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col">
                <span>Posted {getTimeAgo(job.postedAt || job.createdAt)}</span>
                {(job.candidatesCount !== undefined || job.applicationCount !== undefined) && (
                  <span className="text-blue-600 font-medium">
                    {job.candidatesCount || job.applicationCount || 0} {(job.candidatesCount || job.applicationCount) === 1 ? 'applicant' : 'applicants'}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex space-x-1.5 ml-3">
            {renderActions()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobCard