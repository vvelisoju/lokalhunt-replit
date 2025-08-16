import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCandidateAuth } from '../hooks/useCandidateAuth'
import FormInput from '../components/ui/FormInput'
import Button from '../components/ui/Button'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'

const Login = () => {
  const { t } = useTranslation()
  const { login, user, isAuthenticated } = useAuth()
  const candidateAuth = useCandidateAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  // Redirect authenticated users to their respective dashboards
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      console.log('User already authenticated, redirecting based on role:', user.role)
      switch (user.role) {
        case 'CANDIDATE':
          navigate('/candidate/dashboard', { replace: true })
          break
        case 'EMPLOYER':
          navigate('/employer/dashboard', { replace: true })
          break
        case 'BRANCH_ADMIN':
          navigate('/branch-admin/dashboard', { replace: true })
          break
        default:
          navigate('/candidate/dashboard', { replace: true })
      }
    }
  }, [isAuthenticated, user, navigate])


  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      // Try general auth first to determine user role
      const result = await login({
        email: formData.email,
        password: formData.password
      })
      
      if (result.success) {
        const user = result.user
        console.log('Login successful, user:', user, 'role:', user?.role)
        
        if (user?.role === 'EMPLOYER') {
          console.log('Redirecting to employer dashboard')
          toast.success('Login successful!')
          navigate('/employer/dashboard', { replace: true })
        } else if (user?.role === 'BRANCH_ADMIN') {
          console.log('Redirecting to branch admin dashboard') 
          toast.success('Login successful!')
          navigate('/branch-admin/dashboard', { replace: true })
        } else if (user?.role === 'CANDIDATE') {
          console.log('Candidate login - setting up candidate auth')
          // For candidates, we need to also set up the candidate auth system
          // Copy the token to candidateToken for candidate-specific routes
          const token = localStorage.getItem('token')
          if (token) {
            localStorage.setItem('candidateToken', token)
          }
          toast.success('Login successful!')
          console.log('Redirecting to candidate dashboard')
          navigate('/candidate/dashboard', { replace: true })
        } else {
          console.log('Unknown role, redirecting to candidate dashboard as default')
          // Default to candidate dashboard for unknown roles
          const token = localStorage.getItem('token')
          if (token) {
            localStorage.setItem('candidateToken', token)
          }
          toast.success('Login successful!')
          navigate('/candidate/dashboard', { replace: true })
        }
      } else {
        // Show user-friendly error messages
        let errorMessage = result.error
        if (errorMessage.includes('Invalid credentials') || errorMessage.includes('password')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
          errorMessage = 'No account found with this email. Please check your email or create a new account.'
        } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          errorMessage = 'Connection error. Please check your internet and try again.'
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Login error:', error)
      let errorMessage = 'Login failed. Please try again.'
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
          <h1 className="text-4xl font-bold mb-6">Welcome Back</h1>
          <p className="text-xl mb-8 text-blue-100">
            Continue your journey to find the perfect local opportunities
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
              <span>Connect with local employers</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
              <span>Discover city-specific opportunities</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
              <span>Build your professional network</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
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
            {/* Sign In Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center">Sign In</h2>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="relative">
                <FormInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link 
                    to="/forgot-password" 
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login