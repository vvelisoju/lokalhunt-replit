import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Profile from "../../components/ui/Profile";
import { useAuth } from "../../context/AuthContext";
import { profileService } from "../../services/profileService";

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
      const response = await profileService.getProfile(); // Using unified profile service
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
        toast.error(response.error || "Failed to load profile data");
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
      const response = await profileService.updateProfile(formData); // Using unified profile service
      if (response.success) {
        await fetchProfile(); // Refresh profile data
      } else {
        throw new Error(response.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const handleUpdatePassword = async (passwordData) => {
    try {
      const response = await profileService.updatePassword(passwordData); // Using unified profile service
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
