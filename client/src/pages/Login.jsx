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

  // Redirect authenticated users appropriately - only when on login page
  useEffect(() => {
    // Only redirect if user is authenticated AND currently on the login page
    if (isAuthenticated && user?.role && location.pathname === '/login') {
      console.log('User already authenticated on login page, checking redirect:', user.role)

      // Check if they came from a protected route
      const returnUrl = location.state?.from?.pathname

      if (returnUrl && returnUrl !== '/' && returnUrl !== '/login') {
        console.log('Redirecting authenticated user to:', returnUrl)
        navigate(returnUrl, { replace: true })
      } else {
        // Default role-based redirects
        console.log('No return URL, redirecting based on role:', user.role)
        switch (user.role) {
          case 'CANDIDATE':
            console.log('Redirecting to candidate dashboard')
            navigate('/candidate/dashboard', { replace: true })
            break
          case 'EMPLOYER':
            console.log('Redirecting to employer dashboard')
            navigate('/employer/dashboard', { replace: true })
            break
          case 'BRANCH_ADMIN':
            console.log('Redirecting to branch admin dashboard')
            navigate('/branch-admin/dashboard', { replace: true })
            break
          default:
            console.log('Unknown role, redirecting to candidate dashboard as default')
            navigate('/candidate/dashboard', { replace: true })
        }
      }
    }
  }, [isAuthenticated, user, navigate, location.state, location.pathname])


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
    e.stopPropagation()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    console.log('Starting login process with:', { email: formData.email })

    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password
      })

      console.log('Login result:', result)

      if (result.success && result.user) {
        const user = result.user
        console.log('Login successful, user:', user, 'role:', user?.role)

        toast.success('Login successful!')

        // Check if user came from a protected route and redirect appropriately
        const returnUrl = location.state?.from?.pathname
        console.log('Login successful, return URL:', returnUrl, 'user role:', user?.role)

        if (returnUrl && returnUrl !== '/' && returnUrl !== '/login') {
          navigate(returnUrl, { replace: true })
        } else if (user?.role === 'BRANCH_ADMIN') {
          navigate('/branch-admin/dashboard', { replace: true })
        } else if (user?.role === 'EMPLOYER') {
          navigate('/employer/dashboard', { replace: true })
        } else if (user?.role === 'CANDIDATE') {
          // For candidates, also set up candidate auth
          const token = localStorage.getItem('token')
          if (token) {
            localStorage.setItem('candidateToken', token)
          }
          navigate('/candidate/dashboard', { replace: true })
        } else {
          // Default to candidate dashboard
          const token = localStorage.getItem('token')
          if (token) {
            localStorage.setItem('candidateToken', token)
          }
          navigate('/candidate/dashboard', { replace: true })
        }
        return
      }

      // Handle login failure
      const errorMessage = result.error || 'Invalid email or password. Please try again.'
      console.error('Login failed:', errorMessage)
      toast.error(errorMessage)
      
      // Clear password field for security but keep email
      setFormData(prev => ({ ...prev, password: '' }))

    } catch (error) {
      console.error('Login error:', error)

      let errorMessage = 'Unable to connect to server. Please check your connection and try again.'
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status
        const serverMessage = error.response.data?.message
        
        if (status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials.'
        } else if (status === 403) {
          errorMessage = 'Account is deactivated. Please contact support.'
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        } else if (serverMessage) {
          errorMessage = serverMessage
        }
      } else if (error.request) {
        // Network error - request was made but no response received
        errorMessage = 'Unable to connect to server. Please check your internet connection.'
      } else if (error.message) {
        // Something else happened
        errorMessage = `Login failed: ${error.message}`
      }
      
      toast.error(errorMessage)
      
      // Clear password field for security but keep email
      setFormData(prev => ({ ...prev, password: '' }))
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