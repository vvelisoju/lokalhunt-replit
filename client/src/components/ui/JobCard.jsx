import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "./Button";
import Modal from "./Modal";
import TextArea from "./TextArea";
import { useAuth } from "../../context/AuthContext";
import { approveAd, rejectAd } from "../../services/branch-admin/ads";
import { reopenAd } from "../../services/employer/ads";
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
  UserIcon, // Added for gender preference
  CheckIcon, // Imported CheckIcon
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
  onReopen, // Optional external reopen handler
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

  // State for generic loading indicators used in buttons
  const [isLoading, setIsLoading] = useState({
    approve: false,
    reject: false,
    close: false,
    reopen: false,
  });

  // State for reopen confirmation modal
  const [showReopenModal, setShowReopenModal] = useState(false);

  // Internal approve handler - show confirmation modal
  const handleInternalApprove = async (jobId) => {
    setShowApproveModal(true);
  };

  // Handle approve confirmation
  const handleApproveConfirm = async () => {
    setInternalLoading((prev) => ({ ...prev, approve: true }));
    try {
      const result = await approveAd(job.id);
      if (result.success) {
        toast.success("Ad approved successfully");
        // Call the onRefresh callback if provided to refresh the component
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(result.error || "Failed to approve ad");
      }
    } catch (error) {
      console.error("Error approving ad:", error);
      toast.error("Failed to approve ad");
    } finally {
      setInternalLoading((prev) => ({ ...prev, approve: false }));
      setShowApproveModal(false);
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
      toast.error("Please provide a reason for rejection");
      return;
    }

    setInternalLoading((prev) => ({ ...prev, reject: true }));
    try {
      const result = await rejectAd(job.id, rejectReason);
      if (result.success) {
        toast.success("Ad rejected successfully");
        // Call the onRefresh callback if provided to refresh the component
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(result.error || "Failed to reject ad");
      }
    } catch (error) {
      console.error("Error rejecting ad:", error);
      toast.error("Failed to reject ad");
    } finally {
      setInternalLoading((prev) => ({ ...prev, reject: false }));
      setShowRejectModal(false);
      setRejectReason("");
    }
  };

  // Handle reject modal close
  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRejectReason("");
  };

  // Internal reopen handler with confirmation modal
  const handleInternalReopen = async (jobId) => {
    setShowReopenModal(true);
  };

  // Handle reopen confirmation
  const handleReopenConfirm = async () => {
    setIsLoading((prev) => ({ ...prev, reopen: true }));
    try {
      const result = await reopenAd(job.id);
      if (result.success) {
        toast.success("Job reopened successfully");
        // Call the onRefresh callback if provided to refresh the component
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(result.error || "Failed to reopen job");
      }
    } catch (error) {
      console.error("Error reopening job:", error);
      toast.error("Failed to reopen job");
    } finally {
      setIsLoading((prev) => ({ ...prev, reopen: false }));
      setShowReopenModal(false);
    }
  };

  // Handle reopen modal close
  const handleReopenCancel = () => {
    setShowReopenModal(false);
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
      "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide";

    switch (status?.toLowerCase()) {
      case "hired":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Hired
          </span>
        );
      case "applied":
      case "pending":
      case "screened":
      case "reviewed":
      case "rated":
      case "interview":
      case "interview_scheduled":
      case "allocated":
      case "shortlisted":
      case "approved":
      case "rejected":
      default:
        return (
          <span className={`${baseClasses} bg-amber-100 text-amber-800`}>
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
          <Button
            key="view-job"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Navigate to candidate job view with context from applications page
              navigate(`/candidate/jobs/${job.id}?from=applications`);
            }}
            className="flex items-center touch-manipulation"
          >
            <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            <span className="text-xs sm:text-sm">View Job</span>
          </Button>,
        );
        if (applicationStatus === "APPLIED") {
          actions.push(
            <Button
              key="withdraw"
              variant="ghost"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white flex items-center touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
                onWithdraw?.(job.id);
              }}
              disabled={loading.withdraw}
            >
              <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">
                {loading.withdraw ? "Withdrawing..." : "Withdraw"}
              </span>
            </Button>,
          );
        }
        break;

      case "bookmark":
        // Bookmarks page actions
        actions.push(
          <Button
            variant="outline"
            size="sm"
            className="flex items-center touch-manipulation"
          >
            <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            <span className="text-xs sm:text-sm">View</span>
          </Button>,
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
              className="flex items-center touch-manipulation"
            >
              <BriefcaseIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">
                {loading.apply ? "Applying..." : "Apply"}
              </span>
            </Button>,
          );
        } else {
          actions.push(
            <Button
              key="applied"
              size="sm"
              variant="outline"
              disabled
              className="flex items-center"
            >
              <CheckBadgeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">Applied</span>
            </Button>,
          );
        }

        break;

      case "employer":
        // Employer ads page actions
        // Only show Edit button if job is not approved, not closed, and not rejected
        if (
          applicationStatus !== "APPROVED" &&
          applicationStatus !== "CLOSED" &&
          applicationStatus !== "REJECTED"
        ) {
          actions.push(
            <Button
              key="edit"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Updated the edit link for Branch Admin
                if (
                  user?.role === "BRANCH_ADMIN" ||
                  userRole === "BRANCH_ADMIN"
                ) {
                  // Get employerId from job object, with fallback checks
                  const employerId =
                    job.employerId ||
                    job.employer?.id ||
                    job.company?.employerId;

                  if (employerId) {
                    console.log(
                      "Navigating to Branch Admin edit route:",
                      `/branch-admin/employers/${employerId}/ads/${job.id}/edit`,
                    );
                    // Determine the from parameter based on current location
                    const currentPath = location.pathname;
                    let fromParam = "approval"; // default for ads approval page

                    if (currentPath.includes("/branch-admin/employers/")) {
                      fromParam = "employer";
                    }

                    navigate(
                      `/branch-admin/employers/${employerId}/ads/${job.id}/edit?from=${fromParam}`,
                    );
                  } else {
                    console.error("No employerId found in job object:", job);
                    toast.error(
                      "Cannot edit this job - employer information missing",
                    );
                  }
                } else {
                  navigate(`/employer/ads/${job.id}/edit`);
                }
              }}
              className="flex items-center touch-manipulation"
            >
              <PencilIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">Edit</span>
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
              className="text-blue-600 hover:text-blue-700 flex items-center touch-manipulation"
            >
              <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">Preview</span>
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
              className="text-blue-600 hover:text-blue-700 flex items-center touch-manipulation"
            >
              <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">View</span>
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
              className="flex items-center touch-manipulation"
            >
              <CheckBadgeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">
                {loading.submit ? "Submitting..." : "Submit"}
              </span>
            </Button>,
          );
        }

        if (applicationStatus === "APPROVED") {
          actions.push(
            <Button
              key="close"
              variant="ghost"
              size="sm"
              onClick={async (e) => {
                e.stopPropagation();
                if (onArchive) {
                  await onArchive(job.id);
                  // Refresh the component after successful close action
                  if (onRefresh) {
                    onRefresh();
                  }
                }
              }}
              disabled={loading.archive || loading.close}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center touch-manipulation"
            >
              <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">
                {loading.archive || loading.close ? "Closing..." : "Close Job"}
              </span>
            </Button>,
          );
        }

        // Add reopen button for closed jobs
        if (applicationStatus === "CLOSED") {
          actions.push(
            <Button
              key="reopen"
              variant="success"
              size="sm"
              onClick={async (e) => {
                e.stopPropagation();
                // Use external handler if provided, otherwise use internal
                if (onReopen) {
                  onReopen(job.id);
                } else {
                  handleInternalReopen(job.id);
                }
              }}
              disabled={loading.reopen || isLoading.reopen}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center touch-manipulation"
            >
              <CheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">
                {loading.reopen || isLoading.reopen
                  ? "Reopening..."
                  : "Re-Open Job"}
              </span>
            </Button>,
          );
        }

        // Branch Admin specific actions for pending approval jobs
        if (
          (userRole === "BRANCH_ADMIN" || user?.role === "BRANCH_ADMIN") &&
          applicationStatus === "PENDING_APPROVAL"
        ) {
          actions.push(
            <Button
              key="approve"
              variant="success"
              size="sm"
              onClick={async (e) => {
                e.stopPropagation();
                // Use external handler if provided, otherwise use internal
                if (onApprove) {
                  onApprove(job.id);
                } else {
                  handleInternalApprove(job.id);
                }
              }}
              disabled={loading?.approve}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading?.approve ? (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Approving...</span>
                </div>
              ) : (
                <>
                  <CheckIcon className="h-3 w-3 mr-1" />
                  Approve
                </>
              )}
            </Button>,
          );

          actions.push(
            <Button
              key="reject"
              variant="danger"
              size="sm"
              onClick={async (e) => {
                e.stopPropagation();
                // Use external handler if provided, otherwise use internal
                if (onReject) {
                  onReject(job.id);
                } else {
                  handleInternalReject(job.id);
                }
              }}
              disabled={loading?.reject}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading?.reject ? (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Rejecting...</span>
                </div>
              ) : (
                <>
                  <XMarkIcon className="h-3 w-3 mr-1" />
                  Reject
                </>
              )}
            </Button>,
          );
        }
        break;

      case "default":
      default:
        // Jobs page actions
        // View Job button - route based on user role and job status
        actions.push(
          <Button
            key="view-job"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Check if user is a candidate and route accordingly
              if (user?.role === "CANDIDATE") {
                // For candidates, navigate to candidate job view with context
                const fromParam = location.pathname.includes("/candidate/")
                  ? "jobs"
                  : "public";
                navigate(`/candidate/jobs/${job.id}?from=${fromParam}`);
              } else {
                // For public users or other roles, navigate to public job detail page
                const jobRoute = getJobRoute(
                  job.id,
                  job.status || applicationStatus,
                );
                navigate(jobRoute);
              }
            }}
            className="flex items-center touch-manipulation"
          >
            <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            <span className="text-xs sm:text-sm">View Job</span>
          </Button>,
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
                className="flex items-center touch-manipulation"
              >
                <BriefcaseIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                <span className="text-xs sm:text-sm">
                  {loading.apply ? "Applying..." : "Apply Now"}
                </span>
              </Button>,
            );
          } else {
            actions.push(
              <Button
                key="applied"
                size="sm"
                variant="outline"
                disabled
                className="flex items-center"
              >
                <CheckBadgeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                <span className="text-xs sm:text-sm">Applied</span>
              </Button>,
            );
          }
        }

        // Love/Bookmark functionality is now handled in the top-right area for default variant
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
            Are you sure you want to approve this job advertisement? Once
            approved, it will be published and visible to candidates.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">{job.title}</h4>
            <p className="text-blue-700 text-sm">
              {job.company?.name || job.companyName || "Company Name"}
            </p>
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
            Please provide a reason for rejecting this job advertisement. This
            will help the employer understand what needs to be improved.
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

      {/* Reopen Confirmation Modal */}
      <Modal
        isOpen={showReopenModal}
        onClose={handleReopenCancel}
        title="Reopen Job Advertisement"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to reopen this job? It will become active and
            visible to candidates again.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">{job.title}</h4>
            <p className="text-green-700 text-sm">
              {job.company?.name || job.companyName || "Company Name"}
            </p>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleReopenCancel}
              disabled={isLoading.reopen}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReopenConfirm}
              disabled={isLoading.reopen}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading.reopen ? "Reopening..." : "Reopen Job"}
            </Button>
          </div>
        </div>
      </Modal>

      <div
        className={`bg-white border-0 rounded-2xl shadow-sm hover:shadow-lg active:shadow-md transition-all duration-200 ${onClick ? "cursor-pointer active:scale-[0.98]" : ""} ${className}`}
        onClick={onClick}
        style={{
          boxShadow:
            "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Header - Mobile Optimized */}
        <div className="p-4 sm:p-4 pb-2 sm:pb-3">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="flex-1 min-w-0 pr-2 sm:pr-3">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-1 sm:mb-2 line-clamp-2">
                {typeof job.title === "string" ? job.title : "Job Title"}
              </h3>
              <div className="flex items-center mb-1">
                <p className="text-gray-700 text-sm sm:text-base font-semibold truncate">
                  {job.company?.name || job.companyName || "Company Name"}
                </p>
              </div>
              {job.company?.industry && (
                <p className="text-gray-500 text-xs sm:text-sm truncate">
                  {job.company.industry}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end space-y-1 sm:space-y-2 flex-shrink-0">
              {applicationStatus && variant === "employer" && (
                <span
                  className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                    applicationStatus === "DRAFT"
                      ? "bg-gray-100 text-gray-800"
                      : applicationStatus === "PENDING_APPROVAL"
                        ? "bg-amber-100 text-amber-800"
                        : applicationStatus === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : applicationStatus === "CLOSED"
                            ? "bg-red-100 text-red-800"
                            : applicationStatus === "REJECTED"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {applicationStatus === "PENDING_APPROVAL"
                    ? "Pending"
                    : applicationStatus === "CLOSED"
                      ? "Closed"
                      : applicationStatus.replace("_", " ")}
                </span>
              )}
              {applicationStatus &&
                variant !== "employer" &&
                getStatusBadge(applicationStatus)}

              {/* Application Count for Employer Variant - moved under status */}
              {variant === "employer" &&
                (showCandidatesCount ||
                  job.candidatesCount !== undefined ||
                  job.applicationCount !== undefined) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onViewCandidates) onViewCandidates(job.id);
                    }}
                    className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 active:bg-blue-300 transition-colors touch-manipulation text-xs font-semibold"
                    title="View candidates for this job"
                  >
                    <UserGroupIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                    <span className="whitespace-nowrap">
                      {job.candidatesCount || job.applicationCount || 0}
                    </span>
                  </button>
                )}

              {/* Application Count for Application Variant - show under status */}
              {variant === "application" &&
                (job.candidatesCount !== undefined ||
                  job.applicationCount !== undefined) && (
                  <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    <UserGroupIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                    <span className="whitespace-nowrap">
                      {job.candidatesCount || job.applicationCount || 0}
                    </span>
                  </div>
                )}

              {/* Bookmarked Count for Application Variant - show under candidate count */}
              {variant === "application" &&
                job.bookmarkedCount !== undefined && (
                  <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                    <BookmarkIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-gray-500 flex-shrink-0" />
                    <span className="whitespace-nowrap">
                      {job.bookmarkedCount || 0}
                    </span>
                  </div>
                )}

              {/* Candidate Count for Bookmark Variant - show candidate count only */}
              {variant === "bookmark" &&
                (job.candidatesCount !== undefined ||
                  job.applicationCount !== undefined) && (
                  <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    <UserGroupIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                    <span className="whitespace-nowrap">
                      {job.candidatesCount || job.applicationCount || 0}
                    </span>
                  </div>
                )}

              {/* Application Count for Default Variant (Public Jobs) - show in top-right */}
              {variant === "default" &&
                (job.candidatesCount !== undefined ||
                  job.applicationCount !== undefined) && (
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      <UserGroupIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      <span className="whitespace-nowrap">
                        {job.candidatesCount || job.applicationCount || 0}
                      </span>
                    </div>
                    {/* Love/Bookmark button for default variant */}
                    {onBookmark && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookmark(job.id);
                        }}
                        disabled={loading.bookmark}
                        className="p-1.5 sm:p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors touch-manipulation"
                      >
                        {job.isBookmarked ? (
                          <HeartSolidIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                        ) : (
                          <HeartOutlineIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </button>
                    )}
                  </div>
                )}

              {/* Bookmarked Count for Employer Variant - moved under status */}
              {variant === "employer" &&
                (showBookmarkedCount || job.bookmarkedCount !== undefined) && (
                  <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                    <BookmarkIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-gray-500 flex-shrink-0" />
                    <span className="whitespace-nowrap">
                      {job.bookmarkedCount || 0}
                    </span>
                  </div>
                )}

              {variant === "bookmark" && onRemoveBookmark && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBookmark(job.id);
                  }}
                  className="p-1.5 sm:p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 transition-colors touch-manipulation"
                  disabled={loading.bookmark}
                >
                  <HeartSolidIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Job Details - Mobile Optimized Compact Layout */}
          <div className="grid grid-cols-1 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <div className="flex items-center">
              <MapPinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 mr-2 flex-shrink-0" />
              <span className="text-gray-700 font-medium text-xs sm:text-sm truncate">
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
              <BriefcaseIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 mr-2 flex-shrink-0" />
              <span className="text-gray-700 font-medium text-xs sm:text-sm">
                {job.jobType || job.employmentType || "Full Time"}
              </span>
            </div>
            {(job.salary || job.salaryRange) && (
              <div className="flex items-center">
                <CurrencyRupeeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 mr-2 flex-shrink-0" />
                <span className="font-semibold text-green-700 text-xs sm:text-sm truncate">
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
            {job.gender && (
              <div className="flex items-center">
                <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 mr-2 flex-shrink-0" />
                <span className="text-gray-700 font-medium text-xs sm:text-sm capitalize">
                  {job.gender} preferred
                </span>
              </div>
            )}
          </div>

          {/* Description - Mobile Optimized */}
          {job.description && typeof job.description === "string" && (
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4">
              {job.description}
            </p>
          )}

          {/* Rejection Reason - Show for rejected ads in all variants */}
          {(applicationStatus === "REJECTED" || job.status === "REJECTED") &&
            (job.rejectionReason || job.rejectionComments) &&
            (job.rejectionReason?.trim() || job.rejectionComments?.trim()) && (
              <div className="mb-3 sm:mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <XMarkIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-red-800 mb-1">
                      Rejection Reason:
                    </p>
                    <p className="text-xs text-red-700 leading-relaxed break-words">
                      {(job.rejectionReason || job.rejectionComments)?.trim()}
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Skills - Mobile Optimized */}
          {Array.isArray(job.skills) && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {job.skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"
                >
                  {typeof skill === "string" ? skill : String(skill)}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                  +{job.skills.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer - Mobile Optimized */}
        <div className="px-4 sm:px-4 py-3 sm:py-3 bg-gray-50 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            {/* Time and Stats Info */}
            <div className="flex items-center justify-between sm:justify-start sm:flex-1 sm:min-w-0">
              <div className="flex items-center">
                <ClockIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
                <span className="text-xs text-gray-500 font-medium">
                  {showApplicationDate && applicationDate
                    ? `Applied ${getTimeAgo(applicationDate)}`
                    : showBookmarkDate && bookmarkDate
                      ? `Saved ${getTimeAgo(bookmarkDate)}`
                      : `Posted ${getTimeAgo(job.postedAt || job.createdAt)}`}
                </span>
              </div>
            </div>

            {/* Actions - Mobile Optimized with 2 buttons per row for all variants */}
            <div className="w-full sm:w-auto">
              {(() => {
                const actions = renderActions();

                // For default variant, ensure full width buttons in 2-column layout
                if (variant === "default") {
                  return (
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 w-full sm:w-auto">
                      {actions.map((action, index) => (
                        <div key={index} className="sm:flex-none">
                          {React.cloneElement(action, {
                            className: `${action.props.className || ""} w-full justify-center`,
                          })}
                        </div>
                      ))}
                    </div>
                  );
                }

                // For other variants, use existing pairing logic
                const actionPairs = [];
                for (let i = 0; i < actions.length; i += 2) {
                  actionPairs.push(actions.slice(i, i + 2));
                }

                return (
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    {actionPairs.map((pair, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-2 gap-2 sm:flex sm:gap-3"
                      >
                        {pair.map((action, actionIndex) => (
                          <div key={actionIndex} className="sm:flex-none">
                            {React.cloneElement(action, {
                              className: `${action.props.className || ""} w-full justify-center`,
                            })}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobCard;
