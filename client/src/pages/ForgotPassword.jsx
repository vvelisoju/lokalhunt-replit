
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormInput from '../components/ui/FormInput'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import PasswordResetOTP from '../components/ui/PasswordResetOTP'
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { authService } from '../services/authService'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState('email') // 'email' or 'otp'
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const handleChange = (e) => {
    setEmail(e.target.value)
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }))
    }
  }

  const validateEmail = () => {
    const newErrors = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateEmail()) return
    
    setIsLoading(true)
    try {
      const result = await authService.forgotPassword(email)

      if (result.success) {
        toast.success('Password reset OTP sent successfully!')
        setCurrentStep('otp')
      } else {
        throw new Error(result.error || 'Failed to send reset email')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      toast.error(error.message || 'Failed to send reset email. Please try again.')
      setErrors({ email: error.message || 'Failed to send reset email. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetSuccess = async () => {
    toast.success('Password reset successfully! Please log in with your new password.')
    navigate('/login')
  }

  const handleBackToEmail = () => {
    setCurrentStep('email')
  }

  // Show OTP verification step
  if (currentStep === 'otp') {
    return (
      <PasswordResetOTP
        email={email}
        onResetSuccess={handleResetSuccess}
        onBack={handleBackToEmail}
        loading={isLoading}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col lg:flex-row">
      {/* Left Panel - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-orange-500 items-center justify-center p-8">
        <div className="max-w-md text-center text-white">
          <div className="flex items-center justify-center mb-8">
            <img src="/images/logo.png" alt="LokalHunt Logo" className="h-14" />
          </div>
          <h1 className="text-4xl font-bold mb-6">Forgot Password?</h1>
          <p className="text-xl mb-8 text-blue-100 leading-relaxed">
            No worries! We'll send you a verification code to reset your password securely
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-300 rounded-full mr-4 flex-shrink-0"></div>
              <span className="text-lg">Enter your email address</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-300 rounded-full mr-4 flex-shrink-0"></div>
              <span className="text-lg">Verify with OTP code</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-300 rounded-full mr-4 flex-shrink-0"></div>
              <span className="text-lg">Set your new password</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Mobile optimized */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <img
                src="/images/logo.png"
                alt="LokalHunt Logo"
                className="h-14"
              />
            </div>

            <p className="text-gray-600 text-base lg:text-lg">
              Reset your password
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-8">
            {/* Back Link */}
            <div className="mb-6">
              <Link 
                to="/login"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Sign In
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Forgot Password
              </h2>
              <p className="text-gray-600 text-center text-sm">
                Enter your email address and we'll send you a verification code to reset your password
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-gray-50 focus:bg-white"
                    }`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  "Send Verification Code"
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Remember your password?{' '}
                <Link 
                  to="/login" 
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
