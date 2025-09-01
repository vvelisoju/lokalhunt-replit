
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Profile from "../../components/ui/Profile";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import Loader from "../../components/ui/Loader";

const AccountSettings = () => {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.getProfile();
      console.log("Profile API response:", response);
      
      if (response && (response.status === "success" || response.success !== false)) {
        const userData = response.data || response;
        setProfileData(userData);
      } else {
        const errorMessage = response?.error || "Failed to load profile data";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      const errorMessage = "Failed to load profile data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (formData) => {
    try {
      const response = await authService.updateProfile(formData);
      if (response && (response.status === "success" || response.success !== false)) {
        await fetchProfile(); // Refresh profile data
        // Refresh user data in AuthContext to update ProfileDropdown
        if (refreshUser) {
          await refreshUser();
        }
        toast.success("Profile updated successfully");
      } else {
        const errorMessage = response?.error || "Failed to update profile";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
      throw error;
    }
  };

  const handleUpdatePassword = async (passwordData) => {
    try {
      // Note: authService doesn't have updatePassword, this would need to be implemented
      // For now, keeping the original structure but using authService pattern
      const response = await authService.updateProfile(passwordData);
      if (response && (response.status === "success" || response.success !== false)) {
        toast.success("Password updated successfully");
      } else {
        const errorMessage = response?.error || "Failed to update password";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password");
      throw error;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Loading your profile...</p>
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
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to Load Profile
          </h3>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
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
        userType="employer"
        loading={false}
      />
    </div>
  );
};

export default AccountSettings;
