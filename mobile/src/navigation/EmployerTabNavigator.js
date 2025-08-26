import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, Text } from 'react-native'

import EmployerDashboardScreen from '../screens/employer/DashboardScreen'
import PostJobScreen from '../screens/employer/PostJobScreen'
import ManageAdsScreen from '../screens/employer/ManageAdsScreen'
import ApplicantsScreen from '../screens/employer/ApplicantsScreen'
import CompanyProfileScreen from '../screens/employer/CompanyProfileScreen'

const Tab = createBottomTabNavigator()

// Tab Bar Icon Component
const TabBarIcon = ({ name, focused, color }) => (
  <View className="items-center justify-center">
    <Text style={{ color, fontSize: focused ? 20 : 18 }}>{name}</Text>
  </View>
)

export default function EmployerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 65,
        },
        tabBarActiveTintColor: '#F97316',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={EmployerDashboardScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="📊" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="PostJob" 
        component={PostJobScreen}
        options={{
          tabBarLabel: 'Post Job',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="➕" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="ManageAds" 
        component={ManageAdsScreen}
        options={{
          tabBarLabel: 'My Jobs',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="📝" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Applicants" 
        component={ApplicantsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="👥" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="CompanyProfile" 
        component={CompanyProfileScreen}
        options={{
          tabBarLabel: 'Company',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="🏢" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}