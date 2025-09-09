import React, { useState, useEffect } from "react";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import {
  XMarkIcon,
  BellIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon as CheckSolidIcon } from "@heroicons/react/24/solid";
import { formatDistanceToNow } from "date-fns";

const NotificationDrawer = ({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onRefresh,
  loading = false,
}) => {
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're running in Capacitor (mobile app)
    const checkMobileEnvironment = async () => {
      try {
        if (typeof window !== "undefined" && window.Capacitor) {
          const { Capacitor } = await import("@capacitor/core");
          setIsMobile(Capacitor.isNativePlatform());
        }
      } catch (error) {
        setIsMobile(false);
      }
    };
    checkMobileEnvironment();
  }, []);

  // Debug logging and refresh on open
  React.useEffect(() => {
    if (isOpen) {
      console.log("🔔 NotificationDrawer opened with:", {
        notifications: notifications,
        notificationsLength: notifications.length,
        unreadCount: unreadCount,
        loading: loading,
      });

      // Refresh notifications when drawer opens (only once when drawer opens)
      if (onRefresh) {
        console.log("🔄 Refreshing notifications...");
        onRefresh();
      }
    }
  }, [isOpen, onRefresh]); // Removed notifications, unreadCount, and loading from dependencies

  const handleMarkAsRead = async (notificationId) => {
    await onMarkAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await onMarkAllAsRead();
  };

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    setDeletingIds((prev) => new Set(prev).add(notificationId));
    try {
      await onDeleteNotification(notificationId);
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "JOB_ALERT":
        return "💼";
      case "APPLICATION_UPDATE":
        return "📋";
      case "PROFILE_VIEWED":
        return "👁️";
      case "NEW_APPLICATION":
        return "📝";
      case "WELCOME":
        return "🎉";
      case "JOB_BOOKMARKED":
        return "🔖";
      case "JOB_VIEW_MILESTONE":
        return "🎯";
      case "INTERVIEW_SCHEDULED":
        return "📅";
      case "JOB_APPROVED":
        return "✅";
      case "JOB_REJECTED":
        return "❌";
      case "JOB_VIEWED":
        return "👀";
      case "JOB_CLOSED":
        return "🚫";
      case "PROFILE_UPDATE":
        return "✏️";
      case "SYSTEM":
        return "⚙️";
      case "PROMOTIONAL":
        return "🎁";
      case "ADMIN_ALERT":
        return "🚨";
      case "NEW_EMPLOYER_REGISTERED":
        return "🏢";
      case "NEW_CANDIDATE_REGISTERED":
        return "👤";
      case "NEW_AD_SUBMITTED":
        return "✍️";
      default:
        return "🔔";
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      direction="right"
      size="100%"
      className="md:!w-96 lg:!w-[28rem] xl:!w-[32rem]"
      style={{
        zIndex: 1000,
      }}
      overlayColor="rgba(0, 0, 0, 0.5)"
      overlayOpacity={0.5}
      enableOverlay={true}
    >
      <div className="h-full bg-white flex flex-col">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-white ${isMobile ? "safe-top fixed-header" : ""}`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <BellIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="p-4 sm:p-6 border-b bg-gray-50">
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={unreadCount === 0}
            >
              <CheckSolidIcon className="h-4 w-4" />
              <span>Mark all as read</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className={`flex-1 overflow-y-auto ${isMobile ? "main-content-with-fixed-header" : ""}`}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500">
                  Loading notifications...
                </p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="mb-6 p-4 bg-gray-100 rounded-full">
                <BellIcon className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500 max-w-sm">
                We'll notify you when something important happens with your
                account or job applications.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`
                    p-4 sm:p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer
                    transform hover:scale-[1.01] hover:shadow-sm
                    ${!notification.read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}
                    ${index === 0 ? "animate-slideInFromRight" : ""}
                  `}
                  onClick={() =>
                    !notification.read && handleMarkAsRead(notification.id)
                  }
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`
                        text-2xl p-2 rounded-full transition-transform duration-200 hover:scale-110
                        ${!notification.read ? "bg-blue-100" : "bg-gray-100"}
                      `}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4
                          className={`
                          text-sm font-medium text-gray-900 line-clamp-2
                          ${!notification.read ? "font-semibold" : ""}
                        `}
                        >
                          {notification.title}
                        </h4>

                        <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="p-1.5 rounded-full hover:bg-blue-100 transition-colors duration-200 group"
                              title="Mark as read"
                            >
                              <CheckIcon className="h-4 w-4 text-blue-600 group-hover:text-blue-700" />
                            </button>
                          )}

                          <button
                            onClick={(e) => handleDelete(notification.id, e)}
                            className="p-1.5 rounded-full hover:bg-red-100 transition-colors duration-200 group"
                            disabled={deletingIds.has(notification.id)}
                            title="Delete notification"
                          >
                            {deletingIds.has(notification.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b border-red-400"></div>
                            ) : (
                              <TrashIcon className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true },
                          )}
                        </p>

                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer for mobile */}
        <div
          className={`sm:hidden p-4 border-t bg-gray-50 ${isMobile ? "safe-bottom fixed-footer" : ""}`}
        >
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideInFromRight {
          animation: slideInFromRight 0.4s ease-out forwards;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </Drawer>
  );
};

export default NotificationDrawer;
