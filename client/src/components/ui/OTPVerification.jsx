import React, { useState, useEffect } from "react";
import {
  LockClosedIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import FormInput from "./FormInput";
import Button from "./Button";
import { useToast } from "./Toast";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router-dom"; // Assuming you are using react-router-dom
import { useAuth } from "../../context/AuthContext"; // Assuming AuthContext is used

const OTPVerification = ({
  phone,
  email,
  onVerificationSuccess,
  onBack,
  loading: parentLoading,
  isMobile = false,
  mode = "registration", // "registration" or "forgot-password"
  title,
  subtitle,
}) => {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [message, setMessage] = useState(""); // For the success message
  const [isSuccess, setIsSuccess] = useState(false); // To track success state

  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth(); // Get checkAuthStatus from AuthContext

  // Check if OTP is complete (6 digits)
  const isOtpComplete = otp.length === 6;

  // Use phone for display if mobile mode, otherwise fall back to email
  const contactInfo = isMobile ? phone : email;
  const contactIcon = isMobile ? PhoneIcon : EnvelopeIcon;
  const contactType = isMobile ? "mobile number" : "email";

  // Dynamic titles based on mode
  const defaultTitle =
    mode === "registration"
      ? `Verify ${isMobile ? "Mobile Number" : "Email"}`
      : "Reset Password";

  const defaultSubtitle =
    mode === "registration"
      ? `Code sent to ${contactInfo}`
      : `Enter the code sent to ${contactInfo}`;

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
    let errorMsg = "";

    if (error?.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error?.message) {
      errorMsg = error.message;
    } else if (typeof error === "string") {
      errorMsg = error;
    } else {
      errorMsg = "";
    }

    // Convert to lowercase for easier matching
    const lowerErrorMsg = errorMsg.toLowerCase();

    // Map technical errors to user-friendly messages
    if (
      lowerErrorMsg.includes("invalid otp") ||
      lowerErrorMsg.includes("otp must be 6 digits")
    ) {
      return "Invalid verification code. Please check and try again.";
    }
    if (
      lowerErrorMsg.includes("expired") ||
      lowerErrorMsg.includes("otp has expired")
    ) {
      return "Your verification code has expired. Please request a new one.";
    }
    if (
      lowerErrorMsg.includes("user not found") ||
      lowerErrorMsg.includes("not found")
    ) {
      return "Account not found. Please check your details and try again.";
    }
    if (lowerErrorMsg.includes("password") && lowerErrorMsg.includes("match")) {
      return "Passwords do not match. Please make sure they are identical.";
    }
    if (
      lowerErrorMsg.includes("6 characters") ||
      lowerErrorMsg.includes("password must be at least")
    ) {
      return "Password must be at least 6 characters long.";
    }
    if (
      lowerErrorMsg.includes("network") ||
      lowerErrorMsg.includes("connection")
    ) {
      return "Network error. Please check your internet connection and try again.";
    }
    if (lowerErrorMsg.includes("is not a function")) {
      return "Technical error occurred. Please try again or contact support.";
    }

    // If we have a specific error message, show it (cleaned up)
    if (errorMsg && errorMsg.trim()) {
      return errorMsg;
    }

    // Default fallback message
    return "Verification failed. Please check your code and try again.";
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setErrors({});
    setIsLoading(true);

    try {
      let result;
      if (mode === "forgot-password") {
        // For forgot password flow
        result = isMobile
          ? await authService.forgotPasswordMobile(phone)
          : await authService.forgotPassword(email);
      } else {
        // For registration flow
        result = await authService.resendOTP(isMobile ? { phone } : { email });
      }

      if (result.success) {
        setResendCooldown(30);
        showSuccess(`Verification code sent to your ${contactType}!`);
      } else {
        throw new Error(result.error || "Failed to send verification code");
      }
    } catch (error) {
      console.error("Failed to send OTP:", error);
      const friendlyMessage = getUserFriendlyErrorMessage(error);
      showError(`Failed to send code: ${friendlyMessage}`);
      setErrors({
        general: `Failed to send verification code: ${friendlyMessage}`,
      });
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
      validationErrors.otp =
        "Please enter the complete 6-digit verification code";
    }

    // Password validation only required for registration and forgot password
    if (mode === "registration" || mode === "forgot-password") {
      if (!password || password.length < 6) {
        validationErrors.password =
          "Password must be at least 6 characters long";
      }

      if (password !== confirmPassword) {
        validationErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsLoading(true);

      // Prepare verification data
      const verificationData = {
        otp,
        password,
        confirmPassword,
      };

      if (isMobile && phone) {
        verificationData.phone = phone;
      } else if (email) {
        verificationData.email = email;
      }

      // Add flag for forgot password flow
      if (mode === "forgot-password") {
        verificationData.isForgotPassword = true;
      }

      // Add company data for employer registration if available
      if (mode === "registration") {
        const storedCompanyData = localStorage.getItem("tempCompanyData");
        if (storedCompanyData) {
          try {
            const companyData = JSON.parse(storedCompanyData);
            if (companyData.companyName) {
              verificationData.companyName = companyData.companyName;
              verificationData.cityId = companyData.cityId;

              // Also add to registrationData object for backward compatibility
              verificationData.registrationData = {
                companyName: companyData.companyName,
                cityId: companyData.cityId,
              };
            }
          } catch (error) {
            console.error("Error parsing stored company data:", error);
          }
        }
      }

      console.log("OTPVerification: Starting verification process");

      // Call the unified verification service
      const result = await authService.verifyOTP(verificationData);
      console.log("OTPVerification: Verification result:", result);

      // Handle successful response - check multiple success indicators
      const isSuccess =
        result?.success === true ||
        result?.status === "success" ||
        (result?.data && result.data?.success === true) ||
        (result?.message &&
          result.message.toLowerCase().includes("successfully")) ||
        (result?.data?.message &&
          result.data.message.toLowerCase().includes("successfully"));

      if (isSuccess) {
        const responseData = result.data || result;
        const userData = responseData.user;
        const token = responseData.token;

        // Show appropriate success message
        if (mode === "registration") {
          showSuccess(
            "🎉 Registration completed successfully! Welcome to your dashboard!",
          );
        } else {
          showSuccess(
            "🎉 Password reset successfully! Welcome back to your dashboard!",
          );
        }

        // Store authentication data if provided
        if (token && userData) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(userData));
          // Set auth header for subsequent requests
          import("../../services/api").then(({ default: api }) => {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          });

          // Update auth context
          if (checkAuthStatus) {
            await checkAuthStatus();
          }

          // Navigate directly to appropriate dashboard
          setTimeout(() => {
            if (userData.role === "EMPLOYER") {
              navigate("/employer/dashboard", { replace: true });
            } else if (userData.role === "CANDIDATE") {
              navigate("/candidate/dashboard", { replace: true });
            } else if (userData.role === "BRANCH_ADMIN") {
              navigate("/branch-admin/dashboard", { replace: true });
            } else {
              navigate("/candidate/dashboard", { replace: true });
            }
          }, 1500);

          // Return success for parent component if onVerificationSuccess is provided
          if (onVerificationSuccess) {
            return await onVerificationSuccess(verificationData);
          }
        } else {
          // Fallback: use parent component's verification handler
          if (onVerificationSuccess) {
            const result = await onVerificationSuccess(verificationData);
            if (result?.success && result?.user) {
              // Navigation will be handled by parent component
              return result;
            }
          }

          throw new Error("Authentication data not received properly");
        }
      } else {
        // Handle failure case
        const errorMessage =
          result?.error ||
          result?.message ||
          (result?.data && result.data.message) ||
          "Verification failed. Please try again.";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Verification failed:", error);

      // Check if the error response actually indicates success (for backwards compatibility)
      const errorMessage = error.response?.data?.message || error.message || "";
      const errorData = error.response?.data || {};

      if (
        errorMessage.toLowerCase().includes("successfully") ||
        errorData.success === true ||
        errorData.status === "success"
      ) {
        // It's actually a success, just wrapped in an error response
        const userData = errorData.user;
        const token = errorData.token;

        if (mode === "registration") {
          showSuccess(
            "🎉 Registration completed successfully! Welcome to your dashboard!",
          );
        } else {
          showSuccess(
            "🎉 Password reset successfully! Welcome back to your dashboard!",
          );
        }

        // Store authentication data if provided
        if (token && userData) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(userData));
          import("../../services/api").then(({ default: api }) => {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          });

          setTimeout(() => {
            if (userData.role === "EMPLOYER") {
              navigate("/employer/dashboard", { replace: true });
            } else if (userData.role === "CANDIDATE") {
              navigate("/candidate/dashboard", { replace: true });
            } else if (userData.role === "BRANCH_ADMIN") {
              navigate("/branch-admin/dashboard", { replace: true });
            } else {
              navigate("/candidate/dashboard", { replace: true });
            }
          }, 1500);
        }

        return {
          success: true,
          message:
            mode === "registration"
              ? "Registration completed successfully! Welcome to your dashboard!"
              : "Password reset successfully! Welcome back to your dashboard!",
          data: errorData,
        };
      }

      // Handle real errors
      const friendlyErrorMessage = getUserFriendlyErrorMessage(error);

      // Check if it's an OTP-specific error
      if (
        friendlyErrorMessage.toLowerCase().includes("invalid") &&
        friendlyErrorMessage.toLowerCase().includes("verification")
      ) {
        setErrors({
          otp: friendlyErrorMessage,
        });
        showError(friendlyErrorMessage);
      } else if (friendlyErrorMessage.toLowerCase().includes("expired")) {
        setErrors({
          otp: friendlyErrorMessage,
        });
        setOtp(""); // Clear OTP on expiry
        showError(friendlyErrorMessage);
      } else {
        setErrors({
          general: friendlyErrorMessage,
        });
        showError(friendlyErrorMessage);
      }

      // Re-throw for parent component if needed
      if (onVerificationSuccess) {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const ContactIcon = contactIcon;
  const buttonText =
    mode === "registration" ? "Complete Registration" : "Reset Password";
  const passwordSectionTitle =
    mode === "registration" ? "Create Password" : "Set New Password";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col lg:flex-row">
      {/* Left Panel - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-orange-500 items-center justify-center p-8">
        <div className="max-w-md text-center text-white">
          <div className="flex items-center justify-center mb-8">
            <img src="/images/logo.png" alt="LokalHunt Logo" className="h-14" />
          </div>
          <h1 className="text-4xl font-bold mb-6">
            {mode === "registration" ? "Almost There!" : "Reset Password"}
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            {mode === "registration"
              ? `Verify your ${contactType} to complete your LokalHunt registration`
              : `Enter the verification code and set your new password`}
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
              <span>Secure {contactType} verification</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
              <span>
                {mode === "registration"
                  ? "Set up your account password"
                  : "Create a new secure password"}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
              <span>
                {mode === "registration"
                  ? "Join the LokalHunt community"
                  : "Secure your account"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Mobile optimized */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <img
                src="/images/logo.png"
                alt="LokalHunt Logo"
                className="h-14"
              />
            </div>
          </div>

          {/* Verification Form Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-8">
            {/* Back Link */}
            <div className="mb-6">
              <button
                onClick={onBack}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isLoading || parentLoading}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </button>
            </div>

            {/* Header */}
            <div className="mb-6">
              {/* Icon and Title in same line */}
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 bg-blue-100 rounded-full mr-3 flex-shrink-0">
                  <ContactIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 text-center">
                  {title || defaultTitle}
                </h2>
              </div>
              <p className="text-sm text-gray-600 text-center">
                {subtitle || defaultSubtitle}
              </p>
            </div>

            {/* Alert for general errors */}
            {errors.general && !errors.otp && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-700 font-medium">
                    Verification Failed
                  </p>
                  <p className="text-sm text-red-600 mt-1">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Verification Form */}
            <form onSubmit={handleVerify} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Verification Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={handleChange}
                  placeholder="000000"
                  className={`w-full px-4 py-4 text-lg font-mono text-center border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
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
                    <p className="text-sm text-red-600">{errors.otp}</p>
                  </div>
                )}
                {otp.length === 6 && !errors.otp && (
                  <div className="mt-2 flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                    <p className="text-sm text-green-600">
                      Code entered successfully
                    </p>
                  </div>
                )}
              </div>

              {/* Resend Section */}
              <div className="text-center">
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

              {/* Password Section */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  {passwordSectionTitle}
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={handleChange}
                        placeholder={
                          isOtpComplete ? "Create password" : "Enter code first"
                        }
                        disabled={!isOtpComplete}
                        className={`w-full pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
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
                        <p className="text-sm text-red-600">
                          {errors.password}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      At least 6 characters
                    </p>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleChange}
                        placeholder={
                          isOtpComplete
                            ? "Confirm password"
                            : "Enter code first"
                        }
                        disabled={!isOtpComplete}
                        className={`w-full pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
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
                        <p className="text-sm text-red-600">
                          {errors.confirmPassword}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    parentLoading ||
                    !isOtpComplete ||
                    !password ||
                    !confirmPassword
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base"
                >
                  {isLoading || parentLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {mode === "registration"
                        ? "Completing..."
                        : "Resetting..."}
                    </div>
                  ) : (
                    buttonText
                  )}
                </button>
              </div>
            </form>

            {/* Help text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Didn't receive the code? Check your {contactType} or wait{" "}
                {resendCooldown > 0 ? `${resendCooldown}s` : ""} to resend
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
