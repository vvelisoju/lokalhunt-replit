
import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronDownIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { getImageUrl } from '../../services/candidateApi'

const ProfileDropdown = ({ user, logout, onLanguageChange }) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [imageError, setImageError] = useState(false)
  const dropdownRef = useRef(null)

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    setShowUserMenu(false)
    if (onLanguageChange) onLanguageChange(lng)
  }

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close dropdown when clicking outside (desktop only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isMobile && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile])

  // Prevent body scroll when bottom sheet is open
  useEffect(() => {
    if (isMobile && showUserMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobile, showUserMenu])

  const handleLogout = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      // Close dropdown first
      setShowUserMenu(false)
      
      // Call context logout with navigate function (handles both state and cleanup)
      await logout(navigate)
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback: clear everything and redirect using navigate
      const { clearAllAuthData } = await import('../../utils/authUtils')
      clearAllAuthData()
      navigate('/login', { replace: true })
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

  // Get profile image URL using the getImageUrl helper function
  const getProfileImageUrl = () => {
    // Check for profile image/photo in various user data structures
    const profileImagePath = user?.profileImage || 
                             user?.profilePhoto || 
                             user?.candidate?.profilePhoto ||
                             user?.candidate?.profileImage;
    
    if (profileImagePath) {
      // Use getImageUrl helper to properly construct the URL
      return getImageUrl(profileImagePath);
    }
    
    // Fallback to generated avatar
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=059669&color=fff`;
  };

  const avatarUrl = getProfileImageUrl();

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.profileImage, user?.profilePhoto]);

  const handleImageError = () => {
    setImageError(true);
  };

  const finalAvatarUrl = imageError ? 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=059669&color=fff` : 
    avatarUrl;

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

  const MenuContent = () => (
    <>
      {/* User Info Header */}
      <div className={`${isMobile ? 'px-6 py-4' : 'px-4 py-3'} border-b border-gray-100`}>
        <div className="flex items-center">
          <img
            className={`${isMobile ? 'h-12 w-12' : 'h-10 w-10'} rounded-full object-cover ring-2 ${roleConfig.ringColor}`}
            src={finalAvatarUrl}
            alt={displayName}
            onError={handleImageError}
          />
          <div className="ml-3 flex-1">
            <p className={`${isMobile ? 'text-base' : 'text-sm'} font-medium text-gray-700`}>
              {displayName}
            </p>
            <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-500`}>{user?.email}</p>
            <p className={`${isMobile ? 'text-sm' : 'text-xs'} mt-1 ${roleConfig.roleColor}`}>
              {formatRoleName(user?.role)}
            </p>
          </div>
          {isMobile && (
            <button
              onClick={() => setShowUserMenu(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className={`${isMobile ? 'py-2' : 'py-1'}`}>
        {/* Dashboard Link */}
        <Link 
          to={roleConfig.dashboardLink} 
          className={`flex items-center ${isMobile ? 'px-6 py-4' : 'px-4 py-2'} text-sm text-gray-700 ${roleConfig.hoverColor} transition-colors`}
          onClick={() => setShowUserMenu(false)}
        >
          <ChartBarIcon className={`${isMobile ? 'h-6 w-6' : 'h-4 w-4'} mr-3`} />
          <span className={isMobile ? 'text-base' : 'text-sm'}>Dashboard</span>
        </Link>

        {/* Account Settings Link */}
        <Link 
          to={roleConfig.accountSettingsLink} 
          className={`flex items-center ${isMobile ? 'px-6 py-4' : 'px-4 py-2'} text-sm text-gray-700 ${roleConfig.hoverColor} transition-colors`}
          onClick={() => setShowUserMenu(false)}
        >
          <Cog6ToothIcon className={`${isMobile ? 'h-6 w-6' : 'h-4 w-4'} mr-3`} />
          <span className={isMobile ? 'text-base' : 'text-sm'}>Account Settings</span>
        </Link>

        {/* Language Toggle */}
        <button 
          className={`w-full flex items-center ${isMobile ? 'px-6 py-4' : 'px-4 py-2'} text-sm text-gray-700 ${roleConfig.hoverColor} transition-colors`}
          onClick={() => changeLanguage(i18n.language === 'en' ? 'te' : 'en')}
        >
          <GlobeAltIcon className={`${isMobile ? 'h-6 w-6' : 'h-4 w-4'} mr-3`} />
          <span className={isMobile ? 'text-base' : 'text-sm'}>
            Language: {i18n.language === 'en' ? 'తెలుగు' : 'English'}
          </span>
        </button>
      </div>

      {/* Sign Out */}
      <div className={`border-t border-gray-100 ${isMobile ? 'pt-2' : 'pt-1'}`}>
        <button 
          onClick={handleLogout}
          className={`w-full flex items-center ${isMobile ? 'px-6 py-4' : 'px-4 py-2'} text-sm text-gray-700 ${roleConfig.hoverColor} transition-colors`}
        >
          <ArrowRightOnRectangleIcon className={`${isMobile ? 'h-6 w-6' : 'h-4 w-4'} mr-3`} />
          <span className={isMobile ? 'text-base' : 'text-sm'}>Sign Out</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button 
          className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 hover:bg-gray-50 p-1 transition-colors"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <img
            className={`h-8 w-8 rounded-full object-cover ring-2 ${roleConfig.ringColor}`}
            src={finalAvatarUrl}
            alt={displayName}
            onError={handleImageError}
          />
          <div className="ml-3 hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-700">
              {displayName}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-400 hidden sm:block" />
        </button>

        {/* Desktop Dropdown Menu */}
        {!isMobile && showUserMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
            <MenuContent />
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <>
          {/* Backdrop */}
          {showUserMenu && (
            <div 
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300"
              onClick={() => setShowUserMenu(false)}
            />
          )}
          
          {/* Bottom Sheet */}
          <div className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ${
            showUserMenu ? 'translate-y-0' : 'translate-y-full'
          }`}>
            <div className="bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
              </div>
              
              <MenuContent />
              
              {/* Safe area padding for devices with home indicator */}
              <div className="pb-safe"></div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default ProfileDropdown
