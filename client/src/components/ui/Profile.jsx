import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon, PencilIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import FormInput from './FormInput';
import Select from './Select';
import Modal from './Modal';

const Profile = ({ 
  profileData, 
  onUpdateProfile, 
  onUpdatePassword,
  userType = 'branchAdmin',
  loading = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({});
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

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.user?.name || '',
        email: profileData.user?.email || '',
        phone: profileData.phone || '',
        ...getTypeSpecificFields(profileData, userType)
      });
    }
  }, [profileData, userType]);

  const getTypeSpecificFields = (data, type) => {
    switch (type) {
      case 'branchAdmin':
        return {
          branchName: data.branchName || '',
          region: data.region || '',
          designation: data.designation || '',
          assignedCity: data.assignedCity?.name || ''
        };
      case 'employer':
        return {
          companyName: data.companyName || '',
          jobTitle: data.jobTitle || '',
          industry: data.industry || ''
        };
      default:
        return {};
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
      await onUpdateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    try {
      await onUpdatePassword(passwordData);
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const renderTypeSpecificFields = () => {
    switch (userType) {
      case 'branchAdmin':
        return (
          <>
            <FormInput
              label="Branch Name"
              type="text"
              value={formData.branchName || ''}
              onChange={(e) => handleInputChange('branchName', e.target.value)}
              disabled={!isEditing}
              required
            />
            <FormInput
              label="Region"
              type="text"
              value={formData.region || ''}
              onChange={(e) => handleInputChange('region', e.target.value)}
              disabled={!isEditing}
            />
            <FormInput
              label="Designation"
              type="text"
              value={formData.designation || ''}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              disabled={!isEditing}
            />
            <FormInput
              label="Assigned City"
              type="text"
              value={formData.assignedCity || ''}
              disabled={true}
              readOnly
            />
          </>
        );
      case 'employer':
        return (
          <>
            <FormInput
              label="Company Name"
              type="text"
              value={formData.companyName || ''}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              disabled={!isEditing}
              required
            />
            <FormInput
              label="Job Title"
              type="text"
              value={formData.jobTitle || ''}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              disabled={!isEditing}
            />
            <FormInput
              label="Industry"
              type="text"
              value={formData.industry || ''}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              disabled={!isEditing}
            />
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowPasswordModal(true)}
            variant="outline"
            size="sm"
          >
            Change Password
          </Button>
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
          {/* Basic Information */}
          <FormInput
            label="Full Name"
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={!isEditing}
            required
          />
          <FormInput
            label="Email Address"
            type="email"
            value={formData.email || ''}
            disabled={true}
            readOnly
            help="Email cannot be changed"
          />
          <FormInput
            label="Phone Number"
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={!isEditing}
          />
          
          {/* Type-specific fields */}
          {renderTypeSpecificFields()}
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