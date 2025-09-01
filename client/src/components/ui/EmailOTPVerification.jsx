import React, { useState, useEffect } from "react";
import {
  LockClosedIcon,
  PhoneIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import FormInput from "./FormInput";
import Button from "./Button";
import { useToast } from "./Toast";
import { authService } from "../../services/authService";

const MobileOTPVerification = ({
  phone,
  email,
  onVerificationSuccess,
  onBack,
  loading: parentLoading,
  isMobile = false,
}) => {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);

  // Check if OTP is complete (6 digits)
  const isOtpComplete = otp.length === 6;

  // Use phone for display if mobile mode, otherwise fall back to email
  const contactInfo = isMobile ? phone : email;

  // Toast notifications
  const { success: showSuccess, error: showError } = useToast();

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const getUserFriendlyErrorMessage = (error) => {
    // Handle both direct error messages and error response objects
    let errorMsg = '';

    if (error?.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error?.message) {
      errorMsg = error.message;
    } else if (typeof error === 'string') {
      errorMsg = error;
    } else {
      errorMsg = '';
    }

    // Convert to lowercase for easier matching
    const lowerErrorMsg = errorMsg.toLowerCase();

    // Map technical errors to user-friendly messages
    if (lowerErrorMsg.includes('invalid otp') || lowerErrorMsg.includes('otp must be 6 digits')) {
      return 'Invalid verification code. Please check and try again.';
    }
    if (lowerErrorMsg.includes('expired') || lowerErrorMsg.includes('otp has expired')) {
      return 'Your verification code has expired. Please request a new one.';
    }
    if (lowerErrorMsg.includes('user not found') || lowerErrorMsg.includes('not found')) {
      return 'Account not found. Please check your details and try again.';
    }
    if (lowerErrorMsg.includes('password') && lowerErrorMsg.includes('match')) {
      return 'Passwords do not match. Please make sure they are identical.';
    }
    if (lowerErrorMsg.includes('6 characters') || lowerErrorMsg.includes('password must be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    if (lowerErrorMsg.includes('network') || lowerErrorMsg.includes('connection')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    if (lowerErrorMsg.includes('is not a function')) {
      return 'Technical error occurred. Please try again or contact support.';
    }

    // If we have a specific error message, show it (cleaned up)
    if (errorMsg && errorMsg.trim()) {
      return errorMsg;
    }

    // Default fallback message
    return 'Verification failed. Please check your code and try again.';
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setErrors({});
    setIsLoading(true);

    try {
      let result;
      if (isMobile && phone) {
        // For mobile OTP resend, we need to call the appropriate API
        result = await authService.forgotPasswordMobile({ phone });
      } else if (email) {
        result = await authService.resendOTP({ email });
      }

      console.log('Resend OTP result:', result);

      if (result && result.status === 'success') {
        setResendCooldown(30);
        showSuccess(`Verification code sent to your ${isMobile ? 'mobile number' : 'email'}!`);
      } else {
        throw new Error(result?.message || result?.error || "Failed to send verification code");
      }
    } catch (error) {
      console.error("Failed to send OTP:", error);
      const friendlyMessage = getUserFriendlyErrorMessage(error);
      showError(`Failed to send code: ${friendlyMessage}`);
      setErrors({ general: `Failed to send verification code: ${friendlyMessage}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "otp") {
      // Only allow numbers and limit to 6 digits
      const numericValue = value.replace(/\D/g, "").slice(0, 6);
      setOtp(numericValue);
    } else if (name === "password") {
      setPassword(value);
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validate
    const validationErrors = {};

    if (!otp || otp.length !== 6) {
      validationErrors.otp = "Please enter the complete 6-digit verification code";
    }

    if (!password || password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters long";
    }

    if (password !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsLoading(true);

      // Call the verification success callback with all required data
      if (isMobile && phone) {
        await onVerificationSuccess({
          phone,
          otp,
          password,
          confirmPassword,
        });
      } else {
        await onVerificationSuccess({
          email,
          otp,
          password,
          confirmPassword,
        });
      }

      // If we reach here without error, verification was successful
      // Don't show any error messages

    } catch (error) {
      console.error('Verification failed:', error);

      // Only show error messages if the verification actually failed
      // Sometimes the parent component handles success but throws for navigation issues
      if (error && error.message && !error.message.includes('Successfully')) {
        const errorMessage = getUserFriendlyErrorMessage(error);

        // Check if it's an OTP-specific error
        if (errorMessage.toLowerCase().includes('invalid') && errorMessage.toLowerCase().includes('verification')) {
          setErrors({ 
            otp: errorMessage
          });
          showError(errorMessage);
        } else if (errorMessage.toLowerCase().includes('expired')) {
          setErrors({ 
            otp: errorMessage
          });
          setOtp(''); // Clear OTP on expiry
          showError(errorMessage);
        } else if (!errorMessage.toLowerCase().includes('success')) {
          // Only show general errors if they're not success messages
          setErrors({ 
            general: errorMessage
          });
          showError(errorMessage);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Mobile-first layout */}
      <div className="flex flex-col min-h-screen">
        {/* Header with logo - compact on mobile */}
        <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-100">
          <div className="px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={onBack}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isLoading || parentLoading}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </button>
              <img src="/images/logo.png" alt="LokalHunt" className="h-8 sm:h-10" />
              <div className="w-16"></div> {/* Spacer for centering */}
            </div>
          </div>
        </div>

        {/* Main content - scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 sm:px-6 sm:py-8">
            <div className="max-w-md mx-auto">
              {/* Compact header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <PhoneIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Verify Mobile Number
                </h1>
                <p className="text-sm text-gray-600">
                  Code sent to{" "}
                  <span className="font-semibold text-blue-600">{contactInfo}</span>
                </p>
              </div>

              {/* Alert for general errors */}
              {errors.general && !errors.otp && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-red-700 font-medium">Verification Failed</p>
                    <p className="text-sm text-red-600 mt-1">{errors.general}</p>
                  </div>
                </div>
              )}

              {/* Verification Form */}
              <form onSubmit={handleVerify} className="space-y-4">
                {/* OTP Input - More prominent */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={handleChange}
                    placeholder="000000"
                    className={`w-full px-4 py-4 text-lg font-mono text-center border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all tracking-widest ${
                      errors.otp
                        ? "border-red-300 bg-red-50"
                        : otp.length === 6
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 bg-gray-50 focus:bg-white"
                    }`}
                    maxLength={6}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                  />
                  {errors.otp && (
                    <div className="mt-2 flex items-start">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                      <p className="text-sm text-red-600 font-medium">{errors.otp}</p>
                    </div>
                  )}
                  {otp.length === 6 && !errors.otp && (
                    <div className="mt-2 flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                      <p className="text-sm text-green-600">Code entered successfully</p>
                    </div>
                  )}
                </div>

                {/* Resend Section - Compact */}
                <div className="text-center py-2">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0 || isLoading}
                    className={`text-sm font-medium ${
                      resendCooldown > 0 || isLoading
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600 hover:text-blue-500"
                    }`}
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Code"}
                  </button>
                </div>

                {/* Password Section - Compact */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">
                    Create Password
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="password"
                          name="password"
                          value={password}
                          onChange={handleChange}
                          placeholder={isOtpComplete ? "Create password" : "Enter code first"}
                          disabled={!isOtpComplete}
                          className={`w-full pl-10 pr-4 py-3 text-base border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            errors.password
                              ? "border-red-300 bg-red-50"
                              : !isOtpComplete
                              ? "border-gray-200 bg-gray-100 text-gray-400"
                              : "border-gray-200 bg-gray-50 focus:bg-white"
                          }`}
                        />
                      </div>
                      {errors.password && (
                        <div className="mt-1 flex items-start">
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                          <p className="text-sm text-red-600">{errors.password}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={confirmPassword}
                          onChange={handleChange}
                          placeholder={isOtpComplete ? "Confirm password" : "Enter code first"}
                          disabled={!isOtpComplete}
                          className={`w-full pl-10 pr-4 py-3 text-base border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            errors.confirmPassword
                              ? "border-red-300 bg-red-50"
                              : !isOtpComplete
                              ? "border-gray-200 bg-gray-100 text-gray-400"
                              : "border-gray-200 bg-gray-50 focus:bg-white"
                          }`}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <div className="mt-1 flex items-start">
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                          <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button - Fixed at bottom on mobile */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isLoading || parentLoading || !isOtpComplete || !password || !confirmPassword}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    {isLoading || parentLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      "Complete Registration"
                    )}
                  </button>
                </div>
              </form>

              {/* Help text */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Didn't receive the code? Check your messages or wait {resendCooldown > 0 ? `${resendCooldown}s` : ''} to resend
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop layout - hidden on mobile */}
        <div className="hidden lg:flex lg:min-h-screen">
          {/* Left Panel - Logo and Info */}
          <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center p-8">
            <div className="max-w-md text-center text-white">
              <div className="flex items-center justify-center mb-8">
                <img src="/images/logo.png" alt="LokalHunt Logo" className="h-14" />
              </div>
              <h1 className="text-4xl font-bold mb-6">Almost There!</h1>
              <p className="text-xl mb-8 text-blue-100">
                Verify your {isMobile ? 'mobile number' : 'email'} to complete your LokalHunt registration
              </p>
              <div className="space-y-4 text-left">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
                  <span>Secure {isMobile ? 'mobile' : 'email'} verification</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
                  <span>Set up your account password</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
                  <span>Join the LokalHunt community</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Desktop Form */}
          <div className="lg:w-1/2 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                {/* Desktop version of the form would go here */}
                {/* For now, using the same compact layout */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileOTPVerification;