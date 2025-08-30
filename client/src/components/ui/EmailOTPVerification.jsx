import React, { useState, useEffect } from "react";
import {
  LockClosedIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import FormInput from "./FormInput";
import Button from "./Button";
import { useToast } from "./Toast";

const EmailOTPVerification = ({
  email,
  onVerificationSuccess,
  onBack,
  loading: parentLoading,
}) => {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);

  // Check if OTP is complete (6 digits)
  const isOtpComplete = otp.length === 6;

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

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setResendCooldown(30);
        showSuccess("OTP sent successfully!");
      } else {
        throw new Error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Failed to send OTP:", error);
      showError("Failed to send OTP. Please try again.");
      setErrors({ general: "Failed to send OTP. Please try again." });
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
      validationErrors.otp = "Please enter a valid 6-digit code";
    }

    if (!password || password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters";
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
      await onVerificationSuccess({
        email,
        otp,
        password,
        confirmPassword,
      });
    } catch (error) {
      console.error("OTP verification failed:", error);

      // Show error toast notification
      showError(error.message || "Invalid OTP. Please try again.");

      // Set form errors to keep user on the same page
      setErrors({
        otp: "Invalid OTP code. Please check and try again.",
        general: error.message || "Verification failed. Please try again.",
      });

      // Clear the OTP input for user to enter a new one
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col lg:flex-row">
      {/* Left Panel - Logo and Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-orange-500 items-center justify-center p-8">
        <div className="max-w-md text-center text-white">
          <div className="flex items-center justify-center mb-8">
            <img src="/images/logo.png" alt="LokalHunt Logo" className="h-14" />
          </div>
          <h1 className="text-4xl font-bold mb-6">Almost There!</h1>
          <p className="text-xl mb-8 text-blue-100">
            Verify your email to complete your LokalHunt registration
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-300 rounded-full mr-3"></div>
              <span>Secure email verification</span>
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

      {/* Right Panel - Verification Form */}
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
            {/* Back Link */}
            <div className="mb-6">
              <button
                onClick={onBack}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isLoading || parentLoading}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Registration
              </button>
            </div>

            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex items-center justify-center mb-4">
                <EnvelopeIcon className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Verify your email
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                We've sent a 6-digit code to{" "}
                <span className="font-medium text-blue-600">{email}</span>
              </p>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerify} className="space-y-4 sm:space-y-5">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={handleChange}
                  placeholder="000000"
                  className={`w-full pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.otp
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 bg-gray-50 focus:bg-white"
                  }`}
                  maxLength={6}
                  autoComplete="one-time-code"
                />
                {errors.otp && (
                  <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
                )}
              </div>

              {/* Resend Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || isLoading}
                  className={`text-sm ${
                    resendCooldown > 0 || isLoading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:text-blue-500 cursor-pointer font-medium"
                  }`}
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend code"}
                </button>
              </div>

              {/* Password Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Set your password
                </h3>

                <div className="space-y-4">
                  <FormInput
                    label="Password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    placeholder={
                      isOtpComplete ? "Create a password" : "Enter OTP first"
                    }
                    required
                    icon={LockClosedIcon}
                    error={errors.password}
                    helpText="Must be at least 6 characters"
                    disabled={!isOtpComplete}
                    className={`w-full pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.password
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-gray-50 focus:bg-white"
                    }`}
                  />

                  <FormInput
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    placeholder={
                      isOtpComplete
                        ? "Confirm your password"
                        : "Enter OTP first"
                    }
                    required
                    icon={LockClosedIcon}
                    error={errors.confirmPassword}
                    disabled={!isOtpComplete}
                    className={`w-full pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.confirmPassword
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-gray-50 focus:bg-white"
                    }`}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={isLoading || parentLoading}
                  className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-4 px-4 rounded-2xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base hover:border-gray-300"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isLoading || parentLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base"
                >
                  {isLoading || parentLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    "Verify & Complete"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailOTPVerification;
