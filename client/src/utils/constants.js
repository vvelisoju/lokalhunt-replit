// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile'
  },
  CANDIDATE: {
    PROFILE: '/candidate/profile',
    ADS: '/candidate/ads',
    APPLICATIONS: '/candidate/applications',
    BOOKMARKS: '/candidate/ads/bookmarks'
  },
  JOBS: {
    DISCOVER: '/candidate/ads/discover',
    DETAIL: (id) => `/candidate/ads/${id}`,
    APPLY: (id) => `/candidate/ads/${id}/apply`,
    BOOKMARK: (id) => `/candidate/ads/${id}/bookmark`
  }
}

// Application status mapping
export const APPLICATION_STATUS = {
  APPLIED: 'Applied',
  SCREENED: 'Under Review',
  ALLOCATED: 'Shortlisted',
  HIRED: 'Hired',
  REJECTED: 'Not Selected'
}

// Employment types
export const EMPLOYMENT_TYPES = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  REMOTE: 'Remote'
}

// Experience levels
export const EXPERIENCE_LEVELS = {
  ENTRY_LEVEL: 'Entry Level',
  MID_LEVEL: 'Mid Level',
  SENIOR_LEVEL: 'Senior Level',
  EXECUTIVE: 'Executive'
}

// User roles
export const USER_ROLES = {
  CANDIDATE: 'CANDIDATE',
  EMPLOYER: 'EMPLOYER',
  BRANCH_ADMIN: 'BRANCH_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
}

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50
}

// Form validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD_MIN_LENGTH: 6
}