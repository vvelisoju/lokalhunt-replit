import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import JobCard from "../../components/ui/JobCard";
import Loader from "../../components/ui/Loader";
import { useCandidate } from "../../context/CandidateContext";
import { candidateApi } from "../../services/candidateApi";
import { useToast } from "../../components/ui/Toast";

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
    { value: "APPLIED", label: "Applied" },
    { value: "SCREENED", label: "Under Review" },
    { value: "RATED", label: "Interview Scheduled" },
    { value: "ALLOCATED", label: "Shortlisted" },
    { value: "HIRED", label: "Hired" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const dateRangeOptions = [
    { value: "", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "Last 3 Months" },
  ];

  useEffect(() => {
    fetchApplications();
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

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (app) =>
          app.ad?.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
          app.ad?.company?.name
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          (app.ad?.location?.name || app.ad?.location || "")
            .toLowerCase()
            .includes(filters.search.toLowerCase()),
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter((app) => {
        const locationName = app.ad?.location?.name || app.ad?.location || "";
        const locationState = app.ad?.location?.state || "";
        const fullLocation = `${locationName} ${locationState}`.toLowerCase();
        return fullLocation.includes(filters.location.toLowerCase());
      });
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(
        (app) => app.ad?.category?.name === filters.category,
      );
    }

    // Job Type filter
    if (filters.jobType && filters.jobType.length > 0) {
      filtered = filtered.filter((app) =>
        filters.jobType.includes(app.ad?.jobType?.toUpperCase()),
      );
    }

    // Experience filter
    if (filters.experience && filters.experience.length > 0) {
      filtered = filtered.filter((app) =>
        filters.experience.includes(
          app.ad?.categorySpecificFields?.experienceLevel?.toUpperCase(),
        ),
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((app) => app.status === filters.status);
    }

    // Date range filter
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
          (app) => new Date(app.createdAt) >= startDate,
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
      // Refresh applications to update the list
      await fetchApplications();
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

    switch (status?.toLowerCase()) {
      case "applied":
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "screened":
      case "reviewed":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "rated":
      case "interview":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case "allocated":
      case "shortlisted":
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "hired":
        return `${baseClasses} bg-emerald-100 text-emerald-800`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "withdrawn":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "applied":
      case "pending":
        return "Applied";
      case "screened":
      case "reviewed":
        return "Under Review";
      case "rated":
      case "interview":
        return "Interview Scheduled";
      case "allocated":
      case "shortlisted":
      case "approved":
        return "Approved";
      case "hired":
        return "Hired";
      case "rejected":
        return "Rejected";
      case "withdrawn":
        return "Withdrawn";
      default:
        return "Applied";
    }
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
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) =>
                  handleFiltersChange({ ...filters, search: e.target.value })
                }
                className="w-full py-2 px-3 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => {
                  /* Search handled by onChange */
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                handleFiltersChange({ ...filters, status: e.target.value })
              }
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange || ""}
              onChange={(e) =>
                handleFiltersChange({ ...filters, dateRange: e.target.value })
              }
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
              {applications.filter((app) => app.status === "APPLIED").length}
            </div>
            <div className="text-sm text-gray-600">Applied</div>
          </div>
        </Card>
        <Card padding="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {
                applications.filter((app) =>
                  ["ALLOCATED", "HIRED"].includes(app.status),
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Selected</div>
          </div>
        </Card>
        <Card padding="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {applications.filter((app) => app.status === "REJECTED").length}
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
          {filteredApplications.map((application) => {
            // Transform application data to job format for JobCard
            const jobData = {
              id: application.ad?.id,
              title: application.ad?.title,
              employer: application.ad?.employer,
              company: {
                name: application.ad?.company?.name,
                industry: application.ad?.company?.industry,
              },
              location: `${application.ad?.location?.name}, ${application.ad?.location?.state}`,
              jobType:
                application.ad?.categorySpecificFields?.employmentType ||
                "Full Time",
              salaryRange: application.ad?.categorySpecificFields?.salaryRange,
              description: application.ad?.description,
              skills:
                application.ad?.categorySpecificFields?.requiredSkills || [],
              postedAt: application.ad?.createdAt,
              hasApplied: true,
              candidatesCount: application.ad?.candidatesCount || 0,
              gender: application.ad?.gender,
            };

            return (
              <JobCard
                key={application.id}
                job={jobData}
                variant="application"
                applicationStatus={application.status}
                applicationDate={application.createdAt}
                onWithdraw={(appId) =>
                  handleWithdrawApplication(application.id)
                }
                onClick={() => handleJobCardClick(jobData.id)}
                loading={{
                  apply: false,
                  bookmark: false,
                  withdraw: actionLoading.withdraw === application.id,
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
