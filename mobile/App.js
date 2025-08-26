import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from './src/hooks/useAuth'
import AppNavigator from './src/navigation/AppNavigator'
import { ToastProvider } from './src/components/ui/Toast'

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
      <ToastProvider />
      <StatusBar style="auto" />
    </AuthProvider>
  )
}
