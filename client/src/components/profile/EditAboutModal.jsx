import React, { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Button from '../ui/Button'

const EditAboutModal = ({ isOpen, onClose, currentSummary, onSave }) => {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)

  // Update summary when modal opens or currentSummary changes
  useEffect(() => {
    if (isOpen) {
      setSummary(currentSummary || '')
    }
  }, [isOpen, currentSummary])

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave(summary)
      // Show success message or toast here if needed
      console.log('Summary saved successfully')
      onClose()
    } catch (error) {
      console.error('Failed to save summary:', error)
      // Show error message or toast here if needed
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Edit About</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Body */}
        <div className="px-6 py-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Summary *
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Write a brief summary about yourself, your experience, and career goals..."
              rows={8}
              maxLength={2000}
              className="block w-full rounded-xl border-2 border-neutral-200 px-4 py-3 text-base focus:border-primary-500 focus:ring-0 transition-colors duration-200 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                {summary.length}/2000 characters
              </p>
              <div className={`text-sm font-medium ${summary.length > 1800 ? 'text-orange-500' : 'text-gray-400'}`}>
                {2000 - summary.length} remaining
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-neutral-100 px-6 py-4">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave}
              disabled={loading || !summary.trim()}
              className="w-full sm:w-auto px-6 py-3"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditAboutModal