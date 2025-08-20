import React from 'react'
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
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={onMenuClick}
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Page title - hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <h1 className="text-2xl font-semibold text-gray-900">
              Employer Portal
            </h1>
          </div>

          {/* Right side - notifications and user menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>

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