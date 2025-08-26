import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Picker } from '@react-native-picker/picker'
import { apiHelpers } from '../../utils/api'
import { API_ENDPOINTS } from '../../utils/constants'
import { Card, CardContent } from '../../components/ui/Card'
import { showToast } from '../../components/ui/Toast'

export default function BrowseJobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([])
  const [categories, setCategories] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: '',
    employmentType: ''
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    searchJobs()
  }, [filters])

  const loadInitialData = async () => {
    try {
      const [categoriesResponse, citiesResponse] = await Promise.all([
        apiHelpers.get(API_ENDPOINTS.PUBLIC.CATEGORIES),
        apiHelpers.get(API_ENDPOINTS.PUBLIC.CITIES)
      ])
      
      setCategories(categoriesResponse.data || [])
      setCities(citiesResponse.data || [])
    } catch (error) {
      showToast.error('Error', 'Failed to load filter options')
    }
  }

  const searchJobs = async () => {
    setLoading(true)
    try {
      const params = {
        ...filters,
        page: 1,
        limit: 20
      }
      
      const response = await apiHelpers.get(API_ENDPOINTS.PUBLIC.JOBS_SEARCH, { params })
      setJobs(response.data?.jobs || [])
    } catch (error) {
      showToast.error('Error', 'Failed to search jobs')
      console.error('Job search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      city: '',
      employmentType: ''
    })
  }

  const formatSalary = (min, max) => {
    if (!min && !max) return null
    if (min && max) return `₹${min} - ₹${max}`
    if (min) return `₹${min}+`
    if (max) return `Up to ₹${max}`
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-4">
        {/* Search Bar */}
        <View className="bg-white rounded-xl px-4 py-3 mb-4 shadow-sm">
          <TextInput
            className="text-base"
            placeholder="Search jobs, companies, keywords..."
            value={filters.search}
            onChangeText={(text) => updateFilter('search', text)}
          />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row space-x-3 px-1">
            {/* Category Filter */}
            <View className="bg-white rounded-xl px-3 py-2 min-w-[120px]">
              <Picker
                selectedValue={filters.category}
                onValueChange={(value) => updateFilter('category', value)}
                style={{ height: 40 }}
              >
                <Picker.Item label="All Categories" value="" />
                {categories.map((cat) => (
                  <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                ))}
              </Picker>
            </View>

            {/* City Filter */}
            <View className="bg-white rounded-xl px-3 py-2 min-w-[120px]">
              <Picker
                selectedValue={filters.city}
                onValueChange={(value) => updateFilter('city', value)}
                style={{ height: 40 }}
              >
                <Picker.Item label="All Cities" value="" />
                {cities.map((city) => (
                  <Picker.Item key={city.id} label={city.name} value={city.id} />
                ))}
              </Picker>
            </View>

            {/* Employment Type Filter */}
            <View className="bg-white rounded-xl px-3 py-2 min-w-[120px]">
              <Picker
                selectedValue={filters.employmentType}
                onValueChange={(value) => updateFilter('employmentType', value)}
                style={{ height: 40 }}
              >
                <Picker.Item label="All Types" value="" />
                <Picker.Item label="Full-time" value="Full-time" />
                <Picker.Item label="Part-time" value="Part-time" />
                <Picker.Item label="Contract" value="Contract" />
                <Picker.Item label="Freelance" value="Freelance" />
              </Picker>
            </View>

            {/* Clear Filters */}
            <TouchableOpacity 
              className="bg-red-50 rounded-xl px-4 py-3 justify-center"
              onPress={clearFilters}
            >
              <Text className="text-red-600 font-medium">Clear</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Jobs List */}
      <ScrollView 
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={searchJobs} />
        }
      >
        {loading && jobs.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-2">Searching jobs...</Text>
          </View>
        ) : jobs.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-lg">No jobs found</Text>
            <Text className="text-gray-400 text-center mt-2">
              Try adjusting your filters or search terms
            </Text>
          </View>
        ) : (
          jobs.map((job) => (
            <Card
              key={job.id}
              className="mb-4"
              onPress={() => navigation.navigate('JobDetails', { jobId: job.id })}
            >
              <CardContent>
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-2">
                    <Text className="text-lg font-semibold text-gray-800">{job.title}</Text>
                    <Text className="text-gray-600">{job.companyName}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-primary-500 text-sm font-medium">{job.location}</Text>
                    <Text className="text-xs text-gray-400 mt-1">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <Text className="text-gray-700 text-sm mb-3" numberOfLines={2}>
                  {job.description}
                </Text>

                <View className="flex-row flex-wrap">
                  <View className="bg-blue-50 px-2 py-1 rounded mr-2 mb-2">
                    <Text className="text-blue-600 text-xs">{job.employmentType}</Text>
                  </View>
                  <View className="bg-purple-50 px-2 py-1 rounded mr-2 mb-2">
                    <Text className="text-purple-600 text-xs">{job.experienceLevel}</Text>
                  </View>
                  {job.salaryMin && job.salaryMax && (
                    <View className="bg-green-50 px-2 py-1 rounded mr-2 mb-2">
                      <Text className="text-green-600 text-xs">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </Text>
                    </View>
                  )}
                </View>

                {job.skills && job.skills.length > 0 && (
                  <View className="flex-row flex-wrap mt-2">
                    {job.skills.slice(0, 3).map((skill, index) => (
                      <View key={index} className="bg-gray-100 px-2 py-1 rounded mr-2 mb-1">
                        <Text className="text-gray-600 text-xs">{skill}</Text>
                      </View>
                    ))}
                    {job.skills.length > 3 && (
                      <View className="bg-gray-100 px-2 py-1 rounded">
                        <Text className="text-gray-600 text-xs">+{job.skills.length - 3} more</Text>
                      </View>
                    )}
                  </View>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}