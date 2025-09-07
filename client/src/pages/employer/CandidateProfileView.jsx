import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeftIcon,
  HeartIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentArrowDownIcon,
  GlobeAltIcon,
  CalendarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  StarIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  BuildingOfficeIcon,
  CameraIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import LinkedInProfile from "../candidate/LinkedInProfile";
import Loader from "../../components/ui/Loader";
import { bookmarkCandidate, removeBookmark } from "../../services/employer/candidates";

const CandidateProfileView = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (candidateId && !hasFetched.current) {
      loadCandidateProfile();
    }
  }, [candidateId]);

  const loadCandidateProfile = async () => {
    if (hasFetched.current) return; // Prevent duplicate calls

    setLoading(true);
    hasFetched.current = true;

    try {
      const response = await fetch(
        `/api/public/candidates/${candidateId}/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load candidate profile");
      }

      const result = await response.json();
      const data = result.data || result;
      setProfileData(data);
      setIsBookmarked(data.isBookmarked || false);
    } catch (error) {
      console.error("Error loading candidate profile:", error);
      toast.error("Failed to load candidate profile");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleBookmarkToggle = async () => {
    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        const result = await removeBookmark(candidateId);
        if (result.success) {
          setIsBookmarked(false);
          toast.success("Candidate removed from bookmarks");
        } else {
          toast.error(result.error || "Failed to remove bookmark");
        }
      } else {
        const result = await bookmarkCandidate(candidateId);
        if (result.success) {
          setIsBookmarked(true);
          toast.success("Candidate bookmarked successfully");
        } else {
          toast.error(result.error || "Failed to bookmark candidate");
        }
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error("Failed to update bookmark");
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LinkedInProfile
        viewOnly={true}
        candidateId={candidateId}
        profileData={profileData}
        onBack={handleGoBack}
        isBookmarked={isBookmarked}
        onBookmarkToggle={handleBookmarkToggle}
        bookmarkLoading={bookmarkLoading}
      />
    </div>
  );
};

export default CandidateProfileView;