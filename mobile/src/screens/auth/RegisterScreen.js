import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator 
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Picker } from '@react-native-picker/picker'
import { useAuth } from '../../hooks/useAuth'
import { apiHelpers } from '../../utils/api'
import { API_ENDPOINTS, USER_ROLES } from '../../utils/constants'
import { showToast } from '../../components/ui/Toast'

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: USER_ROLES.CANDIDATE,
    city: '',
    companyName: ''
  })
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      const response = await apiHelpers.get(API_ENDPOINTS.PUBLIC.CITIES)
      setCities(response.data || [])
    } catch (error) {
      console.error('Failed to fetch cities:', error)
    }
  }

  const handleRegister = async () => {
    // Validation
    if (!formData.firstName || !formData.email || !formData.password || !formData.city) {
      showToast.error('Error', 'Please fill in all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      showToast.error('Error', 'Passwords do not match')
      return
    }

    if (formData.role === USER_ROLES.EMPLOYER && !formData.companyName) {
      showToast.error('Error', 'Company name is required for employers')
      return
    }

    setLoading(true)
    try {
      const result = await register(formData)
      if (result.success) {
        showToast.success('Success', 'Account created successfully!')
      } else {
        showToast.error('Registration Failed', result.error)
      }
    } catch (error) {
      showToast.error('Error', 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="px-6 pt-8">
          {/* Header */}
          <View className="items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">Create Account</Text>
            <Text className="text-gray-600 text-center mt-2">
              Join LokalHunt and find opportunities
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-6 shadow-sm">
            {/* Role Selection */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">I am a</Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                    formData.role === USER_ROLES.CANDIDATE 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200'
                  }`}
                  onPress={() => updateFormData('role', USER_ROLES.CANDIDATE)}
                >
                  <Text className={`text-center font-medium ${
                    formData.role === USER_ROLES.CANDIDATE ? 'text-primary-600' : 'text-gray-600'
                  }`}>
                    Job Seeker
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                    formData.role === USER_ROLES.EMPLOYER 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200'
                  }`}
                  onPress={() => updateFormData('role', USER_ROLES.EMPLOYER)}
                >
                  <Text className={`text-center font-medium ${
                    formData.role === USER_ROLES.EMPLOYER ? 'text-primary-600' : 'text-gray-600'
                  }`}>
                    Employer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Fields */}
            <View className="space-y-4">
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">First Name *</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="First name"
                    value={formData.firstName}
                    onChangeText={(text) => updateFormData('firstName', text)}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Last Name</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChangeText={(text) => updateFormData('lastName', text)}
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Email *</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(text) => updateFormData('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Phone</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChangeText={(text) => updateFormData('phone', text)}
                  keyboardType="phone-pad"
                />
              </View>

              {formData.role === USER_ROLES.EMPLOYER && (
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Company Name *</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChangeText={(text) => updateFormData('companyName', text)}
                  />
                </View>
              )}

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">City *</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-xl">
                  <Picker
                    selectedValue={formData.city}
                    onValueChange={(itemValue) => updateFormData('city', itemValue)}
                  >
                    <Picker.Item label="Select a city" value="" />
                    {cities.map((city) => (
                      <Picker.Item 
                        key={city.id} 
                        label={city.name} 
                        value={city.id} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Password *</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Create a password"
                  value={formData.password}
                  onChangeText={(text) => updateFormData('password', text)}
                  secureTextEntry
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Confirm Password *</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateFormData('confirmPassword', text)}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                className="bg-primary-500 rounded-xl py-4 mt-6"
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center text-base font-semibold">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Link */}
          <View className="mt-6 items-center mb-6">
            <Text className="text-gray-600">Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-primary-500 font-semibold mt-1">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}