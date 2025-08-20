import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon, PencilIcon, UserIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import FormInput from './FormInput';
import Modal from './Modal';
import { getCities } from '../../services/common/cities';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';

const Profile = ({
  profileData,
  onUpdateProfile,
  onUpdatePassword,
  userType = 'branchAdmin',
  loading = false
}) => {
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cityId: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    if (profileData) {
      // Handle both nested user object and direct profile data
      const userData = profileData.user || profileData;
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        cityId: userData.cityId || ''
      });
    }
  }, [profileData]);

  const loadCities = async () => {
    setCitiesLoading(true);
    try {
      const response = await getCities();
      console.log('Cities API response:', response);

      if (response.success && response.data && Array.isArray(response.data)) {
        setCities(response.data);
        console.log('Cities loaded successfully:', response.data.length, 'cities');
      } else if (response && Array.isArray(response)) {
        // Handle direct array response
        setCities(response);
        console.log('Cities loaded (direct array):', response.length, 'cities');
      } else {
        console.error('Invalid cities response format:', response);
        // Fallback cities from database schema
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
      // Fallback cities
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName) {
        toast.error('First name and last name are required');
        return;
      }

      if (!formData.cityId) {
        toast.error('Please select a city');
        return;
      }

      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email, // Email is read-only, but include for consistency
        phone: formData.phone?.trim() || '',
        cityId: formData.cityId
      };

      console.log('Updating profile with data:', updateData);
      const result = await onUpdateProfile(updateData);
      setIsEditing(false);
      toast.success('Profile updated successfully');

      // Update AuthContext with new user data
      const userData = profileData?.user || profileData;
      const updatedUserData = {
        ...userData,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        cityId: formData.cityId
      };
      updateUser(updatedUserData);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const result = await profileService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (result.success) {
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast.success('Password updated successfully');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
    }
  };

  // Function to get city name from cityId
  const getCityName = (userData) => {
    // Check for cityName first (from new profile API)
    if (userData.cityName) {
      return userData.cityName;
    }
    // Fallback to cityRef format
    if (userData.cityRef) {
      return `${userData.cityRef.name}, ${userData.cityRef.state}`;
    }
    return userData.city || 'Not specified';
  };

  // Get current city name for display
  const getCurrentCityName = () => {
    // Handle both nested user object and direct profile data
    const userData = profileData?.user || profileData;

    if (!userData?.cityId) return 'Not specified';

    // Check if cityName is already provided (from API response)
    if (userData.cityName) {
      return userData.cityName;
    }

    // If cityRef is available (populated city data)
    if (userData.cityRef) {
      return `${userData.cityRef.name}, ${userData.cityRef.state}`;
    }

    // Find city in cities list
    const city = cities.find(c => c.id === userData.cityId);
    return city ? `${city.name}, ${city.state}` : 'Unknown city';
  };

  const formatRole = (role) => {
    const roleMap = {
      'CANDIDATE': 'Candidate',
      'EMPLOYER': 'Employer',
      'BRANCH_ADMIN': 'Branch Admin',
      'SUPER_ADMIN': 'Super Admin'
    };
    return roleMap[role] || role;
  };

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
        <div className="flex space-x-3">
          {/* Hide change password button in edit mode */}
          {!isEditing && (
            <Button
              onClick={() => setShowPasswordModal(true)}
              variant="outline"
              size="sm"
            >
              Change Password
            </Button>
          )}
          {isEditing ? (
            <div className="flex space-x-2">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
              >
                Save Changes
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              icon={PencilIcon}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!isEditing}
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!isEditing}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              disabled
              readOnly
            />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!isEditing}
            />
          </div>

          {/* City Dropdown */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            {isEditing ? (
              <select
                value={formData.cityId || ''}
                onChange={(e) => handleInputChange('cityId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={citiesLoading}
              >
                <option value="">
                  {citiesLoading ? 'Loading cities...' : 'Select a city'}
                </option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.state}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={getCurrentCityName()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                disabled
                readOnly
              />
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="relative">
            <FormInput
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              onClick={() => togglePasswordVisibility('current')}
            >
              {showPasswords.current ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <FormInput
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              required
              help="Minimum 6 characters"
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              onClick={() => togglePasswordVisibility('new')}
            >
              {showPasswords.new ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <FormInput
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              onClick={() => togglePasswordVisibility('confirm')}
            >
              {showPasswords.confirm ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            onClick={() => setShowPasswordModal(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordUpdate}
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            Update Password
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;