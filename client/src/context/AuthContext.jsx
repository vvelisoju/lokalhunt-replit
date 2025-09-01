import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import api from "../services/api"; // Import default export

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Set auth header
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Always use the universal auth profile endpoint - works for all user roles
        console.log("AuthContext: Checking auth status using /auth/profile");
        const response = await api.get("/auth/profile");
        console.log("AuthContext: Auth profile response:", response.data);

        if (
          response.data &&
          (response.data.status === "success" ||
            response.data.success !== false)
        ) {
          const userData = response.data.data || response.data;
          console.log("AuthContext: Setting user data:", userData);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          throw new Error("Invalid profile response");
        }
      } else {
        // No token found
        console.log("AuthContext: No token found");
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("AuthContext: Auth check failed:", error);
      // Clear all auth data on failure
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log(
        "AuthContext: Attempting login with credentials for:",
        credentials.phone || credentials.email,
      );

      const response = await authService.login(credentials);
      console.log("AuthContext: Raw login response:", response);

      // Check for successful response structure
      if (response && (response.success || response.data)) {
        const responseData = response.data || response;
        const { user, token } = responseData;

        console.log("AuthContext: Extracted data:", {
          user,
          token: token ? "present" : "missing",
        });

        if (token && user) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          // Set auth header for subsequent requests
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setUser(user);
          setIsAuthenticated(true);
          setLoading(false); // Ensure loading is cleared on successful login
          console.log("AuthContext: Login successful, user set:", user);
          return { success: true, user };
        } else {
          console.error("AuthContext: Missing token or user data:", {
            token: !!token,
            user: !!user,
          });
          setLoading(false); // Clear loading on error
          return { success: false, error: "Invalid response from server" };
        }
      }

      console.log("AuthContext: Login failed - invalid response structure");
      setLoading(false); // Clear loading on failed response
      return {
        success: false,
        error: response.error || response.message || "Login failed",
      };
    } catch (error) {
      console.error("AuthContext: Login error:", error);

      let errorMessage = "Login failed";

      if (error.response) {
        // Server responded with error
        const { status, data } = error.response;
        console.log("AuthContext: Server error response:", { status, data });

        if (data?.message) {
          errorMessage = data.message;
        } else if (status === 401) {
          errorMessage = "Invalid phone number or password";
        } else if (status === 403) {
          errorMessage = "Account is deactivated";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = `Server error (${status})`;
        }
      } else if (error.request) {
        // Network error
        console.log("AuthContext: Network error:", error.request);
        errorMessage =
          "Unable to connect to server. Please check your connection.";
      } else {
        // Other error
        console.log("AuthContext: Other error:", error.message);
        errorMessage = error.message || "Unexpected error occurred";
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false); // Always clear loading state
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log("AuthContext: Starting registration for:", userData.phone || userData.email);
      
      const response = await authService.register(userData);
      console.log("AuthContext: Registration response:", response);
      
      // Handle registration response - it should return user data and optionally token
      if (response && (response.success || response.data)) {
        const responseData = response.data || response;
        
        // For registration, we might get user data but need to handle OTP verification
        if (responseData.user) {
          console.log("AuthContext: Registration successful, user data received:", responseData.user);
          
          // If we get a token, set authentication immediately
          if (responseData.token) {
            localStorage.setItem("token", responseData.token);
            localStorage.setItem("user", JSON.stringify(responseData.user));
            api.defaults.headers.common["Authorization"] = `Bearer ${responseData.token}`;
            setUser(responseData.user);
            setIsAuthenticated(true);
          }
          
          return { success: true, user: responseData.user, token: responseData.token };
        }
        
        return { success: true, data: responseData };
      }
      
      console.log("AuthContext: Registration failed - invalid response structure");
      return {
        success: false,
        error: response.error || response.message || "Registration failed",
      };
    } catch (error) {
      console.error("AuthContext: Registration error:", error);
      
      let errorMessage = "Registration failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (verificationData) => {
    try {
      setLoading(true);
      console.log("AuthContext: Starting OTP verification");
      
      const response = await authService.verifyOTP(verificationData);
      console.log("AuthContext: OTP verification response:", response);
      
      // Handle successful OTP verification
      if (response && (response.success || response.data)) {
        const responseData = response.data || response;
        
        if (responseData.token && responseData.user) {
          console.log("AuthContext: OTP verification successful, setting auth state");
          
          // Store authentication data
          localStorage.setItem("token", responseData.token);
          localStorage.setItem("user", JSON.stringify(responseData.user));
          api.defaults.headers.common["Authorization"] = `Bearer ${responseData.token}`;
          
          // IMPORTANT: Set authentication state immediately and ensure loading is false
          setUser(responseData.user);
          setIsAuthenticated(true);
          setLoading(false); // Set loading to false immediately after successful auth
          
          console.log("AuthContext: User authenticated after OTP verification:", responseData.user);
          console.log("AuthContext: Authentication state set - isAuthenticated: true, loading: false");
          
          // Force a small delay to ensure state is properly updated before navigation
          await new Promise(resolve => setTimeout(resolve, 100));
          
          return { success: true, user: responseData.user, token: responseData.token };
        }
        
        return { success: true, data: responseData };
      }
      
      console.log("AuthContext: OTP verification failed - invalid response structure");
      return {
        success: false,
        error: response.error || response.message || "OTP verification failed",
      };
    } catch (error) {
      console.error("AuthContext: OTP verification error:", error);
      
      let errorMessage = "OTP verification failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      // Only set loading to false if we haven't already done so above
      // This prevents overriding the successful auth state
      if (!localStorage.getItem("token")) {
        setLoading(false);
      }
    }
  };

  const logout = async (navigate = null) => {
    try {
      console.log("AuthContext: Starting logout process");

      // Try to call logout endpoint, but don't fail if it doesn't exist
      await authService.logout();
    } catch (error) {
      // Ignore API errors during logout - still proceed with client-side cleanup
      console.log(
        "Logout API call failed, proceeding with client-side cleanup",
      );
    }

    // Import and use common logout function
    const { clearAllAuthData } = await import("../utils/authUtils");

    // CRITICAL: Clear candidate context FIRST before clearing auth data
    if (window.candidateContext?.clearData) {
      console.log("AuthContext: Clearing candidate context data");
      window.candidateContext.clearData();
    }

    // Clear all storage to prevent loops
    console.log("AuthContext: Clearing all auth data from storage");
    clearAllAuthData();

    // THEN reset local auth state
    console.log("AuthContext: Resetting auth state");
    setUser(null);
    setIsAuthenticated(false);

    // Small delay to ensure state is updated before navigation
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("AuthContext: Logout complete, navigating to login");

    // Finally navigate
    if (navigate && typeof navigate === "function") {
      navigate("/login", { replace: true });
    } else {
      window.location.href = "/login";
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getProfile();
      if (
        response &&
        (response.status === "success" || response.success !== false)
      ) {
        const userData = response.data || response;
        console.log("AuthContext: Refreshed user data:", userData);
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return userData;
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  // Role-aware navigation helper
  const getDefaultDashboard = (role) => {
    console.log("getDefaultDashboard", role);
    switch (role) {
      case "CANDIDATE":
        return "/candidate/dashboard";
      case "EMPLOYER":
        return "/employer/dashboard";
      case "BRANCH_ADMIN":
        return "/branch-admin/dashboard";
      case "SUPER_ADMIN":
        return "/super-admin/dashboard";
      default:
        return "/candidate/dashboard";
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user can access employer features (either as employer or admin)
  const canAccessEmployerFeatures = () => {
    return (
      user?.role === "EMPLOYER" ||
      user?.role === "BRANCH_ADMIN" ||
      user?.role === "SUPER_ADMIN"
    );
  };

  // Updated fetchUserProfile to use the universal auth endpoint for all users
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      // Set auth header if not already set
      if (!api.defaults.headers.common["Authorization"]) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      // Always use the universal auth profile endpoint - works for all roles
      console.log("AuthContext: Fetching user profile via /auth/profile");
      const response = await api.get("/auth/profile");
      console.log("AuthContext: Profile response:", response.data);

      if (
        response.data &&
        (response.data.status === "success" || response.data.success !== false)
      ) {
        const userData = response.data.data || response.data;
        console.log("AuthContext: Setting fetched user data:", userData);
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return userData;
      } else {
        throw new Error("Invalid profile response structure");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response?.status === 401) {
        console.log("AuthContext: 401 error, logging out user");
        logout();
      }
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    verifyOTP,
    logout,
    checkAuthStatus,
    updateUser,
    getDefaultDashboard,
    hasRole,
    canAccessEmployerFeatures,
    refreshUser,
    fetchUserProfile, // Ensure fetchUserProfile is exposed if needed by other parts of the app
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
