import React from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  className = '',
  showIcon = true
}) => {
  const typeStyles = {
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-400',
      title: 'text-green-800',
      message: 'text-green-700',
      IconComponent: CheckCircleIcon
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-400',
      title: 'text-red-800',
      message: 'text-red-700',
      IconComponent: XCircleIcon
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      IconComponent: ExclamationTriangleIcon
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-400',
      title: 'text-blue-800',
      message: 'text-blue-700',
      IconComponent: InformationCircleIcon
    }
  }

  const styles = typeStyles[type]
  const IconComponent = styles.IconComponent

  return (
    <div className={`rounded-md border p-4 ${styles.container} ${className}`}>
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 ${styles.icon}`} />
          </div>
        )}
        <div className={showIcon ? 'ml-3' : ''}>
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {title}
            </h3>
          )}
          {message && (
            <div className={`${title ? 'mt-2' : ''} text-sm ${styles.message}`}>
              {message}
            </div>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-white ${styles.icon} focus:ring-offset-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-50 focus:ring-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-600`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Alert