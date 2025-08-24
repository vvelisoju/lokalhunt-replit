import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  DocumentIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const EmployerNavbar = () => {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/employer/dashboard', 
      icon: HomeIcon,
      current: location.pathname === '/employer/dashboard' 
    },
    { 
      name: 'Job Ads', 
      href: '/employer/ads', 
      icon: DocumentTextIcon,
      current: location.pathname.startsWith('/employer/ads') 
    },
    { 
      name: 'Company', 
      href: '/employer/companies', 
      icon: BuildingOfficeIcon,
      current: location.pathname === '/employer/companies' 
    },
    { 
      name: 'MOU & Fees', 
      href: '/employer/mou', 
      icon: DocumentIcon,
      current: location.pathname === '/employer/mou' 
    }
  ]

  const handleLogout = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
      // Still navigate to login even if logout API fails
      navigate('/login', { replace: true })
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/employer/dashboard" className="flex items-center">
              <img 
                src="/images/logo.png" 
                alt="LokalHunt" 
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-700">{user?.fullName}</span>
              <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                Employer
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-500 hover:text-gray-700 text-sm"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-gray-500"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  item.current
                    ? 'text-blue-600 bg-blue-100'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center px-3 py-2">
                <UserCircleIcon className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{user?.fullName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default EmployerNavbar