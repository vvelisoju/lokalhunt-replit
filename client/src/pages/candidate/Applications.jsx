import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import JobCard from "../../components/ui/JobCard";
import Loader from "../../components/ui/Loader";
import { useCandidate } from "../../context/CandidateContext";
import { candidateApi } from "../../services/candidateApi";
import { useToast } from "../../components/ui/Toast";
import { AllocationStatus, AllocationStatusLabels, getApplicationStatusOptions } from "../../utils/enums";

const Applications = () => {
  const navigate = useNavigate();
  const { applications, fetchApplications, loading } = useCandidate();
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [actionLoading, setActionLoading] = useState({
    apply: null,
    remove: null,
    withdraw: null,
  });
  const { success: showSuccess, error: showError } = useToast();
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
    // Applications specific filters
    status: "",
    dateRange: "",
  });

  const statusOptions = [
    { value: "", label: "All Statuses" },
    ...getApplicationStatusOptions()
  ];

  const dateRangeOptions = [
    { value: "", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "Last 3 Months" },
  ];

  // Load applications on mount - ensure it's called on component mount
  useEffect(() => {
    console.log("Applications component mounted, fetching applications...");
    const loadApplications = async () => {
      try {
        // Force refresh to always fetch fresh data
        await fetchApplications({}, true);
      } catch (error) {
        console.error("Failed to fetch applications on mount:", error);
      }
    };
    loadApplications();
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  useEffect(() => {
    if (!applications || !Array.isArray(applications)) {
      setFilteredApplications([]);
      return;
    }

    let filtered = [...applications];

    // Search filter (client-side since API doesn't support search)
    if (filters.search) {
      filtered = filtered.filter(
        (app) =>
          app?.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
          app?.company?.name
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          app?.location?.toLowerCase().includes(filters.search.toLowerCase()),
      );
    }

    // Location filter (client-side)
    if (filters.location) {
      filtered = filtered.filter((app) => {
        const location = app?.location || "";
        return location.toLowerCase().includes(filters.location.toLowerCase());
      });
    }

    // Category filter (client-side)
    if (filters.category) {
      filtered = filtered.filter(
        (app) => app?.category?.name === filters.category,
      );
    }

    // Job Type filter (client-side)
    if (filters.jobType && filters.jobType.length > 0) {
      filtered = filtered.filter((app) =>
        filters.jobType.includes(app?.jobType?.toUpperCase()),
      );
    }

    // Experience filter (client-side)
    if (filters.experience && filters.experience.length > 0) {
      filtered = filtered.filter((app) =>
        filters.experience.includes(app?.experienceLevel?.toUpperCase()),
      );
    }

    // Status filter (client-side) - use applicationInfo.status
    if (filters.status) {
      filtered = filtered.filter(
        (app) => app.applicationInfo?.status === filters.status,
      );
    }

    // Date range filter (client-side) - use applicationInfo.createdAt for applied date
    if (filters.dateRange) {
      const now = new Date();
      let startDate = new Date();

      switch (filters.dateRange) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(now.getMonth() - 3);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(
          (app) => new Date(app.applicationInfo?.appliedAt || app.applicationInfo?.createdAt || app.createdAt) >= startDate,
        );
      }
    }

    setFilteredApplications(filtered);
  }, [applications, filters]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleWithdrawApplication = async (applicationId) => {
    setActionLoading((prev) => ({ ...prev, withdraw: applicationId }));
    try {
      await candidateApi.withdrawApplication(applicationId);
      showSuccess("Application withdrawn successfully");
      // Force refresh applications to update the list
      await fetchApplications({}, true);
    } catch (error) {
      console.error("Failed to withdraw application:", error);
      showError(
        error.response?.data?.message || "Failed to withdraw application",
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, withdraw: null }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case "reviewed":
        return <EyeIcon className="h-4 w-4 text-blue-500" />;
      case "interview":
        return <CheckCircleIcon className="h-4 w-4 text-purple-500" />;
      case "approved":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case "withdrawn":
        return <XCircleIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case AllocationStatus.APPLIED:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case AllocationStatus.SHORTLISTED:
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case AllocationStatus.INTERVIEW_SCHEDULED:
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case AllocationStatus.INTERVIEW_COMPLETED:
        return `${baseClasses} bg-indigo-100 text-indigo-800`;
      case AllocationStatus.HIRED:
        return `${baseClasses} bg-emerald-100 text-emerald-800`;
      case AllocationStatus.HOLD:
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case AllocationStatus.REJECTED:
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  const getStatusText = (status) => {
    return AllocationStatusLabels[status] || "Applied";
  };

  const handleJobCardClick = (jobId) => {
    // Applications are always for approved jobs, so use regular job view
    navigate(`/jobs/${jobId}`);
  };

  if (loading && (!applications || applications.length === 0)) {
    return <Loader.Page />;
  }

  return (
    <div className="space-y-2">
      {/* Page Header */}
      <div className="p-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
          </div>
          <div className="text-sm text-gray-500">
            {filteredApplications.length} of {applications?.length || 0}{" "}
            applications
          </div>
        </div>
      </div>

      {/* Application-specific Filters */}
      {/* Enhanced Filter Controls - Using JobFilters styling */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Filter */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-700"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-700"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>


      {/* Application Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card padding="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {applications.length}
            </div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
        </Card>
        <Card padding="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter((app) => app.applicationInfo?.status === AllocationStatus.APPLIED).length}
            </div>
            <div className="text-sm text-gray-600">Applied</div>
          </div>
        </Card>
        <Card padding="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {
                applications.filter((app) =>
                  [AllocationStatus.SHORTLISTED, AllocationStatus.HIRED, AllocationStatus.INTERVIEW_SCHEDULED, AllocationStatus.INTERVIEW_COMPLETED].includes(app.applicationInfo?.status),
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Selected</div>
          </div>
        </Card>
        <Card padding="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {applications.filter((app) => app.applicationInfo?.status === AllocationStatus.REJECTED).length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </Card>
      </div>

      {/* Mobile-Friendly Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No applications found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {applications.length === 0
                ? "You haven't applied to any jobs yet. Start browsing jobs to find opportunities."
                : "No applications match your current filters. Try adjusting your search criteria."}
            </p>
            {applications.length === 0 && (
              <Link to="/candidate/jobs" className="mt-4 inline-block">
                <Button>Find Jobs</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredApplications.map((job) => {
            // Transform application data to job format for JobCard
            const jobData = {
              id: job.id,
              title: job?.title || "Job Title",
              employer: job?.employer,
              description: job?.description,

              locationName: job?.locationName || job?.location?.name,

              location: job?.location
                ? typeof job.location === "string"
                  ? job.location
                  : `${job.location.name}, ${job.location.state || ""}`
                      .trim()
                      .replace(/,$/, "")
                : "Location not specified",

              locationState: job?.locationState || job?.location?.state,

              salary: job?.salary || job?.salaryRange,
              salaryRange: job?.salaryRange || job?.salary,

              jobType: job?.jobType || job?.employmentType || "Full Time",

              skills: job?.skills || [],

              postedAt: job?.postedAt || job?.createdAt,

              candidatesCount:
                job?.candidatesCount ||
                job?.applicationCount ||
                job?._count?.allocations ||
                0,

              company: {
                name: job?.company?.name || "Company",
                industry: job?.company?.industry,
              },

              hasApplied: true, // Since these are applications, user has already applied
              gender: job?.gender,

              salaryDisplay:
                job?.salaryDisplay ||
                (typeof job?.salary === "string"
                  ? job.salary
                  : job?.salary && typeof job.salary === "object"
                    ? job.salary.min && job.salary.max
                      ? `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}`
                      : job.salary.min
                        ? `₹${job.salary.min.toLocaleString()}+`
                        : "Not disclosed"
                    : "Not disclosed"),
            };

            return (
              <JobCard
                key={job.id}
                job={jobData}
                variant="application"
                applicationStatus={job.applicationInfo?.status}
                applicationDate={job.createdAt}
                onWithdraw={(appId) =>
                  handleWithdrawApplication(job.applicationInfo?.id)
                }
                onClick={() => handleJobCardClick(jobData.id)}
                loading={{
                  apply: false,
                  bookmark: false,
                  withdraw: actionLoading.withdraw === job.applicationInfo?.id,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;