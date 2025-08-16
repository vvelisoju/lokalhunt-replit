import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import FormInput from '../components/ui/FormInput'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [errors, setErrors] = useState({})

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
      // Simulate API call - replace with actual forgot password service
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsEmailSent(true)
      toast.success('Password reset email sent successfully!')
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.')
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
          <h1 className="text-4xl font-bold mb-6">Forgot Password?</h1>
          <p className="text-xl mb-8 text-blue-100">
            No worries! We'll send you reset instructions to get back to your account
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
              <span>Check your email inbox</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
              <span>Click the reset link</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
              <span>Create a new password</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
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

            {!isEmailSent ? (
              <>
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                    Forgot Password
                  </h2>
                  <p className="text-gray-600 text-center">
                    Enter your email address and we'll send you a link to reset your password
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <FormInput
                    label="Email Address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    icon={EnvelopeIcon}
                    error={errors.email}
                  />

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>

                {/* Sign In Link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Remember your password?{' '}
                    <Link 
                      to="/login" 
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-6">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Check Your Email
                  </h2>
                  
                  <p className="text-gray-600 mb-6">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  
                  <Alert 
                    type="info"
                    message="Didn't receive the email? Check your spam folder or try again in a few minutes."
                    className="mb-6"
                  />
                  
                  <div className="space-y-4">
                    <Button
                      onClick={() => setIsEmailSent(false)}
                      variant="outline"
                      className="w-full"
                    >
                      Try Different Email
                    </Button>
                    
                    <Link 
                      to="/login"
                      className="block w-full text-center text-sm text-gray-600 hover:text-gray-800"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword