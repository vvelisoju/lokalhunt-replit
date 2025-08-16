import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, EyeIcon, ExclamationTriangleIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

import KpiCards from '../../components/employer/KpiCards'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import { getAds } from '../../services/employer/ads'
import { getMous } from '../../services/employer/mou'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentAds, setRecentAds] = useState([])
  const [activeMou, setActiveMou] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Load ads for stats and recent ads
      const adsResult = await getAds({ limit: 5 })
      if (adsResult.success) {
        const ads = adsResult.data.data || []
        setRecentAds(ads)
        
        // Calculate stats
        const stats = {
          totalAds: ads.length,
          draft: ads.filter(ad => ad.status === 'DRAFT').length,
          pendingApproval: ads.filter(ad => ad.status === 'PENDING_APPROVAL').length,
          approved: ads.filter(ad => ad.status === 'APPROVED').length,
          archived: ads.filter(ad => ad.status === 'ARCHIVED').length,
          allocatedCandidates: ads.reduce((sum, ad) => sum + (ad._count?.allocations || 0), 0)
        }
        setStats(stats)
      }

      // Load MOU info
      const mouResult = await getMous()
      if (mouResult.success) {
        const mous = mouResult.data.data || []
        const active = mous.find(mou => mou.status === 'ACTIVE')
        setActiveMou(active)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setIsLoading(false)
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
      <div className="py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your job postings and candidates</p>
          </div>
          <div className="flex space-x-4">
            <Link to="/employer/ads">
              <Button variant="secondary">
                <EyeIcon className="h-4 w-4 mr-2" />
                View All Ads
              </Button>
            </Link>
            <Link to="/employer/ads/new">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New Ad
              </Button>
            </Link>
          </div>
        </div>

        {/* MOU Status Alert */}
        {!activeMou && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  MOU Required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You need an active MOU to submit job postings for approval.{' '}
                    <Link 
                      to="/employer/mou" 
                      className="font-medium underline hover:text-yellow-600"
                    >
                      Contact Branch Admin to set up your MOU
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="mb-8">
          <KpiCards stats={stats} />
        </div>

        {/* Recent Ads */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Job Ads</h2>
          </div>
          <div className="p-6">
            {recentAds.length > 0 ? (
              <div className="space-y-4">
                {recentAds.map((ad) => (
                  <div key={ad.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <Link 
                        to={`/employer/ads/${ad.id}/edit`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {ad.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        {ad.company?.name} • {ad.city} • Created {new Date(ad.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ad.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                        ad.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                        ad.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {ad.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {ad._count?.allocations || 0} candidates
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No ads yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first job posting.
                </p>
                <div className="mt-6">
                  <Link to="/employer/ads/new">
                    <Button>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Your First Ad
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard