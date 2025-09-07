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
import { useToast } from "../components/ui/Toast";

const Login = () => {
  const { t } = useTranslation();
  const { login, user, isAuthenticated, loading } = useAuth();
  const candidateAuth = useCandidateAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const { success: showSuccess, error: showError } = useToast();

  // Check if user came from register/forgot-password/logout
  const navigationSource =
    location.state?.from?.pathname || location.state?.source;
  const isFromAuthPages =
    navigationSource === "/register" ||
    navigationSource === "/forgot-password" ||
    location.state?.source === "logout" ||
    location.state?.fromLogout;

  // State declarations moved to the top to comply with Rules of Hooks
  const [formData, setFormData] = useState({
    phone: "", // Changed from email to phone
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Add extra checks to prevent infinite loops during logout
    const hasValidToken =
      localStorage.getItem("token") || localStorage.getItem("candidateToken");

    // Skip redirect if coming from logout to prevent loops
    const isFromLogout =
      location.state?.source === "logout" ||
      location.state?.fromLogout ||
      sessionStorage.getItem("logout_redirect") === "true";

    console.log("Login useEffect - Auth state:", {
      isAuthenticated,
      hasUser: !!user,
      hasValidToken,
      loading,
      isFromLogout,
      pathname: location.pathname,
    });

    // CRITICAL FIX: If no valid token but isAuthenticated is true, this is an inconsistent state from logout
    // Force clear the authentication state immediately
    if (isAuthenticated && !hasValidToken && !loading) {
      console.log(
        "Login useEffect - Detected inconsistent auth state after logout, resetting",
      );

      // Import and use the logout utility to clear everything properly
      import("../utils/authUtils")
        .then(({ performLogout }) => {
          performLogout(navigate);
        })
        .catch(() => {
          // Fallback: manually clear state
          if (window.authContext) {
            window.authContext.setUser?.(null);
            window.authContext.setIsAuthenticated?.(false);
            window.authContext.setLoading?.(false);
          }
        });

      return;
    }

    // Only redirect if user is authenticated AND has valid token AND currently on the login page
    // Also ensure loading is false and not coming from logout
    if (
      isAuthenticated &&
      user?.role &&
      hasValidToken &&
      location.pathname === "/login" &&
      !loading &&
      !isFromLogout
    ) {
      console.log(
        "User already authenticated on login page, checking redirect:",
        user.role,
      );

      // Use requestAnimationFrame for smoother redirect without visible flicker
      const redirect = () => {
        // Double-check authentication state and ensure not from logout
        const stillFromLogout =
          location.state?.source === "logout" ||
          location.state?.fromLogout ||
          sessionStorage.getItem("logout_redirect") === "true";

        if (isAuthenticated && user?.role && !loading && !stillFromLogout) {
          // Clear any logout redirect flag
          sessionStorage.removeItem("logout_redirect");

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
                // Ensure candidateToken is set for candidates
                const token = localStorage.getItem("token");
                if (token) {
                  localStorage.setItem("candidateToken", token);
                }
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
                // Only set candidateToken if user is actually a candidate
                if (user.role === "CANDIDATE") {
                  const token = localStorage.getItem("token");
                  if (token) {
                    localStorage.setItem("candidateToken", token);
                  }
                }
                navigate("/candidate/dashboard", { replace: true });
            }
          }
        }
      };

      // Use requestAnimationFrame for immediate but smooth redirect
      requestAnimationFrame(redirect);
    }
  }, [
    isAuthenticated,
    user,
    navigate,
    location.state,
    location.pathname,
    loading,
  ]);

  // Show success message from password reset
  useEffect(() => {
    if (location.state?.message && location.state?.type === "success") {
      showSuccess(location.state.message);

      // Clear the state to prevent showing the message again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname, showSuccess]);

  // Redirect authenticated users appropriately - only when on login page

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
      showError("Please fill in all required fields correctly.");
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

        showSuccess("Login successful! Redirecting...");

        // IMMEDIATE navigation without delay to prevent flickering
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
          // Default fallback - only set candidateToken for actual candidates
          console.log(
            "Unknown role, redirecting to candidate dashboard as default",
          );
          if (user?.role === "CANDIDATE") {
            const token = localStorage.getItem("token");
            if (token) {
              localStorage.setItem("candidateToken", token);
            }
          }
          navigate("/candidate/dashboard", { replace: true });
        }
        return;
      }

      // Handle login failure with clearer messages
      let errorMessage = "Invalid mobile number or password. Please try again.";

      if (result.error && result.error.includes("Invalid")) {
        errorMessage = result.error;
      } else if (result.error && result.error.includes("deactivated")) {
        errorMessage =
          "Your account has been deactivated. Please contact support.";
      } else if (
        result.error &&
        (result.error.toLowerCase().includes("verify") ||
          result.error.toLowerCase().includes("verification"))
      ) {
        errorMessage =
          "Your account needs verification. Use 'Forgot Password' to complete your registration and set your password";
      } else if (
        result.error &&
        (result.error.toLowerCase().includes("not found") ||
          result.error.toLowerCase().includes("exist"))
      ) {
        errorMessage = "Mobile number not found. Please register.";
      } else if (
        result.error &&
        (result.error.toLowerCase().includes("blocked") ||
          result.error.toLowerCase().includes("suspended"))
      ) {
        errorMessage =
          "Your account has been suspended. Please contact support.";
      } else if (result.error) {
        errorMessage = result.error;
      }

      showError(errorMessage);

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
              "Your account needs verification. Use 'Forgot Password' to complete your registration and set your password";
          } else {
            errorMessage = "Wrong password. Try again or login with OTP.";
          }
        } else if (status === 403) {
          if (serverMessage && serverMessage.toLowerCase().includes("verify")) {
            errorMessage =
              "Your account needs verification. Use 'Forgot Password' to complete your registration and set your password";
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
              "Your account needs verification. Use 'Forgot Password' to complete your registration and set your password";
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

      showError(errorMessage);

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

  // Check if coming from logout - more comprehensive check
  const isFromLogout =
    location.state?.source === "logout" ||
    location.state?.fromLogout ||
    sessionStorage.getItem("logout_redirect") === "true";

  // Clear logout redirect flag if it exists - but do it in useEffect to avoid infinite re-renders
  useEffect(() => {
    if (sessionStorage.getItem("logout_redirect")) {
      sessionStorage.removeItem("logout_redirect");
    }
  }, []);

  // CRITICAL FIX: Show loading if we have authentication data but not from logout
  // This prevents the form from rendering while we have valid auth data
  const hasValidAuthData =
    localStorage.getItem("token") && localStorage.getItem("user");
  const shouldShowLoading =
    (loading && !isFromAuthPages) || (hasValidAuthData && !isFromLogout);

  // Show loading screen during initial auth check or when we have auth data
  if (shouldShowLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img src="/images/logo.png" alt="LokalHunt Logo" className="h-14" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">
            {hasValidAuthData
              ? "Redirecting to dashboard..."
              : "Checking authentication..."}
          </p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is authenticated (prevents flickering) but allow if from logout
  if (isAuthenticated && !loading && !isFromLogout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img src="/images/logo.png" alt="LokalHunt Logo" className="h-14" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

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
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-6">
              <img
                src="/images/logo.png"
                alt="LokalHunt Logo"
                className="h-14"
              />
            </div>

            <div className="space-y-2 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Welcome! Find Jobs Near You
              </h2>
              <div className="space-y-2">
                {/* <p className="text-gray-600 text-sm sm:text-base">
                  💼 Get jobs near your home
                </p> */}
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
                {/* <p className="text-gray-500 text-xs">
                  ✉️ Only employers can contact you
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;