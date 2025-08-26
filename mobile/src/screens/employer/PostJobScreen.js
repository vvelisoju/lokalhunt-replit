import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Picker } from '@react-native-picker/picker'
import { apiHelpers } from '../../utils/api'
import { API_ENDPOINTS, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from '../../utils/constants'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { showToast } from '../../components/ui/Toast'

export default function PostJobScreen({ navigation }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    location: '',
    employmentType: '',
    experienceLevel: '',
    skills: '',
    salaryMin: '',
    salaryMax: '',
    educationId: '',
    genderPreference: '',
    requirements: ''
  })
  const [categories, setCategories] = useState([])
  const [educationQualifications, setEducationQualifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadFormData()
  }, [])

  const loadFormData = async () => {
    setLoading(true)
    try {
      const [categoriesResponse, educationResponse] = await Promise.all([
        apiHelpers.get(API_ENDPOINTS.PUBLIC.CATEGORIES),
        apiHelpers.get(API_ENDPOINTS.PUBLIC.EDUCATION_QUALIFICATIONS)
      ])
      
      setCategories(categoriesResponse.data || [])
      setEducationQualifications(educationResponse.data || [])
    } catch (error) {
      showToast.error('Error', 'Failed to load form data')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.title || !formData.description || !formData.categoryId || !formData.location) {
      showToast.error('Error', 'Please fill in all required fields')
      return false
    }
    
    if (formData.salaryMin && formData.salaryMax) {
      if (parseInt(formData.salaryMin) > parseInt(formData.salaryMax)) {
        showToast.error('Error', 'Minimum salary cannot be higher than maximum salary')
        return false
      }
    }

    return true
  }

  const submitJob = async () => {
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const jobData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null
      }

      await apiHelpers.post(API_ENDPOINTS.EMPLOYER.ADS, jobData)
      showToast.success('Success', 'Job posted successfully!')
      
      // Reset form and navigate to manage ads
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        location: '',
        employmentType: '',
        experienceLevel: '',
        skills: '',
        salaryMin: '',
        salaryMax: '',
        educationId: '',
        genderPreference: '',
        requirements: ''
      })
      
      navigation.navigate('ManageAds')
    } catch (error) {
      showToast.error('Error', error.message || 'Failed to post job')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="text-gray-500 mt-2">Loading form...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="px-4 pt-6">
          {/* Header */}
          <Text className="text-2xl font-bold text-gray-800 mb-6">Post New Job</Text>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Job Title *</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="e.g. Software Developer"
                    value={formData.title}
                    onChangeText={(text) => updateFormData('title', text)}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Category *</Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-xl">
                    <Picker
                      selectedValue={formData.categoryId}
                      onValueChange={(itemValue) => updateFormData('categoryId', itemValue)}
                    >
                      <Picker.Item label="Select a category" value="" />
                      {categories.map((category) => (
                        <Picker.Item key={category.id} label={category.name} value={category.id} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Location *</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="e.g. Hyderabad, Telangana"
                    value={formData.location}
                    onChangeText={(text) => updateFormData('location', text)}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Employment Type</Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-xl">
                    <Picker
                      selectedValue={formData.employmentType}
                      onValueChange={(itemValue) => updateFormData('employmentType', itemValue)}
                    >
                      <Picker.Item label="Select employment type" value="" />
                      {EMPLOYMENT_TYPES.map((type) => (
                        <Picker.Item key={type} label={type} value={type} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Experience Level</Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-xl">
                    <Picker
                      selectedValue={formData.experienceLevel}
                      onValueChange={(itemValue) => updateFormData('experienceLevel', itemValue)}
                    >
                      <Picker.Item label="Select experience level" value="" />
                      {EXPERIENCE_LEVELS.map((level) => (
                        <Picker.Item key={level} label={level} value={level} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Education</Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-xl">
                    <Picker
                      selectedValue={formData.educationId}
                      onValueChange={(itemValue) => updateFormData('educationId', itemValue)}
                    >
                      <Picker.Item label="Select education requirement" value="" />
                      {educationQualifications.map((edu) => (
                        <Picker.Item key={edu.id} label={edu.name} value={edu.id} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Gender Preference</Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-xl">
                    <Picker
                      selectedValue={formData.genderPreference}
                      onValueChange={(itemValue) => updateFormData('genderPreference', itemValue)}
                    >
                      <Picker.Item label="No preference" value="" />
                      <Picker.Item label="Male" value="Male" />
                      <Picker.Item label="Female" value="Female" />
                      <Picker.Item label="Other" value="Other" />
                    </Picker>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Salary & Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="space-y-4">
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Min Salary</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                      placeholder="25000"
                      value={formData.salaryMin}
                      onChangeText={(text) => updateFormData('salaryMin', text)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Max Salary</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                      placeholder="50000"
                      value={formData.salaryMax}
                      onChangeText={(text) => updateFormData('salaryMax', text)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Required Skills</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="e.g. JavaScript, React, Node.js"
                    value={formData.skills}
                    onChangeText={(text) => updateFormData('skills', text)}
                    multiline
                    numberOfLines={3}
                  />
                  <Text className="text-xs text-gray-500 mt-1">Separate skills with commas</Text>
                </View>
              </View>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Description *</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="Describe the job role, responsibilities, and what you're looking for..."
                    value={formData.description}
                    onChangeText={(text) => updateFormData('description', text)}
                    multiline
                    numberOfLines={6}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Requirements</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="Additional requirements or qualifications..."
                    value={formData.requirements}
                    onChangeText={(text) => updateFormData('requirements', text)}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <TouchableOpacity 
            className="bg-secondary-500 rounded-xl py-4 mb-6"
            onPress={submitJob}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center text-base font-semibold">
                Post Job
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}