
import React, { useState, useEffect } from 'react'
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import Button from './Button'

const FileUploadModal = ({ isOpen, onClose, onUpload, title, acceptedTypes = "*" }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Handle ESC key and prevent body scroll
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    setSelectedFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      setSelectedFile(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      await onUpload(selectedFile)
      setSelectedFile(null)
      onClose()
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    onClose()
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getAcceptedTypesText = () => {
    if (acceptedTypes === 'image/*') return 'Images (JPG, PNG, GIF, etc.)'
    if (acceptedTypes === '.pdf,application/pdf') return 'PDF files'
    return 'All file types'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        {/* Consistent backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />
        
        {/* Modal panel - Mobile responsive */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-lg mx-2 sm:mx-4">
          {/* Header - Mobile optimized */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              {title}
            </h3>
            <button
              onClick={handleClose}
              className="rounded-md p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
          
          {/* Content - Mobile responsive */}
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            {/* Upload area */}
            <div
              className={`
                border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer
                ${dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
                ${selectedFile ? 'bg-gray-50' : ''}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById('file-upload-input').click()}
            >
              <input
                id="file-upload-input"
                type="file"
                accept={acceptedTypes}
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="text-green-600">
                    <CloudArrowUpIcon className="h-8 w-8 sm:h-10 sm:w-10 mx-auto" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-900 break-all">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-green-600 font-medium">
                    Ready to upload
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-gray-400">
                    <CloudArrowUpIcon className="h-8 w-8 sm:h-10 sm:w-10 mx-auto" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      Click to select or drag and drop
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {getAcceptedTypesText()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Max 10MB per file
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress indicator */}
            {uploading && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Uploading...</span>
                  <span className="text-gray-600">Please wait</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Mobile optimized */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={uploading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploading}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileUploadModal
