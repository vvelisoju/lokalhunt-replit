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
import { useAuth } from '../../hooks/useAuth'
import { apiHelpers } from '../../utils/api'
import { API_ENDPOINTS } from '../../utils/constants'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { showToast } from '../../components/ui/Toast'

export default function CompanyProfileScreen() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState({
    companyName: '',
    industry: '',
    description: '',
    website: '',
    size: '',
    founded: '',
    address: '',
    phone: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCompanyProfile()
  }, [])

  const loadCompanyProfile = async () => {
    setLoading(true)
    try {
      const response = await apiHelpers.get(`${API_ENDPOINTS.EMPLOYER.COMPANY}/profile`)
      const profileData = response.data
      setProfile({
        companyName: profileData.companyName || '',
        industry: profileData.industry || '',
        description: profileData.description || '',
        website: profileData.website || '',
        size: profileData.size || '',
        founded: profileData.founded || '',
        address: profileData.address || '',
        phone: profileData.phone || '',
        email: profileData.email || user?.email || ''
      })
    } catch (error) {
      showToast.error('Error', 'Failed to load company profile')
      console.error('Company profile load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      await apiHelpers.put(`${API_ENDPOINTS.EMPLOYER.COMPANY}/profile`, profile)
      showToast.success('Success', 'Company profile updated successfully')
    } catch (error) {
      showToast.error('Error', 'Failed to update company profile')
      console.error('Company profile save error:', error)
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
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="text-gray-500 mt-2">Loading company profile...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="px-4 pt-6">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">Company Profile</Text>
            <TouchableOpacity 
              className="bg-red-50 px-4 py-2 rounded-lg"
              onPress={handleLogout}
            >
              <Text className="text-red-600 font-medium">Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Basic Company Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Company Name</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    value={profile.companyName}
                    onChangeText={(text) => updateProfile('companyName', text)}
                    placeholder="Enter company name"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Industry</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    value={profile.industry}
                    onChangeText={(text) => updateProfile('industry', text)}
                    placeholder="e.g. Technology, Healthcare, Finance"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Company Size</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    value={profile.size}
                    onChangeText={(text) => updateProfile('size', text)}
                    placeholder="e.g. 1-10, 11-50, 51-200 employees"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Founded Year</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    value={profile.founded}
                    onChangeText={(text) => updateProfile('founded', text)}
                    placeholder="e.g. 2020"
                    keyboardType="numeric"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Website</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    value={profile.website}
                    onChangeText={(text) => updateProfile('website', text)}
                    placeholder="e.g. https://company.com"
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="space-y-4">
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
                    placeholder="Company phone number"
                    keyboardType="phone-pad"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Address</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    value={profile.address}
                    onChangeText={(text) => updateProfile('address', text)}
                    placeholder="Company address"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Company Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>About Company</CardTitle>
            </CardHeader>
            <CardContent>
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Company Description</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                  value={profile.description}
                  onChangeText={(text) => updateProfile('description', text)}
                  placeholder="Tell candidates about your company, culture, and values..."
                  multiline
                  numberOfLines={6}
                />
              </View>
            </CardContent>
          </Card>

          {/* Save Button */}
          <TouchableOpacity 
            className="bg-secondary-500 rounded-xl py-4 mb-6"
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