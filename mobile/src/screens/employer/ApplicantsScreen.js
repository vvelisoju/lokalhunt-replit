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

export default function ApplicantsScreen({ navigation }) {
  const [applicants, setApplicants] = useState([])
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadJobs()
  }, [])

  useEffect(() => {
    if (selectedJob) {
      loadApplicants()
    }
  }, [selectedJob])

  const loadJobs = async () => {
    try {
      const response = await apiHelpers.get(`${API_ENDPOINTS.EMPLOYER.ADS}?status=APPROVED`)
      const approvedJobs = response.data?.ads || []
      setJobs(approvedJobs)
      
      if (approvedJobs.length > 0) {
        setSelectedJob(approvedJobs[0].id)
      }
    } catch (error) {
      showToast.error('Error', 'Failed to load jobs')
      console.error('Jobs load error:', error)
    }
  }

  const loadApplicants = async () => {
    if (!selectedJob) return
    
    setLoading(true)
    try {
      const response = await apiHelpers.get(`${API_ENDPOINTS.EMPLOYER.ADS}/${selectedJob}/applicants`)
      setApplicants(response.data?.applicants || [])
    } catch (error) {
      showToast.error('Error', 'Failed to load applicants')
      console.error('Applicants load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const endpoint = status === 'ACCEPTED' ? 'accept' : 'reject'
      await apiHelpers.patch(`${API_ENDPOINTS.EMPLOYER.ADS}/${selectedJob}/applications/${applicationId}/${endpoint}`)
      
      showToast.success('Success', `Application ${status.toLowerCase()}`)
      loadApplicants()
    } catch (error) {
      showToast.error('Error', `Failed to ${status.toLowerCase()} application`)
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

  const selectedJobTitle = jobs.find(job => job.id === selectedJob)?.title || 'Select a job'

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-6">
        {/* Header */}
        <Text className="text-2xl font-bold text-gray-800 mb-6">Applicants</Text>

        {/* Job Selection */}
        {jobs.length > 0 && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Select Job</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {jobs.map((job) => (
                  <TouchableOpacity
                    key={job.id}
                    className={`px-4 py-2 rounded-xl mr-2 ${
                      selectedJob === job.id ? 'bg-secondary-500' : 'bg-gray-200'
                    }`}
                    onPress={() => setSelectedJob(job.id)}
                  >
                    <Text className={`font-medium text-sm ${
                      selectedJob === job.id ? 'text-white' : 'text-gray-600'
                    }`}>
                      {job.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Applicants List */}
      <ScrollView 
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadApplicants} />
        }
      >
        {!selectedJob ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-lg">No approved jobs</Text>
            <Text className="text-gray-400 text-center mt-2 mb-6">
              You need approved job posts to receive applications
            </Text>
            <TouchableOpacity 
              className="bg-secondary-500 px-6 py-3 rounded-xl"
              onPress={() => navigation.navigate('PostJob')}
            >
              <Text className="text-white font-semibold">Post a Job</Text>
            </TouchableOpacity>
          </View>
        ) : loading && applicants.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="text-gray-500 mt-2">Loading applicants...</Text>
          </View>
        ) : applicants.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-lg">No applicants yet</Text>
            <Text className="text-gray-400 text-center mt-2">
              Applications will appear here once candidates apply to "{selectedJobTitle}"
            </Text>
          </View>
        ) : (
          applicants.map((applicant) => (
            <Card key={applicant.id} className="mb-4">
              <CardContent>
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 pr-2">
                    <Text className="text-lg font-semibold text-gray-800">
                      {applicant.candidateName}
                    </Text>
                    <Text className="text-gray-600">{applicant.email}</Text>
                    {applicant.phone && (
                      <Text className="text-gray-600">{applicant.phone}</Text>
                    )}
                  </View>
                  <View className={`px-2 py-1 rounded-full ${getStatusColor(applicant.status)}`}>
                    <Text className="text-xs font-medium capitalize">
                      {applicant.status.toLowerCase()}
                    </Text>
                  </View>
                </View>

                {applicant.experienceLevel && (
                  <View className="mb-2">
                    <Text className="text-sm text-gray-600">
                      Experience: {applicant.experienceLevel}
                    </Text>
                  </View>
                )}

                {applicant.skills && applicant.skills.length > 0 && (
                  <View className="mb-3">
                    <Text className="text-sm text-gray-600 mb-1">Skills:</Text>
                    <View className="flex-row flex-wrap">
                      {applicant.skills.slice(0, 5).map((skill, index) => (
                        <View key={index} className="bg-gray-100 px-2 py-1 rounded mr-2 mb-1">
                          <Text className="text-gray-600 text-xs">{skill}</Text>
                        </View>
                      ))}
                      {applicant.skills.length > 5 && (
                        <View className="bg-gray-100 px-2 py-1 rounded">
                          <Text className="text-gray-600 text-xs">+{applicant.skills.length - 5} more</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {applicant.coverLetter && (
                  <View className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</Text>
                    <Text className="text-sm text-gray-600" numberOfLines={3}>
                      {applicant.coverLetter}
                    </Text>
                  </View>
                )}

                <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                  <Text className="text-xs text-gray-400">
                    Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                  </Text>
                  
                  {applicant.status.toLowerCase() === 'pending' && (
                    <View className="flex-row space-x-2">
                      <TouchableOpacity 
                        className="bg-red-50 px-3 py-1 rounded"
                        onPress={() => updateApplicationStatus(applicant.id, 'REJECTED')}
                      >
                        <Text className="text-red-600 text-xs font-medium">Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className="bg-green-50 px-3 py-1 rounded"
                        onPress={() => updateApplicationStatus(applicant.id, 'ACCEPTED')}
                      >
                        <Text className="text-green-600 text-xs font-medium">Accept</Text>
                      </TouchableOpacity>
                    </View>
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