import React, { useState, useEffect } from 'react'
import FormInput from '../ui/FormInput'
import TextArea from '../ui/TextArea'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { BuildingOfficeIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { getCities } from '../../services/common/cities'

const CompanyForm = ({ company, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    cityId: '',
    description: '',
    website: '',
    logo: '',
    industry: '',
    size: '',
    isDefault: false
  })
  const [errors, setErrors] = useState({})
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(true)

  const industrySectors = [
    { value: '', label: 'Select Industry' },
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'media', label: 'Media & Entertainment' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'food', label: 'Food & Beverage' },
    { value: 'other', label: 'Other' }
  ]

  const companySizes = [
    { value: '', label: 'Select Company Size' },
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' }
  ]

  useEffect(() => {
    loadCities()
  }, [])

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        cityId: company.cityId || '',
        description: company.description || '',
        website: company.website || '',
        logo: company.logo || '',
        industry: company.industry || '',
        size: company.size || '',
        isDefault: company.isDefault || false
      })
    }
  }, [company])

  const loadCities = async () => {
    try {
      const result = await getCities()
      if (result.success) {
        const cityOptions = result.data.map(city => ({
          value: city.id,
          label: `${city.name}, ${city.state}`
        }))
        setCities([{ value: '', label: 'Select a city' }, ...cityOptions])
      }
    } catch (error) {
      console.error('Error loading cities:', error)
    } finally {
      setLoadingCities(false)
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required'
    }
    
    if (!formData.cityId) {
      newErrors.cityId = 'City is required'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInput
        label="Company Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter company name"
        required
        icon={BuildingOfficeIcon}
        error={errors.name}
      />

      <Select
        label="City"
        name="cityId"
        value={formData.cityId}
        onChange={handleChange}
        options={cities}
        placeholder="Select city"
        required
        disabled={loadingCities}
        error={errors.cityId}
      />

      <TextArea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Describe your company, culture, and what makes it unique..."
        rows={4}
        required
        error={errors.description}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Industry Sector"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          options={industrySectors}
          placeholder="Select industry"
          error={errors.industry}
        />

        <Select
          label="Company Size"
          name="size"
          value={formData.size}
          onChange={handleChange}
          options={companySizes}
          placeholder="Select company size"
          error={errors.size}
        />
      </div>

      <FormInput
        label="Website"
        name="website"
        value={formData.website}
        onChange={handleChange}
        placeholder="https://www.company.com"
        type="url"
        icon={GlobeAltIcon}
        error={errors.website}
      />

      <FormInput
        label="Logo URL"
        name="logo"
        value={formData.logo}
        onChange={handleChange}
        placeholder="https://company.com/logo.png"
        type="url"
        error={errors.logo}
      />

      <div className="flex items-center">
        <input
          id="isDefault"
          name="isDefault"
          type="checkbox"
          checked={formData.isDefault}
          onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
          Set as default company
        </label>
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          {company ? 'Update Company' : 'Create Company'}
        </Button>
      </div>
    </form>
  )
}

export default CompanyForm