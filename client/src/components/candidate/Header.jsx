import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useCandidateAuth } from '../../hooks/useCandidateAuth'
import { useTranslation } from 'react-i18next'

const Header = ({ onMenuClick }) => {
  const { user, logout } = useCandidateAuth()
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
    <header className="bg-white border-b border-neutral-200 px-4 py-3 sm:px-6 lg:px-8 h-16">
      <div className="flex items-center justify-between h-full">
        {/* Left side - Mobile menu button + Logo */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
            onClick={onMenuClick}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Page title - hidden on small screens where sidebar logo is visible */}
          <h1 className="ml-4 text-2xl font-semibold text-neutral-900 lg:ml-0 hidden sm:block lg:hidden">
            {t('dashboard.title', 'Dashboard')}
          </h1>
        </div>

        {/* Right side - Language + Notifications + User menu */}
        <div className="flex items-center space-x-3">
          {/* Language Switcher */}
          <div className="relative">
            <button 
              className="p-2 text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-full transition-colors"
              onClick={() => changeLanguage(i18n.language === 'en' ? 'te' : 'en')}
            >
              <GlobeAltIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-full transition-colors">
            <BellIcon className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-secondary-500 ring-2 ring-white"></span>
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:bg-neutral-50 p-1 transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <img
                className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-100"
                src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=1976d2&color=fff`}
                alt={`${user?.firstName} ${user?.lastName}`}
              />
              <div className="ml-3 hidden sm:block text-left">
                <p className="text-sm font-medium text-neutral-700">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-neutral-500">{user?.email}</p>
              </div>
              <ChevronDownIcon className="ml-2 h-4 w-4 text-neutral-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-sm font-medium text-neutral-700">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>
                
                <div className="py-1">
                  <Link 
                    to="/candidate/profile" 
                    className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <UserIcon className="h-4 w-4 mr-3" />
                    {t('header.myProfile', 'My Profile')}
                  </Link>
                  
                  <button 
                    className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    onClick={() => changeLanguage(i18n.language === 'en' ? 'te' : 'en')}
                  >
                    <GlobeAltIcon className="h-4 w-4 mr-3" />
                    {t('header.language', 'Language')}: {i18n.language === 'en' ? 'తెలుగు' : 'English'}
                  </button>
                </div>
                
                <div className="border-t border-neutral-100 pt-1">
                  <button 
                    onClick={() => {
                      setShowUserMenu(false)
                      logout()
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                    {t('header.logout', 'Logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header