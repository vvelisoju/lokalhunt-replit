import React, { useState, useEffect } from 'react'
import { LockClosedIcon, EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import FormInput from './FormInput'
import Button from './Button'
import { useToast } from './Toast'

const PasswordResetOTP = ({ 
  email, 
  onResetSuccess, 
  onBack, 
  loading: parentLoading 
}) => {
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(30)

  // Check if OTP is complete (6 digits)
  const isOtpComplete = otp.length === 6

  // Toast notifications
  const { success: showSuccess, error: showError } = useToast()

  // Countdown timer for resend
  useEffect(() => {
    let timer
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return

    setErrors({})
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        // Check for success in response data
        if (data.success !== false && (data.status === 'success' || data.message?.includes('sent') || !data.error)) {
          showSuccess('Password reset OTP sent successfully!')
          setResendCooldown(30)
          // The original code had a cooldown of 60s and a different interval logic.
          // Reverting to 30s cooldown and the original interval logic for consistency.
          // const timer = setInterval(() => {
          //   setResendCooldown((prev) => {
          //     if (prev <= 1) {
          //       clearInterval(timer)
          //       return 0
          //     }
          //     return prev - 1
          //   })
          // }, 1000)
        } else {
          throw new Error(data.message || data.error || 'Failed to resend verification code')
        }
      } else {
        throw new Error(data.message || data.error || 'Failed to resend verification code')
      }
    } catch (error) {
      console.error('Failed to send OTP:', error)
      showError(error.message || 'Failed to send OTP. Please try again.')
      setErrors({ general: 'Failed to send OTP. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'otp') {
      // Only allow numbers and limit to 6 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 6)
      setOtp(numericValue)
    } else if (name === 'password') {
      setPassword(value)
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value)
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }))
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    // Reset errors
    setErrors({})

    // Validate
    const validationErrors = {}

    if (!otp || otp.length !== 6) {
      validationErrors.otp = 'Please enter a valid 6-digit code'
    }

    if (!password || password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters'
    }

    if (password !== confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          password,
          confirmPassword
        })
      })

      const data = await response.json()

      if (response.ok && data.success !== false) {
        showSuccess('Password reset successfully!')
        await onResetSuccess()
      } else {
        throw new Error(data.message || 'Password reset failed')
      }
    } catch (error) {
      console.error('Password reset failed:', error)

      // Show error toast notification
      showError(error.message || 'Invalid OTP. Please try again.')

      // Set form errors to keep user on the same page
      setErrors({ 
        otp: 'Invalid OTP code. Please check and try again.',
        general: error.message || 'Password reset failed. Please try again.' 
      })

      // Clear the OTP input for user to enter a new one
      setOtp('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col lg:flex-row">
      {/* Left Panel - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-orange-500 items-center justify-center p-8">
        <div className="max-w-md text-center text-white">
          <div className="flex items-center justify-center mb-8">
            <img src="/images/logo.png" alt="LokalHunt Logo" className="h-14" />
          </div>
          <h1 className="text-4xl font-bold mb-6">Reset Your Password</h1>
          <p className="text-xl mb-8 text-blue-100 leading-relaxed">
            Verify your identity and set a new password for your LokalHunt account
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-300 rounded-full mr-4 flex-shrink-0"></div>
              <span className="text-lg">Enter the verification code</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-300 rounded-full mr-4 flex-shrink-0"></div>
              <span className="text-lg">Set your new password</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-300 rounded-full mr-4 flex-shrink-0"></div>
              <span className="text-lg">Secure your account</span>
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

            {/* Back Link */}
            <div className="mb-6">
              <button
                onClick={onBack}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isLoading || parentLoading}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Forgot Password
              </button>
            </div>

            <p className="text-gray-600 text-base lg:text-lg">
              Reset your password
            </p>
          </div>

          {/* Reset Form Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-8">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex items-center justify-center mb-4">
                <LockClosedIcon className="h-12 w-12 text-red-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Enter verification code
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                We've sent a 6-digit code to{' '}
                <span className="font-medium text-red-600">{email}</span>
              </p>
            </div>

            {/* Reset Form */}
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Enter 6-digit code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={handleChange}
                  placeholder="000000"
                  className={`w-full px-4 py-4 text-center text-2xl font-mono tracking-widest border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                    errors.otp ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                  }`}
                  maxLength={6}
                  autoComplete="one-time-code"
                />
                {errors.otp && (
                  <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
                )}
              </div>

              {/* Resend Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || isLoading}
                  className={`text-sm font-medium ${
                    resendCooldown > 0 || isLoading
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-red-600 hover:text-red-500 cursor-pointer'
                  }`}
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : 'Resend code'
                  }
                </button>
              </div>

              {/* Password Section */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Set your new password
                </h3>

                {/* New Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={password}
                      onChange={handleChange}
                      placeholder={isOtpComplete ? "Enter your new password" : "Enter OTP first"}
                      disabled={!isOtpComplete}
                      className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                        errors.password
                          ? "border-red-300 bg-red-50"
                          : !isOtpComplete
                          ? "border-gray-200 bg-gray-100 cursor-not-allowed"
                          : "border-gray-200 bg-gray-50 focus:bg-white"
                      }`}
                      required
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                  <p className="text-sm text-gray-500">Must be at least 6 characters</p>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleChange}
                      placeholder={isOtpComplete ? "Confirm your new password" : "Enter OTP first"}
                      disabled={!isOtpComplete}
                      className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                        errors.confirmPassword
                          ? "border-red-300 bg-red-50"
                          : !isOtpComplete
                          ? "border-gray-200 bg-gray-100 cursor-not-allowed"
                          : "border-gray-200 bg-gray-50 focus:bg-white"
                      }`}
                      required
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-4 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  disabled={isLoading || parentLoading}
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isLoading || parentLoading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base"
                >
                  {isLoading || parentLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Resetting...
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PasswordResetOTP