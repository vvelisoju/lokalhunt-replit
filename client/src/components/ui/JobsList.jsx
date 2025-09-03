import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BriefcaseIcon } from "@heroicons/react/24/outline";
import SharedJobCard from "./JobCard";
import JobFilters from "./JobFilters";
import { candidateApi } from "../../services/candidateApi";
import { publicApi } from "../../services/publicApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "./Toast";
import Loader from "./Loader";

const JobsList = ({
  showFilters = true,
  title = "Jobs",
  subtitle = "",
  apiEndpoint = "candidate",
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(12);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Initialize filters state from URL parameters
  const initializeFiltersFromURL = useCallback(() => {
    const urlFilters = {
      search: searchParams.get("search") || "",
      location: searchParams.get("location") || "",
      category: searchParams.get("category") || "",
      jobType: searchParams.get("jobType")
        ? searchParams.get("jobType").split(",")
        : [],
      experience: searchParams.get("experience")
        ? searchParams.get("experience").split(",")
        : [],
      gender: searchParams.get("gender") || "",
      education: searchParams.get("education")
        ? searchParams.get("education").split(",")
        : [],
      salaryRange: searchParams.get("salaryRange") || "",
      sortBy: searchParams.get("sortBy") || "newest",
    };
    return urlFilters;
  }, [searchParams]);

  const [filters, setFilters] = useState(initializeFiltersFromURL);

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "salary-high", label: "Salary: High to Low" },
    { value: "salary-low", label: "Salary: Low to High" },
    { value: "relevance", label: "Most Relevant" },
  ];

  // Memoized API parameters to prevent unnecessary re-renders
  const apiParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: jobsPerPage,
      search: filters.search,
      location: filters.location,
      category: filters.category,
      jobType: filters.jobType.join(","),
      experience: filters.experience.join(","),
      salaryRange: filters.salaryRange,
      sortBy: filters.sortBy,
    };

    // Remove empty parameters
    Object.keys(params).forEach((key) => {
      if (!params[key] || params[key] === "") {
        delete params[key];
      }
    });

    return params;
  }, [currentPage, jobsPerPage, filters]);

  const searchJobs = useCallback(async () => {
    try {
      setLoading(true);

      let response;
      if (apiEndpoint === "candidate") {
        // Use candidate-specific endpoint if available
        response = await candidateApi.getRecommendedJobs(apiParams);
      } else {
        // Use public API for all users - it handles authentication internally
        response = await publicApi.searchJobs(apiParams);
      }

      const responseData = response.data?.data || response.data || response;
      const jobs = responseData?.jobs || [];
      const total = responseData?.total || 0;

      setJobs(jobs);
      setTotalJobs(total);
    } catch (error) {
      console.error("Error loading jobs:", error);
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, apiParams]);

  // Load jobs when component mounts or filters change
  useEffect(() => {
    searchJobs();
  }, [searchJobs]);

  // Update URL when filters change
  const updateURL = useCallback(
    (newFilters) => {
      const params = new URLSearchParams();

      Object.entries(newFilters).forEach(([key, value]) => {
        if (
          value &&
          value !== "" &&
          (!Array.isArray(value) || value.length > 0)
        ) {
          if (Array.isArray(value)) {
            params.set(key, value.join(","));
          } else {
            params.set(key, value);
          }
        }
      });

      // Add pagination
      if (currentPage > 1) {
        params.set("page", currentPage.toString());
      }

      setSearchParams(params, { replace: true });
    },
    [currentPage, setSearchParams],
  );

  // Update filters when URL parameters change (for back/forward navigation or direct links)
  useEffect(() => {
    const urlFilters = initializeFiltersFromURL();
    setFilters(urlFilters);
  }, [initializeFiltersFromURL]);

  // Initial search when component mounts with URL filters
  useEffect(() => {
    if (
      filters.search ||
      filters.location ||
      filters.category ||
      filters.jobType.length > 0 ||
      filters.experience.length > 0 ||
      filters.gender ||
      filters.education.length > 0 ||
      filters.salaryRange
    ) {
      // If we have filters from URL, trigger search immediately
      searchJobs();
    }
  }, []); // Only run once on mount

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset page when filters change
    updateURL(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: "",
      location: "",
      category: "",
      jobType: [],
      experience: [],
      gender: "",
      education: [],
      salaryRange: "",
      sortBy: "newest",
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    updateURL(clearedFilters);
  };

  const handleJobCardClick = (jobId, status) => {
    // The 'variant' prop is not available in this component's scope.
    // Assuming the intention is to distinguish between candidate and other user types.
    if (user?.role === "CANDIDATE") {
      // For candidates, navigate to candidate job view with context
      navigate(`/candidate/jobs/${jobId}?from=jobs`);
    } else {
      // For public users or other roles, navigate to public job detail page
      navigate(`/jobs/${jobId}`);
    }
  };

  const handleApply = async (jobId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (user?.role !== "CANDIDATE") {
      showError("Only candidates can apply to jobs");
      return;
    }

    try {
      setApplying(jobId);
      const response = await candidateApi.applyToJob(jobId);

      if (response.status === 201 || response.data?.status === "success") {
        showSuccess("Applied successfully");
        // Update the job in the list to show applied status
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId ? { ...job, hasApplied: true } : job,
          ),
        );
      } else {
        showError(response.data?.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error applying to job:", error);
      if (error.response?.status === 409) {
        showError("You have already applied to this job");
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId ? { ...job, hasApplied: true } : job,
          ),
        );
      } else {
        showError(
          error.response?.data?.message || "Failed to submit application",
        );
      }
    } finally {
      setApplying(null);
    }
  };

  const handleBookmark = async (jobId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (user?.role !== "CANDIDATE") {
      showError("Only candidates can bookmark jobs");
      return;
    }

    try {
      const job = jobs.find((j) => j.id === jobId);
      if (job?.isBookmarked) {
        await candidateApi.removeBookmark(jobId);
        showSuccess("Job removed from bookmarks");
      } else {
        await candidateApi.addBookmark(jobId);
        showSuccess("Job bookmarked successfully");
      }

      // Update the job in the list instantly
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job,
        ),
      );
    } catch (error) {
      console.error("Error bookmarking job:", error);
      showError("Failed to bookmark job");
    }
  };

  const JobCardSkeleton = () => (
    <div className="bg-white border border-gray-200 p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-10 h-10 bg-gray-200 rounded"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="flex space-x-4 mb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="w-5 h-5 bg-gray-200 rounded"></div>
          <div className="w-16 h-8 bg-gray-200 rounded"></div>
          <div className="w-20 h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      {/* Header */}
      {title && (
        <div className="p-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>

            <div className="text-sm text-gray-500">{totalJobs} jobs found</div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="">
          <JobFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            loading={loading}
          />
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-medium text-gray-900">
            Total jobs found:{" "}
            <span className="text-blue-600 font-semibold">{totalJobs}</span>
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-700">Sort:</label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              handleFiltersChange({ ...filters, sortBy: e.target.value })
            }
            className="py-2 px-3 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(10)].map((_, index) => (
            <JobCardSkeleton key={index} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No jobs found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => {
            // Transform job data for shared JobCard
            const jobData = {
              id: job.id,
              title: job.title || "No Title",
              company: job.company,
              companyName: job.company?.name || "Unknown Company",
              location:
                typeof job.location === "string"
                  ? job.location
                  : job.location?.name
                    ? `${job.location.name}, ${job.location.state || ""}`
                        .trim()
                        .replace(/,$/, "")
                    : "Location not specified",
              jobType: job.jobType || "Full Time",
              salary:
                typeof job.salary === "string"
                  ? job.salary
                  : job.salary && typeof job.salary === "object"
                    ? job.salary.min && job.salary.max
                      ? `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}`
                      : job.salary.min
                        ? `₹${job.salary.min.toLocaleString()}+`
                        : "Not disclosed"
                    : job.categorySpecificFields?.salaryRange &&
                        typeof job.categorySpecificFields.salaryRange ===
                          "string"
                      ? job.categorySpecificFields.salaryRange
                      : "Not disclosed",
              description: job.description || "",
              skills: Array.isArray(job.skills)
                ? job.skills
                : job.categorySpecificFields?.requiredSkills || [],
              postedAt: job.postedAt || job.createdAt,
              createdAt: job.createdAt,
              candidatesCount:
                typeof job.applicationCount === "number"
                  ? job.applicationCount
                  : 0,
              applicationCount:
                typeof job.applicationCount === "number"
                  ? job.applicationCount
                  : 0,
              bookmarkedCount:
                job._count?.employerBookmarks || job.bookmarkedCount || 0,
              isBookmarked: Boolean(job.isBookmarked),
              hasApplied: Boolean(job.hasApplied),
              experienceLevel: job.experienceLevel,
              status: job.status || "APPROVED",
            };

            // Determine the variant based on user role for the SharedJobCard
            const variant =
              user?.role === "CANDIDATE" ? "candidate" : "default";
            console.log("Role:::::::::::::", variant, job);
            return (
              <SharedJobCard
                key={job.id}
                job={jobData}
                variant={"default"}
                user={user}
                onApply={handleApply}
                onBookmark={handleBookmark}
                onClick={() => handleJobCardClick(job.id, job.status)}
                loading={{
                  apply: applying === job.id,
                  bookmark: false, // Assuming bookmark loading state is handled elsewhere or not critical for this change
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobsList;
