import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  ChartBarIcon,
  BriefcaseIcon
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

  const handleLogout = () => {
    setShowUserMenu(false)
    logout()
  }

  // Role-based styling and menu items
  const getRoleConfig = (role) => {
    switch (role) {
      case 'CANDIDATE':
        return {
          ringColor: 'ring-primary-100',
          hoverColor: 'hover:bg-primary-50 hover:text-primary-700',
          roleColor: 'text-blue-600',
          menuItems: [
            { to: '/candidate/dashboard', icon: ChartBarIcon, label: 'Dashboard' },
            { to: '/candidate/profile', icon: UserIcon, label: 'My Profile' },
            { to: '/candidate/applications', icon: BriefcaseIcon, label: 'Applications' }
          ]
        }
      case 'EMPLOYER':
        return {
          ringColor: 'ring-green-100',
          hoverColor: 'hover:bg-green-50 hover:text-green-700',
          roleColor: 'text-green-600',
          menuItems: [
            { to: '/employer/dashboard', icon: ChartBarIcon, label: 'Dashboard' },
            { to: '/employer/company-profile', icon: UserIcon, label: 'Company Profile' },
            { to: '/employer/job-ads', icon: BriefcaseIcon, label: 'Job Ads' }
          ]
        }
      case 'BRANCH_ADMIN':
        return {
          ringColor: 'ring-blue-100',
          hoverColor: 'hover:bg-blue-50 hover:text-blue-700',
          roleColor: 'text-blue-600',
          menuItems: [
            { to: '/branch-admin/dashboard', icon: ChartBarIcon, label: 'Dashboard' },
            { to: '/branch-admin/reports', icon: UserIcon, label: 'Admin Profile' },
            { to: '/branch-admin/employers', icon: BriefcaseIcon, label: 'Employers' }
          ]
        }
      default:
        return {
          ringColor: 'ring-gray-100',
          hoverColor: 'hover:bg-gray-50 hover:text-gray-700',
          roleColor: 'text-gray-600',
          menuItems: []
        }
    }
  }

  const roleConfig = getRoleConfig(user?.role)
  const displayName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'
  const avatarUrl = user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=059669&color=fff`

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
              {user?.role === 'BRANCH_ADMIN' ? 'Branch Admin' : user?.role?.charAt(0) + user?.role?.slice(1).toLowerCase()}
            </p>
          </div>
          
          <div className="py-1">
            {roleConfig.menuItems.map((item, index) => (
              <Link 
                key={index}
                to={item.to} 
                className={`flex items-center px-4 py-2 text-sm text-gray-700 ${roleConfig.hoverColor} transition-colors`}
                onClick={() => setShowUserMenu(false)}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Link>
            ))}
            
            <button 
              className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 ${roleConfig.hoverColor} transition-colors`}
              onClick={() => changeLanguage(i18n.language === 'en' ? 'te' : 'en')}
            >
              <GlobeAltIcon className="h-4 w-4 mr-3" />
              Language: {i18n.language === 'en' ? 'తెలుగు' : 'English'}
            </button>
          </div>
          
          <div className="border-t border-gray-100 pt-1">
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