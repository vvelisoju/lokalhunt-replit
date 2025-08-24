import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Loader from "../../components/ui/Loader";
import JobView from "../../components/ui/JobView";
import { publicApi } from "../../services/publicApi";
import { candidateApi } from "../../services/candidateApi";
import { useAuth } from "../../context/AuthContext";

const CandidateJobView = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Get the 'from' parameter to determine where to navigate back
  const searchParams = new URLSearchParams(location.search);
  const fromPage = searchParams.get("from") || "jobs";

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      // Use public API to get job details as it's confirmed to be working
      const jobResponse = await publicApi.getJobById(id);

      console.log(
        "Job details response:",
        id,
        jobResponse,
        jobResponse.success,
      );

      if (jobResponse) {
        const jobData = jobResponse.data;
        setJob(jobData);

        if (isAuthenticated && user?.role === "CANDIDATE") {
          setIsBookmarked(jobData.isBookmarked || false);
          setHasApplied(jobData.hasApplied || false);
        }
      } else {
        throw new Error(jobResponse.message || "Failed to fetch job details");
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error(error.message || "Failed to load job details");
      // If fetching fails, navigate back to the jobs list
      navigate("/candidate/jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToJob = async () => {
    if (!isAuthenticated || user?.role !== "CANDIDATE") {
      toast.error("Please login as a candidate to apply");
      return;
    }

    if (hasApplied) {
      toast.info("You have already applied to this job");
      return;
    }

    try {
      setApplying(true);
      await candidateApi.applyToJob(id);
      setHasApplied(true);
      toast.success("Application submitted successfully!");
      // Optionally refresh job details to update application count if needed
      // fetchJobDetails();
    } catch (error) {
      console.error("Error applying to job:", error);
      if (error.response?.status === 409) {
        toast.error("You have already applied to this job");
        setHasApplied(true);
      } else {
        toast.error(
          error.response?.data?.message || "Failed to submit application",
        );
      }
    } finally {
      setApplying(false);
    }
  };

  const handleBookmarkJob = async () => {
    if (!isAuthenticated || user?.role !== "CANDIDATE") {
      toast.error("Please login as a candidate to bookmark jobs");
      return;
    }

    try {
      setBookmarking(true);
      const response = await candidateApi.toggleBookmark(id);

      if (response.success) {
        const newBookmarkStatus = response.data?.bookmarked ?? !isBookmarked;
        setIsBookmarked(newBookmarkStatus);
        toast.success(
          newBookmarkStatus ? "Job bookmarked!" : "Bookmark removed!",
        );
      } else {
        // Handle error if toggleBookmark doesn't return success but doesn't throw
        toast.error(response.message || "Failed to update bookmark");
      }
    } catch (error) {
      console.error("Error bookmarking job:", error);
      toast.error("Failed to update bookmark");
    } finally {
      setBookmarking(false);
    }
  };

  const handleGoBack = () => {
    // Navigate back based on the 'from' parameter
    switch (fromPage) {
      case "dashboard":
        navigate("/candidate/dashboard");
        break;
      case "bookmarks":
        navigate("/candidate/bookmarks");
        break;
      case "applications":
        navigate("/candidate/applications");
        break;
      default:
        navigate("/candidate/jobs");
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Job Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={handleGoBack}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        {/* Back Button - Mobile Optimized */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group p-2 sm:p-0 -ml-2 sm:ml-0 rounded-lg sm:rounded-none hover:bg-gray-100 sm:hover:bg-transparent"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">
              {fromPage === "dashboard" && "Back to Dashboard"}
              {fromPage === "bookmarks" && "Back to Bookmarks"}
              {fromPage === "applications" && "Back to Applications"}
              {fromPage === "jobs" && "Back to Jobs"}
            </span>
          </button>
        </div>

        {/* Reusable Job View Component */}
        <JobView
          job={job}
          user={user}
          isAuthenticated={isAuthenticated}
          showActions={true}
          onApply={handleApplyToJob}
          onBookmark={handleBookmarkJob}
          applying={applying}
          bookmarking={bookmarking}
          isBookmarked={isBookmarked}
          hasApplied={hasApplied}
          variant="candidate"
        />
      </div>
    </div>
  );
};

export default CandidateJobView;
