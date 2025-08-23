
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UserIcon, EnvelopeIcon, PhoneIcon, EyeIcon, EyeSlashIcon, BuildingOfficeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services/authService';
import FormInput from '../ui/FormInput';
import Button from '../ui/Button';
import CityDropdown from '../ui/CityDropdown';
import Modal from '../ui/Modal';

const CreateEmployerModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    companyName: '',
    role: 'EMPLOYER'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCityChange = (cityId) => {
    // Ensure we're getting just the string value, not the event object
    const selectedCityId = typeof cityId === 'string' ? cityId : cityId?.target?.value || '';
    setFormData(prev => ({ ...prev, city: selectedCityId }));
    if (errors.city) {
      setErrors(prev => ({ ...prev, city: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Contact person name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.city) {
      newErrors.city = 'City is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsLoading(true);
    try {
      // Ensure clean data without circular references
      const submitData = {
        firstName: String(formData.firstName || '').trim(),
        email: String(formData.email || '').trim(),
        phone: String(formData.phone || '').trim(),
        password: String(formData.password || ''),
        cityId: String(formData.city || ''),
        role: 'EMPLOYER',
        companyName: String(formData.companyName || '').trim()
      };

      try {
        const response = await authService.register(submitData);
        console.log('Registration response:', response);

        if (response.success || response.status === 'success') {
          toast.success('Employer created successfully!');
          // Reset form first
          setFormData({
            firstName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            city: '',
            companyName: '',
            role: 'EMPLOYER'
          });
          setErrors({});
          // Close modal
          onClose();
          // Wait a moment for the employer list to refresh, then redirect to employers list
          setTimeout(() => {
            onSuccess(null); // Pass null to just refresh the list instead of redirecting
          }, 1000);
        } else {
          // Show user-friendly error messages
          const errorMessage = response.message || response.error || 'Failed to create employer';
          console.log('Error message:', errorMessage);

          if (errorMessage.toLowerCase().includes('email already exists') ||
              errorMessage.toLowerCase().includes('user with this email')) {
            toast.error('This email address is already registered. Please use a different email.');
          } else if (errorMessage.includes('passwordHash')) {
            toast.error('There was an issue with the password. Please try again.');
          } else if (errorMessage.includes('Invalid')) {
            toast.error('Please check all fields and try again.');
          } else {
            toast.error('Unable to create employer account. Please try again.');
          }
        }
      } catch (apiError) {
        console.log('API Error caught:', apiError);
        // Handle API errors from axios interceptor
        if (apiError.response && apiError.response.data) {
          const errorData = apiError.response.data;
          if (errorData.statusCode === 409 || errorData.message?.toLowerCase().includes('email already exists')) {
            toast.error('This email address is already registered. Please use a different email.');
          } else {
            toast.error(errorData.message || 'Unable to create employer account.');
          }
        } else {
          throw apiError; // Re-throw to be caught by outer catch
        }
      }
    } catch (error) {
      console.error('Error creating employer:', error);
      // Show user-friendly error for network or unexpected errors
      if (error.response && error.response.status === 409) {
        toast.error('This email address is already registered. Please use a different email.');
      } else if (error.message && error.message.includes('Network')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Unable to create employer account. Please try again or contact support.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      firstName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      city: '',
      companyName: '',
      role: 'EMPLOYER'
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Employer"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name - First for Employers */}
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

        {/* Contact Person Name */}
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

        {/* Email */}
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

        {/* Phone */}
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

        {/* Password */}
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

        {/* Confirm Password */}
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

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateEmployerModal;
