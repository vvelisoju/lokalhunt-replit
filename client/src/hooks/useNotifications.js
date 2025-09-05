
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    // Prevent multiple simultaneous fetch calls
    if (fetchingRef.current) {
      console.log('🔔 Fetch already in progress, skipping...');
      return;
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      console.log('🔔 Fetching notifications...');
      
      const response = await api.get('/notifications');
      console.log('🔔 Notifications API Response:', response.data);
      
      if (response.data && response.data.status === 'success') {
        const responseData = response.data.data || {};
        const notifications = responseData.notifications || [];
        const unreadCount = responseData.unreadCount || 0;
        
        console.log('🔔 Processed notifications:', {
          count: notifications.length,
          unreadCount: unreadCount,
          notifications: notifications
        });
        
        setNotifications(notifications);
        setUnreadCount(unreadCount);
      } else {
        console.warn('❌ Unexpected API response structure:', response.data);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('❌ Failed to fetch notifications:', err);
      setError('Failed to load notifications');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      
      // Update local state
      const notificationToDelete = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if deleted notification was unread
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [notifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Refresh function for manual data refresh
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};
