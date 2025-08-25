// Format currency
export const formatCurrency = (amount, currency = 'INR') => {
  if (!amount) return 'Not disclosed'

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })

  if (amount >= 100000) {
    return `${formatter.format(amount / 100000)} Lakhs`
  }

  return formatter.format(amount)
}

// Format salary range
export const formatSalaryRange = (salaryRange) => {
  if (!salaryRange || !salaryRange.min || !salaryRange.max) {
    return 'Salary not disclosed'
  }

  const { min, max, currency } = salaryRange
  const minFormatted = formatCurrency(min, currency)
  const maxFormatted = formatCurrency(max, currency)

  return `${minFormatted} - ${maxFormatted}`
}

// Format date relative to now
export const formatRelativeDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
  return `${Math.ceil(diffDays / 365)} years ago`
}

// Format date for display
export const formatDate = (dateString, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  return new Date(dateString).toLocaleDateString('en-US', {
    ...defaultOptions,
    ...options
  })
}

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Capitalize first letter
export const capitalize = (string) => {
  if (!string) return ''
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

// Get initials from name
export const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  // Simple formatting for Indian numbers
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`
  }
  return phone
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
    }
  }
}

// Icon helper function
export const trendingJobsIcon = () => {
  return '📈'; // Simple emoji icon for trending jobs
};

// Export all utility functions
export {
  formatDate,
  formatSalary,
  formatTimeAgo,
  truncateText,
  getInitials,
  formatExperience,
  formatJobType,
  formatEducationLevel,
  getStatusColor,
  getStatusIcon,
  getPriorityColor,
  getPriorityIcon,
  validateEmail,
  validatePassword,
  formatFileSize,
  generateSlug,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  isEmptyObject,
  removeEmptyFields,
  capitalizeFirstLetter,
  parseJWT,
  isTokenExpired,
  getTimeRemaining,
  trendingJobsIcon
}