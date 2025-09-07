import { useState, useEffect } from 'react';

import Profile from '../../components/ui/Profile';
import { getProfile, updateProfile, updatePassword } from '../../services/branch-admin/auth';
import { useToast } from "../../components/ui/Toast";

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await getProfile();
      if (response.success) {
        setProfile(response.data);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (formData) => {
    const response = await updateProfile(formData);
    if (response.success) {
      setProfile(response.data);
      // Reload to get fresh data
      loadProfile();
      return response.data;
    } else {
      throw new Error(response.error);
    }
  };

  const handleUpdatePassword = async (passwordData) => {
    const response = await updatePassword(passwordData);
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Profile
          profileData={profile}
          onUpdateProfile={handleUpdateProfile}
          onUpdatePassword={handleUpdatePassword}
          userType="branchAdmin"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AdminProfile;