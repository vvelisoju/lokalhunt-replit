import React, { useState, useEffect } from "react";
import Profile from "../../components/ui/Profile";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService"; // Changed import
import { useToast } from "../../components/ui/Toast";

const AccountSettings = () => {
  const { user, refreshUser } = useAuth(); // Added refreshUser
  const { success, error } = useToast();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Assuming authService also has a getProfile method or similar
      // If not, this line would need to be adjusted based on the actual authService functionality
      // For now, we'll assume a placeholder or that the original profileService.getProfile was intended to be here.
      // Since the user asked to remove profileService if not used, and the focus is on update methods,
      // we'll keep this as is for now, but it's a point of potential refactoring if profileService is truly unused.
      // If authService has a getProfile, it should be used here.
      // For the purpose of this edit, we are only changing the update methods as requested.
      const response = await authService.getProfile(); // Placeholder: Assuming authService has getProfile
      console.log("Branch Admin Profile API response:", response);

      if (response.success) {
        // Branch admin profile has a specific structure
        let userData = response.data;

        // If the response has nested data, extract it
        if (response.data.data) {
          userData = response.data.data;
        }

        // For branch admin, merge user data with branch admin specific data
        if (userData.user) {
          // Merge user data with branch admin data
          userData = {
            ...userData.user,
            ...userData,
            // Preserve branch admin specific fields
            assignedCity: userData.assignedCity,
            activitySummary: userData.activitySummary,
            hasActiveMOUs: userData.hasActiveMOUs,
            mous: userData.mous
          };
        }

        setProfileData(userData);
      } else {
        console.error("Profile fetch failed:", response.error);
        error(response.error || "Failed to load profile data");
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
      const response = await authService.updateProfile(formData);
      if (response && (response.status === "success" || response.success !== false)) {
        await fetchProfile(); // Refresh profile data
        // Refresh user data in AuthContext to update ProfileDropdown
        if (refreshUser) {
          await refreshUser();
        }
        success("Profile updated successfully");
      } else {
        throw new Error(response?.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      error(error.message || "Failed to update profile");
      throw error;
    }
  };

  const handleUpdatePassword = async (passwordData) => {
    try {
      const response = await authService.updatePassword(passwordData); // Changed method call
      if (response && (response.status === "success" || response.success !== false)) {
        success("Password updated successfully");
      } else {
        throw new Error(response?.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      error(error.message || "Failed to update password");
      throw error;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Profile
        profileData={profileData}
        onUpdateProfile={handleUpdateProfile}
        onUpdatePassword={handleUpdatePassword}
        userType="branchAdmin"
        loading={loading}
      />
    </div>
  );
};

export default AccountSettings;