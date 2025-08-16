import React, { useState, useEffect } from 'react'
import { DocumentIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import { getMous } from '../../services/employer/mou'
import { toast } from 'react-hot-toast'

const Mou = () => {
  const [mous, setMous] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeMou, setActiveMou] = useState(null)

  useEffect(() => {
    loadMous()
  }, [])

  const loadMous = async () => {
    setIsLoading(true)
    try {
      const result = await getMous()
      if (result.success) {
        const mousList = result.data.data || []
        setMous(mousList)
        const active = mousList.find(mou => mou.status === 'ACTIVE')
        setActiveMou(active)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Failed to load MOUs')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatFeeStructure = (mou) => {
    if (mou.feeType === 'FIXED') {
      return `₹${mou.feeValue?.toLocaleString()} per placement`
    } else if (mou.feeType === 'PERCENTAGE') {
      return `${mou.feeValue}% of annual salary`
    }
    return 'Not specified'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'EXPIRED':
        return 'bg-red-100 text-red-800'
      case 'TERMINATED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return CheckCircleIcon
      case 'PENDING':
        return ClockIcon
      case 'EXPIRED':
      case 'TERMINATED':
        return ExclamationTriangleIcon
      default:
        return DocumentIcon
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">MOU & Fee Structure</h1>
          <p className="text-gray-600 mt-1">
            Manage your Memorandum of Understanding and fee agreements
          </p>
        </div>

        {/* Active MOU Status */}
        {!activeMou ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  No Active MOU
                </h3>
                <p className="text-yellow-700 mb-4">
                  You need an active MOU (Memorandum of Understanding) to submit job postings for approval. 
                  Contact your Branch Admin to set up your agreement and start posting jobs.
                </p>
                <div className="space-y-2 text-sm text-yellow-700">
                  <p>• MOUs define the commercial terms for candidate placements</p>
                  <p>• Fee structures can be fixed amounts or percentage-based</p>
                  <p>• Only employers with active MOUs can post approved job ads</p>
                </div>
                <div className="mt-4">
                  <Button size="sm">
                    Contact Branch Admin
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <CheckCircleIcon className="h-6 w-6 text-green-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  Active MOU Agreement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-green-700">
                      <strong>Start Date:</strong> {formatDate(activeMou.startDate)}
                    </p>
                    <p className="text-green-700">
                      <strong>End Date:</strong> {formatDate(activeMou.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-700">
                      <strong>Fee Structure:</strong> {formatFeeStructure(activeMou)}
                    </p>
                    <p className="text-green-700">
                      <strong>Status:</strong> Active
                    </p>
                  </div>
                </div>
                {activeMou.terms && (
                  <div className="mt-3">
                    <p className="text-green-700">
                      <strong>Terms:</strong> {activeMou.terms}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MOU History */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">MOU History</h2>
          </div>
          <div className="p-6">
            {mous.length > 0 ? (
              <div className="space-y-6">
                {mous.map((mou) => {
                  const StatusIcon = getStatusIcon(mou.status)
                  return (
                    <div key={mou.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <StatusIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                MOU #{mou.id?.slice(-8)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mou.status)}`}>
                                {mou.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <p><strong>Period:</strong></p>
                                <p>{formatDate(mou.startDate)} - {formatDate(mou.endDate)}</p>
                              </div>
                              <div>
                                <p><strong>Fee Structure:</strong></p>
                                <p>{formatFeeStructure(mou)}</p>
                              </div>
                              <div>
                                <p><strong>Version:</strong></p>
                                <p>v{mou.version}</p>
                              </div>
                            </div>
                            {mou.terms && (
                              <div className="mt-3 text-sm text-gray-700">
                                <p><strong>Terms:</strong></p>
                                <p className="mt-1">{mou.terms}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No MOUs yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Contact your Branch Admin to set up your first MOU agreement.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-800 mb-3">
            About MOUs
          </h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              <strong>What is an MOU?</strong> A Memorandum of Understanding defines the commercial 
              terms between you and LokalHunt for candidate placement services.
            </p>
            <p>
              <strong>Fee Types:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Fixed:</strong> A flat fee per successful placement</li>
              <li><strong>Percentage:</strong> A percentage of the candidate's annual salary</li>
            </ul>
            <p>
              <strong>Need Help?</strong> Contact your Branch Admin to discuss terms, 
              negotiate fees, or set up a new agreement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Mou