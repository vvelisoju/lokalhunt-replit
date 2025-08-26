import React, { useState } from 'react'
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Image,
  ActivityIndicator 
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../hooks/useAuth'
import { showToast } from '../../components/ui/Toast'

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      showToast.error('Error', 'Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        showToast.success('Success', 'Login successful!')
        // Navigation will be handled by auth state change
      } else {
        showToast.error('Login Failed', result.error)
      }
    } catch (error) {
      showToast.error('Error', 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="px-6 pt-12">
          {/* Logo and Branding */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl items-center justify-center mb-4">
              <Text className="text-white text-2xl font-bold">LH</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-800">LokalHunt</Text>
            <Text className="text-gray-600 text-center mt-2">
              Find your dream job locally
            </Text>
          </View>

          {/* Login Form */}
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-xl font-semibold text-gray-800 mb-6">Login to your account</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>

              <TouchableOpacity 
                className="bg-primary-500 rounded-xl py-4 mt-6"
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center text-base font-semibold">
                    Login
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Link */}
          <View className="mt-8 items-center">
            <Text className="text-gray-600">Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-primary-500 font-semibold mt-1">Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}