import React, { useState } from 'react'
import Button from './Button'

const FileUploadModal = ({ isOpen, onClose, onUpload, title, acceptedTypes = "*" }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    setSelectedFile(file)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        
        <div className="mb-4">
          <input
            type="file"
            accept={acceptedTypes}
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
          />
        </div>

        {selectedFile && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
            <p className="text-xs text-gray-500">Size: {(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FileUploadModal