import React, { useState, useEffect, useCallback } from "react";
import {
  PencilIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  CameraIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// AboutContent component for expandable text
const AboutContent = ({ summary, loading, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);

  // Character limits for mobile and desktop
  const MOBILE_LIMIT = 150;
  const DESKTOP_LIMIT = 250;

  useEffect(() => {
    if (summary) {
      // Check if content needs truncation on mobile or desktop
      const isMobile = window.innerWidth < 640;
      const limit = isMobile ? MOBILE_LIMIT : DESKTOP_LIMIT;
      setShowSeeMore(summary.length > limit);
    }
  }, [summary]);

  // Handle window resize to adjust truncation
  useEffect(() => {
    const handleResize = () => {
      if (summary) {
        const isMobile = window.innerWidth < 640;
        const limit = isMobile ? MOBILE_LIMIT : DESKTOP_LIMIT;
        setShowSeeMore(summary.length > limit);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [summary]);

  const getTruncatedText = (text) => {
    if (!text || isExpanded) return text;
    const isMobile = window.innerWidth < 640;
    const limit = isMobile ? MOBILE_LIMIT : DESKTOP_LIMIT;
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  const SkeletonLine = ({ width = "w-full", height = "h-4" }) => (
    <div
      className={`${width} ${height} bg-gray-300 rounded animate-pulse`}
    ></div>
  );

  if (loading) {
    return (
      <div className="space-y-2">
        <SkeletonLine width="w-full" height="h-4" />
        <SkeletonLine width="w-5/6" height="h-4" />
        <SkeletonLine width="w-4/5" height="h-4" />
      </div>
    );
  }

  if (!summary) {
    return (
      <button
        onClick={onEdit}
        className="text-gray-500 hover:text-blue-600 cursor-pointer text-left transition-colors text-sm w-full text-left"
      >
        Add a summary about yourself, your experience, and career goals. This
        helps recruiters understand your background.
      </button>
    );
  }

  return (
    <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
      <div className="whitespace-pre-wrap break-words">
        {getTruncatedText(summary)}
      </div>
      {showSeeMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 rounded px-1"
        >
          {isExpanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
};
import { useCandidateAuth } from "../../hooks/useCandidateAuth";
import { useCandidate } from "../../context/CandidateContext";
import { candidateApi, getImageUrl } from "../../services/candidateApi";
import Button from "../../components/ui/Button";
import EditAboutModal from "../../components/profile/EditAboutModal";
import EditExperienceModal from "../../components/profile/EditExperienceModal";
import EditEducationModal from "../../components/profile/EditEducationModal";
import EditSkillsModal from "../../components/profile/EditSkillsModal";
import EditSkillsWithExperienceModal from "../../components/profile/EditSkillsWithExperienceModal";
import EditPreferencesModal from "../../components/profile/EditPreferencesModal";
import EditProfileModal from "../../components/profile/EditProfileModal";
import FileUploadModal from "../../components/ui/FileUploadModal";
import { ObjectUploader } from "../../components/ObjectUploader.jsx";
import axios from "axios";

const LinkedInProfile = () => {
  const { user } = useCandidateAuth();
  const { profile, fetchProfile, updateProfile, loading, dispatch } =
    useCandidate();
  const [profileData, setProfileData] = useState(null);

  // Modal states
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showSkillsWithExperienceModal, setShowSkillsWithExperienceModal] =
    useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);

  // Edit states
  const [editingExperience, setEditingExperience] = useState(null);
  const [editingEducation, setEditingEducation] = useState(null);
  const [experienceIndex, setExperienceIndex] = useState(-1);
  const [educationIndex, setEducationIndex] = useState(-1);

  // Open to work state - initialize from profile data
  const [openToWork, setOpenToWork] = useState(
    profileData?.profileData?.openToWork || false,
  );

  useEffect(() => {
    if (user && !profile && !loading) {
      console.log("LinkedInProfile: Fetching profile for user:", user);
      fetchProfile();
    }
  }, [user, profile, loading, fetchProfile]);

  // Clear profile data when user changes (logout/login with different user)
  useEffect(() => {
    return () => {
      // Clear local profile data when component unmounts (user logout)
      if (!user) {
        console.log("LinkedInProfile: User logged out, clearing profile data");
        setProfileData(null);
      }
    };
  }, [user]);

  // Update open to work state when profile data changes
  useEffect(() => {
    if (profileData?.profileData?.openToWork !== undefined) {
      setOpenToWork(profileData.profileData.openToWork);
    }
  }, [profileData?.profileData?.openToWork]);

  // Upload handlers for ObjectUploader
  const handleGetUploadParameters = useCallback(async () => {
    try {
      const response = await candidateApi.getUploadUrl();
      console.log("Upload URL response:", response);

      if (!response?.data?.data?.uploadURL) {
        throw new Error("Failed to get upload URL from response");
      }

      return {
        method: "PUT",
        url: response.data.data.uploadURL,
      };
    } catch (error) {
      console.error("Error getting upload parameters:", error);
      throw error;
    }
  }, []);

  const handleGetProfileImageUploadParameters = useCallback(async () => {
    try {
      console.log("🖼️ [PROFILE IMAGE] Getting upload parameters...");
      const response = await candidateApi.getProfileImageUploadUrl();
      console.log("🖼️ [PROFILE IMAGE] Upload URL API response:", response);

      if (!response?.data?.data?.uploadURL) {
        console.error(
          "🖼️ [PROFILE IMAGE] Missing uploadURL in response:",
          response,
        );
        throw new Error("Failed to get profile image upload URL from response");
      }

      const uploadURL = response.data.data.uploadURL;
      const publicURL = response.data.data.publicURL;

      console.log("📡 [PROFILE IMAGE] Generated upload URL:", uploadURL);
      console.log(
        "🌐 [PROFILE IMAGE] Expected public URL after upload:",
        publicURL,
      );

      // Store public URL in global scope for use after upload
      window._profileImagePublicURL = publicURL;

      return uploadURL;
    } catch (error) {
      console.error(
        "💥 [PROFILE IMAGE] Error getting upload parameters:",
        error,
      );
      console.error(
        "💥 [PROFILE IMAGE] Full error details:",
        error.response || error,
      );
      throw error;
    }
  }, []);

  const handleGetCoverImageUploadParameters = useCallback(async () => {
    try {
      console.log("🎨 [COVER IMAGE] Getting upload parameters...");
      const response = await candidateApi.getCoverImageUploadUrl();
      console.log("🎨 [COVER IMAGE] Upload URL API response:", response);

      if (!response?.data?.data?.uploadURL) {
        console.error(
          "🎨 [COVER IMAGE] Missing uploadURL in response:",
          response,
        );
        throw new Error("Failed to get cover image upload URL from response");
      }

      const uploadURL = response.data.data.uploadURL;
      const publicURL = response.data.data.publicURL;

      console.log("📡 [COVER IMAGE] Generated upload URL:", uploadURL);
      console.log(
        "🌐 [COVER IMAGE] Expected public URL after upload:",
        publicURL,
      );

      // Store public URL in global scope for use after upload
      window._coverImagePublicURL = publicURL;

      return uploadURL;
    } catch (error) {
      console.error("💥 [COVER IMAGE] Error getting upload parameters:", error);
      console.error(
        "💥 [COVER IMAGE] Full error details:",
        error.response || error,
      );
      throw error;
    }
  }, []);

  const handleProfilePhotoComplete = async (result) => {
    try {
      console.log(
        "🖼️ PROFILE PHOTO UPLOAD COMPLETE - Full result:",
        JSON.stringify(result, null, 2),
      );

      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        console.log(
          "📁 Uploaded file details:",
          JSON.stringify(uploadedFile, null, 2),
        );

        // Use the stored public URL from when we got the upload parameters
        let photoURL = window._profileImagePublicURL;

        // Fallback to constructing URL from upload URL if public URL not available
        if (!photoURL) {
          photoURL = uploadedFile.uploadURL?.split("?")[0]; // Remove query parameters
        }

        console.log("🌐 PUBLIC PROFILE PHOTO URL (FINAL):", photoURL);
        console.log("📋 Profile photo URL (copy this to test):", photoURL);

        // Update profile with the photo URL
        const updateResponse = await candidateApi.updateProfilePhoto({
          photoURL,
        });
        console.log("✅ Profile update API response:", updateResponse);

        // Update local state immediately for smooth transition
        setProfileData((prev) => ({
          ...prev,
          profilePhoto: photoURL,
        }));

        // Clear the cached profile state and refresh
        if (dispatch) {
          dispatch({ type: "CLEAR_PROFILE" });
        }
        setTimeout(() => {
          fetchProfile();
        }, 100); // Small delay for smooth transition

        console.log(
          "🎉 Profile photo upload completed successfully - PUBLIC URL:",
          photoURL,
        );

        // Clean up the global variable
        delete window._profileImagePublicURL;
      } else {
        console.error("❌ No successful upload found in result:", result);
      }
    } catch (error) {
      console.error("💥 Error completing profile photo upload:", error);
      // Don't show alert, just log the error
    }
  };

  const handleCoverPhotoComplete = async (result) => {
    try {
      console.log(
        "🎨 COVER PHOTO UPLOAD COMPLETE - Full result:",
        JSON.stringify(result, null, 2),
      );

      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        console.log(
          "📁 Uploaded file details:",
          JSON.stringify(uploadedFile, null, 2),
        );

        // Use the stored public URL from when we got the upload parameters
        let photoURL = window._coverImagePublicURL;

        // Fallback to constructing URL from upload URL if public URL not available
        if (!photoURL) {
          photoURL = uploadedFile.uploadURL?.split("?")[0]; // Remove query parameters
        }

        console.log("🌐 PUBLIC COVER PHOTO URL (FINAL):", photoURL);
        console.log("📋 Cover photo URL (copy this to test):", photoURL);

        // Update profile with the photo URL
        const updateResponse = await candidateApi.updateCoverPhoto({
          photoURL,
        });
        console.log("✅ Cover update API response:", updateResponse);

        // Update local state immediately for smooth transition
        setProfileData((prev) => ({
          ...prev,
          coverPhoto: photoURL,
        }));

        // Clear the cached profile state and refresh
        if (dispatch) {
          dispatch({ type: "CLEAR_PROFILE" });
        }
        setTimeout(() => {
          fetchProfile();
        }, 100); // Small delay for smooth transition

        console.log(
          "🎉 Cover photo upload completed successfully - PUBLIC URL:",
          photoURL,
        );

        // Clean up the global variable
        delete window._coverImagePublicURL;
      } else {
        console.error("❌ No successful upload found in result:", result);
      }
    } catch (error) {
      console.error("💥 Error completing cover photo upload:", error);
      // Don't show alert, just log the error
    }
  };

  useEffect(() => {
    if (profile && JSON.stringify(profile) !== JSON.stringify(profileData)) {
      console.log("Profile data received in component:", profile);
      console.log("Profile user data:", profile?.user);
      console.log("Profile profileData field:", profile?.profileData);
      console.log(
        "Job preferences structure:",
        profile?.profileData?.jobPreferences,
      );
      console.log("Profile photo URL:", profile?.profilePhoto);
      console.log("Cover photo URL:", profile?.coverPhoto);
      console.log(
        "Processed profile photo URL:",
        getImageUrl(profile?.profilePhoto),
      );
      console.log(
        "Processed cover photo URL:",
        getImageUrl(profile?.coverPhoto),
      );
      setProfileData(profile);
      // Set openToWork status from the fetched profile data
      const openToWorkStatus =
        profile?.openToWork || profile?.profileData?.openToWork || false;
      console.log("Profile loaded:", {
        profileOpenToWork: profile?.openToWork,
        profileDataOpenToWork: profile?.profileData?.openToWork,
        finalStatus: openToWorkStatus,
      });
      setOpenToWork(openToWorkStatus);
    }
  }, [profile, profileData]);

  const handleGenerateResume = () => {
    // TODO: Implement resume generation
    console.log("Generate resume from profile data");
  };

  // Resume upload handlers
  const handleGetResumeUploadParameters = useCallback(async () => {
    try {
      const response = await candidateApi.getUploadUrl();
      console.log("Resume upload URL response:", response);

      if (!response?.data?.data?.uploadURL) {
        throw new Error("Failed to get resume upload URL from response");
      }

      return response.data.data.uploadURL;
    } catch (error) {
      console.error("Error getting resume upload parameters:", error);
      throw error;
    }
  }, []);

  const handleResumeUploadComplete = async (result) => {
    try {
      console.log(
        "📄 RESUME UPLOAD COMPLETE - Full result:",
        JSON.stringify(result, null, 2),
      );

      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        console.log(
          "📁 Uploaded file details:",
          JSON.stringify(uploadedFile, null, 2),
        );

        const resumeURL = uploadedFile.uploadURL.split("?")[0]; // Remove query parameters
        console.log("🌐 PUBLIC RESUME URL:", resumeURL);
        console.log("📋 Resume URL (copy this):", resumeURL);

        // Update profile with the resume URL
        const updateData = {
          resumeUrl: resumeURL,
          resumeFileName: uploadedFile.name || "resume.pdf",
        };
        const updateResponse = await candidateApi.updateProfile(updateData);
        console.log("✅ Resume update API response:", updateResponse);

        // Refresh profile data
        if (dispatch) {
          dispatch({ type: "CLEAR_PROFILE" });
        }
        setTimeout(() => {
          fetchProfile();
        }, 100);

        console.log(
          "🎉 Resume upload completed successfully - PUBLIC URL:",
          resumeURL,
        );
      } else {
        console.error("❌ No successful upload found in result:", result);
      }
    } catch (error) {
      console.error("💥 Error completing resume upload:", error);
    }
  };

  // About section handlers
  const handleSaveAbout = async (summary) => {
    const updatedProfile = {
      ...profileData,
      profileData: {
        ...profileData?.profileData,
        summary: summary,
      },
    };
    const result = await updateProfile(updatedProfile);
    // Use the returned profile data to ensure consistency
    if (result) {
      setProfileData(result);
    } else {
      setProfileData(updatedProfile);
    }
    // Refresh profile from context to ensure data sync
    await fetchProfile();
  };

  // Experience section handlers
  const handleAddExperience = () => {
    setEditingExperience(null);
    setExperienceIndex(-1);
    setShowExperienceModal(true);
  };

  const handleEditExperience = (experience, index) => {
    setEditingExperience(experience);
    setExperienceIndex(index);
    setShowExperienceModal(true);
  };

  const handleSaveExperience = async (experienceData) => {
    const currentExperience = profileData?.experience || [];
    let updatedExperience;

    if (experienceIndex >= 0) {
      // Edit existing experience
      updatedExperience = [...currentExperience];
      updatedExperience[experienceIndex] = experienceData;
    } else {
      // Add new experience
      updatedExperience = [...currentExperience, experienceData];
    }

    const updatedProfile = {
      ...profileData,
      experience: updatedExperience,
    };

    await updateProfile(updatedProfile);
    setProfileData(updatedProfile);
  };

  const handleDeleteExperience = async (index) => {
    const updatedExperience =
      profileData?.experience?.filter((_, i) => i !== index) || [];
    const updatedProfile = {
      ...profileData,
      experience: updatedExperience,
    };

    await updateProfile(updatedProfile);
    setProfileData(updatedProfile);
  };

  // Education section handlers
  const handleAddEducation = () => {
    setEditingEducation(null);
    setEducationIndex(-1);
    setShowEducationModal(true);
  };

  const handleEditEducation = (education, index) => {
    setEditingEducation(education);
    setEducationIndex(index);
    setShowEducationModal(true);
  };

  const handleSaveEducation = async (educationData) => {
    const currentEducation = profileData?.education || [];
    let updatedEducation;

    if (educationIndex >= 0) {
      // Edit existing education
      updatedEducation = [...currentEducation];
      updatedEducation[educationIndex] = educationData;
    } else {
      // Add new education
      updatedEducation = [...currentEducation, educationData];
    }

    const updatedProfile = {
      ...profileData,
      education: updatedEducation,
    };

    await updateProfile(updatedProfile);
    setProfileData(updatedProfile);
  };

  const handleDeleteEducation = async (index) => {
    const updatedEducation =
      profileData?.education?.filter((_, i) => i !== index) || [];
    const updatedProfile = {
      ...profileData,
      education: updatedEducation,
    };

    await updateProfile(updatedProfile);
    setProfileData(updatedProfile);
  };

  // Skills section handlers
  const handleSaveSkills = async (skillsData) => {
    const updatedProfile = {
      ...profileData,
      skills: skillsData,
    };
    const result = await updateProfile(updatedProfile);
    // Use the returned profile data instead of local data to ensure consistency
    if (result) {
      setProfileData(result);
    }
  };

  // Skills with Experience section handlers
  const handleSaveSkillsWithExperience = async (skillsArray) => {
    console.log("Saving additional skills:", skillsArray);

    try {
      // Convert skills array to object format expected by the backend
      const skillsWithExperience = {};
      skillsArray.forEach((skill) => {
        // Store skills with a default experience level
        skillsWithExperience[skill] = "ENTRY_LEVEL";
      });

      console.log("Skills with experience format:", skillsWithExperience);

      // Update profile with skillsWithExperience
      const updatedProfile = {
        ...profileData,
        skillsWithExperience,
      };

      const result = await updateProfile(updatedProfile);
      console.log("Additional skills save result:", result);

      // Use the returned profile data to ensure consistency
      if (result) {
        setProfileData(result);
      }
      // Refresh profile from context to ensure data sync
      await fetchProfile();
    } catch (error) {
      console.error("Failed to save skills with experience:", error);
      throw error;
    }
  };

  // Preferences section handlers
  const handleSavePreferences = async (preferencesData) => {
    console.log("Saving job preferences:", preferencesData);

    // Map the preferences data to both the jobPreferences object and individual candidate fields
    const updatedProfile = {
      ...profileData,
      // Store in jobPreferences object for structured access
      jobPreferences: preferencesData,
      // Also map to individual candidate fields for compatibility
      currentEmploymentStatus: preferencesData.currentEmploymentStatus,
      preferredJobTitles: preferencesData.preferredRoles,
      preferredIndustries: preferencesData.industry,
      preferredJobTypes: preferencesData.jobTypes,
      preferredLocations: preferencesData.preferredLocations,
      preferredSalaryMin: preferencesData.salaryRange?.min
        ? parseFloat(preferencesData.salaryRange.min)
        : null,
      preferredSalaryMax: preferencesData.salaryRange?.max
        ? parseFloat(preferencesData.salaryRange.max)
        : null,
      remoteWorkPreference: preferencesData.workType,
      preferredLanguages: preferencesData.languages,
      shiftPreference: preferencesData.shiftPreference,
      travelWillingness: preferencesData.travelWillingness,
      noticePeriod: preferencesData.noticePeriod,
      // Add availability to skills/experience data if available
      availabilityDate: preferencesData.availability,
    };

    console.log("Updated profile object for preferences:", updatedProfile);
    const result = await updateProfile(updatedProfile);
    console.log("Preferences save result:", result);
    // Use the returned profile data instead of local data to ensure consistency
    if (result) {
      setProfileData(result);
    }
    // Refresh profile from context to ensure data sync
    await fetchProfile();
  };

  // Profile section handlers
  const handleSaveProfile = async (profileFormData) => {
    console.log("Saving profile with data:", profileFormData);
    const updatedProfile = {
      ...profileData,
      firstName: profileFormData.firstName,
      lastName: profileFormData.lastName,
      email: profileFormData.email,
      phone: profileFormData.phone,
      profileData: {
        ...profileData?.profileData,
        firstName: profileFormData.firstName,
        lastName: profileFormData.lastName,
        headline: profileFormData.headline,
        location: profileFormData.location,
        phone: profileFormData.phone,
      },
    };
    console.log("Updated profile object:", updatedProfile);
    const result = await updateProfile(updatedProfile);
    console.log("Update result:", result);
    // Use the returned profile data to ensure consistency
    if (result) {
      setProfileData(result);
    } else {
      setProfileData(updatedProfile);
    }
    // Refresh profile from context to ensure data sync
    await fetchProfile();
  };

  // Open to work toggle - using dedicated API
  const handleToggleOpenToWork = async () => {
    const newStatus = !openToWork;
    try {
      // Call dedicated Open to Work API endpoint
      const response = await candidateApi.updateOpenToWorkStatus(newStatus);
      if (response.data) {
        setOpenToWork(newStatus);
        // Also update the local profile data to keep UI consistent
        setProfileData((prev) => ({
          ...prev,
          openToWork: newStatus,
        }));
      }
    } catch (error) {
      console.error("Failed to update Open to Work status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  // File upload handlers - Real API integration
  const handleProfilePictureUpload = async (file) => {
    try {
      // Get upload URL from backend
      const uploadUrlResponse = await candidateApi.getUploadUrl();
      const { uploadURL } = uploadUrlResponse.data;

      // Upload file directly to object storage
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage");
      }

      // Update profile with the uploaded file URL
      const response = await candidateApi.updateProfilePhoto(
        uploadURL,
        file.name,
        file.size,
      );
      const updatedProfile = response.data;

      setProfileData(updatedProfile);
      // Refresh profile data from context
      await fetchProfile();
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    }
  };

  const handleCoverUpload = async (file) => {
    try {
      // Get upload URL from backend
      const uploadUrlResponse = await candidateApi.getUploadUrl();
      const { uploadURL } = uploadUrlResponse.data;

      // Upload file directly to object storage
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage");
      }

      // Update profile with the uploaded file URL
      const response = await candidateApi.updateCoverPhoto(
        uploadURL,
        file.name,
        file.size,
      );
      const updatedProfile = response.data;

      setProfileData(updatedProfile);
      // Refresh profile data from context
      await fetchProfile();
    } catch (error) {
      console.error("Failed to upload cover photo:", error);
      // Don't show alert, just log the error
    }
  };

  // New function for optimized image upload
  const handleOptimizedProfileImageUpload = async (file) => {
    try {
      console.log(
        "🚀 [OPTIMIZED UPLOAD] Starting optimized profile image upload...",
      );
      // Get upload URL from backend for optimized uploads
      const uploadParams = await handleGetProfileImageUploadParameters();
      const uploadURL =
        typeof uploadParams === "string" ? uploadParams : uploadParams.url; // Adjust if parameters are returned as object

      // Upload file directly to object storage with optimization
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        console.error(
          "🚀 [OPTIMIZED UPLOAD] File upload failed:",
          uploadResponse.statusText,
        );
        throw new Error("Failed to upload optimized file to storage");
      }

      console.log(
        "🚀 [OPTIMIZED UPLOAD] File uploaded successfully. Calling completion handler...",
      );
      // The actual completion logic is handled by handleProfilePhotoComplete, which receives the result from ObjectUploader
      // We assume ObjectUploader will call handleProfilePhotoComplete with the correct result structure after this direct upload.
      // For now, we rely on ObjectUploader's internal handling for direct uploads.
      return; // Indicate success
    } catch (error) {
      console.error(
        "💥 [OPTIMIZED UPLOAD] Error during optimized profile image upload:",
        error,
      );
      // Propagate the error to be handled by onUploadError
      throw error;
    }
  };

  // Skeleton component for smooth loading
  const SkeletonLine = ({ width = "w-full", height = "h-4" }) => (
    <div
      className={`${width} ${height} bg-gray-300 rounded animate-pulse`}
    ></div>
  );

  const SkeletonCircle = ({ size = "w-24 h-24" }) => (
    <div className={`${size} bg-gray-300 rounded-full animate-pulse`}></div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Profile Header */}
      <div className="bg-white shadow-sm overflow-hidden">
        {/* Cover Banner - Mobile Optimized */}
        <div className="h-32 sm:h-48 relative overflow-hidden">
          {profileData?.coverPhoto ? (
            <img
              src={getImageUrl(profileData.coverPhoto)}
              alt="Cover"
              className="w-full h-full object-cover transition-all duration-500"
              key={profileData.coverPhoto}
            />
          ) : loading ? (
            <div className="h-full bg-gray-300 animate-pulse"></div>
          ) : (
            <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 transition-all duration-500"></div>
          )}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={10485760}
              onGetUploadParameters={handleGetCoverImageUploadParameters}
              onComplete={handleCoverPhotoComplete}
              buttonClassName="bg-white bg-opacity-90 backdrop-blur-sm text-gray-700 p-1 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-opacity-100 transition-all duration-200 shadow-lg"
            >
              <span className="hidden sm:inline">📷 Enhance cover</span>
              <span className="sm:hidden text-xs">📷</span>
            </ObjectUploader>
          </div>
        </div>

        {/* Profile Section - Mobile Optimized */}
        <div className="px-3 sm:px-6 pb-3 sm:pb-4">
          {/* Profile Picture and Basic Info */}
          <div className="flex items-end gap-3 sm:gap-6 -mt-12 sm:-mt-20 mb-3 sm:mb-4">
            {/* Profile Picture */}
            <div className="relative flex-shrink-0">
              {loading && !profileData ? (
                <SkeletonCircle size="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40" />
              ) : profileData?.profilePhoto ? (
                <img
                  className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white object-cover shadow-xl ring-2 ring-gray-200"
                  src={getImageUrl(profileData?.profilePhoto)}
                  alt="Profile"
                  onLoad={() => {
                    console.log(
                      "✅ Profile image loaded successfully:",
                      getImageUrl(profileData?.profilePhoto),
                    );
                  }}
                  onError={(e) => {
                    console.error("❌ Profile image failed to load:", {
                      originalSrc: e.target.src,
                      profilePhoto: profileData?.profilePhoto,
                      processedUrl: getImageUrl(profileData?.profilePhoto),
                    });
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      profileData?.user?.firstName || "User",
                    )}&size=128&background=3b82f6&color=ffffff`;
                  }}
                  key={profileData.profilePhoto}
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl font-bold text-white shadow-xl ring-2 ring-gray-200">
                  {profileData?.firstName?.[0] ||
                    profileData?.user?.firstName?.[0] ||
                    profileData?.profileData?.firstName?.[0] ||
                    profileData?.user?.name?.charAt(0).toUpperCase() ||
                    user?.name?.charAt(0).toUpperCase() ||
                    "U"}
                </div>
              )}

              {/* Open to Work Badge */}
              {openToWork && (
                <div className="absolute -top-1 -right-1 sm:top-0 sm:right-0 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-lg ring-2 ring-white">
                  <span className="hidden sm:inline">🟢 Open to Work</span>
                  <span className="sm:hidden">🟢</span>
                </div>
              )}

              {/* Camera Icon - Smaller in mobile */}
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760}
                onGetUploadParameters={handleGetProfileImageUploadParameters}
                onComplete={handleProfilePhotoComplete}
                buttonClassName="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 bg-white p-1 sm:p-1.5 rounded-full shadow-lg hover:shadow-xl transition-all"
                allowedFileTypes={["image/*"]}
                uploadType="image"
              >
                <CameraIcon className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-gray-600" />
              </ObjectUploader>
            </div>
          </div>

          {/* Name and Title - Mobile Optimized */}
          <div className="mb-3">
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1 min-w-0">
                {loading && !profileData ? (
                  <>
                    <SkeletonLine width="w-3/4" height="h-6 sm:h-8" />
                    <div className="mt-2">
                      <SkeletonLine width="w-1/2" height="h-4 sm:h-5" />
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                      {profileData?.firstName && profileData?.lastName
                        ? `${profileData.firstName} ${profileData.lastName}`
                        : profileData?.user?.firstName &&
                            profileData?.user?.lastName
                          ? `${profileData.user.firstName} ${profileData.user.lastName}`
                          : profileData?.profileData?.firstName &&
                              profileData?.profileData?.lastName
                            ? `${profileData.profileData.firstName} ${profileData.profileData.lastName}`
                            : profileData?.user?.name ||
                              user?.name ||
                              "Your Name"}
                    </h1>
                    <p className="text-base sm:text-lg text-gray-700 mb-2 leading-tight">
                      {profileData?.profileData?.headline ||
                        profileData?.headline ||
                        profileData?.profileData?.jobTitle ||
                        profileData?.jobTitle ||
                        profileData?.profileData?.currentRole ||
                        "Your Professional Title"}
                    </p>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="text-gray-500 hover:text-blue-600 transition-all duration-200 p-2 hover:bg-blue-50 rounded-full ml-2 flex-shrink-0"
                title="Edit Profile"
              >
                <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 hover:scale-110" />
              </button>
            </div>

            {/* Contact Info - Mobile Stack */}
            <div className="space-y-1 text-sm text-gray-600 mb-3">
              {loading && !profileData ? (
                <>
                  <SkeletonLine width="w-2/3" height="h-4" />
                  <SkeletonLine width="w-1/2" height="h-4" />
                  <SkeletonLine width="w-3/5" height="h-4" />
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />
                    <span className="truncate">
                      {profileData?.user?.city?.name ||
                        profileData?.city?.name ||
                        profileData?.profileData?.location ||
                        profileData?.location ||
                        profileData?.city ||
                        profileData?.user?.location ||
                        "Your City"}
                    </span>
                  </div>
                  {(profileData?.profileData?.phone ||
                    profileData?.phone ||
                    profileData?.user?.phone) && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2 flex-shrink-0 text-xs">
                        📱
                      </span>
                      <span className="truncate">
                        {profileData?.profileData?.phone ||
                          profileData?.phone ||
                          profileData?.user?.phone}
                      </span>
                    </div>
                  )}
                  {/* Years of Experience */}
                  {(profileData?.experience ||
                    profileData?.totalExperience ||
                    profileData?.yearsOfExperience) && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2 flex-shrink-0 text-xs">
                        💼
                      </span>
                      <span className="truncate">
                        {profileData?.experience ||
                          profileData?.totalExperience ||
                          profileData?.yearsOfExperience}{" "}
                        years experience
                      </span>
                    </div>
                  )}
                  {/* Preferred Job Locations */}
                  {(
                    profileData?.jobPreferences?.preferredLocations ||
                    profileData?.preferredLocations
                  )?.length > 0 && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2 flex-shrink-0 text-xs">
                        🎯
                      </span>
                      <span className="truncate">
                        Open to:{" "}
                        {(
                          profileData?.jobPreferences?.preferredLocations ||
                          profileData?.preferredLocations
                        )
                          .slice(0, 2)
                          .join(", ")}
                        {(
                          profileData?.jobPreferences?.preferredLocations ||
                          profileData?.preferredLocations
                        ).length > 2 &&
                          ` +${(profileData?.jobPreferences?.preferredLocations || profileData?.preferredLocations).length - 2} more`}
                      </span>
                    </div>
                  )}
                  {/* Experience Level */}
                  {profileData?.experienceLevel && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2 flex-shrink-0 text-xs">
                        📊
                      </span>
                      <span className="truncate">
                        {(
                          profileData?.jobPreferences?.experienceLevel ||
                          profileData?.experienceLevel
                        )
                          ?.replace(/_/g, " ")
                          ?.toLowerCase()
                          ?.replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                        level
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-3">
            <Button
              variant={openToWork ? "outline" : "primary"}
              onClick={handleToggleOpenToWork}
              className={`px-4 sm:px-6 py-2 rounded-full font-medium transition-all duration-200 text-sm sm:text-base ${
                openToWork
                  ? "border-red-300 text-red-600 hover:bg-red-50"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {openToWork ? "Remove Open to Work" : "Set Open to Work"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="px-2 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4 max-w-4xl mx-auto">
        {/* About Section */}
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                About
                <div className="ml-2 w-6 sm:w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
              </h2>
              <button
                onClick={() => setShowAboutModal(true)}
                className="text-gray-500 hover:text-blue-600 transition-all duration-200 p-1.5 sm:p-2 hover:bg-blue-50 rounded-full"
                title="Edit About"
              >
                <PencilIcon className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
              </button>
            </div>
            <AboutContent
              summary={profileData?.profileData?.summary}
              loading={loading && !profileData}
              onEdit={() => setShowAboutModal(true)}
            />
          </div>
        </div>

        {/* Skills with Experience Section - Mobile Grid */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                Skills
                <div className="ml-2 w-6 sm:w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded"></div>
              </h2>
              <button
                onClick={() => setShowSkillsWithExperienceModal(true)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 sm:p-2"
                title="Edit Skills"
              >
                <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {loading && !profileData ? (
                // Skeleton for skills
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 bg-gray-300 rounded-full animate-pulse"
                  >
                    <div className="w-12 h-4 bg-gray-300 rounded"></div>
                  </div>
                ))
              ) : profileData?.skillsWithExperience &&
                Object.keys(profileData.skillsWithExperience).length > 0 ? (
                Object.keys(profileData.skillsWithExperience).map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium border border-indigo-200 hover:bg-indigo-200 transition-colors"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 w-full">
                  <div className="w-12 h-12 mx-auto mb-3 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm mb-2">No skills added yet</p>
                  <p className="text-xs text-gray-400 mb-4">
                    Add skills to showcase your expertise
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 text-sm"
                    onClick={() => setShowSkillsWithExperienceModal(true)}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Skills
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resume Section - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                Resume
                <div className="ml-2 w-6 sm:w-8 h-0.5 bg-gradient-to-r from-green-500 to-teal-500 rounded"></div>
              </h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {loading && !profileData ? (
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <SkeletonCircle size="w-6 h-6 sm:w-8 sm:h-8" />
                    <div className="flex-1 space-y-2">
                      <SkeletonLine width="w-1/3" height="h-4" />
                      <SkeletonLine width="w-1/2" height="h-3" />
                    </div>
                    <SkeletonLine width="w-16" height="h-8" />
                  </div>
                </div>
              ) : profileData?.resumeUrl ? (
                <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <DocumentArrowDownIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        Resume uploaded
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {profileData.resumeFileName || "resume.pdf"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        window.open(profileData.resumeUrl, "_blank")
                      }
                      className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
                    >
                      View
                    </Button>
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={10485760} // 10MB
                      onGetUploadParameters={handleGetResumeUploadParameters}
                      onComplete={handleResumeUploadComplete}
                      allowedFileTypes={["application/pdf", ".pdf"]}
                      uploadType="resume"
                      buttonClassName="text-blue-600 hover:bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm"
                    >
                      Update
                    </ObjectUploader>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <DocumentArrowDownIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
                  <p className="mb-4 text-sm">
                    Upload your resume to help employers
                  </p>
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={10485760} // 10MB
                    onGetUploadParameters={handleGetResumeUploadParameters}
                    onComplete={handleResumeUploadComplete}
                    allowedFileTypes={["application/pdf", ".pdf"]}
                    uploadType="resume"
                    buttonClassName="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm inline-flex items-center"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Upload Resume
                  </ObjectUploader>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Preferences Section - Enhanced with All Onboarding Data */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Job Preferences
              </h2>
              <button
                onClick={() => setShowPreferencesModal(true)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 sm:p-2"
                title="Edit Preferences"
              >
                <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {loading && !profileData ? (
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="p-2 sm:p-3 bg-gray-50 rounded-lg border"
                    >
                      <SkeletonLine width="w-1/4" height="h-4" />
                      <div className="mt-2">
                        <SkeletonLine width="w-3/4" height="h-6" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : profileData?.jobPreferences ||
                profileData?.profileData?.jobPreferences ||
                profileData?.currentEmploymentStatus ||
                profileData?.experienceLevel ||
                profileData?.preferredJobTitles ||
                profileData?.preferredIndustries ? (
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {/* Employment Status */}
                  {(profileData?.currentEmploymentStatus ||
                    profileData?.jobPreferences?.currentEmploymentStatus) && (
                    <div className="p-2 sm:p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                        Employment Status
                      </h4>
                      <span className="px-2 sm:px-3 py-1 sm:py-2 bg-indigo-100 text-indigo-800 text-xs sm:text-sm rounded-full font-medium">
                        {(
                          profileData?.currentEmploymentStatus ||
                          profileData?.jobPreferences?.currentEmploymentStatus
                        )
                          ?.replace(/_/g, " ")
                          ?.toLowerCase()
                          ?.replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                  )}

                  {/* Job Types */}
                  {(
                    profileData?.jobPreferences?.jobTypes ||
                    profileData?.profileData?.jobPreferences?.jobTypes ||
                    profileData?.preferredJobTypes
                  )?.length > 0 && (
                    <div className="p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                        Job Types
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {(
                          profileData?.jobPreferences?.jobTypes ||
                          profileData?.profileData?.jobPreferences?.jobTypes ||
                          profileData?.preferredJobTypes
                        ).map((type, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                          >
                            {typeof type === "string"
                              ? type
                                  .replace(/_/g, " ")
                                  .toLowerCase()
                                  .replace(/\b\w/g, (l) => l.toUpperCase())
                              : type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preferred Job Roles */}
                  {(
                    profileData?.jobPreferences?.preferredRoles ||
                    profileData?.jobPreferences?.jobTitles ||
                    profileData?.profileData?.jobPreferences?.jobTitles ||
                    profileData?.preferredJobTitles
                  )?.length > 0 && (
                    <div className="p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                        Preferred Job Roles
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {(
                          profileData?.jobPreferences?.preferredRoles ||
                          profileData?.jobPreferences?.jobTitles ||
                          profileData?.profileData?.jobPreferences?.jobTitles ||
                          profileData?.preferredJobTitles
                        ).map((role, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Industry Preferences */}
                  {(
                    profileData?.jobPreferences?.industry ||
                    profileData?.profileData?.jobPreferences?.industry ||
                    profileData?.preferredIndustries
                  )?.length > 0 && (
                    <div className="p-2 sm:p-3 bg-teal-50 rounded-lg border border-teal-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                        Industry Preferences
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {(
                          profileData?.jobPreferences?.industry ||
                          profileData?.profileData?.jobPreferences?.industry ||
                          profileData?.preferredIndustries
                        ).map((industry, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full font-medium"
                          >
                            {industry}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work Type & Shift Preference */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(profileData?.jobPreferences?.workType ||
                      profileData?.profileData?.jobPreferences?.workType ||
                      profileData?.remoteWorkPreference) && (
                      <div className="p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                          Work Type
                        </h4>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                          {(
                            profileData?.jobPreferences?.workType ||
                            profileData?.profileData?.jobPreferences
                              ?.workType ||
                            profileData?.remoteWorkPreference
                          )
                            ?.toLowerCase()
                            ?.replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                    )}

                    {(profileData?.jobPreferences?.shiftPreference ||
                      profileData?.profileData?.jobPreferences
                        ?.shiftPreference ||
                      profileData?.shiftPreference) && (
                      <div className="p-2 sm:p-3 bg-pink-50 rounded-lg border border-pink-200">
                        <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                          Shift Preference
                        </h4>
                        <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full font-medium">
                          {(
                            profileData?.jobPreferences?.shiftPreference ||
                            profileData?.profileData?.jobPreferences
                              ?.shiftPreference ||
                            profileData?.shiftPreference
                          )
                            ?.replace(/_/g, " ")
                            ?.toLowerCase()
                            ?.replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Experience Level */}
                  {(profileData?.jobPreferences?.experienceLevel ||
                    profileData?.profileData?.jobPreferences
                      ?.experienceLevel) && (
                    <div className="p-2 sm:p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                        Experience Level
                      </h4>
                      <span className="px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-full font-medium">
                        {(
                          profileData?.jobPreferences?.experienceLevel ||
                          profileData?.profileData?.jobPreferences
                            ?.experienceLevel
                        )
                          ?.replace(/_/g, " ")
                          ?.toLowerCase()
                          ?.replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                  )}

                  {/* Preferred Locations */}
                  {(
                    profileData?.jobPreferences?.preferredLocations ||
                    profileData?.profileData?.jobPreferences
                      ?.preferredLocations ||
                    profileData?.preferredLocations
                  )?.length > 0 && (
                    <div className="p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                        Preferred Locations
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {(
                          profileData?.jobPreferences?.preferredLocations ||
                          profileData?.profileData?.jobPreferences
                            ?.preferredLocations ||
                          profileData?.preferredLocations
                        ).map((location, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium"
                          >
                            {location}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Salary Range */}
                  {(profileData?.jobPreferences?.salaryRange?.min ||
                    profileData?.jobPreferences?.salaryRange?.max ||
                    profileData?.profileData?.jobPreferences?.salaryRange
                      ?.min ||
                    profileData?.profileData?.jobPreferences?.salaryRange
                      ?.max ||
                    profileData?.preferredSalaryMin ||
                    profileData?.preferredSalaryMax) && (
                    <div className="p-2 sm:p-3 bg-gray-50 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                        Expected Salary Range
                      </h4>
                      <div className="bg-white p-2 sm:p-3 rounded-lg border">
                        <span className="text-sm sm:text-base font-semibold text-gray-800">
                          ₹
                          {profileData?.jobPreferences?.salaryRange?.min ||
                          profileData?.profileData?.jobPreferences?.salaryRange
                            ?.min ||
                          profileData?.preferredSalaryMin
                            ? Number(
                                profileData?.jobPreferences?.salaryRange?.min ||
                                  profileData?.profileData?.jobPreferences
                                    ?.salaryRange?.min ||
                                  profileData?.preferredSalaryMin,
                              ).toLocaleString()
                            : "0"}{" "}
                          - ₹
                          {profileData?.jobPreferences?.salaryRange?.max ||
                          profileData?.profileData?.jobPreferences?.salaryRange
                            ?.max ||
                          profileData?.preferredSalaryMax
                            ? Number(
                                profileData?.jobPreferences?.salaryRange?.max ||
                                  profileData?.profileData?.jobPreferences
                                    ?.salaryRange?.max ||
                                  profileData?.preferredSalaryMax,
                              ).toLocaleString()
                            : "Open"}{" "}
                          /month
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {(
                    profileData?.jobPreferences?.languages ||
                    profileData?.profileData?.jobPreferences?.languages ||
                    profileData?.preferredLanguages
                  )?.length > 0 && (
                    <div className="p-2 sm:p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                        Preferred Languages
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {(
                          profileData?.jobPreferences?.languages ||
                          profileData?.profileData?.jobPreferences?.languages ||
                          profileData?.preferredLanguages
                        ).map((language, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full font-medium"
                          >
                            {typeof language === "string"
                              ? language
                                  .toLowerCase()
                                  .replace(/\b\w/g, (l) => l.toUpperCase())
                              : language}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Availability & Additional Preferences */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {profileData?.availabilityStatus && (
                      <div className="p-2 sm:p-3 bg-lime-50 rounded-lg border border-lime-200">
                        <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                          Availability
                        </h4>
                        <span className="px-2 py-1 bg-lime-100 text-lime-800 text-xs rounded-full font-medium">
                          {(
                            profileData?.availabilityStatus ||
                            profileData?.profileData?.jobPreferences
                              ?.availability ||
                            profileData?.jobPreferences?.availabilityDate
                          )
                            ?.replace(/_/g, " ")
                            ?.toLowerCase()
                            ?.replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                    )}

                    {(profileData?.jobPreferences?.noticePeriod ||
                      profileData?.profileData?.jobPreferences?.noticePeriod ||
                      profileData?.noticePeriod) && (
                      <div className="p-2 sm:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                          Notice Period
                        </h4>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                          {profileData?.jobPreferences?.noticePeriod ||
                            profileData?.profileData?.jobPreferences
                              ?.noticePeriod ||
                            profileData?.noticePeriod}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Travel Willingness */}
                  {(profileData?.jobPreferences?.travelWillingness ||
                    profileData?.travelWillingness) && (
                    <div className="p-2 sm:p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                        Travel Preference
                      </h4>
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">
                        {profileData?.jobPreferences?.travelWillingness ||
                        profileData?.travelWillingness
                          ? "Willing to travel"
                          : "Prefers local work"}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No job preferences added yet</p>
                  <Button
                    variant="outline"
                    className="mt-3 text-sm"
                    onClick={() => setShowPreferencesModal(true)}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Job Preferences
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                Experience
                <div className="ml-2 w-5 sm:w-6 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
              </h2>
              <button
                onClick={handleAddExperience}
                className="text-gray-500 hover:text-blue-600 transition-all duration-200 p-1.5 sm:p-2 hover:bg-blue-50 rounded-full"
                title="Add Experience"
              >
                <PlusIcon className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {loading && !profileData ? (
                // Skeleton for experience items
                Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="flex gap-2 sm:gap-3">
                    <SkeletonCircle size="w-8 h-8 sm:w-10 sm:h-10" />
                    <div className="flex-1 space-y-2">
                      <SkeletonLine width="w-3/4" height="h-4 sm:h-5" />
                      <SkeletonLine width="w-1/2" height="h-3 sm:h-4" />
                      <SkeletonLine width="w-1/3" height="h-3 sm:h-4" />
                      <SkeletonLine width="w-5/6" height="h-3" />
                    </div>
                  </div>
                ))
              ) : profileData?.experience?.length > 0 ? (
                profileData.experience.map((exp, index) => (
                  <div key={index} className="flex gap-2 sm:gap-3 group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                      <BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">
                            {exp.role}
                          </h3>
                          <p className="text-blue-600 font-medium text-sm truncate">
                            {exp.company} • {exp.employmentType || "Full-time"}
                          </p>
                          <p className="text-gray-600 text-xs sm:text-sm">
                            {exp.duration}
                          </p>
                          <div className="flex items-center text-gray-600 text-xs sm:text-sm mt-1">
                            <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {exp.location || user?.city?.name || "Location"}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-gray-700 mt-2 leading-relaxed text-sm line-clamp-3">
                              {exp.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            onClick={() => handleEditExperience(exp, index)}
                            className="text-gray-500 hover:text-blue-600 transition-colors p-1"
                            title="Edit Experience"
                          >
                            <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExperience(index)}
                            className="text-gray-500 hover:text-red-600 transition-colors p-1"
                            title="Delete Experience"
                          >
                            <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <BuildingOfficeIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No experience added yet</p>
                  <Button
                    variant="outline"
                    className="mt-3 text-sm"
                    onClick={handleAddExperience}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Education</h2>
              <button
                onClick={handleAddEducation}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 sm:p-2"
                title="Add Education"
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {loading && !profileData ? (
                // Skeleton for education items
                Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="flex gap-2 sm:gap-3">
                    <SkeletonCircle size="w-8 h-8 sm:w-10 sm:h-10" />
                    <div className="flex-1 space-y-2">
                      <SkeletonLine width="w-2/3" height="h-4 sm:h-5" />
                      <SkeletonLine width="w-1/2" height="h-3 sm:h-4" />
                      <SkeletonLine width="w-1/3" height="h-3 sm:h-4" />
                    </div>
                  </div>
                ))
              ) : profileData?.education?.length > 0 ? (
                profileData.education.map((edu, index) => (
                  <div key={index} className="flex gap-2 sm:gap-3 group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <AcademicCapIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">
                            {edu.institution}
                          </h3>
                          <p className="text-gray-700 text-sm">
                            {edu.degree}
                            {edu.field ? ` - ${edu.field}` : ""}
                          </p>
                          <p className="text-gray-600 text-xs sm:text-sm">
                            {edu.startYear && edu.endYear
                              ? `${edu.startYear} - ${edu.endYear}`
                              : edu.year}
                          </p>
                          {edu.grade && (
                            <p className="text-gray-600 text-xs sm:text-sm">
                              Grade: {edu.grade}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            onClick={() => handleEditEducation(edu, index)}
                            className="text-gray-500 hover:text-blue-600 transition-colors p-1"
                            title="Edit Education"
                          >
                            <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEducation(index)}
                            className="text-gray-500 hover:text-red-600 transition-colors p-1"
                            title="Delete Education"
                          >
                            <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <AcademicCapIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No education added yet</p>
                  <Button
                    variant="outline"
                    className="mt-3 text-sm"
                    onClick={handleAddEducation}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* All Modals */}
      <EditAboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        currentSummary={profileData?.profileData?.summary}
        onSave={handleSaveAbout}
      />

      <EditExperienceModal
        isOpen={showExperienceModal}
        onClose={() => setShowExperienceModal(false)}
        experience={editingExperience}
        onSave={handleSaveExperience}
        isEditing={experienceIndex >= 0}
      />

      <EditEducationModal
        isOpen={showEducationModal}
        onClose={() => setShowEducationModal(false)}
        education={editingEducation}
        onSave={handleSaveEducation}
        isEditing={educationIndex >= 0}
      />

      <FileUploadModal
        isOpen={showProfilePictureModal}
        onClose={() => setShowProfilePictureModal(false)}
        onUpload={handleProfilePictureUpload}
        title="Upload Profile Picture"
        acceptedTypes="image/*"
      />

      <FileUploadModal
        isOpen={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        onUpload={handleCoverUpload}
        title="Upload Cover Photo"
        acceptedTypes="image/*"
      />

      <EditSkillsModal
        isOpen={showSkillsModal}
        onClose={() => setShowSkillsModal(false)}
        skills={profileData?.skills || profileData?.ratings}
        onSave={handleSaveSkills}
      />

      <EditSkillsWithExperienceModal
        isOpen={showSkillsWithExperienceModal}
        onClose={() => setShowSkillsWithExperienceModal(false)}
        skillsWithExperience={profileData?.skillsWithExperience || {}}
        onSave={handleSaveSkillsWithExperience}
      />

      <EditPreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        preferences={{
          // Combine data from jobPreferences object and individual fields
          ...(profileData?.jobPreferences || {}),
          ...(profileData?.profileData?.jobPreferences || {}),
          // Individual candidate fields for compatibility
          currentEmploymentStatus:
            profileData?.currentEmploymentStatus ||
            profileData?.jobPreferences?.currentEmploymentStatus,
          jobTypes:
            profileData?.preferredJobTypes ||
            profileData?.jobPreferences?.jobTypes ||
            [],
          preferredRoles:
            profileData?.preferredJobTitles ||
            profileData?.jobPreferences?.preferredRoles ||
            profileData?.jobPreferences?.jobTitles ||
            [],
          industry:
            profileData?.preferredIndustries ||
            profileData?.jobPreferences?.industry ||
            [],
          preferredLocations:
            profileData?.preferredLocations ||
            profileData?.jobPreferences?.preferredLocations ||
            [],
          salaryRange: {
            min:
              profileData?.preferredSalaryMin ||
              profileData?.jobPreferences?.salaryRange?.min ||
              "",
            max:
              profileData?.preferredSalaryMax ||
              profileData?.jobPreferences?.salaryRange?.max ||
              "",
          },
          workType:
            profileData?.remoteWorkPreference ||
            profileData?.jobPreferences?.workType ||
            "",
          languages:
            profileData?.preferredLanguages ||
            profileData?.jobPreferences?.languages ||
            [],
          shiftPreference:
            profileData?.shiftPreference ||
            profileData?.jobPreferences?.shiftPreference ||
            "",
          travelWillingness:
            profileData?.travelWillingness ||
            profileData?.jobPreferences?.travelWillingness ||
            false,
          noticePeriod:
            profileData?.noticePeriod ||
            profileData?.jobPreferences?.noticePeriod ||
            "",
          availability: profileData?.availabilityStatus || "",
          experienceLevel: profileData?.experienceLevel || "",
        }}
        onSave={handleSavePreferences}
      />

      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        profileData={profileData}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default LinkedInProfile;
