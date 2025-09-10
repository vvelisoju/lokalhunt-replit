import React, { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Button from '../ui/Button'
import FormInput from '../ui/FormInput'
import Modal from '../ui/Modal'

const EditExperienceModal = ({ isOpen, onClose, experience, onSave, isEditing = false }) => {
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    duration: '',
    description: '',
    location: '',
    employmentType: 'Full-time',
    startDate: '',
    endDate: '',
    current: false
  })

  // Update form data when experience prop changes
  React.useEffect(() => {
    if (experience) {
      setFormData({
        role: experience.role || '',
        company: experience.company || '',
        duration: experience.duration || '',
        description: experience.description || '',
        location: experience.location || '',
        employmentType: experience.employmentType || 'Full-time',
        startDate: experience.startDate || '',
        endDate: experience.endDate || '',
        current: experience.current || false
      })
    } else {
      // Reset form for new experience
      setFormData({
        role: '',
        company: '',
        duration: '',
        description: '',
        location: '',
        employmentType: 'Full-time',
        startDate: '',
        endDate: '',
        current: false
      })
    }
  }, [experience, isOpen])
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Failed to save experience:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Experience" : "Add Experience"}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Job Title *
            </label>
            <input
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="e.g., Software Engineer"
              className="block w-full rounded-xl border-2 border-neutral-200 px-4 py-3 text-base focus:border-primary-500 focus:ring-0 transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Company *
            </label>
            <input
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g., Tech Corp"
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-blue-500 focus:ring-0 transition-colors duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Employment Type
            </label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-blue-500 focus:ring-0 transition-colors duration-200"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Location
            </label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Mumbai, India"
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-blue-500 focus:ring-0 transition-colors duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Start Date *
            </label>
            <input
              name="startDate"
              type="month"
              value={formData.startDate}
              onChange={handleChange}
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-blue-500 focus:ring-0 transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              End Date
            </label>
            <input
              name="endDate"
              type="month"
              value={formData.endDate}
              onChange={handleChange}
              disabled={formData.current}
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-blue-500 focus:ring-0 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="bg-primary-50 p-4 rounded-xl">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="current"
              checked={formData.current}
              onChange={handleChange}
              className="w-5 h-5 text-primary-600 border-2 border-neutral-300 rounded focus:ring-primary-500 focus:ring-2 mr-3"
            />
            <span className="text-sm font-medium text-gray-800">
              I am currently working in this role
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your responsibilities and achievements..."
            rows={5}
            className="block w-full rounded-xl border-2 border-neutral-200 px-4 py-3 text-base focus:border-primary-500 focus:ring-0 transition-colors duration-200 resize-none"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-6 text-base font-semibold rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto py-3 px-6 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            {isEditing ? "Update" : "Add"} Experience
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default EditExperienceModal