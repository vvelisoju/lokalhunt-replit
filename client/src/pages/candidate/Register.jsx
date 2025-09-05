import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  MapPinIcon 
} from '@heroicons/react/24/outline'
import FormInput from '../../components/ui/FormInput'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import CityDropdown from '../../components/ui/CityDropdown'
import OTPVerification from '../../components/ui/OTPVerification'
import { useCandidateAuth } from '../../hooks/useCandidateAuth'
import { authService } from '../../services/authService'

const Register = () => {
  const [currentStep, setCurrentStep] = useState('registration') // 'registration' or 'verification'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    cityId: '',
    agreeToTerms: false
  })
  const [errors, setErrors] = useState({})
  const { register, loading } = useCandidateAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateRegistrationForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }



    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits'
    }

    if (!formData.cityId) {
      newErrors.cityId = 'Please select your city'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault()

    if (!validateRegistrationForm()) return

    // Move to OTP verification step
    setCurrentStep('verification')
  }

  const handleVerificationSuccess = async (verificationData) => {
    try {
      // Complete registration with verification data using auth API
      // Use mobile verification if phone is provided, otherwise fall back to email
      let data;
      if (verificationData.phone) {
        data = await authService.resetPasswordMobile(
          verificationData.phone,
          verificationData.otp,
          verificationData.password,
          verificationData.confirmPassword
        );
      } else {
        data = await authService.verifyOTP({
          phone: formData.phone,
          otp: verificationData.otp,
          password: verificationData.password,
          confirmPassword: verificationData.confirmPassword,
        });
      };

      if (data.success || data.status === 'success') {
        // Store token if provided
        if (data.data.token) {
          localStorage.setItem('token', data.data.token)
          localStorage.setItem('user', JSON.stringify(data.data.user))
        }

        // Set flag to show onboarding for new users
        localStorage.setItem('showOnboarding', 'true')
        localStorage.setItem('onboardingCompleted', 'false')

        // Navigate to dashboard
        navigate('/candidate/dashboard')
      } else {
        throw new Error(data.message || 'Verification failed')
      }
    } catch (error) {
      console.error('Registration completion failed:', error)
      // Reset step to allow re-verification or correction
      setCurrentStep('verification');
      // Set an error message to be displayed in EmailOTPVerification
      // Assuming EmailOTPVerification can receive and display an error prop
      // For now, we'll log it and potentially need to pass it down.
      // In a real app, you'd likely pass an error state down or have a shared error handler.
      console.error("Error during OTP verification:", error.message);
    }
  }

  const handleBackToRegistration = () => {
    setCurrentStep('registration')
  }

  // Show OTP verification step
  if (currentStep === 'verification') {
    return (
      <OTPVerification
        phone={formData.phone}
        email=""
        onVerificationSuccess={handleVerificationSuccess}
        onBack={handleBackToRegistration}
        loading={loading}
        isMobile={true}
        mode="registration"
      />
    )
  }

  // Show registration form
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <img 
            src="/images/logo.png" 
            alt="LokalHunt" 
            className="h-12 w-auto"
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/candidate/login"
            state={{ source: 'register' }}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <form onSubmit={handleRegistrationSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
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
                placeholder="Doe"
                required
                icon={UserIcon}
                error={errors.lastName}
              />
            </div>



            <FormInput
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="9876543210"
              required
              icon={PhoneIcon}
              error={errors.phone}
            />

            <CityDropdown
              label="City"
              name="cityId"
              value={formData.cityId}
              onChange={handleChange}
              placeholder="Select your city"
              required
              error={errors.cityId}
            />

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToTerms" className="text-gray-700">
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </Link>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              Continue to Email Verification
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default Register