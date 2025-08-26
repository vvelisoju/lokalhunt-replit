// Storage utilities for mobile app
import AsyncStorage from '@react-native-async-storage/async-storage'

// Storage interface for React Native
export const storage = {
  async getItem(key) {
    return await AsyncStorage.getItem(key)
  },

  async setItem(key, value) {
    return await AsyncStorage.setItem(key, value)
  },

  async removeItem(key) {
    return await AsyncStorage.removeItem(key)
  },

  async clear() {
    return await AsyncStorage.clear()
  }
}

// Token management
export const tokenStorage = {
  async getToken() {
    return await storage.getItem('token')
  },

  async setToken(token) {
    return await storage.setItem('token', token)
  },

  async removeToken() {
    return await storage.removeItem('token')
  },

  async getUserRole() {
    return await storage.getItem('userRole')
  },

  async setUserRole(role) {
    return await storage.setItem('userRole', role)
  }
}