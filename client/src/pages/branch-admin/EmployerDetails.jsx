import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BanknotesIcon,
  CheckBadgeIcon,
  XMarkIcon,
  EyeIcon,
  PlusIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { toast } from 'react-hot-toast'
import { getEmployerDetails, approveAd, rejectAd } from '../../services/branch-admin/employers'

// Reuse employer components
import CompanyForm from '../../components/employer/CompanyForm'
import FormInput from '../../components/ui/FormInput'
import TextArea from '../../components/ui/TextArea'
import Select from '../../components/ui/Select'
// Use branch admin specific API endpoints
const getCompaniesForEmployer = async (employerId) => {
  const response = await fetch(`/api/branch-admins/employers/${employerId}/companies`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  })
  if (!response.ok) throw new Error('Failed to fetch companies')
  const data = await response.json()
  return { success: true, data }
}

const createCompanyForEmployer = async (employerId, companyData) => {
  const response = await fetch(`/api/branch-admins/employers/${employerId}/companies`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(companyData)
  })
  if (!response.ok) throw new Error('Failed to create company')
  const data = await response.json()
  return { success: true, data }
}

const updateCompanyForEmployer = async (employerId, companyId, companyData) => {
  const response = await fetch(`/api/branch-admins/employers/${employerId}/companies/${companyId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(companyData)
  })
  if (!response.ok) throw new Error('Failed to update company')
  const data = await response.json()
  return { success: true, data }
}

const createAdForEmployer = async (employerId, adData) => {
  const response = await fetch(`/api/branch-admins/employers/${employerId}/ads`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(adData)
  })
  if (!response.ok) throw new Error('Failed to create ad')
  const data = await response.json()
  return { success: true, data }
}

const updateAdForEmployer = async (employerId, adId, adData) => {
  const response = await fetch(`/api/branch-admins/employers/${employerId}/ads/${adId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(adData)
  })
  if (!response.ok) throw new Error('Failed to update ad')
  const data = await response.json()
  return { success: true, data }
}

const submitAdForApprovalForEmployer = async (employerId, adId) => {
  const response = await fetch(`/api/branch-admins/employers/${employerId}/ads/${adId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  })
  if (!response.ok) throw new Error('Failed to submit ad for approval')
  const data = await response.json()
  return { success: true, data }
}

// MOU management API functions
const createMouForEmployer = async (employerId, mouData) => {
  const response = await fetch('/api/branch-admins/mous', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ...mouData, employerId })
  })
  if (!response.ok) throw new Error('Failed to create MOU')
  const data = await response.json()
  return { success: true, data }
}

const updateMouForEmployer = async (mouId, mouData) => {
  const response = await fetch(`/api/branch-admins/mous/${mouId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(mouData)
  })
  if (!response.ok) throw new Error('Failed to update MOU')
  const data = await response.json()
  return { success: true, data }
}

const EmployerDetails = () => {
  const { employerId } = useParams()
  const navigate = useNavigate()
  const [employer, setEmployer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedAd, setSelectedAd] = useState(null)
  const [adModal, setAdModal] = useState({ isOpen: false, type: '', ad: null })
  
  // Company management states
  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [isCompanySubmitting, setIsCompanySubmitting] = useState(false)
  
  // Ad management states  
  const [showAdForm, setShowAdForm] = useState(false)
  const [editingAd, setEditingAd] = useState(null)
  const [isAdSubmitting, setIsAdSubmitting] = useState(false)
  const [adFormData, setAdFormData] = useState({
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
  const [adErrors, setAdErrors] = useState({})
  const [companies, setCompanies] = useState([])
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [activeMou, setActiveMou] = useState(null)
  
  // MOU management states
  const [showMouForm, setShowMouForm] = useState(false)
  const [editingMou, setEditingMou] = useState(null)
  const [isMouSubmitting, setIsMouSubmitting] = useState(false)
  const [mouFormData, setMouFormData] = useState({
    title: '',
    description: '',
    feeStructureType: 'FIXED',
    feeAmount: '',
    feePercentage: '',
    validUntil: '',
    terms: '',
    isActive: true
  })
  const [mouErrors, setMouErrors] = useState({})

  useEffect(() => {
    if (employerId) {
      loadEmployerDetails()
      loadCompaniesData()
      loadInitialAdData()
    }
  }, [employerId])

  const loadEmployerDetails = async () => {
    setIsLoading(true)
    try {
      const result = await getEmployerDetails(employerId)
      if (result.success) {
        setEmployer(result.data)
      } else {
        if (result.status === 404) {
          toast.error('Employer not found')
        } else {
          toast.error('Failed to load employer details')
        }
        navigate('/branch-admin/employers')
      }
    } catch (error) {
      console.error('Error loading employer details:', error)
      if (error.response?.status === 404) {
        toast.error('Employer not found')
      } else {
        toast.error('Failed to load employer details')
      }
      navigate('/branch-admin/employers')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCompaniesData = async () => {
    try {
      const result = await getCompaniesForEmployer(employerId)
      console.log('Raw API result:', result) // Debug log
      
      if (result.success) {
        // The API returns { data: { companies: [...], total: number } }
        let companiesList = []
        
        // Handle different possible response structures
        if (result.data?.data?.companies) {
          companiesList = result.data.data.companies
        } else if (result.data?.companies) {
          companiesList = result.data.companies
        } else if (Array.isArray(result.data?.data)) {
          companiesList = result.data.data
        } else if (Array.isArray(result.data)) {
          companiesList = result.data
        }
        
        console.log('Loaded companies:', companiesList) // Debug log
        
        if (companiesList.length > 0) {
          const companyOptions = companiesList.map(company => ({
            value: company.id,
            label: company.name
          }))
          setCompanies(companyOptions)
        } else {
          // No companies exist
          setCompanies([{
            value: '',
            label: 'No companies available - Create one first',
            disabled: true
          }])
        }
      }
    } catch (error) {
      console.error('Error loading companies:', error)
      // Set a fallback message
      setCompanies([{
        value: '',
        label: 'Failed to load companies',
        disabled: true
      }])
    }
  }

  const loadInitialAdData = async () => {
    try {
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

      // MOU data will be loaded from employer details
      // No need to call separate MOU API since we have it in employer data

      // Set default valid until date (30 days from now)
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 30)
      setAdFormData(prev => ({
        ...prev,
        validUntil: defaultDate.toISOString().split('T')[0]
      }))
    } catch (error) {
      console.error('Error loading ad data:', error)
    }
  }

  const handleAdAction = async (adId, action, reason = null) => {
    try {
      const result = action === 'approve' 
        ? await approveAd(adId)
        : await rejectAd(adId, reason)

      if (result.success) {
        toast.success(`Ad ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
        loadEmployerDetails() // Refresh data
      } else {
        toast.error(result.error || `Failed to ${action} ad`)
      }
    } catch (error) {
      console.error(`Error ${action}ing ad:`, error)
      toast.error(`Failed to ${action} ad`)
    }
    setAdModal({ isOpen: false, type: '', ad: null })
  }

  // Company management functions
  const handleCreateCompany = async (companyData) => {
    setIsCompanySubmitting(true)
    try {
      const result = await createCompanyForEmployer(employerId, companyData)
      if (result.success) {
        toast.success('Company created successfully')
        setShowCompanyForm(false)
        loadEmployerDetails() // Refresh to show new company
        loadCompaniesData() // Refresh companies dropdown
      } else {
        toast.error(result.error || 'Failed to create company')
      }
    } catch (error) {
      console.error('Error creating company:', error)
      toast.error('Failed to create company')
    } finally {
      setIsCompanySubmitting(false)
    }
  }

  const handleUpdateCompany = async (companyData) => {
    if (!editingCompany) return
    
    setIsCompanySubmitting(true)
    try {
      const result = await updateCompanyForEmployer(employerId, editingCompany.id, companyData)
      if (result.success) {
        toast.success('Company updated successfully')
        setShowCompanyForm(false)
        setEditingCompany(null)
        loadEmployerDetails() // Refresh to show updated company
        loadCompaniesData() // Refresh companies dropdown
      } else {
        toast.error(result.error || 'Failed to update company')
      }
    } catch (error) {
      console.error('Error updating company:', error)
      toast.error('Failed to update company')
    } finally {
      setIsCompanySubmitting(false)
    }
  }

  const handleCompanySubmit = (companyData) => {
    if (editingCompany) {
      handleUpdateCompany(companyData)
    } else {
      handleCreateCompany(companyData)
    }
  }

  const handleEditCompany = (company) => {
    setEditingCompany(company)
    setShowCompanyForm(true)
  }

  const handleCancelCompanyForm = () => {
    setShowCompanyForm(false)
    setEditingCompany(null)
  }

  // Ad management functions
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

  const handleAdChange = (e) => {
    const { name, value } = e.target
    setAdFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateAdForm = () => {
    const newErrors = {}
    
    if (!adFormData.title.trim()) newErrors.title = 'Title is required'
    if (!adFormData.description.trim()) newErrors.description = 'Description is required'
    if (!adFormData.companyId) {
      if (companies.length === 0 || (companies.length === 1 && companies[0].disabled)) {
        newErrors.companyId = 'No companies available. Please create a company first.'
      } else {
        newErrors.companyId = 'Company is required'
      }
    }
    if (!adFormData.city) newErrors.city = 'City is required'
    if (!adFormData.employmentType) newErrors.employmentType = 'Employment type is required'
    if (!adFormData.experienceLevel) newErrors.experienceLevel = 'Experience level is required'
    if (!adFormData.validUntil) newErrors.validUntil = 'Valid until date is required'
    
    setAdErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateAd = async (action = 'save') => {
    if (!validateAdForm()) {
      toast.error('Please fix the errors below')
      return
    }

    setIsAdSubmitting(true)
    try {
      const adData = {
        companyId: adFormData.companyId,
        categoryName: adFormData.categoryName,
        title: adFormData.title,
        description: adFormData.description,
        locationId: adFormData.city,
        validUntil: adFormData.validUntil,
        categorySpecificFields: {
          employmentType: adFormData.employmentType,
          experienceLevel: adFormData.experienceLevel,
          salaryMin: adFormData.salaryMin ? parseInt(adFormData.salaryMin) : null,
          salaryMax: adFormData.salaryMax ? parseInt(adFormData.salaryMax) : null,
          skills: adFormData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
        },
        contactInfo: null
      }

      let result
      if (editingAd) {
        result = await updateAdForEmployer(employerId, editingAd.id, adData)
        // For editing, if action is submit, submit for approval
        if (result.success && action === 'submit') {
          const submitResult = await submitAdForApprovalForEmployer(employerId, editingAd.id)
          if (submitResult.success) {
            toast.success('Ad updated and submitted for approval')
          } else {
            toast.error('Ad updated but failed to submit for approval')
          }
        } else if (result.success) {
          toast.success('Ad updated successfully')
        }
      } else {
        // For new ads, check if we should create with PENDING_APPROVAL status
        if (action === 'submit') {
          // Create ad directly with PENDING_APPROVAL status by calling submit endpoint
          result = await createAdForEmployer(employerId, adData)
          if (result.success) {
            const adId = result.data && result.data.id
            if (adId) {
              const submitResult = await submitAdForApprovalForEmployer(employerId, adId)
              if (submitResult.success) {
                toast.success('Ad created and submitted for approval')
              } else {
                toast.error('Ad created but failed to submit for approval')
              }
            }
          }
        } else {
          // Create as draft
          result = await createAdForEmployer(employerId, adData)
          if (result.success) {
            toast.success('Ad created successfully')
          }
        }
      }

      if (result && result.success) {
        setShowAdForm(false)
        setEditingAd(null)
        setAdFormData({
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
        loadEmployerDetails() // Refresh to show new/updated ad
      } else {
        toast.error(result?.error || (editingAd ? 'Failed to update ad' : 'Failed to create ad'))
      }
    } catch (error) {
      console.error('Error saving ad:', error)
      toast.error(editingAd ? 'Failed to update ad' : 'Failed to create ad')
    } finally {
      setIsAdSubmitting(false)
    }
  }

  const handleEditAd = (ad) => {
    const categorySpecificFields = ad.categorySpecificFields || {}
    setAdFormData({
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
    setEditingAd(ad)
    setShowAdForm(true)
  }

  const handleCancelAdForm = () => {
    setShowAdForm(false)
    setEditingAd(null)
    setAdFormData({
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
    setAdErrors({})
  }

  // MOU management functions
  const handleMouChange = (e) => {
    const { name, value, type, checked } = e.target
    setMouFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateMouForm = () => {
    const newErrors = {}
    
    if (!mouFormData.title.trim()) newErrors.title = 'Title is required'
    if (!mouFormData.description.trim()) newErrors.description = 'Description is required'
    if (mouFormData.feeStructureType === 'FIXED') {
      if (!mouFormData.feeAmount || parseFloat(mouFormData.feeAmount) <= 0) {
        newErrors.feeAmount = 'Valid fee amount is required'
      }
    } else {
      if (!mouFormData.feePercentage || parseFloat(mouFormData.feePercentage) <= 0 || parseFloat(mouFormData.feePercentage) > 100) {
        newErrors.feePercentage = 'Valid percentage (1-100) is required'
      }
    }
    if (!mouFormData.validUntil) newErrors.validUntil = 'Valid until date is required'
    if (!mouFormData.terms.trim()) newErrors.terms = 'Terms are required'
    
    setMouErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateMou = async () => {
    if (!validateMouForm()) {
      toast.error('Please fix the errors below')
      return
    }

    setIsMouSubmitting(true)
    try {
      const mouData = {
        title: mouFormData.title,
        description: mouFormData.description,
        feeStructure: {
          type: mouFormData.feeStructureType,
          ...(mouFormData.feeStructureType === 'FIXED' 
            ? { amount: parseFloat(mouFormData.feeAmount) }
            : { percentage: parseFloat(mouFormData.feePercentage) }
          )
        },
        validUntil: mouFormData.validUntil,
        terms: mouFormData.terms,
        isActive: mouFormData.isActive
      }

      let result
      if (editingMou) {
        result = await updateMouForEmployer(editingMou.id, mouData)
      } else {
        result = await createMouForEmployer(employerId, mouData)
      }

      if (result.success) {
        toast.success(editingMou ? 'MOU updated successfully' : 'MOU created successfully')
        setShowMouForm(false)
        setEditingMou(null)
        setMouFormData({
          title: '',
          description: '',
          feeStructureType: 'FIXED',
          feeAmount: '',
          feePercentage: '',
          validUntil: '',
          terms: '',
          isActive: true
        })
        loadEmployerDetails() // Refresh to show new/updated MOU
      } else {
        toast.error(result.error || (editingMou ? 'Failed to update MOU' : 'Failed to create MOU'))
      }
    } catch (error) {
      console.error('Error saving MOU:', error)
      toast.error(editingMou ? 'Failed to update MOU' : 'Failed to create MOU')
    } finally {
      setIsMouSubmitting(false)
    }
  }

  const handleEditMou = (mou) => {
    setMouFormData({
      title: mou.notes || '',
      description: mou.terms || '',
      feeStructureType: mou.feeType || 'FIXED',
      feeAmount: mou.feeType === 'FIXED' ? mou.feeValue?.toString() || '' : '',
      feePercentage: mou.feeType === 'PERCENTAGE' ? mou.feeValue?.toString() || '' : '',
      validUntil: mou.signedAt ? mou.signedAt.split('T')[0] : '',
      terms: mou.terms || '',
      isActive: mou.isActive ?? true
    })
    setEditingMou(mou)
    setShowMouForm(true)
  }

  const handleCancelMouForm = () => {
    setShowMouForm(false)
    setEditingMou(null)
    setMouFormData({
      title: '',
      description: '',
      feeStructureType: 'FIXED',
      feeAmount: '',
      feePercentage: '',
      validUntil: '',
      terms: '',
      isActive: true
    })
    setMouErrors({})
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', icon: '📝' },
      PENDING_APPROVAL: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: '✅' },
      ARCHIVED: { color: 'bg-red-100 text-red-800', icon: '🗄️' }
    }
    
    const config = statusConfig[status] || statusConfig.DRAFT
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {status?.replace('_', ' ') || 'Unknown'}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!employer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Employer not found</h2>
          <Button onClick={() => navigate('/branch-admin/employers')}>
            Back to Employers
          </Button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'companies', name: 'Companies', icon: BuildingOfficeIcon },
    { id: 'ads', name: 'Job Ads', icon: DocumentTextIcon },
    { id: 'mous', name: 'MOUs', icon: BanknotesIcon },
    { id: 'allocations', name: 'Allocations', icon: ChartBarIcon }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/branch-admin/employers')}
              icon={ArrowLeftIcon}
              className="flex-shrink-0"
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {employer.user?.name || 'Employer Details'}
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">
                Comprehensive employer information and management
              </p>
            </div>
          </div>

          {/* Employer Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Basic Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{employer.user?.name}</h2>
                    <p className="text-gray-600">{employer.user?.email}</p>
                    <p className="text-sm text-gray-500">
                      Member since {new Date(employer.user?.createdAt || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:w-1/2">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {employer.companies?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Companies</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {employer.ads?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Job Ads</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {employer.mous?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">MOUs</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {employer.allocations?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Allocations</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{employer.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{employer.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-900">{employer.city || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employer.user?.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employer.user?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Profile Complete</span>
                    <span className="text-blue-600 font-medium">
                      {employer.profileCompleteness || '75%'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Active</span>
                    <span className="text-gray-900">
                      {employer.lastActiveAt 
                        ? new Date(employer.lastActiveAt).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Companies</h3>
                <Button
                  onClick={() => setShowCompanyForm(true)}
                  icon={PlusIcon}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Company
                </Button>
              </div>
              <div className="p-6">
                {employer.companies && employer.companies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employer.companies.map((company) => (
                      <div key={company.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <BuildingOfficeIcon className="h-8 w-8 text-blue-500" />
                            <div>
                              <h4 className="font-semibold text-gray-900">{company.name}</h4>
                              <p className="text-sm text-gray-600">{company.industry}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditCompany(company)}
                            icon={PencilIcon}
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Size:</span>
                            <span className="text-gray-900">{company.companySize}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Location:</span>
                            <span className="text-gray-900">{company.city?.name || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Website:</span>
                            <span className="text-blue-600">{company.website || 'Not provided'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No companies registered yet</p>
                    <Button
                      onClick={() => setShowCompanyForm(true)}
                      icon={PlusIcon}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Create First Company
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Job Advertisements</h3>
                <Button
                  onClick={() => {
                    // Check actual employer companies data instead of dropdown options
                    const actualCompanies = employer?.companies || []
                    if (actualCompanies.length === 0) {
                      toast.error('Please create a company first before posting job ads')
                      setActiveTab('companies')
                    } else {
                      setShowAdForm(true)
                    }
                  }}
                  icon={PlusIcon}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Ad
                </Button>
              </div>
              <div className="p-6">
                {employer.ads && employer.ads.length > 0 ? (
                  <div className="space-y-4">
                    {employer.ads.map((ad) => (
                      <div key={ad.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{ad.title}</h4>
                              {getStatusBadge(ad.status)}
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                              {ad.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>📍 {ad.location?.name || ad.company?.city?.name}</span>
                              <span>🏢 {ad.company?.name}</span>
                              <span>📅 {new Date(ad.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={PencilIcon}
                              onClick={() => handleEditAd(ad)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={EyeIcon}
                              onClick={() => setSelectedAd(ad)}
                            >
                              View
                            </Button>
                            {ad.status === 'PENDING_APPROVAL' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  icon={CheckBadgeIcon}
                                  onClick={() => setAdModal({ isOpen: true, type: 'approve', ad })}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  icon={XMarkIcon}
                                  onClick={() => setAdModal({ isOpen: true, type: 'reject', ad })}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {ad.categorySpecificFields && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-100 text-sm">
                            <div>
                              <span className="text-gray-500">Type:</span>
                              <span className="ml-2 text-gray-900">
                                {ad.categorySpecificFields.employmentType || 'Not specified'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Experience:</span>
                              <span className="ml-2 text-gray-900">
                                {ad.categorySpecificFields.experienceLevel || 'Not specified'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Salary:</span>
                              <span className="ml-2 text-gray-900">
                                {ad.categorySpecificFields.salaryMin && ad.categorySpecificFields.salaryMax
                                  ? `₹${ad.categorySpecificFields.salaryMin.toLocaleString()} - ₹${ad.categorySpecificFields.salaryMax.toLocaleString()}`
                                  : 'Not disclosed'
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Skills:</span>
                              <span className="ml-2 text-gray-900">
                                {ad.categorySpecificFields.skills?.length || 0} required
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No job advertisements posted yet</p>
                    <Button
                      onClick={() => {
                        // Check actual employer companies data instead of dropdown options
                        const actualCompanies = employer?.companies || []
                        if (actualCompanies.length === 0) {
                          toast.error('Please create a company first before posting job ads')
                          setActiveTab('companies')
                        } else {
                          setShowAdForm(true)
                        }
                      }}
                      icon={PlusIcon}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Create First Ad
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'mous' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Memorandums of Understanding</h3>
                <Button
                  onClick={() => setShowMouForm(true)}
                  icon={PlusIcon}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create MOU
                </Button>
              </div>
              <div className="p-6">
                {employer.mous && employer.mous.length > 0 ? (
                  <div className="space-y-4">
                    {employer.mous.map((mou) => (
                      <div key={mou.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{mou.notes || 'MOU Agreement'}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                mou.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {mou.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Type:</span>
                                <span className="ml-2 text-gray-900">{mou.feeType}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Amount:</span>
                                <span className="ml-2 text-gray-900">
                                  {mou.feeType === 'FIXED' 
                                    ? `₹${mou.feeValue?.toLocaleString()}`
                                    : `${mou.feeValue}%`
                                  }
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Valid Until:</span>
                                <span className="ml-2 text-gray-900">
                                  {mou.signedAt ? new Date(mou.signedAt).toLocaleDateString() : 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Version:</span>
                                <span className="ml-2 text-gray-900">{mou.version || '1.0'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={PencilIcon}
                              onClick={() => handleEditMou(mou)}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No MOUs created yet</p>
                    <Button
                      onClick={() => setShowMouForm(true)}
                      icon={PlusIcon}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Create First MOU
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'allocations' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Candidate Allocations</h3>
              </div>
              <div className="p-6">
                {employer.allocations && employer.allocations.length > 0 ? (
                  <div className="space-y-4">
                    {employer.allocations.map((allocation) => (
                      <div key={allocation.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {allocation.candidate?.user?.name}
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>📧 {allocation.candidate?.user?.email}</p>
                              <p>💼 {allocation.ad?.title}</p>
                              <p>📅 Allocated: {new Date(allocation.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            allocation.status === 'ALLOCATED' 
                              ? 'bg-green-100 text-green-800'
                              : allocation.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {allocation.status}
                          </span>
                        </div>
                        {allocation.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Notes:</strong> {allocation.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No allocations yet
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Analytics & Performance</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <ChartBarIcon className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {employer.ads?.filter(ad => ad.status === 'APPROVED').length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Approved Ads</div>
                  </div>

                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <UserIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {employer.allocations?.filter(alloc => alloc.status === 'ALLOCATED').length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Active Allocations</div>
                  </div>

                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <BanknotesIcon className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {employer.mous?.filter(mou => mou.isActive).length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Active MOUs</div>
                  </div>
                </div>

                <div className="mt-8 text-center text-gray-500">
                  <ChartBarIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Detailed analytics coming soon</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ad Action Modals */}
        <Modal
          isOpen={adModal.isOpen}
          onClose={() => setAdModal({ isOpen: false, type: '', ad: null })}
          title={`${adModal.type === 'approve' ? 'Approve' : 'Reject'} Job Ad`}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to {adModal.type} the job ad "{adModal.ad?.title}"?
            </p>
            
            {adModal.type === 'reject' && (
              <textarea
                placeholder="Please provide a reason for rejection..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows={3}
                ref={(el) => {
                  if (el) {
                    el.rejectReason = el.value
                  }
                }}
              />
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setAdModal({ isOpen: false, type: '', ad: null })}
              >
                Cancel
              </Button>
              <Button
                className={adModal.type === 'approve' 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-red-600 hover:bg-red-700"
                }
                onClick={() => {
                  const reason = adModal.type === 'reject' 
                    ? document.querySelector('textarea')?.value 
                    : null
                  handleAdAction(adModal.ad?.id, adModal.type, reason)
                }}
              >
                {adModal.type === 'approve' ? 'Approve Ad' : 'Reject Ad'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Ad Details Modal */}
        <Modal
          isOpen={!!selectedAd}
          onClose={() => setSelectedAd(null)}
          title="Job Advertisement Details"
          size="lg"
        >
          {selectedAd && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{selectedAd.title}</h3>
                {getStatusBadge(selectedAd.status)}
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-600">{selectedAd.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Company:</span>
                  <span className="ml-2">{selectedAd.company?.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Location:</span>
                  <span className="ml-2">{selectedAd.location?.name || selectedAd.company?.city?.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Posted:</span>
                  <span className="ml-2">{new Date(selectedAd.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Valid Until:</span>
                  <span className="ml-2">{new Date(selectedAd.validUntil).toLocaleDateString()}</span>
                </div>
              </div>

              {selectedAd.categorySpecificFields && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Job Requirements</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Employment Type:</span>
                      <span className="ml-2">{selectedAd.categorySpecificFields.employmentType}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Experience Level:</span>
                      <span className="ml-2">{selectedAd.categorySpecificFields.experienceLevel}</span>
                    </div>
                    {(selectedAd.categorySpecificFields.salaryMin || selectedAd.categorySpecificFields.salaryMax) && (
                      <div>
                        <span className="font-medium text-gray-500">Salary Range:</span>
                        <span className="ml-2">
                          ₹{selectedAd.categorySpecificFields.salaryMin?.toLocaleString()} - 
                          ₹{selectedAd.categorySpecificFields.salaryMax?.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedAd.categorySpecificFields.skills && selectedAd.categorySpecificFields.skills.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-500">Required Skills:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedAd.categorySpecificFields.skills.map((skill, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedAd(null)}
                >
                  Close
                </Button>
                {selectedAd.status === 'PENDING_APPROVAL' && (
                  <>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setSelectedAd(null)
                        setAdModal({ isOpen: true, type: 'approve', ad: selectedAd })
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setSelectedAd(null)
                        setAdModal({ isOpen: true, type: 'reject', ad: selectedAd })
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Company Form Modal */}
        <Modal
          isOpen={showCompanyForm}
          onClose={handleCancelCompanyForm}
          title={editingCompany ? 'Edit Company' : 'Create Company'}
        >
          <CompanyForm
            company={editingCompany}
            onSubmit={handleCompanySubmit}
            onCancel={handleCancelCompanyForm}
            isLoading={isCompanySubmitting}
          />
        </Modal>

        {/* Ad Form Modal */}
        <Modal
          isOpen={showAdForm}
          onClose={handleCancelAdForm}
          title={editingAd ? 'Edit Job Ad' : 'Create Job Ad'}
        >
          <form onSubmit={(e) => {
            e.preventDefault()
            handleCreateAd('save')
          }} className="space-y-6">
            <FormInput
              label="Job Title"
              name="title"
              value={adFormData.title}
              onChange={handleAdChange}
              placeholder="Enter job title"
              required
              error={adErrors.title}
            />

            <TextArea
              label="Job Description"
              name="description"
              value={adFormData.description}
              onChange={handleAdChange}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={4}
              required
              error={adErrors.description}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Company"
                name="companyId"
                value={adFormData.companyId}
                onChange={handleAdChange}
                options={companies}
                placeholder={companies.length === 0 ? "Loading companies..." : "Select company"}
                required
                error={adErrors.companyId}
                disabled={companies.length === 0 || (companies.length === 1 && companies[0]?.disabled)}
              />

              <Select
                label="Location"
                name="city"
                value={adFormData.city}
                onChange={handleAdChange}
                options={cities}
                placeholder="Select city"
                required
                disabled={loadingCities}
                error={adErrors.city}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Employment Type"
                name="employmentType"
                value={adFormData.employmentType}
                onChange={handleAdChange}
                options={employmentTypes}
                placeholder="Select employment type"
                required
                error={adErrors.employmentType}
              />

              <Select
                label="Experience Level"
                name="experienceLevel"
                value={adFormData.experienceLevel}
                onChange={handleAdChange}
                options={experienceLevels}
                placeholder="Select experience level"
                required
                error={adErrors.experienceLevel}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Minimum Salary (₹)"
                name="salaryMin"
                value={adFormData.salaryMin}
                onChange={handleAdChange}
                placeholder="Enter minimum salary"
                type="number"
                error={adErrors.salaryMin}
              />

              <FormInput
                label="Maximum Salary (₹)"
                name="salaryMax"
                value={adFormData.salaryMax}
                onChange={handleAdChange}
                placeholder="Enter maximum salary"
                type="number"
                error={adErrors.salaryMax}
              />
            </div>

            <FormInput
              label="Skills (comma-separated)"
              name="skills"
              value={adFormData.skills}
              onChange={handleAdChange}
              placeholder="e.g., JavaScript, React, Node.js"
              error={adErrors.skills}
            />

            <FormInput
              label="Valid Until"
              name="validUntil"
              value={adFormData.validUntil}
              onChange={handleAdChange}
              type="date"
              required
              error={adErrors.validUntil}
            />

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelAdForm}
                disabled={isAdSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isAdSubmitting}
                className="w-full sm:w-auto"
              >
                {editingAd ? 'Update Ad' : 'Create Ad'}
              </Button>
              {/* Hide submit button for approved ads */}
              {!(editingAd && editingAd.status === 'APPROVED') && (
                <Button
                  type="button"
                  onClick={() => handleCreateAd('submit')}
                  isLoading={isAdSubmitting}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                >
                  {editingAd ? 'Update & Submit' : 'Submit for Approval'}
                </Button>
              )}
            </div>
          </form>
        </Modal>

        {/* MOU Form Modal */}
        <Modal
          isOpen={showMouForm}
          onClose={handleCancelMouForm}
          title={editingMou ? 'Edit MOU' : 'Create New MOU'}
          size="lg"
        >
          <form onSubmit={(e) => { e.preventDefault(); handleCreateMou(); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormInput
                  label="MOU Title"
                  name="title"
                  value={mouFormData.title}
                  onChange={handleMouChange}
                  placeholder="e.g., Standard Recruitment Agreement"
                  error={mouErrors.title}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <TextArea
                  label="Description"
                  name="description"
                  value={mouFormData.description}
                  onChange={handleMouChange}
                  placeholder="Brief description of the MOU scope and purpose"
                  rows={3}
                  error={mouErrors.description}
                  required
                />
              </div>

              <div>
                <Select
                  label="Fee Structure Type"
                  name="feeStructureType"
                  value={mouFormData.feeStructureType}
                  onChange={handleMouChange}
                  options={[
                    { value: 'FIXED', label: 'Fixed Amount' },
                    { value: 'PERCENTAGE', label: 'Percentage of Salary' }
                  ]}
                  error={mouErrors.feeStructureType}
                  required
                />
              </div>

              {mouFormData.feeStructureType === 'FIXED' ? (
                <div>
                  <FormInput
                    label="Fixed Fee Amount (₹)"
                    name="feeAmount"
                    type="number"
                    value={mouFormData.feeAmount}
                    onChange={handleMouChange}
                    placeholder="e.g., 50000"
                    error={mouErrors.feeAmount}
                    required
                  />
                </div>
              ) : (
                <div>
                  <FormInput
                    label="Percentage (%)"
                    name="feePercentage"
                    type="number"
                    value={mouFormData.feePercentage}
                    onChange={handleMouChange}
                    placeholder="e.g., 10"
                    min="1"
                    max="100"
                    error={mouErrors.feePercentage}
                    required
                  />
                </div>
              )}

              <div>
                <FormInput
                  label="Valid Until"
                  name="validUntil"
                  type="date"
                  value={mouFormData.validUntil}
                  onChange={handleMouChange}
                  error={mouErrors.validUntil}
                  required
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={mouFormData.isActive}
                    onChange={handleMouChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active MOU</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <TextArea
                  label="Terms & Conditions"
                  name="terms"
                  value={mouFormData.terms}
                  onChange={handleMouChange}
                  placeholder="Key terms and conditions of this MOU"
                  rows={4}
                  error={mouErrors.terms}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelMouForm}
                disabled={isMouSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isMouSubmitting}
                className="w-full sm:w-auto"
              >
                {editingMou ? 'Update MOU' : 'Create MOU'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}

export default EmployerDetails