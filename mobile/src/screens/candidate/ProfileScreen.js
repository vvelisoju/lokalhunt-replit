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
import { useAuth } from '../../hooks/useAuth'
import { apiHelpers } from '../../utils/api'
import { API_ENDPOINTS, EXPERIENCE_LEVELS } from '../../utils/constants'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { showToast } from '../../components/ui/Toast'

export default function CandidateProfileScreen() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    experienceLevel: '',
    skills: '',
    bio: '',
    education: '',
    expectedSalary: ''
  })
  const [cities, setCities] = useState([])
  const [educationQualifications, setEducationQualifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
    loadFormData()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const response = await apiHelpers.get(API_ENDPOINTS.CANDIDATE.PROFILE)
      const profileData = response.data
      setProfile({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        city: profileData.cityId || '',
        experienceLevel: profileData.experienceLevel || '',
        skills: Array.isArray(profileData.skills) ? profileData.skills.join(', ') : (profileData.skills || ''),
        bio: profileData.bio || '',
        education: profileData.educationId || '',
        expectedSalary: profileData.expectedSalary || ''
      })
    } catch (error) {
      showToast.error('Error', 'Failed to load profile')
      console.error('Profile load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFormData = async () => {
    try {
      const [citiesResponse, educationResponse] = await Promise.all([
        apiHelpers.get(API_ENDPOINTS.PUBLIC.CITIES),
        apiHelpers.get(API_ENDPOINTS.PUBLIC.EDUCATION_QUALIFICATIONS)
      ])
      
      setCities(citiesResponse.data || [])
      setEducationQualifications(educationResponse.data || [])
    } catch (error) {
      console.error('Failed to load form data:', error)
    }
  }

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const profileData = {
        ...profile,
        skills: profile.skills.split(',').map(skill => skill.trim()).filter(Boolean)
      }
      
      await apiHelpers.put(API_ENDPOINTS.CANDIDATE.PROFILE, profileData)
      showToast.success('Success', 'Profile updated successfully')
    } catch (error) {
      showToast.error('Error', 'Failed to update profile')
      console.error('Profile save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      showToast.info('Logged Out', 'You have been logged out successfully')
    } catch (error) {
      showToast.error('Error', 'Failed to logout')
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-2">Loading profile...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="px-4 pt-6">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">My Profile</Text>
            <TouchableOpacity 
              className="bg-red-50 px-4 py-2 rounded-lg"
              onPress={handleLogout}
            >
              <Text className="text-red-600 font-medium">Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="space-y-4">
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">First Name</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                      value={profile.firstName}
                      onChangeText={(text) => updateProfile('firstName', text)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Last Name</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                      value={profile.lastName}
                      onChangeText={(text) => updateProfile('lastName', text)}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
                  <TextInput
                    className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-500"
                    value={profile.email}
                    editable={false}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Phone</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    value={profile.phone}
                    onChangeText={(text) => updateProfile('phone', text)}
                    keyboardType="phone-pad"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">City</Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-xl">
                    <Picker
                      selectedValue={profile.city}
                      onValueChange={(itemValue) => updateProfile('city', itemValue)}
                    >
                      <Picker.Item label="Select a city" value="" />
                      {cities.map((city) => (
                        <Picker.Item key={city.id} label={city.name} value={city.id} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Experience Level</Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-xl">
                    <Picker
                      selectedValue={profile.experienceLevel}
                      onValueChange={(itemValue) => updateProfile('experienceLevel', itemValue)}
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
                      selectedValue={profile.education}
                      onValueChange={(itemValue) => updateProfile('education', itemValue)}
                    >
                      <Picker.Item label="Select education" value="" />
                      {educationQualifications.map((edu) => (
                        <Picker.Item key={edu.id} label={edu.name} value={edu.id} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Skills (comma separated)</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    value={profile.skills}
                    onChangeText={(text) => updateProfile('skills', text)}
                    placeholder="e.g. JavaScript, React, Node.js"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Expected Salary (per month)</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    value={profile.expectedSalary}
                    onChangeText={(text) => updateProfile('expectedSalary', text)}
                    placeholder="e.g. 25000"
                    keyboardType="numeric"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Bio</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    value={profile.bio}
                    onChangeText={(text) => updateProfile('bio', text)}
                    placeholder="Tell us about yourself..."
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Save Button */}
          <TouchableOpacity 
            className="bg-primary-500 rounded-xl py-4 mb-6"
            onPress={saveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center text-base font-semibold">
                Save Profile
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}