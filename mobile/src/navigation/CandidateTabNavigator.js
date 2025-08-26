import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, Text } from 'react-native'

import CandidateDashboardScreen from '../screens/candidate/DashboardScreen'
import BrowseJobsScreen from '../screens/candidate/BrowseJobsScreen'
import AppliedJobsScreen from '../screens/candidate/AppliedJobsScreen'
import BookmarksScreen from '../screens/candidate/BookmarksScreen'
import CandidateProfileScreen from '../screens/candidate/ProfileScreen'

const Tab = createBottomTabNavigator()

// Tab Bar Icon Component
const TabBarIcon = ({ name, focused, color }) => (
  <View className="items-center justify-center">
    <Text style={{ color, fontSize: focused ? 20 : 18 }}>{name}</Text>
  </View>
)

export default function CandidateTabNavigator() {
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
        tabBarActiveTintColor: '#3B82F6',
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
        component={CandidateDashboardScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="🏠" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="BrowseJobs" 
        component={BrowseJobsScreen}
        options={{
          tabBarLabel: 'Browse',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="🔍" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="AppliedJobs" 
        component={AppliedJobsScreen}
        options={{
          tabBarLabel: 'Applied',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="📋" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Bookmarks" 
        component={BookmarksScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="🔖" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={CandidateProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="👤" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}