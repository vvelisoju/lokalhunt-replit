import React from 'react'
import Toast from 'react-native-toast-message'
import { View, Text } from 'react-native'

// Custom toast configurations for LokalHunt branding
const toastConfig = {
  success: (props) => (
    <View className="bg-green-500 mx-4 p-4 rounded-lg shadow-lg border-l-4 border-green-600">
      <Text className="text-white font-semibold text-base">{props.text1}</Text>
      {props.text2 && <Text className="text-green-100 text-sm mt-1">{props.text2}</Text>}
    </View>
  ),
  error: (props) => (
    <View className="bg-red-500 mx-4 p-4 rounded-lg shadow-lg border-l-4 border-red-600">
      <Text className="text-white font-semibold text-base">{props.text1}</Text>
      {props.text2 && <Text className="text-red-100 text-sm mt-1">{props.text2}</Text>}
    </View>
  ),
  info: (props) => (
    <View className="bg-primary-500 mx-4 p-4 rounded-lg shadow-lg border-l-4 border-primary-600">
      <Text className="text-white font-semibold text-base">{props.text1}</Text>
      {props.text2 && <Text className="text-blue-100 text-sm mt-1">{props.text2}</Text>}
    </View>
  ),
  warning: (props) => (
    <View className="bg-yellow-500 mx-4 p-4 rounded-lg shadow-lg border-l-4 border-yellow-600">
      <Text className="text-white font-semibold text-base">{props.text1}</Text>
      {props.text2 && <Text className="text-yellow-100 text-sm mt-1">{props.text2}</Text>}
    </View>
  ),
}

// Toast utility functions
export const showToast = {
  success: (title, message) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      visibilityTime: 4000,
    })
  },
  error: (title, message) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      visibilityTime: 5000,
    })
  },
  info: (title, message) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      visibilityTime: 4000,
    })
  },
  warning: (title, message) => {
    Toast.show({
      type: 'warning',
      text1: title,
      text2: message,
      visibilityTime: 4000,
    })
  },
}

// Toast component with custom config
export const ToastProvider = () => (
  <Toast config={toastConfig} />
)