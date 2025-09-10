import React, { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit About"
      maxWidth="md"
    >
      <div className="space-y-4">
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
            disabled={loading || !summary.trim()}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default EditAboutModal