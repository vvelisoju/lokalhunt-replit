import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { apiHelpers } from '../../utils/api'
import { API_ENDPOINTS } from '../../utils/constants'
import { Card, CardContent } from '../../components/ui/Card'
import { showToast } from '../../components/ui/Toast'

export default function AppliedJobsScreen({ navigation }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all, pending, accepted, rejected

  useEffect(() => {
    loadApplications()
  }, [filter])

  const loadApplications = async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? { status: filter.toUpperCase() } : {}
      const response = await apiHelpers.get(API_ENDPOINTS.CANDIDATE.APPLICATIONS, { params })
      setApplications(response.data?.applications || [])
    } catch (error) {
      showToast.error('Error', 'Failed to load applications')
      console.error('Applications load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted': return 'bg-green-100 text-green-600'
      case 'rejected': return 'bg-red-100 text-red-600'
      case 'pending': return 'bg-yellow-100 text-yellow-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const FilterButton = ({ label, value, isActive }) => (
    <TouchableOpacity
      className={`px-4 py-2 rounded-xl mr-2 ${
        isActive ? 'bg-primary-500' : 'bg-gray-200'
      }`}
      onPress={() => setFilter(value)}
    >
      <Text className={`font-medium ${
        isActive ? 'text-white' : 'text-gray-600'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-6">
        {/* Header */}
        <Text className="text-2xl font-bold text-gray-800 mb-6">My Applications</Text>

        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row">
            <FilterButton label="All" value="all" isActive={filter === 'all'} />
            <FilterButton label="Pending" value="pending" isActive={filter === 'pending'} />
            <FilterButton label="Accepted" value="accepted" isActive={filter === 'accepted'} />
            <FilterButton label="Rejected" value="rejected" isActive={filter === 'rejected'} />
          </View>
        </ScrollView>
      </View>

      {/* Applications List */}
      <ScrollView 
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadApplications} />
        }
      >
        {loading && applications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-2">Loading applications...</Text>
          </View>
        ) : applications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-lg">No applications found</Text>
            <Text className="text-gray-400 text-center mt-2">
              {filter === 'all' 
                ? 'Start applying to jobs to see them here'
                : `No ${filter} applications`
              }
            </Text>
            <TouchableOpacity 
              className="bg-primary-500 px-6 py-3 rounded-xl mt-4"
              onPress={() => navigation.navigate('BrowseJobs')}
            >
              <Text className="text-white font-semibold">Browse Jobs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          applications.map((application) => (
            <Card 
              key={application.id} 
              className="mb-4"
              onPress={() => navigation.navigate('JobDetails', { jobId: application.jobId })}
            >
              <CardContent>
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 pr-2">
                    <Text className="text-lg font-semibold text-gray-800">
                      {application.jobTitle}
                    </Text>
                    <Text className="text-gray-600">{application.companyName}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${getStatusColor(application.status)}`}>
                    <Text className="text-xs font-medium capitalize">
                      {application.status.toLowerCase()}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm text-gray-500">Applied on</Text>
                  <Text className="text-sm font-medium text-gray-700">
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </Text>
                </View>

                {application.location && (
                  <View className="flex-row items-center mb-2">
                    <Text className="text-primary-500 text-sm">📍 {application.location}</Text>
                  </View>
                )}

                {application.salaryRange && (
                  <View className="flex-row items-center mb-2">
                    <Text className="text-green-600 text-sm">💰 {application.salaryRange}</Text>
                  </View>
                )}

                {application.notes && (
                  <View className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <Text className="text-sm text-gray-700">{application.notes}</Text>
                  </View>
                )}

                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <TouchableOpacity 
                    className="bg-primary-50 px-4 py-2 rounded-lg"
                    onPress={() => navigation.navigate('JobDetails', { jobId: application.jobId })}
                  >
                    <Text className="text-primary-600 font-medium">View Job</Text>
                  </TouchableOpacity>
                  
                  {application.status.toLowerCase() === 'pending' && (
                    <TouchableOpacity className="bg-gray-50 px-4 py-2 rounded-lg">
                      <Text className="text-gray-600 font-medium">Withdraw</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </CardContent>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}