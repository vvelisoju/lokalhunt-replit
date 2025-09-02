import React, { useState, useEffect } from "react";
import Layout from "../../components/candidate/Layout";
import Profile from "../../components/ui/Profile";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { profileService } from "../../services/profileService";
import { useToast } from "../../components/ui/Toast";

const AccountSettings = () => {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      if (
        response &&
        (response.status === "success" || response.success !== false)
      ) {
        const userData = response.data || response;
        setProfileData(userData);
      } else {
        error(response?.error || "Failed to load profile data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (formData) => {
    try {
      console.log("Updating candidate profile with data:", formData);

      // Use authService for user-related updates to maintain consistent user structure
      const response = await authService.updateProfile(formData);
      console.log("Profile update response:", response);

      if (response && (response.status === "success" || response.success)) {
        await fetchProfile(); // Refresh profile data
        success("Profile updated successfully");
        
        // Always refresh user data to update ProfileDropdown with flat user structure
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        const errorMessage = response?.error || response?.message || "Failed to update profile";
        console.error("Profile update failed:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update profile";
      throw new Error(errorMessage);
    }
  };

  const handleUpdatePassword = async (passwordData) => {
    try {
      const response = await profileService.updatePassword(passwordData);
      if (response.success) {
        success("Password updated successfully");
      } else {
        throw new Error(response.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Profile
        profileData={profileData}
        onUpdateProfile={handleUpdateProfile}
        onUpdatePassword={handleUpdatePassword}
        userType="candidate"
        loading={loading}
      />
    </div>
  );
};

export default AccountSettings;
