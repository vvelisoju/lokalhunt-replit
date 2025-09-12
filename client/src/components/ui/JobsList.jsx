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
import { useCandidate } from "../../context/CandidateContext";

const JobsList = ({
  showFilters = true,
  title = "Jobs",
  subtitle = "",
  apiEndpoint = "public",
  defaultFilters = {},
  onFiltersChange,
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

  // Get candidate context for preferred locations
  const { profile: candidateProfile } = useCandidate();

  // Function to get filters from localStorage
  const getSavedFilters = () => {
    const savedFilters = localStorage.getItem("jobFilters");
    return savedFilters ? JSON.parse(savedFilters) : null;
  };

  // Function to save filters to localStorage
  const saveFiltersToLocalStorage = (filtersToSave) => {
    localStorage.setItem("jobFilters", JSON.stringify(filtersToSave));
  };

  // Initialize filters state from URL parameters, localStorage, and default filters
  const initializeFilters = useCallback(() => {
    const jobTypeParam = searchParams.get("jobType");
    const experienceParam = searchParams.get("experience");
    const educationParam = searchParams.get("education");
    
    const urlFilters = {
      search: searchParams.get("search") || "",
      location: searchParams.get("location") || "",
      category: searchParams.get("category") || "",
      jobType: jobTypeParam ? jobTypeParam.split(",") : [],
      experience: experienceParam ? experienceParam.split(",") : [],
      gender: searchParams.get("gender") || "",
      education: educationParam ? educationParam.split(",") : [],
      salaryRange: searchParams.get("salaryRange") || "",
      sortBy: searchParams.get("sortBy") || "newest",
    };

    const savedFilters = getSavedFilters();
    const initialFilters = {
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

    // Prioritize: URL > localStorage > defaultFilters > initialFilters
    let mergedFilters = { ...initialFilters };

    // Apply default filters if available
    if (defaultFilters && Object.keys(defaultFilters).length > 0) {
      mergedFilters = { ...mergedFilters, ...defaultFilters };
    }

    // Apply saved filters from localStorage if they exist and are not empty
    if (savedFilters && Object.keys(savedFilters).some(key => savedFilters[key] !== "" && savedFilters[key] !== null && !(Array.isArray(savedFilters[key]) && savedFilters[key].length === 0))) {
      mergedFilters = { ...mergedFilters, ...savedFilters };
    }

    // Apply URL filters if they exist and have meaningful values
    const hasUrlFilters = Object.keys(urlFilters).some((key) => {
      const value = urlFilters[key];
      return (
        value != null &&
        value !== "" &&
        (!Array.isArray(value) || value.length > 0)
      );
    });

    if (hasUrlFilters) {
      mergedFilters = { ...mergedFilters, ...urlFilters };
    }

    // Remove default location if it's the first preferred location and not set by URL/localStorage
    if (mergedFilters.location === "" && candidateProfile?.preferredLocations?.length > 0) {
       // No default location selection as candidate first preferred location
    } else if (mergedFilters.location === "" && candidateProfile?.preferredLocations?.length > 0) {
        // Do nothing here, let it remain empty if no other source provided it.
    }


    console.log("JobsList: Initializing filters with:", mergedFilters);
    return mergedFilters;
  }, [searchParams, defaultFilters, candidateProfile]);


  // Initialize filters state
  const [filters, setFilters] = useState(initializeFilters());
  const [filtersInitialized, setFiltersInitialized] = useState(false);

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
      jobType: Array.isArray(filters.jobType) ? filters.jobType.join(",") : "",
      experience: Array.isArray(filters.experience) ? filters.experience.join(",") : "",
      salaryRange: filters.salaryRange,
      sortBy: filters.sortBy,
    };

    // Remove empty parameters
    const cleanedParams = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== "") {
        cleanedParams[key] = value;
      }
    });

    return cleanedParams;
  }, [currentPage, jobsPerPage, filters]);

  const searchJobs = useCallback(async () => {
    try {
      setLoading(true);
      console.log("JobsList: Making API call with params:", apiParams);

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

      console.log("JobsList: API response received:", {
        jobs: jobs.length,
        total,
      });

      // Always update jobs array, even if empty - this fixes the issue of showing old results
      setJobs(jobs);
      setTotalJobs(total);
    } catch (error) {
      console.error("Error loading jobs:", error);
      // Clear jobs on error to avoid showing stale data
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, JSON.stringify(apiParams)]);

  // Update URL and localStorage when filters change
  const updateFiltersAndStorage = useCallback(
    (newFilters) => {
      console.log("JobsList: Updating filters and storage:", newFilters);
      setFilters(newFilters);
      setCurrentPage(1); // Reset page when filters change
      saveFiltersToLocalStorage(newFilters); // Save to localStorage

      // Update URL
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
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  // Initialize filters on mount only once
  useEffect(() => {
    if (!filtersInitialized) {
      // Check if filters exist in localStorage first
      const savedFilters = getSavedFilters();
      
      if (savedFilters && Object.keys(savedFilters).some(key => savedFilters[key] !== "" && savedFilters[key] !== null && !(Array.isArray(savedFilters[key]) && savedFilters[key].length === 0))) {
        // Use saved filters directly without reinitializing
        console.log('JobsList: Using saved filters from localStorage:', savedFilters);
        setFilters(savedFilters);
      } else {
        // Only initialize filters if no valid saved filters exist
        const initialFilters = initializeFilters();
        setFilters(initialFilters);
      }
      
      setFiltersInitialized(true);
    }
  }, [filtersInitialized]);

  // Fetch jobs when filters change or filters are initialized
  useEffect(() => {
    if (!filtersInitialized) {
      console.log("JobsList: Filters not yet initialized, skipping API call");
      return;
    }
    console.log("JobsList: Filters changed, calling searchJobs:", filters);
    searchJobs();
  }, [searchJobs, filtersInitialized]);

  // Call onFiltersChange when filters change
  useEffect(() => {
    if (filtersInitialized && typeof onFiltersChange === 'function') {
      onFiltersChange(filters);
    }
  }, [filters, filtersInitialized, onFiltersChange]);

  // Clear filters and storage
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
    saveFiltersToLocalStorage(clearedFilters); // Clear from localStorage
    updateFiltersAndStorage(clearedFilters); // Also update URL and call prop
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
            onFiltersChange={updateFiltersAndStorage}
            onClearFilters={handleClearFilters}
            loading={loading}
          />
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {/* <h2 className="text-base font-medium text-gray-900">
            Total jobs found:{" "}
            <span className="text-blue-600 font-semibold">{totalJobs}</span>
          </h2> */}
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-700">Sort:</label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              updateFiltersAndStorage({ ...filters, sortBy: e.target.value })
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
            console.log("Job:::::::::::::", job.gender);
            // Transform job data for shared JobCard
            const jobData = {
              id: job.id,
              title: job.title || "No Title",
              company: job.company,
              employer: job.employer,
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
              gender: job.gender,
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