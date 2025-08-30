
// Database enums mapping for frontend use
export const UserRole = {
  CANDIDATE: 'CANDIDATE',
  EMPLOYER: 'EMPLOYER',
  BRANCH_ADMIN: 'BRANCH_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
}

export const AdStatus = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  ARCHIVED: 'ARCHIVED'
}

export const AllocationStatus = {
  APPLIED: 'APPLIED',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED: 'INTERVIEW_COMPLETED',
  HIRED: 'HIRED',
  HOLD: 'HOLD',
  REJECTED: 'REJECTED'
}

export const FeeType = {
  FIXED: 'FIXED',
  PERCENTAGE: 'PERCENTAGE'
}

export const EmploymentType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERNSHIP: 'INTERNSHIP',
  FREELANCE: 'FREELANCE'
}

export const ExperienceLevel = {
  ENTRY_LEVEL: 'ENTRY_LEVEL',
  MID_LEVEL: 'MID_LEVEL',
  SENIOR_LEVEL: 'SENIOR_LEVEL',
  EXECUTIVE: 'EXECUTIVE'
}

export const CurrentEmploymentStatus = {
  LOOKING_FOR_JOB: 'LOOKING_FOR_JOB',
  OPEN_TO_OPPORTUNITIES: 'OPEN_TO_OPPORTUNITIES',
  CURRENTLY_WORKING: 'CURRENTLY_WORKING',
  STUDENT_RECENT_GRADUATE: 'STUDENT_RECENT_GRADUATE'
}

export const ShiftPreference = {
  DAY_SHIFT: 'DAY_SHIFT',
  NIGHT_SHIFT: 'NIGHT_SHIFT',
  FLEXIBLE_HOURS: 'FLEXIBLE_HOURS',
  WEEKEND_ONLY: 'WEEKEND_ONLY'
}

export const Availability = {
  IMMEDIATELY: 'IMMEDIATELY',
  WITHIN_1_WEEK: 'WITHIN_1_WEEK',
  WITHIN_1_MONTH: 'WITHIN_1_MONTH',
  AFTER_2_MONTHS: 'AFTER_2_MONTHS'
}

export const Language = {
  ENGLISH: 'ENGLISH',
  HINDI: 'HINDI',
  TELUGU: 'TELUGU',
  TAMIL: 'TAMIL',
  KANNADA: 'KANNADA',
  MALAYALAM: 'MALAYALAM',
  BENGALI: 'BENGALI',
  MARATHI: 'MARATHI',
  GUJARATI: 'GUJARATI',
  PUNJABI: 'PUNJABI',
  URDU: 'URDU',
  ODIA: 'ODIA'
}

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  PAST_DUE: 'PAST_DUE',
  PENDING_APPROVAL: 'PENDING_APPROVAL'
}

export const EmailTemplateType = {
  OTP_VERIFICATION: 'OTP_VERIFICATION',
  JOB_APPLIED: 'JOB_APPLIED',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  JOB_REJECTED: 'JOB_REJECTED',
  WELCOME: 'WELCOME',
  PASSWORD_RESET: 'PASSWORD_RESET',
  PROFILE_APPROVED: 'PROFILE_APPROVED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  TEST: 'TEST',
  PASSWORD_RESET_OTP: 'PASSWORD_RESET_OTP'
}

// Human-readable labels for enums
export const ExperienceLevelLabels = {
  [ExperienceLevel.ENTRY_LEVEL]: 'Entry Level (0-2 years)',
  [ExperienceLevel.MID_LEVEL]: 'Mid Level (3-5 years)',
  [ExperienceLevel.SENIOR_LEVEL]: 'Senior Level (6-10 years)',
  [ExperienceLevel.EXECUTIVE]: 'Executive (10+ years)'
}

export const EmploymentTypeLabels = {
  [EmploymentType.FULL_TIME]: 'Full Time',
  [EmploymentType.PART_TIME]: 'Part Time',
  [EmploymentType.CONTRACT]: 'Contract',
  [EmploymentType.INTERNSHIP]: 'Internship',
  [EmploymentType.FREELANCE]: 'Freelance'
}

export const ShiftPreferenceLabels = {
  [ShiftPreference.DAY_SHIFT]: 'Day Shift',
  [ShiftPreference.NIGHT_SHIFT]: 'Night Shift',
  [ShiftPreference.FLEXIBLE_HOURS]: 'Flexible Hours',
  [ShiftPreference.WEEKEND_ONLY]: 'Weekend Only'
}

export const AvailabilityLabels = {
  [Availability.IMMEDIATELY]: 'Immediately',
  [Availability.WITHIN_1_WEEK]: 'Within 1 Week',
  [Availability.WITHIN_1_MONTH]: 'Within 1 Month',
  [Availability.AFTER_2_MONTHS]: 'After 2 Months'
}

export const LanguageLabels = {
  [Language.ENGLISH]: 'English',
  [Language.HINDI]: 'Hindi',
  [Language.TELUGU]: 'Telugu',
  [Language.TAMIL]: 'Tamil',
  [Language.KANNADA]: 'Kannada',
  [Language.MALAYALAM]: 'Malayalam',
  [Language.BENGALI]: 'Bengali',
  [Language.MARATHI]: 'Marathi',
  [Language.GUJARATI]: 'Gujarati',
  [Language.PUNJABI]: 'Punjabi',
  [Language.URDU]: 'Urdu',
  [Language.ODIA]: 'Odia'
}

export const AllocationStatusLabels = {
  [AllocationStatus.APPLIED]: 'Applied',
  [AllocationStatus.SHORTLISTED]: 'Shortlisted',
  [AllocationStatus.INTERVIEW_SCHEDULED]: 'Interview Scheduled',
  [AllocationStatus.INTERVIEW_COMPLETED]: 'Interview Completed',
  [AllocationStatus.HIRED]: 'Hired',
  [AllocationStatus.HOLD]: 'On Hold',
  [AllocationStatus.REJECTED]: 'Rejected'
}

export const CurrentEmploymentStatusLabels = {
  [CurrentEmploymentStatus.LOOKING_FOR_JOB]: 'Looking for Job',
  [CurrentEmploymentStatus.OPEN_TO_OPPORTUNITIES]: 'Open to Opportunities',
  [CurrentEmploymentStatus.CURRENTLY_WORKING]: 'Currently Working',
  [CurrentEmploymentStatus.STUDENT_RECENT_GRADUATE]: 'Student/Recent Graduate'
}

// Helper functions
export const getExperienceLevelOptions = () => {
  return Object.values(ExperienceLevel).map(value => ({
    value,
    label: ExperienceLevelLabels[value]
  }))
}

export const getEmploymentTypeOptions = () => {
  return Object.values(EmploymentType).map(value => ({
    value,
    label: EmploymentTypeLabels[value]
  }))
}

export const getShiftPreferenceOptions = () => {
  return Object.values(ShiftPreference).map(value => ({
    value,
    label: ShiftPreferenceLabels[value]
  }))
}

export const getAvailabilityOptions = () => {
  return Object.values(Availability).map(value => ({
    value,
    label: AvailabilityLabels[value]
  }))
}

export const getLanguageOptions = () => {
  return Object.values(Language).map(value => ({
    value,
    label: LanguageLabels[value]
  }))
}
