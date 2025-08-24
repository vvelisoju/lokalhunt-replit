import React from 'react'
import { Link } from 'react-router-dom'
import {
  Bars3Icon,
  BellIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import ProfileDropdown from '../ui/ProfileDropdown'

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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
          <div className="flex items-center space-x-4">
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
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* User profile dropdown */}
            <ProfileDropdown
              user={{...user, role: 'BRANCH_ADMIN'}}
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