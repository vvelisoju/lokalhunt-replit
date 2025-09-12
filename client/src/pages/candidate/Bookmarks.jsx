import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookmarkIcon as BookmarkSolidIcon,
  BriefcaseIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import { BookmarkIcon as BookmarkOutlineIcon } from "@heroicons/react/24/outline";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import JobCard from "../../components/ui/JobCard";
import JobFilters from "../../components/ui/JobFilters";
import Loader from "../../components/ui/Loader";
import { useCandidate } from "../../context/CandidateContext";

const Bookmarks = () => {
  const navigate = useNavigate();
  const { bookmarks, fetchBookmarks, removeBookmark, applyToJob, loading } =
    useCandidate();
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [actionLoading, setActionLoading] = useState({
    apply: null,
    remove: null,
  });
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    category: "",
    jobType: [],
    experience: [],
    gender: "",
    education: [],
    salaryRange: "",
    sortBy: "newest",
  });

  const handleFiltersChange = useCallback((newFilters) => {
    console.log("Bookmarks: Received filter change", { current: filters, new: newFilters });
    setFilters(newFilters);
  }, [filters]);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  useEffect(() => {
    if (!bookmarks || !Array.isArray(bookmarks)) {
      setFilteredBookmarks([]);
      return;
    }

    console.log("Filtering bookmarks:", bookmarks, "with filters:", filters);

    // Debug: Log first bookmark structure to understand data format
    if (bookmarks.length > 0) {
      console.log("Sample bookmark structure:", JSON.stringify(bookmarks[0], null, 2));
    }

    let filtered = [...bookmarks];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter((bookmark) => {
        const job = bookmark.ad || bookmark;
        const title = job?.title?.toLowerCase() || "";
        const companyName = job?.company?.name?.toLowerCase() || job?.employer?.user?.name?.toLowerCase() || "";
        const description = job?.description?.toLowerCase() || "";
        const searchTerm = filters.search.toLowerCase();

        return title.includes(searchTerm) || 
               companyName.includes(searchTerm) || 
               description.includes(searchTerm);
      });
    }

    // Location filter - handle both city ID and city name
    if (filters.location) {
      filtered = filtered.filter((bookmark) => {
        const job = bookmark.ad || bookmark;

        // Get location data from various possible sources
        const locationId = job?.locationId || job?.cityId;
        const locationName = job?.locationName || job?.location?.name || "";
        const locationState = job?.locationState || job?.location?.state || "";
        const location = job?.location || "";

        // Handle UUID (city ID) vs city name
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.location);

        if (isUUID) {
          // Match by location ID
          return locationId === filters.location;
        } else {
          // Match by location name (case insensitive)
          const searchLocation = filters.location.toLowerCase();
          const fullLocation = `${locationName}, ${locationState}`.toLowerCase();

          return locationName.toLowerCase().includes(searchLocation) ||
                 locationState.toLowerCase().includes(searchLocation) ||
                 fullLocation.includes(searchLocation) ||
                 (typeof location === "string" && location.toLowerCase().includes(searchLocation));
        }
      });
    }

    // Category filter - now using categoryId
    if (filters.category && filters.category !== "") {
      filtered = filtered.filter((bookmark) => {
        const job = bookmark.ad || bookmark;
        return job.categoryId === filters.category;
      });
    }

    // Job Type filter
    if (filters.jobType && filters.jobType.length > 0) {
      filtered = filtered.filter((bookmark) => {
        const job = bookmark.ad || bookmark;
        const jobType = (job?.jobType || job?.categorySpecificFields?.employmentType || job?.employmentType || "").toUpperCase();
        return filters.jobType.includes(jobType);
      });
    }

    // Experience filter
    if (filters.experience && filters.experience.length > 0) {
      filtered = filtered.filter((bookmark) => {
        const job = bookmark.ad || bookmark;
        const experienceLevel = (job?.categorySpecificFields?.experienceLevel || job?.experienceLevel || "").toUpperCase();
        return filters.experience.includes(experienceLevel);
      });
    }

    // Gender filter
    if (filters.gender) {
      filtered = filtered.filter((bookmark) => {
        const job = bookmark.ad || bookmark;
        return job?.gender === filters.gender || (!job?.gender && filters.gender === "Both");
      });
    }

    // Education filter
    if (filters.education && filters.education.length > 0) {
      filtered = filtered.filter((bookmark) => {
        const job = bookmark.ad || bookmark;
        const jobEducation = job?.categorySpecificFields?.minimumEducation || job?.minimumEducation || "";
        return filters.education.includes(jobEducation);
      });
    }

    // Salary range filter
    if (filters.salaryRange) {
      filtered = filtered.filter((bookmark) => {
        const job = bookmark.ad || bookmark;

        let salary = 0;

        // Handle different salary structures
        if (job?.categorySpecificFields?.salaryRange) {
          const salaryRange = job.categorySpecificFields.salaryRange;
          if (typeof salaryRange === "object" && salaryRange.min && salaryRange.max) {
            salary = (salaryRange.min + salaryRange.max) / 2;
          }
        } else if (job?.salaryMin && job?.salaryMax) {
          salary = (parseInt(job.salaryMin) + parseInt(job.salaryMax)) / 2;
        } else if (job?.salary) {
          if (typeof job.salary === "string") {
            const numericSalary = job.salary.replace(/[^\d]/g, "");
            salary = parseInt(numericSalary) || 0;
          } else if (typeof job.salary === "number") {
            salary = job.salary;
          }
        }

        if (!salary) return false;

        // Handle salary range filtering
        if (filters.salaryRange === "100000+") {
          return salary >= 100000;
        }

        const rangeParts = filters.salaryRange.split("-");
        if (rangeParts.length === 2) {
          const [min, max] = rangeParts.map(Number);
          return salary >= min && salary <= max;
        }

        return false;
      });
    }

    // Sort by newest by default
    if (filters.sortBy === "newest" || !filters.sortBy) {
      filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    console.log("Filtered bookmarks result:", filtered);
    setFilteredBookmarks(filtered);
  }, [bookmarks, filters]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveBookmark = async (jobId) => {
    setActionLoading((prev) => ({ ...prev, remove: jobId }));
    try {
      // Use the context function which handles the API call and refetching
      await removeBookmark(jobId);
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, remove: null }));
    }
  };

  const handleApplyToJob = async (jobId) => {
    setActionLoading((prev) => ({ ...prev, apply: jobId }));
    try {
      // Use the context function which handles the API call and refetching
      await applyToJob(jobId);
    } catch (error) {
      console.error("Failed to apply to job:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, apply: null }));
    }
  };

  const handleJobCardClick = (jobId) => {
    // Bookmarked jobs are always approved jobs, so use regular job view
    navigate(`/jobs/${jobId}`);
  };

  const formatSalary = (salary) => {
    if (salary >= 100000) {
      return `₹${(salary / 100000).toFixed(1)} LPA`;
    }
    return `₹${salary.toLocaleString()}`;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const bookmarkDate = new Date(date);
    const diffInHours = Math.floor((now - bookmarkDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}m ago`;
  };

  if (loading && (!bookmarks || bookmarks.length === 0)) {
    return <Loader.Page />;
  }

  return (
    <div className="space-y-2">
      {/* Page Header */}
      <div className="p-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Saved Jobs</h1>
          </div>
          <div className="text-sm text-gray-500">
            {filteredBookmarks.length} of {bookmarks?.length || 0} saved jobs
          </div>
        </div>
      </div>

      {/* Shared Job Filters Component */}
      <JobFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        showAdvancedFilters={false}
      />

      {/* Bookmarked Jobs */}
      {filteredBookmarks.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No saved jobs found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {bookmarks?.length === 0
                ? "You haven't saved any jobs yet. Start browsing jobs and bookmark the ones you like."
                : "No saved jobs match your current filters. Try adjusting your search criteria."}
            </p>
            {bookmarks?.length === 0 && (
              <Link to="/candidate/jobs" className="mt-4 inline-block">
                <Button>Find Jobs</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookmarks.map((bookmark) => {
            // Extract job data from bookmark structure (bookmark.ad is the job)
            const job = bookmark.ad || bookmark;

            const jobData = {
              id: job?.id || bookmark?.adId,
              title: job?.title || "Job Title",
              employer: job?.employer,
              description: job?.description,

              locationName: job?.location?.name || job?.locationName,

              location: job?.location
                ? typeof job.location === "string"
                  ? job.location
                  : `${job.location.name || ""}, ${job.location.state || ""}`
                      .trim()
                      .replace(/,$/, "")
                : job?.locationName || "Location not specified",

              locationState: job?.location?.state || job?.locationState,

              salary: job?.salary || job?.salaryRange,
              salaryRange: job?.salaryRange || job?.salary,

              jobType: job?.jobType || job?.categorySpecificFields?.employmentType || job?.employmentType || "Full Time",

              skills: job?.skills || [],

              postedAt: job?.postedAt || job?.createdAt,

              candidatesCount:
                job?.candidatesCount ||
                job?.applicationCount ||
                job?._count?.allocations ||
                0,

              company: {
                name: job?.company?.name || job?.employer?.user?.name || "Company",
                industry: job?.company?.industry,
              },

              hasApplied: job?.hasApplied || false,
              isBookmarked: true, // Since these are bookmarks
              gender: job?.gender,

              salaryDisplay: job?.salaryDisplay || (() => {
                if (job?.salaryMin && job?.salaryMax) {
                  return `₹${parseInt(job.salaryMin).toLocaleString()} - ₹${parseInt(job.salaryMax).toLocaleString()}`;
                } else if (typeof job?.salary === "string") {
                  return job.salary;
                } else if (job?.salary && typeof job.salary === "object") {
                  if (job.salary.min && job.salary.max) {
                    return `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}`;
                  } else if (job.salary.min) {
                    return `₹${job.salary.min.toLocaleString()}+`;
                  }
                }
                return "Not disclosed";
              })(),
            };

            return (
              <JobCard
                key={bookmark.id}
                job={jobData}
                variant="bookmark"
                applicationStatus={job?.applicationInfo?.status}
                bookmarkDate={bookmark.createdAt}
                showApplicationDate={false}
                showBookmarkDate={true}
                showCandidatesCount={true}
                showBookmarkedCount={false}
                onApply={(jobId) => handleApplyToJob(jobId)}
                onRemoveBookmark={(jobId) => handleRemoveBookmark(jobId)}
                onClick={() => {
                  navigate(`/candidate/jobs/${jobData.id}?from=bookmarks`);
                }}
                loading={{
                  apply: actionLoading.apply === jobData.id,
                  bookmark: actionLoading.remove === jobData.id,
                  withdraw: false,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;