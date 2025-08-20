
import React from 'react'
import { ChartBarIcon } from '@heroicons/react/24/outline'

const AllocationsTab = ({ employer }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Candidate Allocations</h3>
      </div>
      <div className="p-6">
        {employer.allocations && employer.allocations.length > 0 ? (
          <div className="space-y-4">
            {employer.allocations.map((allocation) => (
              <div key={allocation.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {allocation.candidate?.user?.name}
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📧 {allocation.candidate?.user?.email}</p>
                      <p>💼 {allocation.ad?.title}</p>
                      <p>📅 Allocated: {new Date(allocation.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    allocation.status === 'ALLOCATED' 
                      ? 'bg-green-100 text-green-800'
                      : allocation.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {allocation.status}
                  </span>
                </div>
                {allocation.notes && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Notes:</strong> {allocation.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No allocations yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AllocationsTab
