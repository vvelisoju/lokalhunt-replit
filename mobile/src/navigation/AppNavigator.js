import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { useAuth } from '../hooks/useAuth'

import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import CandidateTabNavigator from './CandidateTabNavigator'
import EmployerTabNavigator from './EmployerTabNavigator'
import { USER_ROLES } from '../utils/constants'

const Stack = createStackNavigator()

export default function AppNavigator() {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return null // Or a loading screen
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            gestureEnabled: true
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user?.role === USER_ROLES.CANDIDATE ? (
            <Stack.Screen name="CandidateApp" component={CandidateTabNavigator} />
          ) : user?.role === USER_ROLES.EMPLOYER ? (
            <Stack.Screen name="EmployerApp" component={EmployerTabNavigator} />
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  )
}