
import React from 'react'

const AllocationStatusBadge = ({ status, size = 'md', className = '' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      APPLIED: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        label: 'Applied',
        icon: '📝'
      },
      SHORTLISTED: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Shortlisted',
        icon: '⭐'
      },
      INTERVIEW_SCHEDULED: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        label: 'Interview Scheduled',
        icon: '📅'
      },
      INTERVIEW_COMPLETED: {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        label: 'Interview Completed',
        icon: '✅'
      },
      HIRED: {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Hired',
        icon: '🎉'
      },
      HOLD: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        label: 'Hold',
        icon: '⏸️'
      },
      REJECTED: {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Rejected',
        icon: '❌'
      }
    }
    
    return configs[status] || {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      label: status || 'Unknown',
      icon: '❓'
    }
  }

  const getSizeClasses = (size) => {
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base'
    }
    return sizes[size] || sizes.md
  }

  const config = getStatusConfig(status)
  const sizeClasses = getSizeClasses(size)

  return (
    <span 
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${config.color} ${sizeClasses} ${className}
      `}
      title={config.label}
    >
      <span className="text-xs">{config.icon}</span>
      {config.label}
    </span>
  )
}

export default AllocationStatusBadge
