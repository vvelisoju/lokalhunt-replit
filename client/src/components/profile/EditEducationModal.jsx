import React, { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Button from '../ui/Button'
import FormInput from '../ui/FormInput'
import Modal from '../ui/Modal'

const EditEducationModal = ({ isOpen, onClose, education, onSave, isEditing = false }) => {
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    field: '',
    year: '',
    startYear: '',
    endYear: '',
    grade: '',
    current: false
  })

  // Update form data when education prop changes
  React.useEffect(() => {
    if (education) {
      setFormData({
        institution: education.institution || '',
        degree: education.degree || '',
        field: education.field || '',
        year: education.year || '',
        startYear: education.startYear || '',
        endYear: education.endYear || '',
        grade: education.grade || '',
        current: education.current || false
      })
    } else {
      // Reset form for new education
      setFormData({
        institution: '',
        degree: '',
        field: '',
        year: '',
        startYear: '',
        endYear: '',
        grade: '',
        current: false
      })
    }
  }, [education, isOpen])
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
      console.error('Failed to save education:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Education" : "Add Education"}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              School/University *
            </label>
            <input
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="e.g., Mumbai University"
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-blue-500 focus:ring-0 transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Degree *
            </label>
            <input
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              placeholder="e.g., Bachelor of Technology"
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-blue-500 focus:ring-0 transition-colors duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Field of Study
          </label>
          <input
            name="field"
            value={formData.field}
            onChange={handleChange}
            placeholder="e.g., Computer Science"
            className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-blue-500 focus:ring-0 transition-colors duration-200"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Start Year
            </label>
            <input
              name="startYear"
              type="number"
              value={formData.startYear}
              onChange={handleChange}
              placeholder="e.g., 2019"
              min="1950"
              max="2030"
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-blue-500 focus:ring-0 transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              End Year
            </label>
            <input
              name="endYear"
              type="number"
              value={formData.endYear}
              onChange={handleChange}
              placeholder="e.g., 2023"
              min="1950"
              max="2030"
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
              I am currently studying here
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Grade/CGPA
          </label>
          <input
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            placeholder="e.g., 8.5 CGPA or First Class"
            className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-blue-500 focus:ring-0 transition-colors duration-200"
          />
        </div>
      </div>

      {/* Footer */}
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
          onClick={handleSave}
          disabled={loading || !formData.institution.trim() || !formData.degree.trim()}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </Modal>
  )
}

export default EditEducationModal