import React, { useState, useEffect } from 'react'
import {
  DocumentIcon,
  CloudArrowUpIcon,
  EyeIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import Loader from '../../components/ui/Loader'
import { useCandidate } from '../../context/CandidateContext'
import { useCandidateAuth } from '../../hooks/useCandidateAuth'
import { candidateApi, getImageUrl } from '../../services/candidateApi'

const Resume = () => {
  const { user } = useCandidateAuth()
  const { uploadResume, deleteResume, loading } = useCandidate()
  const [resume, setResume] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchResumeData()
    }
  }, [user])

  const allowedFileTypes = ['.pdf', '.doc', '.docx']
  const maxFileSize = 5 * 1024 * 1024 // 5MB

  const handleFileSelect = (files) => {
    const file = files[0]
    if (!file) return

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    if (!allowedFileTypes.includes(fileExtension)) {
      alert(`Please select a valid file type: ${allowedFileTypes.join(', ')}`)
      return
    }

    // Validate file size
    if (file.size > maxFileSize) {
      alert('File size should be less than 5MB')
      return
    }

    handleUpload(file)
  }

  const handleUpload = async (file) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const uploadedResume = await uploadResume(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setTimeout(() => {
        setResume(uploadedResume)
        setUploadProgress(0)
        setIsUploading(false)
        // Refresh the resume data from backend after successful upload
        fetchResumeData()
      }, 500)
    } catch (error) {
      setUploadProgress(0)
      setIsUploading(false)
      console.error('Upload failed:', error)
    }
  }

  const fetchResumeData = async () => {
    try {
      const response = await candidateApi.getResume()
      setResume(response.data)
    } catch (error) {
      console.log('No resume found or error fetching resume:', error.message)
      setResume(null)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your resume? This action cannot be undone.')) {
      try {
        await deleteResume()
        setResume(null)
        // Refresh data from backend to ensure UI is in sync
        fetchResumeData()
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFileSelect(files)
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase()
    return <DocumentIcon className="h-8 w-8 text-red-500" />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Resume</h1>
        <p className="mt-1 text-gray-600">
          Upload and manage your resume to enhance your job applications
        </p>
      </div>

      {/* Resume Status Alert */}
      {!resume && (
        <Alert
          type="warning"
          title="Resume Required"
          message="Upload your resume to improve your chances of getting hired. Most employers require a resume to consider your application."
        />
      )}

      {resume && (
        <Alert
          type="success"
          title="Resume Uploaded"
          message="Your resume is ready! Employers can now view your qualifications when you apply for jobs."
        />
      )}

      {/* Upload/Current Resume Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card>
          <Card.Header>
            <Card.Title>
              {resume ? 'Update Resume' : 'Upload Resume'}
            </Card.Title>
          </Card.Header>
          <Card.Content>
            {isUploading ? (
              <div className="text-center py-12">
                <Loader size="lg" text="Uploading resume..." />
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-600">{uploadProgress}% complete</p>
              </div>
            ) : (
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                  hover:border-gray-400 cursor-pointer
                `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('resume-upload').click()}
              >
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <p className="text-lg font-medium text-gray-900">
                    Drop your resume here, or click to browse
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Supports PDF, DOC, DOCX up to 5MB
                  </p>
                </div>
                
                <input
                  id="resume-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                
                <div className="mt-6">
                  <Button variant="primary">
                    Choose File
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
              <p>• Maximum file size: 5MB</p>
              <p>• Supported formats: PDF, DOC, DOCX</p>
              <p>• Make sure your resume is up-to-date and error-free</p>
            </div>
          </Card.Content>
        </Card>

        {/* Current Resume */}
        <Card>
          <Card.Header>
            <Card.Title>Current Resume</Card.Title>
          </Card.Header>
          <Card.Content>
            {resume ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  {getFileIcon(resume.fileName)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {resume.fileName || 'resume.pdf'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(resume.fileSize || 0)} • Uploaded {new Date(resume.uploadedAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(getImageUrl(resume.url), '_blank')}
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = getImageUrl(resume.url)
                      link.download = resume.fileName || 'resume.pdf'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700"
                    disabled={loading}
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No resume uploaded
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Upload your resume to start applying for jobs
                </p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Resume Tips */}
      <Card>
        <Card.Header>
          <Card.Title>Resume Tips</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">What to Include</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  Contact information and professional summary
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  Relevant work experience with achievements
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  Education and certifications
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  Skills relevant to your target jobs
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  Keywords from job descriptions
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Best Practices</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  Keep it concise (1-2 pages maximum)
                </li>
                <li className="flex items-start">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  Use a clean, professional format
                </li>
                <li className="flex items-start">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  Proofread for spelling and grammar
                </li>
                <li className="flex items-start">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  Tailor it for each job application
                </li>
                <li className="flex items-start">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  Save as PDF to preserve formatting
                </li>
              </ul>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}

export default Resume