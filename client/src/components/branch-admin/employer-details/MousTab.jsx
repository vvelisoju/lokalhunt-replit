
import React from 'react'
import { DocumentTextIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline'
import Button from '../../ui/Button'

const MousTab = ({ employer, onCreateMou, onEditMou }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Memorandums of Understanding</h3>
        <Button
          onClick={onCreateMou}
          icon={PlusIcon}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create MOU
        </Button>
      </div>
      <div className="p-6">
        {employer.mous && employer.mous.length > 0 ? (
          <div className="space-y-4">
            {employer.mous.map((mou) => (
              <div key={mou.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{mou.notes || 'MOU Agreement'}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        mou.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {mou.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-2 text-gray-900">{mou.feeType}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <span className="ml-2 text-gray-900">
                          {mou.feeType === 'FIXED' 
                            ? `₹${mou.feeValue?.toLocaleString()}`
                            : `${mou.feeValue}%`
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Valid Until:</span>
                        <span className="ml-2 text-gray-900">
                          {mou.signedAt ? new Date(mou.signedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Version:</span>
                        <span className="ml-2 text-gray-900">{mou.version || '1.0'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={PencilIcon}
                      onClick={() => onEditMou(mou)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No MOUs created yet</p>
            <Button
              onClick={onCreateMou}
              icon={PlusIcon}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create First MOU
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MousTab
