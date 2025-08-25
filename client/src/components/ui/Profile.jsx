import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CogIcon,
  KeyIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Button from "./Button";
import FormInput from "./FormInput";
import Modal from "./Modal";
import Loader from "./Loader";
import CityDropdown from "./CityDropdown";

const Profile = ({
  profileData,
  onUpdateProfile,
  onUpdatePassword,
  userType = "candidate",
  loading = false,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    companyName: "",
    industry: "",
    assignedCity: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (profileData && typeof profileData === "object") {
      // Handle city data - extract ID if it's an object
      let cityValue = "";
      if (profileData.city) {
        if (typeof profileData.city === "object" && profileData.city.id) {
          cityValue = profileData.city.id.toString();
        } else if (typeof profileData.city === "string") {
          cityValue = profileData.city;
        } else if (typeof profileData.city === "number") {
          cityValue = profileData.city.toString();
        }
      }

      setFormData({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        city: cityValue,
        companyName: profileData.companyName || "",
        industry: profileData.industry || "",
        assignedCity: profileData.assignedCity || "",
      });
    }
  }, [profileData]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    if (profileData) {
      // Handle city data - extract ID if it's an object
      let cityValue = "";
      if (profileData.city) {
        if (typeof profileData.city === "object" && profileData.city.id) {
          cityValue = profileData.city.id.toString();
        } else if (typeof profileData.city === "string") {
          cityValue = profileData.city;
        } else if (typeof profileData.city === "number") {
          cityValue = profileData.city.toString();
        }
      }

      setFormData({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        city: cityValue,
        companyName: profileData.companyName || "",
        industry: profileData.industry || "",
        assignedCity: profileData.assignedCity || "",
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      setIsSubmitting(true);
      // Send city directly as the API expects it
      await onUpdateProfile(formData);
      setEditMode(false);
      // Don't show toast here as it's handled in the parent component
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMode(false);
      // Don't show toast here as it's handled in the parent component
    } catch (error) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!formData.city) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for phone number - only allow digits and limit to 10
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 10) {
        setFormData(prev => ({
          ...prev,
          [name]: digitsOnly
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content Container - maximized screen space */}
      <div className="w-full px-2 sm:px-4 py-4 sm:py-6">
        {/* Page Header - improved for desktop and mobile */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
                    Profile
                  </h1>
                  <p className="text-sm lg:text-base text-gray-500">
                    Account Settings
                  </p>
                </div>
              </div>

              {/* Action Buttons - aligned right for mobile and desktop */}
              <div className="flex flex-row gap-2 sm:gap-3">
                {!editMode && !passwordMode && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPasswordMode(true)}
                      className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2"
                    >
                      <KeyIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Change Password</span>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit Profile</span>
                    </Button>
                  </>
                )}

                {editMode && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Cancel</span>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2"
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Save Changes</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Card - improved responsive design */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Profile Header - Compact design */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                <UserIcon className="h-7 w-7 lg:h-8 lg:w-8 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">
                  {(profileData?.firstName || "").toString()}{" "}
                  {(profileData?.lastName || "").toString()}
                </h2>
                <p className="text-gray-600 text-sm truncate">
                  {(profileData?.email || "No email").toString()}
                </p>
                {userType === "employer" && profileData?.companyName && (
                  <p className="text-gray-500 text-xs truncate">
                    {(profileData.companyName || "").toString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Fields - improved desktop grid layout */}
          <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-sm lg:text-base font-medium text-gray-900 uppercase tracking-wider">
                Basic Information
              </h3>

              {/* Desktop Grid Layout for larger screens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <UserIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      {editMode ? (
                        <FormInput
                          value={formData.firstName}
                          onChange={handleInputChange}
                          name="firstName"
                          placeholder="Enter your first name"
                          className="border border-gray-300 bg-white rounded-lg w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          error={errors.firstName}
                        />
                      ) : (
                        <p className="text-gray-900 font-medium text-sm lg:text-base">
                          {(
                            profileData?.firstName || "Not provided"
                          ).toString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <UserIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      {editMode ? (
                        <FormInput
                          value={formData.lastName}
                          onChange={handleInputChange}
                          name="lastName"
                          placeholder="Enter your last name"
                          className="border border-gray-300 bg-white rounded-lg w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          error={errors.lastName}
                        />
                      ) : (
                        <p className="text-gray-900 font-medium text-sm lg:text-base">
                          {(profileData?.lastName || "Not provided").toString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-3 lg:col-span-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 text-sm font-medium">
                        @
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <p className="text-gray-900 font-medium text-sm lg:text-base">
                        {(profileData?.email || "Not provided").toString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <PhoneIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      {editMode ? (
                        <FormInput
                          label="Phone"
                          name="phone"
                          type="tel"
                          value={formData.phone || ""}
                          onChange={handleInputChange}
                          icon={PhoneIcon}
                          placeholder="Enter your 10-digit phone number"
                          required
                          error={errors.phone}
                        />
                      ) : (
                        <p className="text-gray-900 font-medium text-sm lg:text-base">
                          {(profileData?.phone || "Not provided").toString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* City */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPinIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      {editMode ? (
                        <CityDropdown
                          value={formData.city}
                          onChange={(cityId) =>
                            setFormData({ ...formData, city: cityId })
                          }
                          placeholder="Select your city"
                          className="w-full"
                          hideLabel={true}
                          error={errors.city}
                        />
                      ) : (
                        <p className="text-gray-900 font-medium text-sm lg:text-base">
                          {typeof profileData?.city === "object" &&
                          profileData?.city?.name
                            ? `${profileData.city.name}, ${profileData.city.state}`
                            : (profileData?.city || "Not provided").toString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information for Employers */}
            {userType === "employer" && (
              <div className="space-y-6">
                <h3 className="text-sm lg:text-base font-medium text-gray-900 uppercase tracking-wider">
                  Company Information
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BriefcaseIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        {editMode ? (
                          <FormInput
                            value={formData.companyName}
                            onChange={handleInputChange}
                            name="companyName"
                            placeholder="Enter your company name"
                            className="border border-gray-300 bg-white rounded-lg w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium text-sm lg:text-base">
                            {(
                              profileData?.companyName || "Not provided"
                            ).toString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Industry */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AcademicCapIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Industry
                        </label>
                        {editMode ? (
                          <FormInput
                            value={formData.industry}
                            onChange={handleInputChange}
                            name="industry"
                            placeholder="Enter your industry"
                            className="border border-gray-300 bg-white rounded-lg w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium text-sm lg:text-base">
                            {(
                              profileData?.industry || "Not provided"
                            ).toString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Branch Admin Information */}
            {userType === "branchAdmin" && (
              <div className="space-y-6">
                <h3 className="text-sm lg:text-base font-medium text-gray-900 uppercase tracking-wider">
                  Admin Information
                </h3>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CogIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned City
                    </label>
                    <p className="text-gray-900 font-medium text-sm lg:text-base">
                      {(profileData?.assignedCity || "Not assigned").toString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 sm:mt-6">
          <button
            onClick={() => setPasswordMode(true)}
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <KeyIcon className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm lg:text-base">
                  Change Password
                </p>
                <p className="text-sm text-gray-500">Update your password</p>
              </div>
            </div>
            <div className="text-gray-400 text-lg lg:text-xl">›</div>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={passwordMode}
        onClose={() => {
          setPasswordMode(false);
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }}
        title="Change Password"
      >
        <div className="space-y-6 p-1 sm:p-0">
          {/* Password Requirements Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-medium">i</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Password Requirements</p>
                <p className="text-xs text-blue-700">Must be at least 6 characters long</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Current Password
              </label>
              <div className="relative">
                <FormInput
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Enter your current password"
                  className="pr-12 h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 touch-manipulation"
                >
                  {showPasswords.current ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                New Password
              </label>
              <div className="relative">
                <FormInput
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Enter your new password"
                  className="pr-12 h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 touch-manipulation"
                >
                  {showPasswords.new ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Confirm New Password
              </label>
              <div className="relative">
                <FormInput
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm your new password"
                  className="pr-12 h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 touch-manipulation"
                >
                  {showPasswords.confirm ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {/* Password Match Indicator */}
              {passwordData.confirmPassword && (
                <div className="mt-2">
                  {passwordData.newPassword === passwordData.confirmPassword ? (
                    <p className="text-xs text-green-600 flex items-center">
                      <CheckIcon className="h-3 w-3 mr-1" />
                      Passwords match
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 flex items-center">
                      <XMarkIcon className="h-3 w-3 mr-1" />
                      Passwords do not match
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile-Optimized Button Layout */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => {
                setPasswordMode(false);
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
              className="flex-1 h-12 text-base font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePasswordChange}
              disabled={
                isSubmitting ||
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                !passwordData.confirmPassword ||
                passwordData.newPassword !== passwordData.confirmPassword
              }
              className="flex-1 h-12 text-base font-medium rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 order-1 sm:order-2"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader />
                  <span className="ml-2">Updating...</span>
                </div>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;