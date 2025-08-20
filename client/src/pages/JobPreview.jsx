import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Loader from "../components/ui/Loader";
import JobView from "../components/ui/JobView";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { publicApi } from "../services/publicApi";
import { candidateApi } from "../services/candidateApi";
import sharedApi from "../services/sharedApi";
import { useAuth } from "../context/AuthContext";

const JobPreview = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Using browser back functionality, no longer need 'from' parameter

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    loadJobDetail();
  }, [id]);

  const loadJobDetail = async () => {
    try {
      setLoading(true);

      // Get job details from preview API for DRAFT/PENDING_APPROVAL jobs
      const response = await sharedApi.getJobPreview(id);

      if (response) {
        const jobData = response.data || response;
        setJob(jobData);

        // If user is authenticated, check bookmark and application status from job data
        if (isAuthenticated && user?.role === "CANDIDATE") {
          setIsBookmarked(jobData.isBookmarked || false);
          setHasApplied(jobData.hasApplied || false);
        }
      } else {
        toast.error("Job not found");
        navigate("/jobs");
      }
    } catch (error) {
      console.error("Error loading job details:", error);
      toast.error("Failed to load job details");
      navigate("/jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToJob = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to apply for jobs");
      navigate("/login");
      return;
    }

    if (user?.role !== "CANDIDATE") {
      toast.error("Only candidates can apply for jobs");
      return;
    }

    try {
      setApplying(true);
      const response = await candidateApi.applyToJob(job.id);

      if (response.success) {
        setHasApplied(true);
        toast.success("Application submitted successfully!");
      } else {
        toast.error(response.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error applying to job:", error);
      toast.error("Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  const handleBookmarkJob = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to bookmark jobs");
      navigate("/login");
      return;
    }

    if (user?.role !== "CANDIDATE") {
      toast.error("Only candidates can bookmark jobs");
      return;
    }

    try {
      setBookmarking(true);
      let response;

      if (isBookmarked) {
        response = await candidateApi.removeBookmark(job.id);
        if (response.success) {
          setIsBookmarked(false);
          toast.success("Job removed from bookmarks");
        }
      } else {
        response = await candidateApi.addBookmark(job.id);
        if (response.success) {
          setIsBookmarked(true);
          toast.success("Job bookmarked successfully!");
        }
      }

      if (!response.success) {
        toast.error(response.message || "Failed to update bookmark");
      }
    } catch (error) {
      console.error("Error bookmarking job:", error);
      toast.error("Failed to update bookmark");
    } finally {
      setBookmarking(false);
    }
  };

  const handleBackNavigation = () => {
    // Use browser's native back button functionality
    // If there's no history (e.g., direct link access), fallback to jobs page
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/jobs");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader />
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Job Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/jobs")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Jobs
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={handleBackNavigation}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-all hover:translate-x-[-2px] group mb-8"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:mr-3 transition-all" />
          <span className="font-medium">Back</span>
        </button>

        {/* Job Preview Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-blue-800">
                Job Preview
              </h1>
              <p className="text-blue-600 text-sm">
                This is how the job posting will appear to candidates
              </p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Preview Mode
            </div>
          </div>
        </div>

        {/* Reusable Job View Component */}
        <JobView
          job={job}
          user={user}
          isAuthenticated={isAuthenticated}
          showActions={user?.role === "CANDIDATE"}
          onApply={handleApplyToJob}
          onBookmark={handleBookmarkJob}
          applying={applying}
          bookmarking={bookmarking}
          isBookmarked={isBookmarked}
          hasApplied={hasApplied}
          variant="preview"
        />
      </div>

      <Footer />
    </div>
  );
};

export default JobPreview;
