import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import CityDropdown from "../ui/CityDropdown";

const EditProfileModal = ({ isOpen, onClose, profileData, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    headline: "",
    location: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profileData) {
      // Handle city data - extract ID if it's an object, otherwise use the value directly
      let cityValue = "";
      const cityData =
        profileData.city ||
        profileData.user?.city ||
        profileData.profileData?.city;

      if (cityData) {
        if (typeof cityData === "object" && cityData.id) {
          // City is stored as an object with id
          cityValue = cityData.id.toString();
        } else if (
          typeof cityData === "string" ||
          typeof cityData === "number"
        ) {
          // City is stored as ID string/number
          cityValue = cityData.toString();
        }
      }

      setFormData({
        firstName:
          profileData.firstName ||
          profileData.user?.firstName ||
          profileData.profileData?.firstName ||
          "",
        lastName:
          profileData.lastName ||
          profileData.user?.lastName ||
          profileData.profileData?.lastName ||
          "",
        email:
          profileData.email ||
          profileData.user?.email ||
          profileData.profileData?.email ||
          "",
        phone:
          profileData.phone ||
          profileData.user?.phone ||
          profileData.profileData?.phone ||
          "",
        city: cityValue,
        headline:
          profileData.headline ||
          profileData.profileData?.headline ||
          profileData.profileData?.currentRole ||
          "",
        location:
          profileData.location || profileData.profileData?.location || "",
      });
    }
  }, [profileData]);

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For phone field, only allow numbers and limit to 10 digits
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));

      // Clear phone error when user starts typing
      if (errors.phone) {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleCityChange = (cityId) => {
    setFormData((prev) => ({ ...prev, city: cityId }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 modal">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-xl w-full max-w-md max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full border-2 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-0 transition-colors ${
                    errors.firstName
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full border-2 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-0 transition-colors ${
                    errors.lastName
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50 cursor-not-allowed focus:outline-none"
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full border-2 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-0 transition-colors ${
                    errors.phone
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-gray-400">
                    {formData.phone.length}/10
                  </span>
                </div>
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter exactly 10 digits (numbers only)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City
              </label>
              <CityDropdown
                value={formData.city}
                onChange={handleCityChange}
                placeholder="Select your city"
                className="w-full"
                hideLabel={true}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Professional Headline
              </label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g., Software Engineer at Tech Company"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Mumbai, Maharashtra"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors"
              />
            </div> */}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-6 text-base font-semibold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto py-3 px-6 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
