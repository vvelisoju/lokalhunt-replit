/**
 * Firebase Push Notification Utility
 * Handles sending push notifications using Firebase Admin SDK
 */

const admin = require('firebase-admin')
const path = require('path')

// Initialize Firebase Admin SDK
let firebaseApp = null

const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp
  }

  try {
    // Path to service account key file
    const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json')
    
    // Initialize Firebase Admin SDK with service account
    const serviceAccount = require(serviceAccountPath)
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // You can add other Firebase project configs here if needed
    }, 'lokalhunt-push')

    console.log('✅ Firebase Admin SDK initialized successfully')
    return firebaseApp
    
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message)
    console.error('Make sure firebase-service-account.json exists in /server directory')
    throw error
  }
}

/**
 * Send a push notification to a specific device
 * @param {string} deviceToken - The FCM device token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload
 * @param {object} options - Additional notification options
 * @returns {Promise<object>} - Firebase messaging response
 */
const sendPushNotification = async (deviceToken, title, body, data = {}, options = {}) => {
  try {
    // Ensure Firebase is initialized
    const app = initializeFirebase()
    
    // Construct the message payload
    const message = {
      token: deviceToken,
      notification: {
        title: title,
        body: body,
      },
      data: {
        // Convert all data values to strings (Firebase requirement)
        ...Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key])
          return acc
        }, {}),
        // Add timestamp for tracking
        timestamp: new Date().toISOString(),
      },
      // Android specific options
      android: {
        priority: 'high',
        notification: {
          title: title,
          body: body,
          icon: 'ic_notification', // You can customize this
          color: '#3B82F6', // LokalHunt blue color
          sound: 'default',
          ...options.android
        }
      },
      // iOS specific options  
      apns: {
        payload: {
          aps: {
            alert: {
              title: title,
              body: body
            },
            badge: 1,
            sound: 'default',
            ...options.ios
          }
        }
      }
    }

    // Send the message
    const response = await admin.messaging().send(message)
    
    console.log('✅ Push notification sent successfully:', {
      messageId: response,
      title: title,
      body: body,
      token: `${deviceToken.slice(0, 20)}...`,
      timestamp: new Date().toISOString()
    })

    return {
      success: true,
      messageId: response,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('❌ Error sending push notification:', {
      error: error.message,
      code: error.code,
      title: title,
      body: body,
      token: deviceToken ? `${deviceToken.slice(0, 20)}...` : 'undefined',
      timestamp: new Date().toISOString()
    })

    throw {
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Send push notifications to multiple devices
 * @param {string[]} deviceTokens - Array of FCM device tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload
 * @param {object} options - Additional notification options
 * @returns {Promise<object>} - Results summary
 */
const sendPushNotificationMultiple = async (deviceTokens, title, body, data = {}, options = {}) => {
  try {
    // Ensure Firebase is initialized
    const app = initializeFirebase()

    // Construct the multicast message payload
    const message = {
      tokens: deviceTokens,
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key])
          return acc
        }, {}),
        timestamp: new Date().toISOString(),
      },
      android: {
        priority: 'high',
        notification: {
          title: title,
          body: body,
          icon: 'ic_notification',
          color: '#3B82F6',
          sound: 'default',
          ...options.android
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: title,
              body: body
            },
            badge: 1,
            sound: 'default',
            ...options.ios
          }
        }
      }
    }

    // Send to multiple devices
    const response = await admin.messaging().sendEachForMulticast(message)
    
    console.log('✅ Multicast push notifications sent:', {
      successCount: response.successCount,
      failureCount: response.failureCount,
      totalTokens: deviceTokens.length,
      title: title,
      body: body,
      timestamp: new Date().toISOString()
    })

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      totalTokens: deviceTokens.length,
      responses: response.responses,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('❌ Error sending multicast push notifications:', error.message)
    
    throw {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

// Example usage function for testing
const testPushNotification = async () => {
  // This is just an example - replace with actual device token
  const exampleToken = 'your-device-token-here'
  
  try {
    const result = await sendPushNotification(
      exampleToken,
      'Welcome to LokalHunt!',
      'Your job portal is now ready for mobile notifications.',
      { 
        type: 'welcome',
        action: 'open_app'
      }
    )
    console.log('Test notification result:', result)
  } catch (error) {
    console.error('Test notification failed:', error)
  }
}

module.exports = {
  initializeFirebase,
  sendPushNotification,
  sendPushNotificationMultiple,
  testPushNotification
}