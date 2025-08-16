import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import FormInput from '../../components/ui/FormInput'
import TextArea from '../../components/ui/TextArea'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Modal from '../../components/ui/Modal'
import { createAd, updateAd, getAd, submitForApproval } from '../../services/employer/ads'
import { getCompanies } from '../../services/employer/companies'
import { getMous } from '../../services/employer/mou'
import { toast } from 'react-hot-toast'

const AdForm = () => {
  const { adId } = useParams()
  const navigate = useNavigate()
  const isEditing = !!adId

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryName: 'Jobs',
    city: '',
    employmentType: '',
    experienceLevel: '',
    salaryMin: '',
    salaryMax: '',
    skills: '',
    validUntil: '',
    companyId: ''
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(isEditing)
  const [companies, setCompanies] = useState([])
  const [activeMou, setActiveMou] = useState(null)
  const [showMouModal, setShowMouModal] = useState(false)

  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(false)

  const employmentTypes = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'FREELANCE', label: 'Freelance' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'REMOTE', label: 'Remote' }
  ]

  const experienceLevels = [
    { value: 'ENTRY', label: 'Entry Level (0-2 years)' },
    { value: 'MID', label: 'Mid Level (2-5 years)' },
    { value: 'SENIOR', label: 'Senior Level (5+ years)' },
    { value: 'EXECUTIVE', label: 'Executive Level' }
  ]

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      // Load companies
      const companiesResult = await getCompanies()
      if (companiesResult.success) {
        console.log('Companies loaded for dropdown:', companiesResult.data)
        const companiesList = companiesResult.data.data || []
        setCompanies(companiesList.map(company => ({
          value: company.id,
          label: company.name
        })))
      }

      // Load cities
      setLoadingCities(true)
      const citiesResult = await fetch('/api/public/cities')
      if (citiesResult.ok) {
        const citiesData = await citiesResult.json()
        if (citiesData.status === 'success') {
          setCities(citiesData.data.map(city => ({
            value: city.id,
            label: `${city.name}, ${city.state}`
          })))
        }
      }
      setLoadingCities(false)

      // Load MOU
      const mouResult = await getMous()
      if (mouResult.success) {
        const mous = mouResult.data.data || []
        const active = mous.find(mou => mou.status === 'ACTIVE')
        setActiveMou(active)
      }

      // Load ad data if editing
      if (isEditing) {
        const adResult = await getAd(adId)
        if (adResult.success) {
          console.log('Ad data loaded:', adResult.data)
          const ad = adResult.data.data || adResult.data
          
          // Parse category specific fields for job details
          const categorySpecificFields = ad.categorySpecificFields || {}
          
          setFormData({
            title: ad.title || '',
            description: ad.description || '',
            categoryName: ad.categoryName || 'Jobs',
            city: ad.locationId || ad.location?.id || '',
            employmentType: categorySpecificFields.employmentType || '',
            experienceLevel: categorySpecificFields.experienceLevel || '',
            salaryMin: categorySpecificFields.salaryMin?.toString() || '',
            salaryMax: categorySpecificFields.salaryMax?.toString() || '',
            skills: Array.isArray(categorySpecificFields.skills) ? 
                    categorySpecificFields.skills.join(', ') : 
                    (categorySpecificFields.skills || ''),
            validUntil: ad.validUntil ? ad.validUntil.split('T')[0] : '',
            companyId: ad.companyId || ''
          })
        } else {
          toast.error('Failed to load ad data')
          navigate('/employer/ads')
        }
      } else {
        // Set default valid until date (30 days from now)
        const defaultDate = new Date()
        defaultDate.setDate(defaultDate.getDate() + 30)
        setFormData(prev => ({
          ...prev,
          validUntil: defaultDate.toISOString().split('T')[0]
        }))
      }
    } catch (error) {
      toast.error('Failed to load form data')
    } finally {
      setIsPageLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.companyId) {
      newErrors.companyId = 'Company is required'
    }

    if (!formData.city) {
      newErrors.city = 'City is required'
    }

    if (!formData.employmentType) {
      newErrors.employmentType = 'Employment type is required'
    }

    if (!formData.experienceLevel) {
      newErrors.experienceLevel = 'Experience level is required'
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'Valid until date is required'
    } else {
      const validDate = new Date(formData.validUntil)
      const today = new Date()
      if (validDate <= today) {
        newErrors.validUntil = 'Valid until date must be in the future'
      }
    }

    if (formData.salaryMin && formData.salaryMax) {
      if (parseInt(formData.salaryMin) >= parseInt(formData.salaryMax)) {
        newErrors.salaryMax = 'Maximum salary must be greater than minimum salary'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e, action = 'save') => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Map frontend form data to backend expected format
      const adData = {
        companyId: formData.companyId,
        categoryName: formData.categoryName,
        title: formData.title,
        description: formData.description,
        locationId: formData.city, // Now using actual city ID from cities API
        validUntil: formData.validUntil,
        categorySpecificFields: {
          employmentType: formData.employmentType,
          experienceLevel: formData.experienceLevel,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
          skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
        },
        contactInfo: null // Can be added later if needed
      }

      console.log('Submitting ad data:', adData)

      let result
      if (isEditing) {
        result = await updateAd(adId, adData)
      } else {
        result = await createAd(adData)
      }

      if (result.success) {
        // Check if there's a MOU warning
        if (result.data.data && result.data.data.mouWarning) {
          toast.success('Ad created successfully!')
          toast((t) => (
            <div className="flex flex-col space-y-2">
              <div className="font-medium text-amber-800">⚠️ MOU Required</div>
              <div className="text-sm text-amber-700">
                You need an active MOU agreement for final approval. Please contact your Branch Admin to set up your MOU.
              </div>
            </div>
          ), {
            duration: 6000,
            style: {
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              color: '#92400e',
            },
          })
        } else if (action === 'submit') {
          // Handle submission for approval - allow without MOU but show warning
          const currentAdId = isEditing ? adId : (result.data.data && result.data.data.id)
          if (currentAdId) {
            const submitResult = await submitForApproval(currentAdId)
            if (submitResult.success) {
              toast.success(isEditing ? 'Ad updated and submitted for approval' : 'Ad created and submitted for approval')
              // Show MOU warning if no MOU exists
              if (!activeMou) {
                toast((t) => (
                  <div className="flex flex-col space-y-2">
                    <div className="font-medium text-amber-800">📋 Approval Note</div>
                    <div className="text-sm text-amber-700">
                      Branch Admin can approve this ad for live publication after signing the MOU agreement.
                    </div>
                  </div>
                ), {
                  duration: 7000,
                  style: {
                    background: '#fef3c7',
                    border: '1px solid #f59e0b',
                    color: '#92400e',
                  },
                })
              }
            } else {
              toast.error('Failed to submit for approval: ' + submitResult.error)
            }
          }
        } else {
          toast.success(isEditing ? 'Ad updated successfully' : 'Ad saved as draft')
        }
        navigate('/employer/ads')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(isEditing ? 'Failed to update ad' : 'Failed to create ad')
    } finally {
      setIsLoading(false)
    }
  }

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-orange-500 px-4 lg:px-6 py-4 lg:py-6">
            <h1 className="text-xl lg:text-2xl font-bold text-white">
              {isEditing ? 'Edit Job Ad' : 'Create New Job Ad'}
            </h1>
            <p className="text-blue-100 mt-1 text-sm">
              {isEditing ? 'Update your job posting details' : 'Fill out the details for your new job posting'}
            </p>
          </div>

          <form onSubmit={(e) => handleSubmit(e, 'save')} className="p-4 lg:p-6 space-y-6">
            {/* Common Ad Details Section - Scalable for different ad types */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                Common Details
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-3">
                  <FormInput
                    label="Ad Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer"
                    required
                    error={errors.title}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleChange}
                    options={companies}
                    placeholder="Select company"
                    required
                    error={errors.companyId}
                  />
                  {errors.companyId && (
                    <p className="text-sm text-red-600 mt-1">{errors.companyId}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    options={cities}
                    placeholder="Select city"
                    required
                    disabled={loadingCities}
                    error={errors.city}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                  )}
                </div>
                <FormInput
                  label="Valid Until"
                  name="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={handleChange}
                  required
                  error={errors.validUntil}
                />
              </div>
            </div>

            {/* Job Specific Details Section - Job category specific fields */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
              <h3 className="text-base font-semibold text-orange-900 mb-3 flex items-center">
                <div className="h-2 w-2 bg-orange-500 rounded-full mr-2"></div>
                Job Specific Details
              </h3>
              
              {/* Job Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    options={employmentTypes}
                    placeholder="Select employment type"
                    required
                    error={errors.employmentType}
                  />
                  {errors.employmentType && (
                    <p className="text-sm text-red-600 mt-1">{errors.employmentType}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    options={experienceLevels}
                    placeholder="Select experience level"
                    required
                    error={errors.experienceLevel}
                  />
                  {errors.experienceLevel && (
                    <p className="text-sm text-red-600 mt-1">{errors.experienceLevel}</p>
                  )}
                </div>
                <FormInput
                  label="Required Skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. JavaScript, React, Node.js"
                  error={errors.skills}
                />
              </div>

              {/* Compensation Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-orange-900 mb-3">Compensation</h4>
                  <FormInput
                    label="Minimum Salary (₹)"
                    name="salaryMin"
                    type="number"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    placeholder="e.g. 50000"
                    error={errors.salaryMin}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-orange-900 mb-3 opacity-0">Compensation</h4>
                  <FormInput
                    label="Maximum Salary (₹)"
                    name="salaryMax"
                    type="number"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    placeholder="e.g. 80000"
                    error={errors.salaryMax}
                  />
                </div>
              </div>

              {/* Job Description - Full Width at Bottom */}
              <div>
                <TextArea
                  label="Job Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the role, responsibilities, requirements, and benefits..."
                  rows={6}
                  required
                  error={errors.description}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white border-t border-gray-200 pt-4 mt-6">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/employer/ads')}
                  disabled={isLoading}
                  className="w-full sm:w-auto order-3 sm:order-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full sm:w-auto order-2"
                >
                  {isEditing ? 'Update Draft' : 'Save as Draft'}
                </Button>
                <Button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'submit')}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 order-1 sm:order-3"
                >
                  {isEditing ? 'Update & Submit' : 'Submit for Approval'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* MOU Required Modal */}
      <Modal
        isOpen={showMouModal}
        onClose={() => setShowMouModal(false)}
        title="Active MOU Required"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You need an active MOU (Memorandum of Understanding) to submit job postings for approval.
            Please contact your Branch Admin to set up your MOU agreement.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowMouModal(false)}
            >
              Continue as Draft
            </Button>
            <Button
              onClick={async () => {
                setShowMouModal(false)
                // Proceed with submission even without MOU
                const e = { preventDefault: () => {} }
                await handleSubmit(e, 'submit')
              }}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              Proceed to Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdForm