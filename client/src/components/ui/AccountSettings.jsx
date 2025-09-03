import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Profile from "./Profile";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import Loader from "./Loader";
import { useToast } from "./Toast";

const AccountSettings = () => {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.getProfile();
      console.log("Profile API response:", response);

      // Handle different response structures
      let userData = null;
      if (response?.data?.data) {
        userData = response.data.data;
      } else if (response?.data) {
        userData = response.data;
      } else if (response?.success || response?.status === "success") {
        userData = response.data || response;
      }

      if (userData) {
        setProfileData(userData);
      } else {
        const errorMessage =
          response?.error || response?.message || "Failed to load profile data";
        setError(errorMessage);
        showError(errorMessage);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load profile data";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (formData) => {
    try {
      console.log("Updating profile with data:", formData);

      const response = await authService.updateProfile(formData);
      console.log("Profile update response:", response);

      if (
        response &&
        (response.status === "success" || response.success == true)
      ) {
        await fetchProfile(); // Refresh profile data
        // Refresh user data in AuthContext to update ProfileDropdown
        showSuccess("Profile updated successfully");

        if (refreshUser) {
          await refreshUser();
        }
      } else {
        const errorMessage =
          response?.error || response?.message || "Failed to update profile";
        console.error("Profile update failed:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";
      showError(errorMessage);
      throw error;
    }
  };

  const handleUpdatePassword = async (passwordData) => {
    try {
      const response = await authService.changePassword(passwordData);
      console.log("Password change response:", response);

      if (
        response &&
        (response.status === "success" || response.success == true)
      ) {
        showSuccess(response.message || "Password updated successfully");
        return response;
      } else {
        const errorMessage =
          response?.error || response?.message || "Failed to update password";
        console.error("Password update failed:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating password:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update password";
      showError(errorMessage);
      throw error;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to Load Profile
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchProfile}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show profile component
  return (
    <div className="min-h-screen bg-gray-50">
      <Profile
        profileData={profileData}
        onUpdateProfile={handleUpdateProfile}
        onUpdatePassword={handleUpdatePassword}
        userType={user?.role?.toLowerCase() || "user"}
        loading={false}
      />
    </div>
  );
};

export default AccountSettings;
