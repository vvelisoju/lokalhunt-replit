
import React, { useState, useEffect } from 'react'
import Button from '../ui/Button'
import { getCities } from '../../services/common/cities'

const EditPreferencesModal = ({ isOpen, onClose, preferences, onSave }) => {
  const [formData, setFormData] = useState({
    // From Step 1 - Basic Info
    currentEmploymentStatus: '',
    
    // From Step 2 - Job Preferences
    jobTypes: [],
    preferredRoles: [],
    industry: [],
    preferredLocations: [],
    shiftPreference: '',
    
    // From Step 3 - Skills & Experience
    experienceLevel: '',
    salaryRange: { min: '', max: '' },
    
    // From Step 4 - Final Setup
    availability: '',
    languages: [],
    workType: '',
    noticePeriod: '',
    travelWillingness: false
  })
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    roles: false,
    industry: false,
    locations: false,
    languages: false
  })

  useEffect(() => {
    if (isOpen && preferences) {
      console.log('EditPreferencesModal received preferences:', preferences)
      
      // Handle preferred locations - could be array of strings or array of objects
      let processedLocations = []
      if (preferences.preferredLocations) {
        processedLocations = preferences.preferredLocations.map(location => {
          if (typeof location === 'string') {
            return location
          } else if (location && location.name) {
            return location.name
          }
          return location
        }).filter(Boolean)
      }

      // Get experience level from multiple possible sources
      const experienceLevel = preferences.experienceLevel || 
                             preferences.jobPreferences?.experienceLevel || 
                             preferences.skillsExperience?.experienceLevel || 
                             ''

      // Get availability from multiple possible sources
      const availability = preferences.availabilityStatus ||
                          preferences.availability || 
                          preferences.availabilityDate || 
                          preferences.skillsExperience?.availabilityDate || 
                          preferences.jobPreferences?.availability || 
                          ''

      console.log('Mapped experience level:', experienceLevel)
      console.log('Mapped availability:', availability)
      
      setFormData({
        // Basic Info
        currentEmploymentStatus: preferences.currentEmploymentStatus || '',
        
        // Job Preferences
        jobTypes: preferences.jobTypes || [],
        preferredRoles: preferences.preferredRoles || preferences.jobTitles || [],
        industry: preferences.industry || [],
        preferredLocations: processedLocations,
        shiftPreference: preferences.shiftPreference || '',
        
        // Skills & Experience - ensure these are properly mapped
        experienceLevel: experienceLevel,
        salaryRange: preferences.salaryRange || { min: '', max: '' },
        
        // Final Setup - handle multiple availability field sources
        availability: availability,
        languages: preferences.languages || [],
        workType: preferences.workType || preferences.remoteWorkPreference || '',
        noticePeriod: preferences.noticePeriod || '',
        travelWillingness: preferences.travelWillingness || false
      })
    }
  }, [isOpen, preferences])

  useEffect(() => {
    if (isOpen) {
      loadCities()
    }
  }, [isOpen])

  const loadCities = async () => {
    setLoadingCities(true)
    try {
      const result = await getCities()
      if (result.success) {
        setCities(result.data.map(city => ({
          id: city.id,
          name: `${city.name}, ${city.state}`
        })))
      }
    } catch (error) {
      console.error('Error loading cities:', error)
    } finally {
      setLoadingCities(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Ensure experience level and availability are included in the saved data
      const dataToSave = {
        ...formData,
        // Make sure these critical fields are explicitly included
        experienceLevel: formData.experienceLevel,
        availability: formData.availability,
        // Map availability to both fields for backend compatibility
        availabilityStatus: formData.availability,
        availabilityDate: formData.availability,
      }
      
      console.log('Saving preferences data:', dataToSave)
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }

  const handleClose = () => {
    // Reset form data when closing
    setFormData({
      currentEmploymentStatus: '',
      jobTypes: [],
      preferredRoles: [],
      industry: [],
      preferredLocations: [],
      shiftPreference: '',
      experienceLevel: '',
      salaryRange: { min: '', max: '' },
      availability: '',
      languages: [],
      workType: '',
      noticePeriod: '',
      travelWillingness: false
    })
    setExpandedSections({
      roles: false,
      industry: false,
      locations: false,
      languages: false
    })
    onClose()
  }

  const handleArrayFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (!isOpen) return null

  const jobTypeOptions = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP']
  const workTypeOptions = ['REMOTE', 'ONSITE', 'HYBRID', 'FLEXIBLE']
  const employmentStatusOptions = [
    'LOOKING_FOR_JOB', 
    'OPEN_TO_OPPORTUNITIES', 
    'CURRENTLY_WORKING', 
    'STUDENT_RECENT_GRADUATE'
  ]
  const experienceLevelOptions = ['ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'EXECUTIVE']
  const shiftPreferenceOptions = ['DAY_SHIFT', 'NIGHT_SHIFT', 'FLEXIBLE_HOURS', 'WEEKEND_ONLY']
  const availabilityOptions = ['IMMEDIATELY', 'WITHIN_1_WEEK', 'WITHIN_1_MONTH', 'AFTER_2_MONTHS']
  const languageOptions = [
    'ENGLISH', 'HINDI', 'TELUGU', 'TAMIL', 'KANNADA', 'MALAYALAM', 
    'BENGALI', 'MARATHI', 'GUJARATI', 'PUNJABI', 'URDU', 'ODIA'
  ]

  // Common job roles for local jobs
  const commonJobRoles = [
    'Delivery Driver', 'Sales Executive', 'Customer Service Representative',
    'Security Guard', 'Housekeeping', 'Cook', 'Waiter', 'Cashier',
    'Data Entry Clerk', 'Office Assistant', 'Receptionist', 'Telecaller',
    'Field Sales Executive', 'Store Manager', 'Supervisor'
  ]

  const commonIndustries = [
    'Administrative & Clerk Roles', 'Banking & Office Staff', 'Cook / Chef / Kitchen Staff',
    'Delivery & Courier', 'Driver', 'Electrician / Plumber / Technician',
    'Garments & Textile Worker', 'Housekeeping & Cleaning', 'IT & Computer Operator',
    'Labour / Construction Worker', 'Marketing & Sales Executive', 'Mechanic / Vehicle Repair',
    'Medical & Healthcare Support', 'Security Guard', 'Shop Salesman / Retail Staff',
    'Teacher / Trainer / Tutor', 'Telecalling / BPO Support', 'Waiter / Hotel Staff'
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-black bg-opacity-50 overflow-y-auto modal">
      <div className="relative bg-white rounded-lg w-full max-w-2xl mx-auto my-4 sm:my-8">
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-lg px-4 sm:px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Job Preferences</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="px-4 sm:px-6 py-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Current Employment Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Current Employment Status
              </label>
              <select
                value={formData.currentEmploymentStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, currentEmploymentStatus: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select employment status</option>
                {employmentStatusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Types */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Job Types
              </label>
              <div className="grid grid-cols-2 gap-2">
                {jobTypeOptions.map(type => (
                  <label key={type} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.jobTypes.includes(type)}
                      onChange={() => handleArrayFieldChange('jobTypes', type)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">
                      {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preferred Job Roles - Collapsible */}
            <div className="space-y-2">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('roles')}
              >
                <label className="text-sm font-medium text-gray-700">
                  Preferred Job Roles ({formData.preferredRoles.length} selected)
                </label>
                <span className="text-gray-500 text-sm">
                  {expandedSections.roles ? '▼' : '▶'}
                </span>
              </div>
              {expandedSections.roles && (
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                  {commonJobRoles.map(role => (
                    <label key={role} className="flex items-center space-x-2 mb-1 text-xs">
                      <input
                        type="checkbox"
                        checked={formData.preferredRoles.includes(role)}
                        onChange={() => handleArrayFieldChange('preferredRoles', role)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
              )}
              {formData.preferredRoles.length > 0 && (
                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  <strong>Selected:</strong> {formData.preferredRoles.slice(0, 3).join(', ')}
                  {formData.preferredRoles.length > 3 && ` +${formData.preferredRoles.length - 3} more`}
                </div>
              )}
            </div>

            {/* Industry Preferences - Collapsible */}
            <div className="space-y-2">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('industry')}
              >
                <label className="text-sm font-medium text-gray-700">
                  Industry Preferences ({formData.industry.length} selected)
                </label>
                <span className="text-gray-500 text-sm">
                  {expandedSections.industry ? '▼' : '▶'}
                </span>
              </div>
              {expandedSections.industry && (
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                  {commonIndustries.map(industry => (
                    <label key={industry} className="flex items-center space-x-2 mb-1 text-xs">
                      <input
                        type="checkbox"
                        checked={formData.industry.includes(industry)}
                        onChange={() => handleArrayFieldChange('industry', industry)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{industry}</span>
                    </label>
                  ))}
                </div>
              )}
              {formData.industry.length > 0 && (
                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  <strong>Selected:</strong> {formData.industry.slice(0, 2).join(', ')}
                  {formData.industry.length > 2 && ` +${formData.industry.length - 2} more`}
                </div>
              )}
            </div>

            {/* Work Type & Shift Preference - Side by side on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Work Type
                </label>
                <div className="space-y-1">
                  {workTypeOptions.map(type => (
                    <label key={type} className="flex items-center space-x-2 text-sm">
                      <input
                        type="radio"
                        name="workType"
                        value={type}
                        checked={formData.workType === type}
                        onChange={(e) => setFormData(prev => ({ ...prev, workType: e.target.value }))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">
                        {type.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Shift Preference
                </label>
                <select
                  value={formData.shiftPreference}
                  onChange={(e) => setFormData(prev => ({ ...prev, shiftPreference: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select shift</option>
                  {shiftPreferenceOptions.map(shift => (
                    <option key={shift} value={shift}>
                      {shift.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Experience Level & Availability - Side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Experience Level
                  {formData.experienceLevel && (
                    <span className="ml-2 text-xs text-green-600">✓ Selected</span>
                  )}
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select level</option>
                  {experienceLevelOptions.map(level => (
                    <option key={level} value={level}>
                      {level.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Availability
                  {formData.availability && (
                    <span className="ml-2 text-xs text-green-600">✓ Selected</span>
                  )}
                </label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select availability</option>
                  {availabilityOptions.map(availability => (
                    <option key={availability} value={availability}>
                      {availability.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preferred Locations - Collapsible */}
            <div className="space-y-2">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('locations')}
              >
                <label className="text-sm font-medium text-gray-700">
                  Preferred Locations ({formData.preferredLocations.length} selected)
                </label>
                <span className="text-gray-500 text-sm">
                  {expandedSections.locations ? '▼' : '▶'}
                </span>
              </div>
              {expandedSections.locations && (
                <>
                  {loadingCities ? (
                    <div className="text-sm text-gray-500 p-2">Loading cities...</div>
                  ) : (
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                      {cities.map(city => {
                        const isSelected = formData.preferredLocations.some(location => 
                          location === city.name || 
                          location.includes(city.name.split(',')[0]) // Handle partial matches
                        )
                        
                        return (
                          <label key={city.id} className="flex items-center space-x-2 mb-1 text-xs">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleArrayFieldChange('preferredLocations', city.name)}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">{city.name}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
              {formData.preferredLocations.length > 0 && (
                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  <strong>Selected:</strong> {formData.preferredLocations.slice(0, 3).join(', ')}
                  {formData.preferredLocations.length > 3 && ` +${formData.preferredLocations.length - 3} more`}
                </div>
              )}
            </div>

            {/* Salary Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Expected Salary Range (per month)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min (₹)"
                  value={formData.salaryRange.min}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    salaryRange: { ...prev.salaryRange, min: e.target.value }
                  }))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max (₹)"
                  value={formData.salaryRange.max}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    salaryRange: { ...prev.salaryRange, max: e.target.value }
                  }))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Languages - Collapsible */}
            <div className="space-y-2">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('languages')}
              >
                <label className="text-sm font-medium text-gray-700">
                  Preferred Languages ({formData.languages.length} selected)
                </label>
                <span className="text-gray-500 text-sm">
                  {expandedSections.languages ? '▼' : '▶'}
                </span>
              </div>
              {expandedSections.languages && (
                <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                  {languageOptions.map(language => (
                    <label key={language} className="flex items-center space-x-1 text-xs">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(language)}
                        onChange={() => handleArrayFieldChange('languages', language)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">
                        {language.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {formData.languages.length > 0 && (
                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  <strong>Selected:</strong> {formData.languages.map(lang => 
                    lang.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                  ).slice(0, 4).join(', ')}
                  {formData.languages.length > 4 && ` +${formData.languages.length - 4} more`}
                </div>
              )}
            </div>

            {/* Notice Period */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Notice Period
              </label>
              <select
                value={formData.noticePeriod}
                onChange={(e) => setFormData(prev => ({ ...prev, noticePeriod: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select notice period</option>
                <option value="Immediate">Immediate</option>
                <option value="1 week">1 week</option>
                <option value="2 weeks">2 weeks</option>
                <option value="1 month">1 month</option>
                <option value="2 months">2 months</option>
                <option value="3 months">3 months</option>
              </select>
            </div>

            {/* Travel Willingness */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.travelWillingness}
                  onChange={(e) => setFormData(prev => ({ ...prev, travelWillingness: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Willing to travel for work</span>
              </label>
            </div>
          </form>
        </div>

        {/* Footer - Sticky */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-lg px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditPreferencesModal
