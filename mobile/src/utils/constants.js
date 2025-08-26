// Constants for mobile app
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh'
  },
  
  // Public endpoints
  PUBLIC: {
    STATS: '/public/stats',
    CATEGORIES: '/public/categories',
    CITIES: '/public/cities',
    EDUCATION_QUALIFICATIONS: '/public/education-qualifications',
    JOBS_FEATURED: '/public/jobs/featured',
    JOBS_SEARCH: '/public/jobs/search',
    JOB_BY_ID: '/public/jobs',
    TESTIMONIALS: '/public/testimonials',
    COMPANIES: '/public/companies'
  },
  
  // Candidate endpoints
  CANDIDATE: {
    PROFILE: '/candidates/profile',
    DASHBOARD: '/candidates/dashboard',
    BOOKMARKS: '/candidates/bookmarks',
    APPLICATIONS: '/candidates/applications',
    APPLY: '/candidates/apply'
  },
  
  // Employer endpoints
  EMPLOYER: {
    PROFILE: '/employers/profile',
    DASHBOARD: '/employers/dashboard',
    ADS: '/employers/ads',
    APPLICANTS: '/employers/applicants',
    COMPANY: '/employers/company'
  }
}

export const USER_ROLES = {
  CANDIDATE: 'CANDIDATE',
  EMPLOYER: 'EMPLOYER',
  BRANCH_ADMIN: 'BRANCH_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
}

export const JOB_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED'
}

export const APPLICATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship',
  'Temporary'
]

export const EXPERIENCE_LEVELS = [
  'Entry Level',
  'Mid Level',
  'Senior Level',
  'Executive Level'
]

export const COLORS = {
  primary: '#3B82F6', // Blue
  secondary: '#F97316', // Orange
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
}