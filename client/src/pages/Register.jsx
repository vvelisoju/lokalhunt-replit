import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormInput from '../components/ui/FormInput'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon, 
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import CityDropdown from '../components/ui/CityDropdown'

const Register = () => {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('candidate')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    companyName: '',
    role: 'CANDIDATE'
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const cities = [
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'hyderabad', label: 'Hyderabad' },
    { value: 'chennai', label: 'Chennai' },
    { value: 'kolkata', label: 'Kolkata' },
    { value: 'pune', label: 'Pune' }
  ]

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setFormData(prev => ({
      ...prev,
      role: tab === 'candidate' ? 'CANDIDATE' : 'EMPLOYER',
      companyName: tab === 'candidate' ? '' : prev.companyName,
      lastName: tab === 'employer' ? '' : prev.lastName
    }))
    setErrors({})
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleCityChange = (cityId) => {
    setFormData(prev => ({ ...prev, city: cityId }))
    if (errors.city) {
      setErrors(prev => ({ ...prev, city: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = activeTab === 'employer' ? 'Contact person name is required' : 'First name is required'
    }

    if (activeTab === 'candidate' && !formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }

    if (!formData.city) {
      newErrors.city = 'City is required'
    }

    if (formData.role === 'EMPLOYER' && !formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required for employers'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        city: formData.city,
        role: formData.role,
        ...(formData.role === 'EMPLOYER' && { companyName: formData.companyName })
      }

      const result = await register(registrationData)

      if (result.success) {
        toast.success('Registration successful!')
        // Wait a moment for auth context to update, then redirect
        setTimeout(() => {
          if (formData.role === 'EMPLOYER') {
            navigate('/employer/dashboard', { replace: true })
          } else {
            navigate('/candidate/dashboard', { replace: true })
          }
        }, 500)
      } else {
        // Show user-friendly error messages
        let errorMessage = result.error
        if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
          errorMessage = 'An account with this email already exists. Please use a different email or try logging in.'
        } else if (errorMessage.includes('validation')) {
          errorMessage = 'Please check your information and try again.'
        } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          errorMessage = 'Connection error. Please check your internet and try again.'
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Registration error:', error)
      let errorMessage = 'Registration failed. Please try again.'
      if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      }
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Logo and Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-orange-500 items-center justify-center">
        <div className="max-w-md text-center text-white">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <div className="text-blue-600 font-bold text-xl flex items-center">
                <svg className="w-8 h-8 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                LH
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-6">Join LokalHunt</h1>
          <p className="text-xl mb-8 text-blue-100">
            Start your journey to discover amazing local opportunities
          </p>
          <div className="space-y-4 text-left">
            {activeTab === 'candidate' ? (
              <>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
                  <span>Find jobs in your city</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
                  <span>Connect with local employers</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
                  <span>Build your career locally</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
                  <span>Post jobs to local talent</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
                  <span>Manage candidate applications</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
                  <span>Grow your local team</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                <div className="text-white font-bold text-lg flex items-center">
                  <svg className="w-6 h-6 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  LH
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Role Selection Tabs */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Create Account</h2>
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => handleTabChange('candidate')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'candidate'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Job Seeker
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('employer')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'employer'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Employer
                </button>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company Name - First for Employers */}
              {activeTab === 'employer' && (
                <FormInput
                  label="Company Name"
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter your company name"
                  required
                  icon={BuildingOfficeIcon}
                  error={errors.companyName}
                />
              )}

              {/* Name Fields */}
              {activeTab === 'candidate' ? (
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="First Name"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    required
                    icon={UserIcon}
                    error={errors.firstName}
                  />
                  <FormInput
                    label="Last Name"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    required
                    icon={UserIcon}
                    error={errors.lastName}
                  />
                </div>
              ) : (
                <FormInput
                  label="Contact Person Name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter contact person name"
                  required
                  icon={UserIcon}
                  error={errors.firstName}
                />
              )}

              {/* Email and Phone */}
              <FormInput
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                icon={EnvelopeIcon}
                error={errors.email}
              />

              <FormInput
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
                icon={PhoneIcon}
                error={errors.phone}
              />

              {/* City */}
              <CityDropdown
                label="City"
                name="city"
                value={formData.city}
                onChange={handleCityChange}
                error={errors.city}
              />

              {/* Password Fields */}
              <div className="relative">
                <FormInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  icon={LockClosedIcon}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="relative">
                <FormInput
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  icon={LockClosedIcon}
                  error={errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register