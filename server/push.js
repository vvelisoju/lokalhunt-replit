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
    // Get Firebase credentials from environment variables
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required')
    }

    // Parse the service account JSON from environment variable
    let serviceAccount
    try {
      serviceAccount = JSON.parse(serviceAccountKey)
    } catch (parseError) {
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON format: ' + parseError.message)
    }

    // Validate required fields
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('Invalid service account: missing required fields (project_id, private_key, client_email)')
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    }, 'lokalhunt-push')

    console.log('✅ Firebase Admin SDK initialized successfully for project:', serviceAccount.project_id)
    return firebaseApp

  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message)
    console.error('Make sure FIREBASE_SERVICE_ACCOUNT_KEY environment variable contains valid Firebase service account JSON')
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
    console.log('🔍 Push notification request received:', {
      title: title,
      body: body,
      deviceToken: deviceToken ? `${deviceToken.slice(0, 20)}...` : 'null',
      fullTokenLength: deviceToken ? deviceToken.length : 0,
      dataKeys: Object.keys(data),
      timestamp: new Date().toISOString()
    });

    // Log full token for debugging (remove in production)
    console.log('🔧 Full device token for debugging:', deviceToken);

    // Ensure Firebase is initialized
    let app = firebaseApp;
    if (!app) {
      console.log('🔧 Firebase not initialized, initializing now...');
      app = initializeFirebase();
    }

    if (!deviceToken) {
      throw new Error('Device token is required');
    }

    // Validate device token format
    if (typeof deviceToken !== 'string' || deviceToken.length < 10) {
      throw new Error('Invalid device token format');
    }

    const message = {
      token: deviceToken,
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...data,
        // Convert all data values to strings (FCM requirement)
        ...(typeof data === 'object' ? Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        ) : {})
      },
      android: {
        notification: {
          title: title,
          body: body,
          icon: 'ic_stat_notification',
          color: '#4CAF50',
          sound: 'default',
          channelId: 'default',
          priority: 'high',
          visibility: 'public',
          ...options.android
        },
        priority: 'high',
        ttl: 3600000, // 1 hour
        collapseKey: 'lokalhunt_notification'
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
            ...options.apns
          }
        }
      }
    };

    console.log('📤 Sending FCM message:', {
      title: title,
      body: body,
      token: deviceToken.substring(0, 20) + '...',
      hasData: Object.keys(data).length > 0,
      messageStructure: {
        hasNotification: !!message.notification,
        hasAndroidConfig: !!message.android,
        hasApnsConfig: !!message.apns,
        dataFields: Object.keys(message.data)
      }
    });

    const response = await app.messaging().send(message);

    console.log('✅ FCM response received:', {
      messageId: response,
      timestamp: new Date().toISOString(),
      success: true
    });

    return {
      success: true,
      messageId: response,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Push notification failed:', {
      error: error.message,
      code: error.code,
      details: error.details || 'No additional details',
      title: title,
      body: body,
      token: deviceToken ? deviceToken.substring(0, 20) + '...' : 'null',
      timestamp: new Date().toISOString(),
      errorType: error.constructor.name
    });

    return {
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    };
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
    let app = firebaseApp;
    if (!app) {
      app = initializeFirebase();
    }

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
        notification: {
          title: title,
          body: body,
          icon: 'ic_stat_notification',
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
    const response = await app.messaging().sendEachForMulticast(message)

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