import React, { useState } from 'react'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import Modal from '../ui/Modal'

const statusColors = {
  APPLIED: 'bg-blue-100 text-blue-800',
  SCREENED: 'bg-purple-100 text-purple-800',
  RATED: 'bg-indigo-100 text-indigo-800',
  ALLOCATED: 'bg-yellow-100 text-yellow-800',
  SHORTLISTED: 'bg-green-100 text-green-800',
  INTERVIEW: 'bg-orange-100 text-orange-800',
  HIRED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800'
}

const CandidatesTable = ({ candidates, onStatusUpdate }) => {
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [notes, setNotes] = useState('')

  const handleStatusChange = (allocation, newStatus) => {
    if (['HIRED', 'REJECTED'].includes(newStatus)) {
      setSelectedCandidate(allocation)
      setNotes(allocation.notes || '')
      setShowNotesModal(true)
    } else {
      onStatusUpdate(allocation.id, newStatus)
    }
  }

  const handleConfirmStatusUpdate = () => {
    if (selectedCandidate) {
      onStatusUpdate(selectedCandidate.id, selectedCandidate.status, notes)
      setShowNotesModal(false)
      setSelectedCandidate(null)
      setNotes('')
    }
  }

  if (!candidates.length) {
    return (
      <div className="text-center py-8">
        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Candidates will appear here once they're allocated to this ad.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.map((allocation) => (
                <tr key={allocation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {allocation.candidate?.fullName?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {allocation.candidate?.fullName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {allocation.candidate?.city}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 space-y-1">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {allocation.candidate?.email}
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {allocation.candidate?.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {allocation.rating || 'N/A'}/10
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[allocation.status]}`}>
                      {allocation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <select
                      value={allocation.status}
                      onChange={(e) => handleStatusChange(allocation, e.target.value)}
                      className="rounded border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ALLOCATED">Allocated</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="HIRED">Hired</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                    {allocation.notes && (
                      <button
                        onClick={() => {
                          setSelectedCandidate(allocation)
                          setNotes(allocation.notes)
                          setShowNotesModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ChatBubbleLeftIcon className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes Modal */}
      <Modal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        title="Update Candidate Status"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              Updating status for: <strong>{selectedCandidate?.candidate?.fullName}</strong>
            </p>
            <p className="text-sm text-gray-600">
              New status: <strong>{selectedCandidate?.status}</strong>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Add any notes about this candidate..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowNotesModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmStatusUpdate}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Update Status
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default CandidatesTable