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

export default function ManageAdsScreen({ navigation }) {
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all, draft, pending, approved, rejected

  useEffect(() => {
    loadAds()
  }, [filter])

  const loadAds = async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? { status: filter.toUpperCase() } : {}
      const response = await apiHelpers.get(API_ENDPOINTS.EMPLOYER.ADS, { params })
      setAds(response.data?.ads || [])
    } catch (error) {
      showToast.error('Error', 'Failed to load job ads')
      console.error('Ads load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitForApproval = async (adId) => {
    try {
      await apiHelpers.patch(`${API_ENDPOINTS.EMPLOYER.ADS}/${adId}/submit`)
      showToast.success('Success', 'Job submitted for approval')
      loadAds()
    } catch (error) {
      showToast.error('Error', 'Failed to submit job for approval')
    }
  }

  const archiveAd = async (adId) => {
    try {
      await apiHelpers.patch(`${API_ENDPOINTS.EMPLOYER.ADS}/${adId}/archive`)
      showToast.success('Success', 'Job archived successfully')
      loadAds()
    } catch (error) {
      showToast.error('Error', 'Failed to archive job')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-600'
      case 'REJECTED': return 'bg-red-100 text-red-600'
      case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-600'
      case 'DRAFT': return 'bg-gray-100 text-gray-600'
      case 'ARCHIVED': return 'bg-gray-100 text-gray-500'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const FilterButton = ({ label, value, isActive }) => (
    <TouchableOpacity
      className={`px-4 py-2 rounded-xl mr-2 ${
        isActive ? 'bg-secondary-500' : 'bg-gray-200'
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
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-800">Manage Jobs</Text>
          <TouchableOpacity 
            className="bg-secondary-500 px-4 py-2 rounded-xl"
            onPress={() => navigation.navigate('PostJob')}
          >
            <Text className="text-white font-medium">+ New Job</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row">
            <FilterButton label="All" value="all" isActive={filter === 'all'} />
            <FilterButton label="Draft" value="draft" isActive={filter === 'draft'} />
            <FilterButton label="Pending" value="pending_approval" isActive={filter === 'pending_approval'} />
            <FilterButton label="Approved" value="approved" isActive={filter === 'approved'} />
            <FilterButton label="Rejected" value="rejected" isActive={filter === 'rejected'} />
          </View>
        </ScrollView>
      </View>

      {/* Ads List */}
      <ScrollView 
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadAds} />
        }
      >
        {loading && ads.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="text-gray-500 mt-2">Loading jobs...</Text>
          </View>
        ) : ads.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-lg">No jobs found</Text>
            <Text className="text-gray-400 text-center mt-2 mb-6">
              {filter === 'all' 
                ? 'Create your first job post to get started'
                : `No ${filter.replace('_', ' ')} jobs`
              }
            </Text>
            <TouchableOpacity 
              className="bg-secondary-500 px-6 py-3 rounded-xl"
              onPress={() => navigation.navigate('PostJob')}
            >
              <Text className="text-white font-semibold">Post Job</Text>
            </TouchableOpacity>
          </View>
        ) : (
          ads.map((ad) => (
            <Card key={ad.id} className="mb-4">
              <CardContent>
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 pr-2">
                    <Text className="text-lg font-semibold text-gray-800">{ad.title}</Text>
                    <Text className="text-gray-600">{ad.location}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${getStatusColor(ad.status)}`}>
                    <Text className="text-xs font-medium">
                      {ad.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                {ad.description && (
                  <Text className="text-gray-700 text-sm mb-3" numberOfLines={2}>
                    {ad.description}
                  </Text>
                )}

                <View className="flex-row flex-wrap mb-3">
                  <View className="bg-blue-50 px-2 py-1 rounded mr-2 mb-2">
                    <Text className="text-blue-600 text-xs">{ad.employmentType}</Text>
                  </View>
                  {ad.experienceLevel && (
                    <View className="bg-purple-50 px-2 py-1 rounded mr-2 mb-2">
                      <Text className="text-purple-600 text-xs">{ad.experienceLevel}</Text>
                    </View>
                  )}
                  {ad.salaryMin && ad.salaryMax && (
                    <View className="bg-green-50 px-2 py-1 rounded mr-2 mb-2">
                      <Text className="text-green-600 text-xs">
                        ₹{ad.salaryMin} - ₹{ad.salaryMax}
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                  <Text className="text-xs text-gray-400">
                    Created {new Date(ad.createdAt).toLocaleDateString()}
                  </Text>
                  <View className="flex-row space-x-2">
                    {ad.status === 'DRAFT' && (
                      <TouchableOpacity 
                        className="bg-blue-50 px-3 py-1 rounded"
                        onPress={() => submitForApproval(ad.id)}
                      >
                        <Text className="text-blue-600 text-xs font-medium">Submit</Text>
                      </TouchableOpacity>
                    )}
                    {(ad.status === 'APPROVED' || ad.status === 'REJECTED') && (
                      <TouchableOpacity 
                        className="bg-gray-50 px-3 py-1 rounded"
                        onPress={() => archiveAd(ad.id)}
                      >
                        <Text className="text-gray-600 text-xs font-medium">Archive</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity className="bg-secondary-50 px-3 py-1 rounded">
                      <Text className="text-secondary-600 text-xs font-medium">Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </CardContent>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}