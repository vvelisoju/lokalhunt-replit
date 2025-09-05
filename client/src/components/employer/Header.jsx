import React from 'react'
import {
  Bars3Icon,
  BellIcon,
  ArrowLeftIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { useRole } from '../../context/RoleContext'
import ProfileDropdown from '../ui/ProfileDropdown'
import Button from '../ui/Button' // Assuming Button component is imported from a local UI library
import { UserCircleIcon } from '@heroicons/react/24/solid' // Assuming UserCircleIcon is used
import NotificationBell from '../ui/NotificationBell'; // Import NotificationBell

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const { isAdminView, targetEmployer } = useRole()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  // Dummy functions for illustration, replace with actual implementations if needed
  const onNotificationClick = () => {
    console.log('Notification clicked');
  };
  const onToggleMenu = () => {
    console.log('Toggle menu clicked');
  };


  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* Role Indicator for Branch Admin */}
      {isAdminView() && (
        <div className="bg-purple-50 border-b border-purple-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Viewing as Admin
                </span>
                <span className="ml-3 text-sm text-purple-700">
                  Employer: {targetEmployer?.companyName || 'Unknown Company'}
                </span>
              </div>
              <Link to="/branch-admin/employers" className="text-purple-600 hover:text-purple-800 flex items-center text-sm">
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Employers List
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-16">
          {/* Left side - Mobile menu button and logo */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-3 sm:p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onMenuClick}
            >
              <Bars3Icon className="h-8 sm:h-6 w-8 sm:w-6" aria-hidden="true" />
            </button>

            {/* Logo - shown on mobile, hidden on desktop */}
            <div className="lg:hidden flex items-center">
              <Link to="/employer" className="flex items-center">
                <img
                  src="/images/logo.png"
                  alt="LokalHunt"
                  className="h-12 sm:h-8 w-auto"
                />
              </Link>
            </div>

            {/* Page title - hidden on mobile, shown on desktop */}
            <div className="hidden lg:block">
              <h1 className="text-2xl font-semibold text-gray-900">
                Employer Portal
              </h1>
            </div>
          </div>

          {/* Right side - Post Job + notifications and user menu */}
          <div className="flex items-center space-x-3">
            {/* Post Job Button - Hidden on mobile */}
            <Link
              to={
                isAdminView()
                  ? `/branch-admin/employers/${targetEmployer?.id}/ads/new`
                  : "/employer/ads/new"
              }
              className="hidden sm:flex w-8 h-8 bg-green-600 hover:bg-green-700 rounded-full items-center justify-center transition-colors duration-200"
              title="Post Job"
            >
              <PlusIcon className="w-4 h-4 text-white" />
            </Link>

            {/* Notifications */}
            <NotificationBell />

            {/* User profile dropdown */}
            <ProfileDropdown
              user={{...user, role: 'EMPLOYER'}}
              logout={logout}
              onLanguageChange={changeLanguage}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header