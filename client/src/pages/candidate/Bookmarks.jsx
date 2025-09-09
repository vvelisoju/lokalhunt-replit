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
    setFilters(newFilters);
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  useEffect(() => {
    if (!bookmarks || !Array.isArray(bookmarks)) {
      setFilteredBookmarks([]);
      return;
    }

    let filtered = [...bookmarks];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (bookmark) =>
          bookmark.ad?.title
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          bookmark.ad?.company?.name
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          bookmark.ad?.description
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()),
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter((bookmark) => {
        const jobLocation =
          bookmark.ad?.location?.name?.toLowerCase() ||
          bookmark.ad?.location?.toLowerCase() ||
          "";
        return jobLocation.includes(filters.location.toLowerCase());
      });
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(
        (bookmark) => bookmark.ad?.category?.name === filters.category,
      );
    }

    // Job Type filter
    if (filters.jobType && filters.jobType.length > 0) {
      filtered = filtered.filter((bookmark) =>
        filters.jobType.includes(
          bookmark.ad?.jobType?.toUpperCase() ||
            bookmark.ad?.categorySpecificFields?.employmentType?.toUpperCase(),
        ),
      );
    }

    // Experience filter
    if (filters.experience && filters.experience.length > 0) {
      filtered = filtered.filter((bookmark) =>
        filters.experience.includes(
          bookmark.ad?.categorySpecificFields?.experienceLevel?.toUpperCase(),
        ),
      );
    }

    // Salary range filter
    if (filters.salaryRange) {
      filtered = filtered.filter((bookmark) => {
        const salaryRange = bookmark.ad?.categorySpecificFields?.salaryRange;
        if (!salaryRange && !bookmark.ad?.salary) return false;

        let salary = 0;
        if (
          salaryRange &&
          typeof salaryRange === "object" &&
          salaryRange.min &&
          salaryRange.max
        ) {
          salary = (salaryRange.min + salaryRange.max) / 2;
        } else if (bookmark.ad?.salary) {
          salary =
            typeof bookmark.ad.salary === "string"
              ? parseInt(bookmark.ad.salary.replace(/[^\d]/g, ""))
              : bookmark.ad.salary;
        }

        if (filters.salaryRange === "1500000+") {
          return salary >= 1500000;
        }

        const [min, max] = filters.salaryRange.split("-").map(Number);
        return salary >= min && (max ? salary <= max : true);
      });
    }

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
            // Transform bookmark data to job format for JobCard
            const jobData = {
              id: bookmark.ad?.id,
              title: bookmark.ad?.title || "No Title",
              companyName: bookmark.ad?.company?.name || "Unknown Company",
              company: bookmark.ad?.company,
              employer: bookmark.ad?.employer,
              location:
                bookmark.ad?.location?.name && bookmark.ad?.location?.state
                  ? `${bookmark.ad.location.name}, ${bookmark.ad.location.state}`
                  : bookmark.ad?.location?.name ||
                    bookmark.ad?.location ||
                    "Location not specified",
              jobType:
                bookmark.ad?.jobType ||
                bookmark.ad?.categorySpecificFields?.employmentType ||
                "Full Time",
              salary: bookmark.ad?.categorySpecificFields?.salaryRange
                ? typeof bookmark.ad.categorySpecificFields.salaryRange ===
                    "object" &&
                  bookmark.ad.categorySpecificFields.salaryRange.min &&
                  bookmark.ad.categorySpecificFields.salaryRange.max
                  ? `₹${bookmark.ad.categorySpecificFields.salaryRange.min.toLocaleString()} - ₹${bookmark.ad.categorySpecificFields.salaryRange.max.toLocaleString()}`
                  : bookmark.ad.categorySpecificFields.salaryRange
                : "Not disclosed",
              description: bookmark.ad?.description || "",
              skills: bookmark.ad?.categorySpecificFields?.requiredSkills || [],
              postedAt: bookmark.ad?.createdAt,
              createdAt: bookmark.ad?.createdAt,
              candidatesCount:
                bookmark.ad?.candidatesCount ||
                bookmark.ad?.applicationCount ||
                bookmark.ad?._count?.allocations ||
                0,
              applicationCount:
                bookmark.ad?.candidatesCount ||
                bookmark.ad?.applicationCount ||
                bookmark.ad?._count?.allocations ||
                0,
              bookmarkedCount:
                bookmark.ad?.bookmarkedCount ||
                bookmark.ad?._count?.bookmarks ||
                0,
              isBookmarked: true, // Always true for bookmarks page
              hasApplied:
                bookmark.hasApplied || bookmark.ad?.hasApplied || false,
              experienceLevel:
                bookmark.ad?.categorySpecificFields?.experienceLevel,
              gender: bookmark.ad?.gender,
            };

            return (
              <JobCard
                key={bookmark.id}
                job={jobData}
                variant="bookmark"
                bookmarkDate={bookmark.createdAt}
                showBookmarkDate={true}
                showCandidatesCount={true}
                showBookmarkedCount={false}
                onApply={(jobId) => handleApplyToJob(jobId)}
                onRemoveBookmark={(jobId) => handleRemoveBookmark(jobId)}
                onClick={() => {
                  navigate(`/candidate/jobs/${bookmark.ad.id}?from=bookmarks`);
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
