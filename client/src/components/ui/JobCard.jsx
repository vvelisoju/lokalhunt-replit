import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "./Button";
import Modal from "./Modal";
import TextArea from "./TextArea";
import { useAuth } from "../../context/AuthContext";
import { approveAd, rejectAd } from "../../services/branch-admin/ads";
import { toast } from "react-hot-toast";
import {
  MapPinIcon,
  BriefcaseIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  BookmarkIcon as BookmarkOutlineIcon,
  HeartIcon as HeartOutlineIcon,
  EyeIcon,
  PencilIcon,
  CheckBadgeIcon,
  XMarkIcon,
  UserGroupIcon, // Added for candidate count
  BookmarkIcon, // Added for bookmarked count
} from "@heroicons/react/24/outline";
import {
  BookmarkIcon as BookmarkSolidIcon,
  HeartIcon as HeartSolidIcon,
} from "@heroicons/react/24/solid";

const JobCard = ({
  job,
  variant = "default", // 'default', 'application', 'bookmark', 'employer'
  onApply,
  onBookmark,
  onWithdraw,
  onRemoveBookmark,
  onSubmit,
  onArchive,
  onApprove, // Optional external approve handler
  onReject, // Optional external reject handler
  onViewCandidates, // Added prop to handle viewing candidates
  onClick, // Added onClick prop
  className = "",
  showApplicationDate = false,
  showBookmarkDate = false,
  showCandidatesCount = false, // New prop to control candidate count visibility
  showBookmarkedCount = false, // New prop to control bookmarked count visibility
  applicationStatus = null,
  applicationDate = null,
  bookmarkDate = null,
  loading = {},
  userRole = null, // New prop to identify user role
  onRefresh, // Optional callback to refresh data after approve/reject
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Internal state for loading and modals
  const [internalLoading, setInternalLoading] = useState({
    approve: false,
    reject: false,
  });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Internal approve handler - show confirmation modal
  const handleInternalApprove = async (jobId) => {
    setShowApproveModal(true);
  };

  // Handle approve confirmation
  const handleApproveConfirm = async () => {
    setInternalLoading(prev => ({ ...prev, approve: true }));
    try {
      const result = await approveAd(job.id);
      if (result.success) {
        toast.success('Job ad approved successfully');
        setShowApproveModal(false);
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(result.error || 'Failed to approve job ad');
      }
    } catch (error) {
      console.error('Error approving job ad:', error);
      toast.error(error.response?.data?.message || 'Failed to approve job ad');
    } finally {
      setInternalLoading(prev => ({ ...prev, approve: false }));
    }
  };

  // Handle approve modal close
  const handleApproveCancel = () => {
    setShowApproveModal(false);
  };

  // Internal reject handler
  const handleInternalReject = async (jobId) => {
    setShowRejectModal(true);
  };

  // Handle reject confirmation
  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setInternalLoading(prev => ({ ...prev, reject: true }));
    try {
      const result = await rejectAd(job.id, rejectReason);
      if (result.success) {
        toast.success('Job ad rejected successfully');
        setShowRejectModal(false);
        setRejectReason("");
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(result.error || 'Failed to reject job ad');
      }
    } catch (error) {
      console.error('Error rejecting job ad:', error);
      toast.error(error.response?.data?.message || 'Failed to reject job ad');
    } finally {
      setInternalLoading(prev => ({ ...prev, reject: false }));
    }
  };

  // Handle reject modal close
  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRejectReason("");
  };

  // Helper function to get correct job route based on status
  const getJobRoute = (jobId, status) => {
    if (status === "DRAFT" || status === "PENDING_APPROVAL") {
      return `/jobs/${jobId}/preview`;
    }
    return `/jobs/${jobId}`;
  };

  // Helper function to get time ago string
  const getTimeAgo = (date) => {
    if (!date) return "";
    const now = new Date();
    const targetDate = new Date(date);
    const diffInHours = Math.floor((now - targetDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

    return targetDate.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    if (!status) return null;

    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status?.toLowerCase()) {
      case "applied":
      case "pending":
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Applied
          </span>
        );
      case "screened":
      case "reviewed":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            Under Review
          </span>
        );
      case "rated":
      case "interview":
        return (
          <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
            Interview
          </span>
        );
      case "allocated":
      case "shortlisted":
      case "approved":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Shortlisted
          </span>
        );
      case "hired":
        return (
          <span className={`${baseClasses} bg-emerald-100 text-emerald-800`}>
            Hired
          </span>
        );
      case "rejected":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            Rejected
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            Applied
          </span>
        );
    }
  };

  // Render actions based on variant
  const renderActions = () => {
    const actions = [];

    switch (variant) {
      case "application":
        // Applied Jobs page actions
        actions.push(
          <Link key="view" to={getJobRoute(job.id, job.status)}>
            <Button variant="outline" size="sm" className="flex items-center">
              <EyeIcon className="w-4 h-4 mr-1" />
              View Job
            </Button>
          </Link>,
        );
        if (applicationStatus === "APPLIED") {
          actions.push(
            <Button
              key="withdraw"
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                onWithdraw?.(job.id);
              }}
              disabled={loading.withdraw}
            >
              {loading.withdraw ? "Withdrawing..." : "Withdraw"}
            </Button>,
          );
        }
        break;

      case "bookmark":
        // Bookmarks page actions
        actions.push(
          <Link key="view" to={getJobRoute(job.id, job.status)}>
            <Button variant="outline" size="sm" className="flex items-center">
              <EyeIcon className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </Link>,
        );
        if (!job.hasApplied) {
          actions.push(
            <Button
              key="apply"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onApply?.(job.id);
              }}
              disabled={loading.apply}
            >
              {loading.apply ? "Applying..." : "Apply Now"}
            </Button>,
          );
        } else {
          actions.push(
            <Button key="applied" size="sm" variant="outline" disabled>
              Applied
            </Button>,
          );
        }

        // Remove bookmark button
        actions.push(
          <Button
            key="remove-bookmark"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveBookmark?.(job.id);
            }}
            disabled={loading.bookmark}
            className="text-red-600 hover:text-red-700"
          >
            {loading.bookmark ? "Removing..." : "Remove"}
          </Button>,
        );
        break;

      case "employer":
        // Employer ads page actions
        // Only show Edit button if job is not approved
        if (applicationStatus !== "APPROVED") {
          actions.push(
            <Button
              key="edit"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Updated the edit link for Branch Admin
                if (user?.role === "BRANCH_ADMIN" || userRole === "BRANCH_ADMIN") {
                  // Get employerId from job object, with fallback checks
                  const employerId = job.employerId || job.employer?.id || job.company?.employerId;

                  if (employerId) {
                    console.log('Navigating to Branch Admin edit route:', `/branch-admin/employers/${employerId}/ads/${job.id}/edit`);
                    // Determine the from parameter based on current location
                    const currentPath = location.pathname;
                    let fromParam = 'approval'; // default for ads approval page

                    if (currentPath.includes('/branch-admin/employers/')) {
                      fromParam = 'employer';
                    }

                    navigate(`/branch-admin/employers/${employerId}/ads/${job.id}/edit?from=${fromParam}`);
                  } else {
                    console.error('No employerId found in job object:', job);
                    toast.error('Cannot edit this job - employer information missing');
                  }
                } else {
                  navigate(`/employer/ads/${job.id}/edit`);
                }
              }}
              className="flex items-center"
            >
              <PencilIcon className="w-4 h-4 mr-1" />
            </Button>,
          );
        }

        // Show Preview for DRAFT/PENDING jobs, View for others
        if (
          applicationStatus === "DRAFT" ||
          applicationStatus === "PENDING_APPROVAL"
        ) {
          actions.push(
            <Button
              key="preview-job"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/jobs/${job.id}/preview?from=employer-ads`);
              }}
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <EyeIcon className="w-4 h-4 mr-1" />
            </Button>,
          );
        } else {
          actions.push(
            <Button
              key="view-job"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/jobs/${job.id}?from=employer-ads`);
              }}
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <EyeIcon className="w-4 h-4 mr-1" />
            </Button>,
          );
        }

        if (applicationStatus === "DRAFT") {
          actions.push(
            <Button
              key="submit"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSubmit?.(job.id);
              }}
              disabled={loading.submit}
            >
              {loading.submit ? "Submitting..." : "Submit for Approval"}
            </Button>,
          );
        }

        if (applicationStatus === "APPROVED") {
          actions.push(
            <Button
              key="archive"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onArchive?.(job.id);
              }}
              disabled={loading.archive}
              className="text-red-600 hover:text-red-700"
            >
              {loading.archive ? "Closing..." : "Close Job"}
            </Button>,
          );
        }

        // Branch Admin specific actions for pending approval jobs
        if ((userRole === "BRANCH_ADMIN" || user?.role === "BRANCH_ADMIN") && applicationStatus === "PENDING_APPROVAL") {
          actions.push(
            <Button
              key="approve"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Use external handler if provided, otherwise use internal
                if (onApprove) {
                  onApprove(job.id);
                } else {
                  handleInternalApprove(job.id);
                }
              }}
              disabled={loading?.approve || internalLoading.approve}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center"
            >
              <CheckBadgeIcon className="w-4 h-4 mr-1" />
              {(loading?.approve || internalLoading.approve) ? "Approving..." : "Approve"}
            </Button>,
          );

          actions.push(
            <Button
              key="reject"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Use external handler if provided, otherwise use internal
                if (onReject) {
                  onReject(job.id);
                } else {
                  handleInternalReject(job.id);
                }
              }}
              disabled={loading?.reject || internalLoading.reject}
              className="text-red-600 hover:text-red-700 flex items-center"
            >
              <XMarkIcon className="w-4 h-4 mr-1" />
              {(loading?.reject || internalLoading.reject) ? "Rejecting..." : "Reject"}
            </Button>,
          );
        }
        break;

      case "default":
      default:
        // Jobs page actions
        // View Job button - route based on job status
        actions.push(
          <Link key="view" to={getJobRoute(job.id, job.status)}>
            <Button variant="outline" size="sm" className="flex items-center">
              <EyeIcon className="w-4 h-4 mr-1" />
              View Job
            </Button>
          </Link>,
        );

        // Show application button for all jobs when onApply handler is provided
        if (onApply) {
          if (!job.hasApplied) {
            actions.push(
              <Button
                key="apply"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onApply(job.id);
                }}
                disabled={loading.apply}
              >
                {loading.apply ? "Applying..." : "Apply Now"}
              </Button>,
            );
          } else {
            actions.push(
              <Button key="applied" size="sm" variant="outline" disabled>
                Applied
              </Button>,
            );
          }
        }

        // Show bookmark functionality when onBookmark is provided
        if (onBookmark) {
          actions.push(
            <Button
              key="bookmark"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(job.id);
              }}
              disabled={loading.bookmark}
              className="text-gray-600 hover:text-blue-600"
            >
              {job.isBookmarked ? (
                <BookmarkSolidIcon className="h-5 w-5 text-blue-500" />
              ) : (
                <BookmarkOutlineIcon className="h-5 w-5" />
              )}
            </Button>,
          );
        }
        break;
    }

    return actions;
  };

  return (
    <>
      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={handleApproveCancel}
        title="Approve Job Advertisement"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to approve this job advertisement? Once approved, it will be published and visible to candidates.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">{job.title}</h4>
            <p className="text-blue-700 text-sm">{job.company?.name || job.companyName}</p>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleApproveCancel}
              disabled={internalLoading.approve}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveConfirm}
              disabled={internalLoading.approve}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {internalLoading.approve ? "Approving..." : "Approve Ad"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={handleRejectCancel}
        title="Reject Job Advertisement"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide a reason for rejecting this job advertisement. This will help the employer understand what needs to be improved.
          </p>
          <TextArea
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter the reason for rejection..."
            rows={4}
            required
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleRejectCancel}
              disabled={internalLoading.reject}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectConfirm}
              disabled={internalLoading.reject || !rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {internalLoading.reject ? "Rejecting..." : "Reject Ad"}
            </Button>
          </div>
        </div>
      </Modal>

      <div
        className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${onClick ? "cursor-pointer" : ""} ${className}`}
        onClick={onClick}
      >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
            {typeof job.title === "string" ? job.title : "Job Title"}
          </h3>
          <p className="text-gray-600 text-sm font-medium">
            {job.company?.name || job.companyName || "Company Name"}
          </p>
          {job.company?.industry && (
            <p className="text-gray-500 text-xs mt-0.5">
              {job.company.industry}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-1.5">
          {applicationStatus && variant === "employer" && (
            <div className="flex flex-col items-end space-y-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  applicationStatus === "DRAFT"
                    ? "bg-gray-100 text-gray-800"
                    : applicationStatus === "PENDING_APPROVAL"
                      ? "bg-yellow-100 text-yellow-800"
                      : applicationStatus === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : applicationStatus === "ARCHIVED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                }`}
              >
                {applicationStatus === "PENDING_APPROVAL"
                  ? "Pending"
                  : applicationStatus.replace("_", " ")}
              </span>
            </div>
          )}
          {applicationStatus &&
            variant !== "employer" &&
            getStatusBadge(applicationStatus)}
          {variant === "bookmark" && onRemoveBookmark && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveBookmark(job.id);
              }}
              className="text-red-600 hover:text-red-700 p-1"
              disabled={loading.bookmark}
            >
              <HeartSolidIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Job Details */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
        <div className="flex items-center">
          <MapPinIcon className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
          <span className="truncate">
            {typeof job.location === "string"
              ? job.location
              : job.locationName
                ? `${job.locationName}, ${job.locationState || ""}`
                    .trim()
                    .replace(/,$/, "")
                : job.location?.name
                  ? `${job.location.name}, ${job.location.state || ""}`
                      .trim()
                      .replace(/,$/, "")
                  : "Location not specified"}
          </span>
        </div>
        <div className="flex items-center">
          <BriefcaseIcon className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
          <span>{job.jobType || job.employmentType || "Full Time"}</span>
        </div>
        {(job.salary || job.salaryRange) && (
          <div className="flex items-center">
            <CurrencyRupeeIcon className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            <span className="font-medium text-green-600">
              {typeof job.salary === "string"
                ? job.salary
                : job.salary && typeof job.salary === "object"
                  ? job.salary.min && job.salary.max
                    ? `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}`
                    : job.salary.min
                      ? `₹${job.salary.min.toLocaleString()}+`
                      : "Salary not disclosed"
                  : job.salaryRange?.min && job.salaryRange?.max
                    ? `₹${job.salaryRange.min.toLocaleString()} - ₹${job.salaryRange.max.toLocaleString()}`
                    : "Salary not disclosed"}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      {job.description && typeof job.description === "string" && (
        <p className="text-gray-700 text-sm line-clamp-2 mb-3">
          {job.description}
        </p>
      )}

      {/* Skills */}
      {Array.isArray(job.skills) && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
            >
              {typeof skill === "string" ? skill : String(skill)}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
              +{job.skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 flex-1 min-w-0">
          {showApplicationDate && applicationDate ? (
            <div className="flex flex-col">
              <span>Applied {getTimeAgo(applicationDate)}</span>
              {(job.candidatesCount !== undefined ||
                job.applicationCount !== undefined) && (
                <span className="text-blue-600 font-medium">
                  {job.candidatesCount || job.applicationCount || 0}{" "}
                  {(job.candidatesCount || job.applicationCount) === 1
                    ? "applicant"
                    : "applicants"}
                </span>
              )}
            </div>
          ) : showBookmarkDate && bookmarkDate ? (
            <div className="flex flex-col">
              <span>Saved {getTimeAgo(bookmarkDate)}</span>
              {(job.candidatesCount !== undefined ||
                job.applicationCount !== undefined) && (
                <span className="text-blue-600 font-medium">
                  {job.candidatesCount || job.applicationCount || 0}{" "}
                  {(job.candidatesCount || job.applicationCount) === 1
                    ? "applicant"
                    : "applicants"}
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              <span>Posted {getTimeAgo(job.postedAt || job.createdAt)}</span>
              {/* Candidates count display for non-employer variants */}
              {(job.candidatesCount !== undefined || job.applicationCount !== undefined) && (
                <span className="text-blue-600 font-medium">
                  {job.candidatesCount || job.applicationCount || 0}{" "}
                  {(job.candidatesCount || job.applicationCount) === 1
                    ? "applicant"
                    : "applicants"}
                </span>
              )}
            </div>
          )}
        </div>
        {/* Conditionally render employer stats or actions */}
        {variant === "employer" ? (
          <div className="flex flex-col items-end">
            {/* Candidates count and stats for employer variant */}
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              {/* Candidates count with click handler */}
              {(showCandidatesCount || job.candidatesCount !== undefined || job.applicationCount !== undefined) && (
                <button
                  onClick={() => {
                    if (onViewCandidates) onViewCandidates(job.id);
                  }}
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
                  title="View candidates for this job"
                >
                  <UserGroupIcon className="h-4 w-4 mr-1.5" />
                  {job.candidatesCount || job.applicationCount || 0}{" "}
                  {(job.candidatesCount || job.applicationCount) === 1
                    ? "candidate"
                    : "candidates"}
                </button>
              )}

              {/* Bookmarked count */}
              {(showBookmarkedCount || job.bookmarkedCount !== undefined) && (
                <div className="flex items-center text-gray-600">
                  <BookmarkIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>
                    {job.bookmarkedCount || 0} bookmarked
                  </span>
                </div>
              )}
            </div>
            <div className="flex space-x-1.5">{renderActions()}</div>
          </div>
        ) : (
          <div className="flex space-x-1.5 ml-3">{renderActions()}</div>
        )}
      </div>
    </div>
    </>
  );
};

export default JobCard;