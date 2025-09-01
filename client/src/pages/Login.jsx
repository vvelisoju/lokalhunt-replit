import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCandidateAuth } from "../hooks/useCandidateAuth";
import FormInput from "../components/ui/FormInput";
import Button from "../components/ui/Button";
import {
  EyeIcon,
  EyeSlashIcon,
  PhoneIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

const Login = () => {
  const { t } = useTranslation();
  const { login, user, isAuthenticated } = useAuth();
  const candidateAuth = useCandidateAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // Redirect authenticated users appropriately - only when on login page
  useEffect(() => {
    // Add extra checks to prevent infinite loops during logout
    const hasValidToken =
      localStorage.getItem("token") || localStorage.getItem("candidateToken");

    // Only redirect if user is authenticated AND has valid token AND currently on the login page
    if (
      isAuthenticated &&
      user?.role &&
      hasValidToken &&
      location.pathname === "/login"
    ) {
      console.log(
        "User already authenticated on login page, checking redirect:",
        user.role,
      );

      // Add a small delay to prevent rapid redirects during logout
      const timeoutId = setTimeout(() => {
        // Double-check authentication state again after delay
        if (isAuthenticated && user?.role) {
          // Check if they came from a protected route
          const returnUrl = location.state?.from?.pathname;

          if (returnUrl && returnUrl !== "/" && returnUrl !== "/login") {
            console.log("Redirecting authenticated user to:", returnUrl);
            navigate(returnUrl, { replace: true });
          } else {
            // Default role-based redirects
            console.log("No return URL, redirecting based on role:", user.role);
            switch (user.role) {
              case "CANDIDATE":
                console.log("Redirecting to candidate dashboard");
                navigate("/candidate/dashboard", { replace: true });
                break;
              case "EMPLOYER":
                console.log("Redirecting to employer dashboard");
                navigate("/employer/dashboard", { replace: true });
                break;
              case "BRANCH_ADMIN":
                console.log("Redirecting to branch admin dashboard");
                navigate("/branch-admin/dashboard", { replace: true });
                break;
              default:
                console.log(
                  "Unknown role, redirecting to candidate dashboard as default",
                );
                navigate("/candidate/dashboard", { replace: true });
            }
          }
        }
      }, 200); // 200ms delay to let logout complete

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, user, navigate, location.state, location.pathname]);

  // Show success message from password reset
  useEffect(() => {
    if (location.state?.message && location.state?.type === "success") {
      toast.success(location.state.message, {
        duration: 4000,
        style: {
          background: "#10b981",
          color: "#ffffff",
          fontWeight: "600",
          padding: "16px",
          borderRadius: "12px",
          maxWidth: "500px",
        },
      });

      // Clear the state to prevent showing the message again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const [formData, setFormData] = useState({
    phone: "", // Changed from email to phone
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Changed validation for phone number
    if (!formData.phone) {
      newErrors.phone = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      // Basic 10-digit number validation
      newErrors.phone = "Please enter a valid 10-digit mobile number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) {
      // Show validation error message
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Changed to use phone instead of email
    console.log("Starting login process with:", { phone: formData.phone });

    try {
      const result = await login({
        phone: formData.phone.trim(), // Use phone number
        password: formData.password,
      });

      console.log("Login result:", result);

      if (result.success && result.user) {
        const user = result.user;
        console.log("Login successful, user:", user, "role:", user?.role);

        toast.success("Login successful! Redirecting...");

        // Check if user came from a protected route and redirect appropriately
        const returnUrl = location.state?.from?.pathname;
        console.log(
          "Login successful, return URL:",
          returnUrl,
          "user role:",
          user?.role,
        );

        if (returnUrl && returnUrl !== "/" && returnUrl !== "/login") {
          navigate(returnUrl, { replace: true });
        } else if (user?.role === "BRANCH_ADMIN") {
          navigate("/branch-admin/dashboard", { replace: true });
        } else if (user?.role === "EMPLOYER") {
          navigate("/employer/dashboard", { replace: true });
        } else if (user?.role === "CANDIDATE") {
          // For candidates, also set up candidate auth
          const token = localStorage.getItem("token");
          if (token) {
            localStorage.setItem("candidateToken", token);
          }
          navigate("/candidate/dashboard", { replace: true });
        } else {
          // Default to candidate dashboard
          const token = localStorage.getItem("token");
          if (token) {
            localStorage.setItem("candidateToken", token);
          }
          navigate("/candidate/dashboard", { replace: true });
        }
        return;
      }

      // Handle login failure with clearer messages
      let errorMessage = "Invalid mobile number or password. Please try again.";

      if (result.error) {
        if (
          result.error.toLowerCase().includes("verify") ||
          result.error.toLowerCase().includes("verification")
        ) {
          errorMessage =
            "Please verify your account before logging in. Check your SMS for verification code.";
        } else if (
          result.error.toLowerCase().includes("invalid") ||
          result.error.toLowerCase().includes("incorrect")
        ) {
          errorMessage = "Wrong password. Try again or login with OTP.";
        } else if (
          result.error.toLowerCase().includes("not found") ||
          result.error.toLowerCase().includes("exist")
        ) {
          errorMessage = "Mobile number not found. Please register.";
        } else if (
          result.error.toLowerCase().includes("blocked") ||
          result.error.toLowerCase().includes("suspended")
        ) {
          errorMessage =
            "Your account has been suspended. Please contact support.";
        } else {
          errorMessage = result.error;
        }
      }

      console.error("Login failed:", errorMessage);

      // Always show error toast for failed login
      toast.error(errorMessage);

      // Also set form errors for visual feedback
      setErrors({
        general: errorMessage,
        phone: "Please check your mobile number",
        password: "Please check your password",
      });

      // Clear password field for security but keep phone
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage =
        "Unable to connect to server. Please check your connection and try again.";

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const serverMessage = error.response.data?.message;

        if (status === 401) {
          if (serverMessage && serverMessage.toLowerCase().includes("verify")) {
            errorMessage =
              "Please verify your account before logging in. Check your SMS for verification code.";
          } else {
            errorMessage = "Wrong password. Try again or login with OTP.";
          }
        } else if (status === 403) {
          if (serverMessage && serverMessage.toLowerCase().includes("verify")) {
            errorMessage =
              "Please verify your account before logging in. Check your SMS for verification code.";
          } else {
            errorMessage = "Account is deactivated. Please contact support.";
          }
        } else if (status === 404) {
          errorMessage = "Mobile number not found. Please register.";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (serverMessage) {
          // Handle specific server messages
          if (
            serverMessage.toLowerCase().includes("verify") ||
            serverMessage.toLowerCase().includes("verification")
          ) {
            errorMessage =
              "Please verify your account before logging in. Check your SMS for verification code.";
          } else if (
            serverMessage.toLowerCase().includes("not found") ||
            serverMessage.toLowerCase().includes("exist")
          ) {
            errorMessage = "Mobile number not found. Please register.";
          } else {
            errorMessage = serverMessage;
          }
        }
      } else if (error.request) {
        // Network error - request was made but no response received
        errorMessage =
          "Unable to connect to server. Please check your internet connection.";
      } else if (error.message) {
        // Something else happened
        errorMessage = `Login failed: ${error.message}`;
      }

      // Always show error toast for exceptions
      toast.error(errorMessage);

      // Also set form errors for visual feedback
      setErrors({
        general: errorMessage,
        phone: "Connection error",
        password: "Please try again",
      });

      // Clear password field for security but keep phone
      setFormData((prev) => ({ ...prev, password: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col lg:flex-row">
      {/* Left Panel - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-orange-500 items-center justify-center p-8">
        <div className="max-w-md text-center text-white">
          <div className="flex items-center justify-center mb-8">
            <img src="/images/logo.png" alt="LokalHunt Logo" className="h-14" />
          </div>
          <h1 className="text-4xl font-bold mb-6">Welcome Back</h1>
          <p className="text-xl mb-8 text-blue-100 leading-relaxed">
            Continue your journey to find the perfect local opportunities
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-300 rounded-full mr-4 flex-shrink-0"></div>
              <span className="text-lg">Connect with local employers</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-300 rounded-full mr-4 flex-shrink-0"></div>
              <span className="text-lg">
                Discover city-specific opportunities
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-300 rounded-full mr-4 flex-shrink-0"></div>
              <span className="text-lg">Build your professional network</span>
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

            <div className="space-y-3 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Welcome! Find Jobs Near You
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm sm:text-base">
                  💼 Get jobs near your home
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  🤝 Connect directly with employers in your city
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-base lg:text-lg">
              Login with your mobile number
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error Message */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm text-center">
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Mobile Number Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel" // Changed type to tel for phone numbers
                    name="phone" // Changed name to phone
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    onInput={(e) => {
                      // Allow only digits and limit to 10 characters
                      e.target.value = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 10);
                      // Update the form data
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }));
                    }}
                    className={`w-full pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.phone // Changed error key to phone
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-gray-50 focus:bg-white"
                    }`}
                    required
                  />
                </div>
                {errors.phone && ( // Changed error key to phone
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p> // Changed error key to phone
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.password
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-gray-50 focus:bg-white"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Trust Signals and Assurance */}
            <div className="mt-6 space-y-3">
              <div className="text-center">
                <p className="text-blue-600 font-medium text-sm">
                  💼 No fees, direct jobs from local employers
                </p>
              </div>
              <div className="space-y-2 text-center">
                <p className="text-gray-500 text-xs">
                  🔒 Your details are safe and private
                </p>
                <p className="text-gray-500 text-xs">
                  ✉️ Only employers can contact you
                </p>
              </div>
            </div>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Register free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
