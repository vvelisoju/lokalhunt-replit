import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Layout from "../../components/candidate/Layout";
import Profile from "../../components/ui/Profile";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";

const AccountSettings = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      if (response && (response.status === "success" || response.success !== false)) {
        const userData = response.data || response;
        setProfileData(userData);
      } else {
        toast.error(response?.error || "Failed to load profile data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (formData) => {
    try {
      const response = await authService.updateProfile(formData);
      if (response && (response.status === "success" || response.success !== false)) {
        await fetchProfile(); // Refresh profile data
      } else {
        throw new Error(response?.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const handleUpdatePassword = async (passwordData) => {
    try {
      const response = await profileService.updatePassword(passwordData);
      if (response.success) {
        toast.success("Password updated successfully");
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