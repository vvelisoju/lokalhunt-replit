import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bars3Icon,
  BellIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import ProfileDropdown from '../ui/ProfileDropdown'
import NotificationBell from '../ui/NotificationBell';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()
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

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${isMobile ? 'safe-top' : ''}`}>
      <div className="flex items-center justify-between px-4 py-2 min-h-14">
        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={onMenuClick}
        >
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Page title - hidden on mobile, shown on desktop */}
        <div className="hidden lg:block">
          <h1 className="text-2xl font-semibold text-gray-900">
            Branch Admin Portal
          </h1>
        </div>

        {/* Right side - Employers + notifications and user menu */}
        <div className="flex items-center space-x-2">
          {/* Employers Button */}
          <Link
            to="/branch-admin/employers"
            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors duration-200"
            title="Employers"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>

          {/* Notifications */}
          <NotificationBell />

          {/* User profile dropdown */}
          <ProfileDropdown
            user={{...user, role: 'BRANCH_ADMIN'}}
            logout={logout}
            onLanguageChange={changeLanguage}
          />
        </div>
      </div>
    </header>
  )
}

export default Header