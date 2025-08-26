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

export default function BookmarksScreen({ navigation }) {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBookmarks()
  }, [])

  const loadBookmarks = async () => {
    setLoading(true)
    try {
      const response = await apiHelpers.get(API_ENDPOINTS.CANDIDATE.BOOKMARKS)
      setBookmarks(response.data?.bookmarks || [])
    } catch (error) {
      showToast.error('Error', 'Failed to load bookmarks')
      console.error('Bookmarks load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeBookmark = async (jobId) => {
    try {
      await apiHelpers.delete(`${API_ENDPOINTS.CANDIDATE.BOOKMARKS}/${jobId}`)
      setBookmarks(prev => prev.filter(bookmark => bookmark.jobId !== jobId))
      showToast.success('Success', 'Bookmark removed')
    } catch (error) {
      showToast.error('Error', 'Failed to remove bookmark')
    }
  }

  const formatSalary = (min, max) => {
    if (!min && !max) return null
    if (min && max) return `₹${min} - ₹${max}`
    if (min) return `₹${min}+`
    if (max) return `Up to ₹${max}`
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-6">
        {/* Header */}
        <Text className="text-2xl font-bold text-gray-800 mb-6">My Bookmarks</Text>
      </View>

      {/* Bookmarks List */}
      <ScrollView 
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadBookmarks} />
        }
      >
        {loading && bookmarks.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-2">Loading bookmarks...</Text>
          </View>
        ) : bookmarks.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-6xl mb-4">🔖</Text>
            <Text className="text-gray-500 text-lg">No bookmarks yet</Text>
            <Text className="text-gray-400 text-center mt-2 mb-6">
              Save interesting jobs to view them later
            </Text>
            <TouchableOpacity 
              className="bg-primary-500 px-6 py-3 rounded-xl"
              onPress={() => navigation.navigate('BrowseJobs')}
            >
              <Text className="text-white font-semibold">Browse Jobs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          bookmarks.map((bookmark) => (
            <Card 
              key={bookmark.id} 
              className="mb-4"
              onPress={() => navigation.navigate('JobDetails', { jobId: bookmark.jobId })}
            >
              <CardContent>
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-2">
                    <Text className="text-lg font-semibold text-gray-800">
                      {bookmark.job.title}
                    </Text>
                    <Text className="text-gray-600">{bookmark.job.companyName}</Text>
                  </View>
                  <TouchableOpacity 
                    className="p-2"
                    onPress={() => removeBookmark(bookmark.jobId)}
                  >
                    <Text className="text-red-500 text-lg">❌</Text>
                  </TouchableOpacity>
                </View>

                {bookmark.job.description && (
                  <Text className="text-gray-700 text-sm mb-3" numberOfLines={2}>
                    {bookmark.job.description}
                  </Text>
                )}

                <View className="flex-row flex-wrap mb-3">
                  <View className="bg-blue-50 px-2 py-1 rounded mr-2 mb-2">
                    <Text className="text-blue-600 text-xs">{bookmark.job.employmentType}</Text>
                  </View>
                  <View className="bg-purple-50 px-2 py-1 rounded mr-2 mb-2">
                    <Text className="text-purple-600 text-xs">{bookmark.job.experienceLevel}</Text>
                  </View>
                  <View className="bg-primary-50 px-2 py-1 rounded mr-2 mb-2">
                    <Text className="text-primary-600 text-xs">{bookmark.job.location}</Text>
                  </View>
                  {bookmark.job.salaryMin && bookmark.job.salaryMax && (
                    <View className="bg-green-50 px-2 py-1 rounded mr-2 mb-2">
                      <Text className="text-green-600 text-xs">
                        {formatSalary(bookmark.job.salaryMin, bookmark.job.salaryMax)}
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                  <Text className="text-xs text-gray-400">
                    Saved {new Date(bookmark.createdAt).toLocaleDateString()}
                  </Text>
                  <TouchableOpacity 
                    className="bg-primary-500 px-4 py-2 rounded-lg"
                    onPress={() => navigation.navigate('JobDetails', { jobId: bookmark.jobId })}
                  >
                    <Text className="text-white font-medium">Apply Now</Text>
                  </TouchableOpacity>
                </View>
              </CardContent>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}