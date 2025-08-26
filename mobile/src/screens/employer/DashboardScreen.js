import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../hooks/useAuth'
import { apiHelpers } from '../../utils/api'
import { API_ENDPOINTS } from '../../utils/constants'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { showToast } from '../../components/ui/Toast'

export default function EmployerDashboardScreen({ navigation }) {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalAds: 0,
    pendingAds: 0,
    approvedAds: 0,
    totalApplications: 0,
    newApplications: 0
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [recentAds, setRecentAds] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load dashboard stats and recent data
      const [dashboardResponse, adsResponse] = await Promise.all([
        apiHelpers.get(API_ENDPOINTS.EMPLOYER.DASHBOARD + '/stats'),
        apiHelpers.get(API_ENDPOINTS.EMPLOYER.ADS + '?limit=5')
      ])

      setStats(dashboardResponse.data || stats)
      setRecentAds(adsResponse.data?.ads || [])
      
      // Try to get recent applications
      try {
        const applicationsResponse = await apiHelpers.get(API_ENDPOINTS.EMPLOYER.APPLICANTS + '?limit=5')
        setRecentApplications(applicationsResponse.data?.applications || [])
      } catch (error) {
        console.log('Applications endpoint might not be available')
      }
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
              {user?.firstName || 'Employer'}! 👋
            </Text>
          </View>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap mb-6 -mx-2">
            <View className="w-1/2 px-2 mb-4">
              <View className="bg-blue-500 rounded-xl p-4">
                <Text className="text-blue-100 text-sm">Total Jobs</Text>
                <Text className="text-white text-2xl font-bold">{stats.totalAds}</Text>
              </View>
            </View>
            <View className="w-1/2 px-2 mb-4">
              <View className="bg-yellow-500 rounded-xl p-4">
                <Text className="text-yellow-100 text-sm">Pending</Text>
                <Text className="text-white text-2xl font-bold">{stats.pendingAds}</Text>
              </View>
            </View>
            <View className="w-1/2 px-2 mb-4">
              <View className="bg-green-500 rounded-xl p-4">
                <Text className="text-green-100 text-sm">Approved</Text>
                <Text className="text-white text-2xl font-bold">{stats.approvedAds}</Text>
              </View>
            </View>
            <View className="w-1/2 px-2 mb-4">
              <View className="bg-secondary-500 rounded-xl p-4">
                <Text className="text-orange-100 text-sm">Applications</Text>
                <Text className="text-white text-2xl font-bold">{stats.totalApplications}</Text>
              </View>
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
                  onPress={() => navigation.navigate('PostJob')}
                >
                  <Text className="text-primary-600 font-medium">Post New Job</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-green-50 px-4 py-2 rounded-lg mb-2"
                  onPress={() => navigation.navigate('ManageAds')}
                >
                  <Text className="text-green-600 font-medium">Manage Jobs</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-orange-50 px-4 py-2 rounded-lg mb-2"
                  onPress={() => navigation.navigate('Applicants')}
                >
                  <Text className="text-orange-600 font-medium">View Applicants</Text>
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>

          {/* Recent Job Posts */}
          <Card className="mb-6">
            <CardHeader>
              <View className="flex-row justify-between items-center">
                <CardTitle>Recent Job Posts</CardTitle>
                <TouchableOpacity onPress={() => navigation.navigate('ManageAds')}>
                  <Text className="text-primary-500 text-sm">View All</Text>
                </TouchableOpacity>
              </View>
            </CardHeader>
            <CardContent>
              {recentAds.length === 0 ? (
                <Text className="text-gray-500 text-center py-4">
                  No job posts yet. Create your first job post!
                </Text>
              ) : (
                recentAds.slice(0, 3).map((ad, index) => (
                  <View key={index} className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                    <View className="flex-1">
                      <Text className="font-medium text-gray-800">{ad.title}</Text>
                      <Text className="text-gray-600 text-sm">{ad.location}</Text>
                    </View>
                    <View className={`px-2 py-1 rounded-full ${
                      ad.status === 'APPROVED' ? 'bg-green-100' :
                      ad.status === 'REJECTED' ? 'bg-red-100' : 
                      ad.status === 'PENDING_APPROVAL' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        ad.status === 'APPROVED' ? 'text-green-600' :
                        ad.status === 'REJECTED' ? 'text-red-600' : 
                        ad.status === 'PENDING_APPROVAL' ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {ad.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          {recentApplications.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <View className="flex-row justify-between items-center">
                  <CardTitle>Recent Applications</CardTitle>
                  <TouchableOpacity onPress={() => navigation.navigate('Applicants')}>
                    <Text className="text-primary-500 text-sm">View All</Text>
                  </TouchableOpacity>
                </View>
              </CardHeader>
              <CardContent>
                {recentApplications.slice(0, 3).map((application, index) => (
                  <View key={index} className="py-3 border-b border-gray-100 last:border-b-0">
                    <Text className="font-medium text-gray-800">{application.candidateName}</Text>
                    <Text className="text-gray-600 text-sm">{application.jobTitle}</Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      Applied {new Date(application.appliedAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}