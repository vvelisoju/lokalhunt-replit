import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, UserIcon, PhoneIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services/authService';
import publicApi from '../../services/publicApi';

const CreateEmployer = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    cityId: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    setCitiesLoading(true);
    try {
      const response = await publicApi.getCities();
      console.log('Cities response:', response);
      
      if (response && response.data && Array.isArray(response.data)) {
        setCities(response.data);
        console.log('Cities loaded:', response.data);
      } else if (response && Array.isArray(response)) {
        setCities(response);
        console.log('Cities loaded (direct array):', response);
      } else {
        console.error('Invalid cities response format:', response);
        // Fallback to default cities if API fails
        const fallbackCities = [
          { id: 'c66cc663-ec21-41bc-b58c-7f6a53c8ed70', name: 'Bangalore', state: 'Karnataka' },
          { id: '4ae30f5b-d4d1-4d7a-a3c7-de3040eb94fa', name: 'Delhi', state: 'Delhi' },
          { id: 'd505a6c5-8140-459b-8ff3-39565c65b74e', name: 'Hyderabad', state: 'Telangana' },
          { id: '69f77c2d-aaaa-4c14-bf9c-61a1910a018a', name: 'Mumbai', state: 'Maharashtra' },
          { id: 'aba48839-eb36-4d8a-8a40-963017304952', name: 'Pune', state: 'Maharashtra' }
        ];
        setCities(fallbackCities);
        toast.error('Using fallback cities due to API error');
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      // Fallback to default cities
      const fallbackCities = [
        { id: 'c66cc663-ec21-41bc-b58c-7f6a53c8ed70', name: 'Bangalore', state: 'Karnataka' },
        { id: '4ae30f5b-d4d1-4d7a-a3c7-de3040eb94fa', name: 'Delhi', state: 'Delhi' },
        { id: 'd505a6c5-8140-459b-8ff3-39565c65b74e', name: 'Hyderabad', state: 'Telangana' },
        { id: '69f77c2d-aaaa-4c14-bf9c-61a1910a018a', name: 'Mumbai', state: 'Maharashtra' },
        { id: 'aba48839-eb36-4d8a-8a40-963017304952', name: 'Pune', state: 'Maharashtra' }
      ];
      setCities(fallbackCities);
      toast.error('Failed to load cities from server. Using default cities.');
    } finally {
      setCitiesLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.cityId) newErrors.cityId = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsLoading(true);
    try {
      const submitData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'EMPLOYER',
        cityId: formData.cityId
      };

      console.log('Submitting data:', submitData);
      const response = await authService.register(submitData);
      console.log('Create employer response:', response);
      
      if (response.success) {
        toast.success('Employer created successfully!');
        // Since registration response includes user data, use the user ID
        navigate(`/branch-admin/employers/${response.data.user.id}`);
      } else {
        // Show user-friendly error messages
        const errorMessage = response.error || 'Failed to create employer';
        if (errorMessage.includes('email already exists')) {
          toast.error('This email address is already registered. Please use a different email.');
        } else if (errorMessage.includes('passwordHash')) {
          toast.error('There was an issue with the password. Please try again.');
        } else if (errorMessage.includes('Invalid')) {
          toast.error('Please check all fields and try again.');
        } else {
          toast.error('Unable to create employer account. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error creating employer:', error);
      // Show user-friendly error for network or unexpected errors
      if (error.message && error.message.includes('Network')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Unable to create employer account. Please try again or contact support.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (citiesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading cities...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/branch-admin/employers')}
            className="flex items-center gap-2 px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>
        </div>

        {/* Registration Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="First name"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Last name"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.cityId}
                  onChange={(e) => handleInputChange('cityId', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.cityId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your city</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}, {city.state}
                    </option>
                  ))}
                </select>
                {errors.cityId && (
                  <p className="mt-1 text-sm text-red-600">{errors.cityId}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a password"
                    className={`w-full pl-4 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className={`w-full pl-4 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEmployer;