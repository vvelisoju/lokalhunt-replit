
import React from 'react'
import { BuildingOfficeIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline'
import Button from '../../ui/Button'

const CompaniesTab = ({ employer, onAddCompany, onEditCompany }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Companies</h3>
        <Button
          onClick={onAddCompany}
          icon={PlusIcon}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Company
        </Button>
      </div>
      <div className="p-6">
        {employer.companies && employer.companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employer.companies.map((company) => (
              <div 
                key={company.id} 
                className={`border rounded-lg p-4 ${
                  company.isDefault 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className={`h-8 w-8 ${
                      company.isDefault ? 'text-blue-600' : 'text-blue-500'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold ${
                          company.isDefault ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {company.name}
                        </h4>
                        {company.isDefault && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{company.industry}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onEditCompany(company)}
                    icon={PencilIcon}
                  >
                    Edit
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size:</span>
                    <span className="text-gray-900">{company.companySize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span className="text-gray-900">{company.city?.name || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Website:</span>
                    <span className="text-blue-600">{company.website || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No companies registered yet</p>
            <Button
              onClick={onAddCompany}
              icon={PlusIcon}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create First Company
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CompaniesTab
