import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/ui/FormInput";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useToast } from "../components/ui/Toast";
import CityDropdown from "../components/ui/CityDropdown";
import EmailOTPVerification from "../components/ui/EmailOTPVerification";

const Register = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast, success, error } = useToast();

  const [activeTab, setActiveTab] = useState("candidate");
  const [currentStep, setCurrentStep] = useState("registration"); // Track current step: 'registration' or 'verification'
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    city: "",
    companyName: "",
    role: "CANDIDATE",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const cities = [
    { value: "mumbai", label: "Mumbai" },
    { value: "delhi", label: "Delhi" },
    { value: "bangalore", label: "Bangalore" },
    { value: "hyderabad", label: "Hyderabad" },
    { value: "chennai", label: "Chennai" },
    { value: "kolkata", label: "Kolkata" },
    { value: "pune", label: "Pune" },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData((prev) => ({
      ...prev,
      role: tab === "candidate" ? "CANDIDATE" : "EMPLOYER",
      companyName: tab === "candidate" ? "" : prev.companyName,
      lastName: tab === "employer" ? "" : prev.lastName,
    }));
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCityChange = (cityId) => {
    console.log("Selected city ID:", cityId);
    setFormData((prev) => ({ ...prev, city: cityId }));
    if (errors.city) {
      setErrors((prev) => ({ ...prev, city: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName =
        activeTab === "employer"
          ? "Contact person name is required"
          : "First name is required";
    }

    if (activeTab === "candidate" && !formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.city) {
      newErrors.city = "City is required";
    }

    if (formData.role === "EMPLOYER" && !formData.companyName.trim()) {
      newErrors.companyName = "Company name is required for employers";
    }

    // Password validation is now handled in the EmailOTPVerification component

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setErrors({});

      // Call the register API to create user and send OTP
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          cityId: formData.city,
          companyName: formData.companyName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Show success toast and immediately transition
        success("Registration successful! Please check your email for OTP.");
        setCurrentStep("verification");
      } else {
        // Handle registration errors
        if (response.status === 409) {
          setErrors({ email: "User with this email already exists" });
          error("User with this email already exists");
        } else if (response.status === 201) {
          // Registration created but maybe email failed - still proceed to verification
          success("Registration successful! Please check your email for OTP.");
          setCurrentStep("verification");
        } else {
          const errorMessage =
            data.message || "Registration failed. Please try again.";
          setErrors({ general: errorMessage });
          error(errorMessage);
        }
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setErrors({ general: "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = async (verificationData) => {
    try {
      setIsLoading(true);

      // Verify OTP and complete registration via auth API
      const otpResponse = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: verificationData.otp,
          password: verificationData.password,
          confirmPassword: verificationData.confirmPassword,
          companyName: formData.companyName,
          companyDescription: formData.companyDescription,
          industry: formData.industry,
          companySize: formData.companySize,
          website: formData.website,
          contactDetails: formData.contactDetails,
        }),
      });

      const otpData = await otpResponse.json();

      // Check if the response was successful (status 200-299)
      if (otpResponse.ok && otpData.success !== false) {
        // Store token and user data
        if (otpData.data && otpData.data.token) {
          localStorage.setItem("token", otpData.data.token);
          localStorage.setItem("user", JSON.stringify(otpData.data.user));
        }

        console.log("Registration completed successfully", formData, otpData);
        // Show success message
        success("Registration completed successfully!");

        // For employers, fetch employer profile to ensure proper setup
        if (formData.role === "EMPLOYER" && otpData.data?.token) {
          try {
            // Make a call to employer profile to verify setup
            const profileResponse = await fetch("/api/auth/profile", {
              method: "GET",
              headers: {
                Authorization: `Bearer ${otpData.data.token}`,
                "Content-Type": "application/json",
              },
            });

            if (profileResponse.ok) {
              console.log("Employer profile verified successfully");
            } else {
              console.warn(
                "Employer profile verification failed, but proceeding with redirect",
              );
            }
          } catch (profileError) {
            console.warn("Error verifying employer profile:", profileError);
            // Don't block navigation for profile verification errors
          }
        }

        // Navigate to appropriate dashboard based on role
        if (formData.role === "EMPLOYER") {
          // For employers, redirect to employer dashboard
          console.log("Redirecting employer to dashboard");
          navigate("/employer/dashboard", { replace: true });
        } else {
          // For candidates, redirect to candidate dashboard
          navigate("/candidate/dashboard", { replace: true });
        }
        return; // Return early to prevent any further execution
      } else {
        // Handle error response from server
        const errorMessage = otpData.message || "Verification failed";
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Registration completion failed:", err);
      // Always throw the error to let EmailOTPVerification handle it
      // This prevents navigation when verification fails
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRegistration = () => {
    setCurrentStep("registration");
  };

  // Show OTP verification step
  if (currentStep === "verification") {
    return (
      <EmailOTPVerification
        email={formData.email}
        onVerificationSuccess={handleVerificationSuccess}
        onBack={handleBackToRegistration}
        loading={isLoading}
      />
    );
  }

  // Show registration form
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Logo and Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-orange-500 items-center justify-center p-8">
        <div className="max-w-md text-center text-white">
          <div className="flex items-center justify-center mb-8">
            <img src="/images/logo.png" alt="LokalHunt Logo" className="h-14" />
          </div>
          <h1 className="text-4xl font-bold mb-6">Join LokalHunt</h1>
          <p className="text-xl mb-8 text-blue-100">
            Start your journey to discover amazing local opportunities
          </p>
          <div className="space-y-4 text-left">
            {activeTab === "candidate" ? (
              <>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
                  <span>Find jobs in your city</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
                  <span>Connect with local employers</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
                  <span>Build your career locally</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
                  <span>Post jobs to local talent</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
                  <span>Manage candidate applications</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
                  <span>Grow your local team</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <img
                src="/images/logo.png"
                alt="LokalHunt Logo"
                className="h-14"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-8">
            {/* Role Selection Tabs */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-4 sm:mb-6">
                Create Account
              </h2>
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => handleTabChange("candidate")}
                  className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "candidate"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Job Seeker
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("employer")}
                  className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "employer"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Employer
                </button>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Company Name - First for Employers */}
              {activeTab === "employer" && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Enter your company name"
                      className={`w-full pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.companyName
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50 focus:bg-white"
                      }`}
                      required
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.companyName}
                    </p>
                  )}
                </div>
              )}

              {/* Name Fields */}
              {activeTab === "candidate" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="First name"
                        className={`w-full pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.firstName
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50 focus:bg-white"
                        }`}
                        required
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last name"
                        className={`w-full pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.lastName
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50 focus:bg-white"
                        }`}
                        required
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Contact Person Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter contact person name"
                      className={`w-full pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.firstName
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50 focus:bg-white"
                      }`}
                      required
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
              )}

              {/* Email and Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`w-full pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-gray-50 focus:bg-white"
                    }`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className={`w-full pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.phone
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-gray-50 focus:bg-white"
                    }`}
                    required
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>
                <CityDropdown
                  name="city"
                  value={formData.city}
                  onChange={handleCityChange}
                  error={errors.city}
                  hideLabel={true}
                  className="mobile-friendly-select"
                />
              </div>

              {/* Password Fields - Removed from this form */}

              {/* Terms and Conditions */}
              <div className="flex items-start pt-3">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 flex-shrink-0"
                />
                <label
                  htmlFor="terms"
                  className="ml-3 block text-sm text-gray-700 leading-relaxed"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-500 underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-500 underline"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 sm:py-4 px-4 rounded-2xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Continue to Verification"
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
