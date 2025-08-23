import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronDownIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'

const ProfileDropdown = ({ user, logout, onLanguageChange }) => {
  const { t, i18n } = useTranslation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const dropdownRef = useRef(null)

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    setShowUserMenu(false)
    if (onLanguageChange) onLanguageChange(lng)
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

  const handleLogout = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await logout()
      // Don't manually navigate here - let the AuthContext and route protection handle it
    } catch (error) {
      console.error('Logout error:', error)
      // Even on error, the logout function should clear the auth state
    }
  }

  // Role-based styling and dashboard links
  const getRoleConfig = (role) => {
    switch (role) {
      case 'CANDIDATE':
        return {
          ringColor: 'ring-primary-100',
          hoverColor: 'hover:bg-primary-50 hover:text-primary-700',
          roleColor: 'text-blue-600',
          dashboardLink: '/candidate/dashboard',
          accountSettingsLink: '/candidate/account-settings'
        }
      case 'EMPLOYER':
        return {
          ringColor: 'ring-green-100',
          hoverColor: 'hover:bg-green-50 hover:text-green-700',
          roleColor: 'text-green-600',
          dashboardLink: '/employer/dashboard',
          accountSettingsLink: '/employer/account-settings'
        }
      case 'BRANCH_ADMIN':
        return {
          ringColor: 'ring-blue-100',
          hoverColor: 'hover:bg-blue-50 hover:text-blue-700',
          roleColor: 'text-blue-600',
          dashboardLink: '/branch-admin/dashboard',
          accountSettingsLink: '/branch-admin/account-settings'
        }
      case 'SUPER_ADMIN':
        return {
          ringColor: 'ring-purple-100',
          hoverColor: 'hover:bg-purple-50 hover:text-purple-700',
          roleColor: 'text-purple-600',
          dashboardLink: '/super-admin/dashboard',
          accountSettingsLink: '/super-admin/account-settings'
        }
      default:
        return {
          ringColor: 'ring-gray-100',
          hoverColor: 'hover:bg-gray-50 hover:text-gray-700',
          roleColor: 'text-gray-600',
          dashboardLink: '/dashboard',
          accountSettingsLink: '/account-settings'
        }
    }
  }

  const roleConfig = getRoleConfig(user?.role)

  // Better name extraction logic
  let displayName = 'User'

  // Check for firstName and lastName first (most common case)
  if (user?.firstName || user?.lastName) {
    displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  } 
  // Check for full name
  else if (user?.name) {
    displayName = user.name
  } 
  else if (user?.fullName) {
    displayName = user.fullName
  }
  // Fallback to email username
  else if (user?.email) {
    displayName = user.email.split('@')[0]
  }

  // Ensure we don't have empty displayName
  if (!displayName || displayName.trim() === '') {
    displayName = 'User'
  }

  const avatarUrl = user?.profileImage || user?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=059669&color=fff`

  // Format role display name
  const formatRoleName = (role) => {
    switch (role) {
      case 'BRANCH_ADMIN':
        return 'Branch Admin'
      case 'SUPER_ADMIN':
        return 'Super Admin'
      default:
        return role?.charAt(0) + role?.slice(1).toLowerCase()
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 hover:bg-gray-50 p-1 transition-colors"
        onClick={() => setShowUserMenu(!showUserMenu)}
      >
        <img
          className={`h-8 w-8 rounded-full object-cover ring-2 ${roleConfig.ringColor}`}
          src={avatarUrl}
          alt={displayName}
        />
        <div className="ml-3 hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-700">
            {displayName}
          </p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-400 hidden sm:block" />
      </button>

      {/* Dropdown Menu */}
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700">
              {displayName}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <p className={`text-xs mt-1 ${roleConfig.roleColor}`}>
              {formatRoleName(user?.role)}
            </p>
          </div>

          <div className="py-1">
            {/* Dashboard Link */}
            <Link 
              to={roleConfig.dashboardLink} 
              className={`flex items-center px-4 py-2 text-sm text-gray-700 ${roleConfig.hoverColor} transition-colors`}
              onClick={() => setShowUserMenu(false)}
            >
              <ChartBarIcon className="h-4 w-4 mr-3" />
              Dashboard
            </Link>

            {/* Account Settings Link */}
            <Link 
              to={roleConfig.accountSettingsLink} 
              className={`flex items-center px-4 py-2 text-sm text-gray-700 ${roleConfig.hoverColor} transition-colors`}
              onClick={() => setShowUserMenu(false)}
            >
              <Cog6ToothIcon className="h-4 w-4 mr-3" />
              Account Settings
            </Link>

            {/* Language Toggle */}
            <button 
              className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 ${roleConfig.hoverColor} transition-colors`}
              onClick={() => changeLanguage(i18n.language === 'en' ? 'te' : 'en')}
            >
              <GlobeAltIcon className="h-4 w-4 mr-3" />
              Language: {i18n.language === 'en' ? 'తెలుగు' : 'English'}
            </button>
          </div>

          <div className="border-t border-gray-100 pt-1">
            {/* Sign Out */}
            <button 
              onClick={handleLogout}
              className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 ${roleConfig.hoverColor} transition-colors`}
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown