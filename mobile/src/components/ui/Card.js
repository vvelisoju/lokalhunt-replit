import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

export const Card = ({ children, className = '', onPress, ...props }) => {
  const Component = onPress ? TouchableOpacity : View
  
  return (
    <Component
      className={`bg-white rounded-xl shadow-md p-4 mb-3 border border-gray-100 ${className}`}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      {...props}
    >
      {children}
    </Component>
  )
}

export const CardHeader = ({ children, className = '' }) => (
  <View className={`mb-3 ${className}`}>
    {children}
  </View>
)

export const CardTitle = ({ children, className = '' }) => (
  <Text className={`text-lg font-semibold text-gray-800 ${className}`}>
    {children}
  </Text>
)

export const CardContent = ({ children, className = '' }) => (
  <View className={className}>
    {children}
  </View>
)

export const CardFooter = ({ children, className = '' }) => (
  <View className={`mt-3 pt-3 border-t border-gray-100 ${className}`}>
    {children}
  </View>
)