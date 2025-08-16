import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BriefcaseIcon,
  BookmarkIcon,
  UserIcon,
  DocumentIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Loader from '../../components/ui/Loader'
import { useCandidate } from '../../context/CandidateContext'
import { useCandidateAuth } from '../../hooks/useCandidateAuth'

const Dashboard = () => {
  const { user } = useCandidateAuth()
  const { applications, fetchApplications, loading } = useCandidate()
  const { t } = useTranslation()
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    rejectedApplications: 0,
    interviewScheduled: 0,
    profileViews: 0,
    profileCompletion: 75,
    bookmarks: 0
  })

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch applications if fetchApplications is available
        if (fetchApplications && typeof fetchApplications === 'function') {
          await fetchApplications()
        }
        
        // Fetch dashboard stats - handle missing endpoint gracefully
        try {
          const response = await fetch('/api/candidates/dashboard/stats', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('candidateToken') || localStorage.getItem('token')}`
            }
          })
          
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
              setStats(result.data)
            }
          } else if (response.status === 404) {
            // Dashboard stats endpoint doesn't exist, use defaults
            console.info('Dashboard stats endpoint not implemented, using defaults')
          }
        } catch (statsError) {
          console.warn('Failed to load dashboard stats:', statsError)
          // Continue with default stats
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }
    
    if (user) {
      loadDashboardData()
    }
  }, [user, fetchApplications])

  const quickStats = [
    {
      name: t('stats.applications', 'Applications'),
      value: applications?.length || stats.totalApplications || 0,
      icon: BriefcaseIcon,
      color: 'blue',
      href: '/candidate/applications'
    },
    {
      name: t('stats.bookmarks', 'Bookmarks'),
      value: stats.bookmarks || 0,
      icon: BookmarkIcon,
      color: 'green',
      href: '/candidate/bookmarks'
    },
    {
      name: t('stats.profileViews', 'Profile Views'),
      value: stats.profileViews || 0,
      icon: EyeIcon,
      color: 'purple',
      href: '/candidate/profile'
    },
    {
      name: t('stats.resume', 'Resume'),
      value: user?.resume ? t('stats.uploaded', 'Uploaded') : t('stats.missing', 'Missing'),
      icon: DocumentIcon,
      color: user?.resume ? 'green' : 'red',
      href: '/candidate/resume'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'interview':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (loading) {
    return <Loader.Page />
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section - Mobile optimized */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t('dashboard.welcome', 'Welcome back, {{name}}!', { name: user?.firstName })}
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              {t('dashboard.subtitle', "Here's what's happening with your job search today.")}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link to="/jobs">
              <Button variant="primary" size="sm" className="w-full sm:w-auto">
                <BriefcaseIcon className="h-4 w-4 mr-2" />
                {t('dashboard.browseJobs', 'Browse Jobs')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Completion Alert - Mobile optimized */}
      {stats.profileCompletion < 100 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0">
            <UserIcon className="h-5 w-5 text-primary-600 sm:mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-primary-900">
                {t('dashboard.completeProfile', 'Complete your profile to get better job matches')}
              </h3>
              <div className="mt-2 flex items-center">
                <div className="flex-1 bg-primary-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-gradient-to-r from-primary-600 to-secondary-500 h-2 rounded-full" 
                    style={{ width: `${stats.profileCompletion}%` }}
                  ></div>
                </div>
                <span className="text-xs sm:text-sm text-primary-700 font-medium">
                  {t('sidebar.percentComplete', '{{percent}}% complete', { percent: stats.profileCompletion })}
                </span>
              </div>
            </div>
            <Link to="/candidate/profile" className="sm:ml-4">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                {t('dashboard.completeProfileButton', 'Complete Profile')}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats - Mobile optimized grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.name} to={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                  <div className={`
                    p-2 sm:p-3 rounded-lg mb-2 sm:mb-0
                    ${stat.color === 'blue' ? 'bg-blue-100' : ''}
                    ${stat.color === 'green' ? 'bg-green-100' : ''}
                    ${stat.color === 'purple' ? 'bg-purple-100' : ''}
                    ${stat.color === 'red' ? 'bg-red-100' : ''}
                  `}>
                    <Icon className={`
                      h-4 w-4 sm:h-6 sm:w-6
                      ${stat.color === 'blue' ? 'text-blue-600' : ''}
                      ${stat.color === 'green' ? 'text-green-600' : ''}
                      ${stat.color === 'purple' ? 'text-purple-600' : ''}
                      ${stat.color === 'red' ? 'text-red-600' : ''}
                    `} />
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Recent Applications - Mobile optimized */}
      <Card>
        <Card.Header>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <Card.Title className="text-lg">{t('applications.recent', 'Recent Applications')}</Card.Title>
            <Link to="/candidate/applications">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                {t('applications.viewAll', 'View All')}
              </Button>
            </Link>
          </div>
        </Card.Header>
        <Card.Content>
          {!applications || !Array.isArray(applications) || applications.length === 0 ? (
            <div className="text-center py-8">
              <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t('applications.noApplications', 'No applications yet')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('applications.startApplying', 'Start applying to jobs to track your applications here.')}
              </p>
              <Link to="/jobs" className="mt-4 inline-block">
                <Button>{t('applications.browseJobs', 'Browse Jobs')}</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table view */}
              <div className="hidden md:block">
                <Table>
                  <Table.Header>
                <Table.Row>
                  <Table.Head>Job Title</Table.Head>
                  <Table.Head>Company</Table.Head>
                  <Table.Head>Applied Date</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {(applications && Array.isArray(applications) ? applications : []).slice(0, 5).map((application) => (
                  <Table.Row key={application.id}>
                    <Table.Cell>
                      <div className="font-medium text-gray-900">
                        {application.job?.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {application.job?.location}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {application.job?.company?.name}
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(application.createdAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <span className={getStatusBadge(application.status)}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">
                          {t(`applications.status.${application.status}`, application.status)}
                        </span>
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Link to={`/candidate/applications/${application.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                ))}
                  </Table.Body>
                </Table>
              </div>

              {/* Mobile card view */}
              <div className="md:hidden space-y-4">
                {(applications && Array.isArray(applications) ? applications : []).slice(0, 5).map((application) => (
                  <div key={application.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {application.job?.title}
                        </h4>
                        <p className="text-sm text-gray-600">{application.job?.company?.name}</p>
                        <p className="text-xs text-gray-500">{application.job?.location}</p>
                      </div>
                      <span className={getStatusBadge(application.status)}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize text-xs">
                          {t(`applications.status.${application.status}`, application.status)}
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Applied: {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Recommended Jobs */}
      <Card>
        <Card.Header>
          <Card.Title>{t('jobs.recommended', 'Recommended Jobs')}</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t('jobs.noJobs', 'No recommendations yet')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('jobs.checkBack', 'Complete your profile to get personalized job recommendations.')}
            </p>
            <Link to="/candidate/profile" className="mt-4 inline-block">
              <Button>{t('dashboard.completeProfileButton', 'Complete Profile')}</Button>
            </Link>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}

export default Dashboard