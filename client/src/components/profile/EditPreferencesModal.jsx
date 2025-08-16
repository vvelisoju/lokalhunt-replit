import React, { useState, useEffect } from 'react'
import Button from '../ui/Button'
import { getCities } from '../../services/common/cities'

const EditPreferencesModal = ({ isOpen, onClose, preferences, onSave }) => {
  const [formData, setFormData] = useState({
    jobTypes: [],
    preferredLocations: [],
    salaryRange: { min: '', max: '' },
    workType: '',
    noticePeriod: ''
  })
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(false)

  useEffect(() => {
    if (preferences) {
      setFormData({
        jobTypes: preferences.jobTypes || [],
        preferredLocations: preferences.preferredLocations || [],
        salaryRange: preferences.salaryRange || { min: '', max: '' },
        workType: preferences.workType || '',
        noticePeriod: preferences.noticePeriod || ''
      })
    }
  }, [preferences])

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
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }

  const handleJobTypeChange = (jobType) => {
    setFormData(prev => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(jobType)
        ? prev.jobTypes.filter(type => type !== jobType)
        : [...prev.jobTypes, jobType]
    }))
  }

  const handleLocationChange = (location) => {
    setFormData(prev => ({
      ...prev,
      preferredLocations: prev.preferredLocations.includes(location)
        ? prev.preferredLocations.filter(loc => loc !== location)
        : [...prev.preferredLocations, location]
    }))
  }

  if (!isOpen) return null

  const jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']
  const workTypeOptions = ['Remote', 'On-site', 'Hybrid']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Edit Job Preferences</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Types
            </label>
            <div className="grid grid-cols-2 gap-2">
              {jobTypeOptions.map(type => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.jobTypes.includes(type)}
                    onChange={() => handleJobTypeChange(type)}
                    className="mr-2"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* Work Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Type
            </label>
            <select
              value={formData.workType}
              onChange={(e) => setFormData(prev => ({ ...prev, workType: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select work type</option>
              {workTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Preferred Locations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Locations
            </label>
            {loadingCities ? (
              <div className="text-sm text-gray-500">Loading cities...</div>
            ) : (
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                {cities.map(city => (
                  <label key={city.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.preferredLocations.includes(city.name)}
                      onChange={() => handleLocationChange(city.name)}
                      className="mr-2"
                    />
                    <span className="text-sm">{city.name}</span>
                  </label>
                ))}
              </div>
            )}
            {formData.preferredLocations.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {formData.preferredLocations.join(', ')}
              </div>
            )}
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Salary Range (per month)
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Min salary"
                value={formData.salaryRange.min}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  salaryRange: { ...prev.salaryRange, min: e.target.value }
                }))}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="number"
                placeholder="Max salary"
                value={formData.salaryRange.max}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  salaryRange: { ...prev.salaryRange, max: e.target.value }
                }))}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          {/* Notice Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notice Period
            </label>
            <select
              value={formData.noticePeriod}
              onChange={(e) => setFormData(prev => ({ ...prev, noticePeriod: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPreferencesModal