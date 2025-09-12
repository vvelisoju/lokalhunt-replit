import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Loader from "../../components/ui/Loader";
import JobView from "../../components/ui/JobView";
import { publicApi } from "../../services/publicApi";
import { candidateApi } from "../../services/candidateApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";

const CandidateJobView = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const fetchingRef = useRef(false);

  // Get the 'from' parameter to determine where to navigate back
  const searchParams = new URLSearchParams(location.search);
  const fromPage = searchParams.get("from") || "jobs";

  const fetchJobDetails = useCallback(async () => {
    if (fetchingRef.current) return;

    try {
      fetchingRef.current = true;
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
      showError(error.message || "Failed to load job details");
      // If fetching fails, navigate back to the jobs list
      navigate("/candidate/jobs");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [id]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  const handleApplyToJob = async () => {
    if (!isAuthenticated || user?.role !== "CANDIDATE") {
      showError("Please login as a candidate to apply");
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
      showSuccess("Application submitted successfully!");
      // Optionally refresh job details to update application count if needed
      setJob({ ...job, hasApplied: hasApplied });
      //fetchJobDetails();
    } catch (error) {
      console.error("Error applying to job:", error);
      if (error.response?.status === 409) {
        showError("You have already applied to this job");
        setHasApplied(true);
      } else {
        showError(
          error.response?.data?.message || "Failed to submit application",
        );
      }
    } finally {
      setApplying(false);
    }
  };

  const handleBookmarkJob = async () => {
    if (!isAuthenticated || user?.role !== "CANDIDATE") {
      showError("Please login as a candidate to bookmark jobs");
      return;
    }

    try {
      setBookmarking(true);
      const response = await candidateApi.toggleBookmark(id);

      if (response.success || response.status == "success") {
        const newBookmarkStatus = response.data?.bookmarked ?? !isBookmarked;
        setIsBookmarked(newBookmarkStatus);
        showSuccess(
          newBookmarkStatus ? "Job bookmarked!" : "Bookmark removed!",
        );
        setJob({ ...job, isBookmarked: newBookmarkStatus });
        //fetchJobDetails();
      } else {
        // Handle error if toggleBookmark doesn't return success but doesn't throw
        showError(response.message || "Failed to update bookmark");
      }
    } catch (error) {
      console.error("Error bookmarking job:", error);
      showError("Failed to update bookmark");
    } finally {
      setBookmarking(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
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
      <div className="px-3 sm:px-4 lg:px-8 py-2 sm:py-4">
        {/* Back Button - Compact Mobile Design */}
        <div className="mb-3 sm:mb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group p-1 sm:p-0 -ml-1 sm:ml-0 rounded-md sm:rounded-none hover:bg-gray-100 sm:hover:bg-transparent"
          >
            <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 group-hover:-translate-x-1 transition-transform flex-shrink-0" />
            <span className="text-sm sm:text-base font-medium">Back</span>
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
