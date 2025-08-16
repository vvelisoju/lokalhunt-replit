import React from 'react'
import { 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ArchiveBoxIcon,
  UserGroupIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

const KpiCards = ({ stats }) => {
  const kpis = [
    {
      name: 'Total Ads',
      value: stats?.totalAds || 0,
      icon: DocumentTextIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Pending Approval',
      value: stats?.pendingApproval || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Approved',
      value: stats?.approved || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Draft',
      value: stats?.draft || 0,
      icon: EyeIcon,
      color: 'bg-gray-500'
    },
    {
      name: 'Archived',
      value: stats?.archived || 0,
      icon: ArchiveBoxIcon,
      color: 'bg-red-500'
    },
    {
      name: 'Allocated Candidates',
      value: stats?.allocatedCandidates || 0,
      icon: UserGroupIcon,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpis.map((kpi) => (
        <div key={kpi.name} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`${kpi.color} rounded-md p-3`}>
              <kpi.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{kpi.name}</p>
              <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default KpiCards