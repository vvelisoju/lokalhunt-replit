import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const dropdownRef = useRef(null)

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    setShowUserMenu(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
            <div className="relative" ref={dropdownRef}>
              <button 
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 hover:bg-gray-50 p-1 transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <img
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-green-100"
                  src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name}&background=059669&color=fff`}
                  alt={user?.name || 'Employer'}
                />
                <div className="ml-3 hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.name || 'Employer'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email || 'employer@example.com'}</p>
                </div>
                <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">
                      {user?.name || 'Employer'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email || 'employer@example.com'}</p>
                    <p className="text-xs text-green-600 mt-1">Employer</p>
                  </div>
                  
                  <div className="py-1">
                    <Link 
                      to="/employer/company-profile" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserIcon className="h-4 w-4 mr-3" />
                      Company Profile
                    </Link>
                    
                    <button 
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      onClick={() => changeLanguage(i18n.language === 'en' ? 'te' : 'en')}
                    >
                      <GlobeAltIcon className="h-4 w-4 mr-3" />
                      Language: {i18n.language === 'en' ? 'తెలుగు' : 'English'}
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-1">
                    <button 
                      onClick={() => {
                        setShowUserMenu(false)
                        logout()
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header