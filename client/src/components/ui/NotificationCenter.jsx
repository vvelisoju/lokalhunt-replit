import React from 'react';
import { BellIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckIcon as CheckSolidIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationCenter = ({ onClose }) => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'JOB_ALERT':
        return '💼';
      case 'APPLICATION_UPDATE':
        return '📋';
      case 'PROFILE_VIEWED':
        return '👁️';
      case 'NEW_APPLICATION':
        return '📝';
      case 'WELCOME':
        return '🎉';
      case 'JOB_BOOKMARKED':
        return '🔖';
      case 'JOB_VIEW_MILESTONE':
        return '🎯';
      default:
        return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-auto safe-area-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b safe-top">
        <div className="flex items-center space-x-3">
          <BellIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {notifications.length > 0 && unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors px-3 py-1 rounded-md hover:bg-blue-50"
            >
              <CheckSolidIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Mark all as read</span>
              <span className="sm:hidden">Mark all</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Content - Account for safe areas */}
      <div 
        className="overflow-y-auto"
        style={{
          maxHeight: 'calc(100vh - 200px - var(--safe-area-inset-top) - var(--safe-area-inset-bottom))',
          minHeight: '200px'
        }}
      >
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <BellIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-500">
              We'll notify you when something important happens.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`
                  p-3 sm:p-4 hover:bg-gray-50 transition-colors
                  ${!notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                `}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className={`
                        text-sm font-medium text-gray-900
                        ${!notification.read ? 'font-semibold' : ''}
                      `}>
                        {notification.title}
                      </h4>

                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                            title="Mark as read"
                          >
                            <CheckIcon className="h-4 w-4 text-blue-600" />
                          </button>
                        )}

                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                          title="Delete notification"
                        >
                          <TrashIcon className="h-4 w-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safe area aware bottom padding */}
      <div className="safe-bottom h-4"></div>
    </div>
  );
};

export default NotificationCenter;