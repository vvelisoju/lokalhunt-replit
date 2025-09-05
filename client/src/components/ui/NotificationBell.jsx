
import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import NotificationDrawer from './NotificationDrawer';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationBell = ({ className = "" }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  } = useNotifications();

  // Debug logging
  useEffect(() => {
    console.log('🔔 NotificationBell - notifications:', notifications);
    console.log('🔔 NotificationBell - unreadCount:', unreadCount);
    console.log('🔔 NotificationBell - loading:', loading);
    console.log('🔔 NotificationBell - notifications.length:', notifications?.length);
  }, [notifications, unreadCount, loading]);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={toggleDrawer}
        className={`
          relative p-2 rounded-lg hover:bg-gray-100 transition-colors
          ${className}
        `}
        title="Notifications"
      >
        <BellIcon className="h-6 w-6 text-gray-600" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDeleteNotification={deleteNotification}
        onRefresh={refreshNotifications}
        loading={loading}
      />
    </>
  );
};

export default NotificationBell;
