import React from 'react'
import { Link } from 'react-router-dom'
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
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      link: '/employer/ads'
    },
    {
      name: 'Pending Approval',
      value: stats?.pendingApproval || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      bgLight: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      link: '/employer/ads?status=PENDING_APPROVAL'
    },
    {
      name: 'Approved',
      value: stats?.approved || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
      link: '/employer/ads?status=APPROVED'
    },
    {
      name: 'Draft',
      value: stats?.draft || 0,
      icon: EyeIcon,
      color: 'bg-gray-500',
      bgLight: 'bg-gray-50',
      textColor: 'text-gray-600',
      link: '/employer/ads?status=DRAFT'
    },
    {
      name: 'Closed',
      value: stats?.archived || 0,
      icon: ArchiveBoxIcon,
      color: 'bg-red-500',
      bgLight: 'bg-red-50',
      textColor: 'text-red-600',
      link: '/employer/ads?status=ARCHIVED'
    },
    {
      name: 'Allocated Candidates',
      value: stats?.allocatedCandidates || 0,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
      link: '/employer/candidates'
    }
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {kpis.map((kpi) => (
        <Link key={kpi.name} to={kpi.link} className="block">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md active:shadow-sm active:scale-[0.98] transition-all duration-200 cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Icon with background */}
              <div className={`${kpi.bgLight} rounded-2xl p-3 w-14 h-14 flex items-center justify-center`}>
                <kpi.icon className={`h-6 w-6 ${kpi.textColor}`} />
              </div>

              {/* Stats */}
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none">{kpi.value}</p>
                <p className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">{kpi.name}</p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default KpiCards