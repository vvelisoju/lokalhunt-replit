import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../hooks/useAuth'
import { apiHelpers } from '../../utils/api'
import { API_ENDPOINTS } from '../../utils/constants'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { showToast } from '../../components/ui/Toast'

export default function CandidateDashboardScreen({ navigation }) {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    applications: 0,
    bookmarks: 0,
    views: 0
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [featuredJobs, setFeaturedJobs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load dashboard stats and recent data
      const [statsResponse, applicationsResponse, jobsResponse] = await Promise.all([
        apiHelpers.get(API_ENDPOINTS.CANDIDATE.DASHBOARD + '/stats'),
        apiHelpers.get(API_ENDPOINTS.CANDIDATE.APPLICATIONS + '?limit=3'),
        apiHelpers.get(API_ENDPOINTS.PUBLIC.JOBS_FEATURED + '?limit=5')
      ])

      setStats(statsResponse.data || stats)
      setRecentApplications(applicationsResponse.data?.applications || [])
      setFeaturedJobs(jobsResponse.data || [])
    } catch (error) {
      showToast.error('Error', 'Failed to load dashboard data')
      console.error('Dashboard data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadDashboardData} />
        }
      >
        <View className="px-4 pt-6">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-xl text-gray-600">{getGreeting()},</Text>
            <Text className="text-2xl font-bold text-gray-800">
              {user?.firstName || 'Job Seeker'}! 👋
            </Text>
          </View>

          {/* Stats Cards */}
          <View className="flex-row mb-6 space-x-3">
            <View className="flex-1 bg-blue-500 rounded-xl p-4">
              <Text className="text-blue-100 text-sm">Applications</Text>
              <Text className="text-white text-2xl font-bold">{stats.applications}</Text>
            </View>
            <View className="flex-1 bg-green-500 rounded-xl p-4">
              <Text className="text-green-100 text-sm">Bookmarks</Text>
              <Text className="text-white text-2xl font-bold">{stats.bookmarks}</Text>
            </View>
            <View className="flex-1 bg-orange-500 rounded-xl p-4">
              <Text className="text-orange-100 text-sm">Profile Views</Text>
              <Text className="text-white text-2xl font-bold">{stats.views}</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row flex-wrap space-x-2">
                <TouchableOpacity 
                  className="bg-primary-50 px-4 py-2 rounded-lg mb-2"
                  onPress={() => navigation.navigate('BrowseJobs')}
                >
                  <Text className="text-primary-600 font-medium">Browse Jobs</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-green-50 px-4 py-2 rounded-lg mb-2"
                  onPress={() => navigation.navigate('Profile')}
                >
                  <Text className="text-green-600 font-medium">Update Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-orange-50 px-4 py-2 rounded-lg mb-2"
                  onPress={() => navigation.navigate('Bookmarks')}
                >
                  <Text className="text-orange-600 font-medium">My Bookmarks</Text>
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card className="mb-6">
            <CardHeader>
              <View className="flex-row justify-between items-center">
                <CardTitle>Recent Applications</CardTitle>
                <TouchableOpacity onPress={() => navigation.navigate('AppliedJobs')}>
                  <Text className="text-primary-500 text-sm">View All</Text>
                </TouchableOpacity>
              </View>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <Text className="text-gray-500 text-center py-4">
                  No applications yet. Start applying to jobs!
                </Text>
              ) : (
                recentApplications.map((application, index) => (
                  <View key={index} className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                    <View className="flex-1">
                      <Text className="font-medium text-gray-800">{application.jobTitle}</Text>
                      <Text className="text-gray-600 text-sm">{application.companyName}</Text>
                    </View>
                    <View className={`px-2 py-1 rounded-full ${
                      application.status === 'ACCEPTED' ? 'bg-green-100' :
                      application.status === 'REJECTED' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        application.status === 'ACCEPTED' ? 'text-green-600' :
                        application.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {application.status}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </CardContent>
          </Card>

          {/* Featured Jobs */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
            </CardHeader>
            <CardContent>
              {featuredJobs.length === 0 ? (
                <Text className="text-gray-500 text-center py-4">
                  No jobs to show right now
                </Text>
              ) : (
                featuredJobs.slice(0, 3).map((job, index) => (
                  <TouchableOpacity 
                    key={index}
                    className="py-3 border-b border-gray-100 last:border-b-0"
                    onPress={() => navigation.navigate('JobDetails', { jobId: job.id })}
                  >
                    <Text className="font-medium text-gray-800">{job.title}</Text>
                    <Text className="text-gray-600 text-sm">{job.companyName}</Text>
                    <View className="flex-row mt-1">
                      <Text className="text-primary-500 text-xs bg-primary-50 px-2 py-1 rounded">
                        {job.location}
                      </Text>
                      {job.salaryRange && (
                        <Text className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded ml-2">
                          ₹{job.salaryRange}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}