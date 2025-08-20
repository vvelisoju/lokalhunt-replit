import { useState, useEffect } from "react";
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
      const response = await profileService.getProfile(); // Use unified profile service
      console.log("Profile API response:", response);
      if (response.success) {
        // Handle the nested data structure: response.data.data.user
        setProfileData(response.data.data ? response.data.data.user : response.data);
      } else {
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
      const response = await profileService.updateProfile(formData); // Use unified profile service
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
      const response = await profileService.updatePassword(passwordData); // Use unified profile service
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
        userType="employer"
        loading={loading}
      />
    </div>
  );
};

export default AccountSettings;
