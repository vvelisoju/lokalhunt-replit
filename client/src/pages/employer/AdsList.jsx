import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import JobCard from "../../components/ui/JobCard";
import EmptyState from "../../components/employer/EmptyState";
import Button from "../../components/ui/Button";
import FormInput from "../../components/ui/FormInput";
import Select from "../../components/ui/Select";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import {
  getAds,
  submitForApproval,
  archiveAd,
} from "../../services/employer/ads";
import { useRole } from "../../context/RoleContext";
import { toast } from "react-hot-toast";

// Debounce hook for search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AdsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ads, setAds] = useState({ data: [], pagination: null });
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    adId: null,
  });

  // Role context for Branch Admin functionality
  const roleContext = useRole();
  const {
    isAdminView = () => false,
    isBranchAdmin = () => false,
    can = () => false,
    targetEmployer = null,
    getCurrentEmployerId = () => null,
  } = roleContext || {};

  // Filters
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "",
  );
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // useNavigate hook for navigation
  const navigate = useNavigate();

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "DRAFT", label: "Draft" },
    { value: "PENDING_APPROVAL", label: "Pending Approval" },
    { value: "APPROVED", label: "Approved" },
    { value: "CLOSED", label: "Closed" },
  ];

  useEffect(() => {
    loadAds();
  }, [debouncedSearchTerm, statusFilter, page]);

  useEffect(() => {
    // Reset to page 1 when search term changes
    if (page !== 1) {
      setPage(1);
    }
  }, [debouncedSearchTerm, statusFilter]);

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.set("search", debouncedSearchTerm);
    if (statusFilter) params.set("status", statusFilter);
    if (page > 1) params.set("page", page.toString());
    setSearchParams(params);
  }, [debouncedSearchTerm, statusFilter, page, setSearchParams]);

  const loadAds = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search: debouncedSearchTerm.trim(),
        status: typeof statusFilter === "string" ? statusFilter.trim() : "",
      };

      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (!params[key] || params[key] === "") {
          delete params[key];
        }
      });

      const result = await getAds(params);

      if (result.success) {
        const adsData = result.data || [];

        console.log("Loaded ads:", adsData);
        setAds({
          data: adsData,
          pagination: result.data.meta || {
            page: 1,
            limit: 12,
            total: 0,
            pages: 1,
            hasNext: false,
            hasPrev: false,
          },
        });
      } else {
        toast.error(result.error);
        setAds({ data: [], pagination: null });
      }
    } catch (error) {
      console.error("Error loading ads:", error);
      toast.error("Failed to load ads");
      setAds({ data: [], pagination: null });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForApproval = async (adId) => {
    try {
      const result = await submitForApproval(adId);
      if (result.success) {
        toast.success("Ad submitted for approval successfully");
        loadAds();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to submit ad for approval");
    }
    setConfirmModal({ isOpen: false, type: "", adId: null });
  };

  const handleArchiveAd = async (adId) => {
    try {
      const result = await archiveAd(adId);
      if (result.success) {
        toast.success("Ad archived successfully");
        loadAds();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to archive ad");
    }
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === "submit") {
      handleSubmitForApproval(confirmModal.adId);
    } else if (confirmModal.type === "archive") {
      handleArchiveAd(confirmModal.adId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center px-2 mb-4">
          <div>
            <h1 class="text-xl font-bold text-gray-900">Job Ads</h1>
            <p className="text-gray-600 mt-1 text-xs">
              {isAdminView()
                ? "Employer job postings - Admin view"
                : "Manage your job postings"}
            </p>
          </div>
          <div className="flex space-x-4">
            {can("manage-own-ads") && (
              <Link
                to={
                  isAdminView()
                    ? `/branch-admin/employers/${getCurrentEmployerId()}/ads/new`
                    : "/employer/ads/new"
                }
              >
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Job
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Search ads"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, company, or location..."
              icon={MagnifyingGlassIcon}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setPage(1);
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Ads Grid */}
        {ads.data && ads.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ads.data.map((ad) => (
                <JobCard
                  key={ad.id}
                  job={{
                    employerId:
                      ad.employerId ||
                      ad.employer?.id ||
                      getCurrentEmployerId(),
                    id: ad.id,
                    title: ad.title,
                    description: ad.description,
                    company: ad.company || {
                      name: ad.companyName || "Company",
                    },
                    location:
                      ad.city || ad.location || "Location not specified",
                    jobType: ad.employmentType || "Full Time",
                    salary:
                      ad.salaryMin && ad.salaryMax
                        ? {
                            min: ad.salaryMin,
                            max: ad.salaryMax,
                          }
                        : null,
                    skills: ad.skills
                      ? typeof ad.skills === "string"
                        ? ad.skills.split(",").map((s) => s.trim())
                        : Array.isArray(ad.skills)
                          ? ad.skills
                          : []
                      : [],
                    postedAt: ad.createdAt,
                    candidatesCount:
                      ad._count?.allocations ||
                      ad.candidatesCount ||
                      ad.applicationCount ||
                      0,
                    applicationCount:
                      ad._count?.allocations ||
                      ad.candidatesCount ||
                      ad.applicationCount ||
                      0,
                    bookmarkedCount:
                      ad._count?.employerBookmarks || ad.bookmarkedCount || 0,
                    rejectionReason: ad.rejectionReason || "",
                    gender: ad.gender,
                  }}
                  variant="employer"
                  onSubmit={() =>
                    setConfirmModal({
                      isOpen: true,
                      type: "submit",
                      adId: ad.id,
                    })
                  }
                  onArchive={() => handleArchiveAd(ad.id)}
                  onViewCandidates={() => {
                    const candidatesRoute = isAdminView()
                      ? `/branch-admin/employers/${getCurrentEmployerId()}/candidates?adId=${ad.id}&adTitle=${encodeURIComponent(ad.title)}`
                      : `/employer/candidates?adId=${ad.id}&adTitle=${encodeURIComponent(ad.title)}`;
                    navigate(candidatesRoute);
                  }}
                  applicationStatus={ad.status}
                  showApplicationDate={false}
                  showCandidatesCount={true}
                  showBookmarkedCount={true}
                  loading={{
                    submit: false,
                    archive: false,
                  }}
                  onRefresh={loadAds}
                />
              ))}
            </div>

            {/* Pagination */}
            {ads.pagination && ads.pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="secondary"
                  disabled={!ads.pagination.hasPrev}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1"
                >
                  Previous
                </Button>

                <div className="flex space-x-1">
                  {[...Array(ads.pagination.pages)].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "primary" : "secondary"}
                        onClick={() => setPage(pageNum)}
                        className="px-3 py-1 text-sm"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="secondary"
                  disabled={!ads.pagination.hasNext}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={DocumentTextIcon}
            title="No job ads found"
            description={
              debouncedSearchTerm || statusFilter
                ? "Try adjusting your filters to find more ads."
                : "Get started by creating your first job posting."
            }
            actionText={
              !debouncedSearchTerm && !statusFilter
                ? "Create Your First Ad"
                : null
            }
            onAction={() => {
              // Navigate to appropriate create ad route based on context
              const createRoute = isAdminView()
                ? `/branch-admin/employers/${getCurrentEmployerId()}/ads/new`
                : "/employer/ads/new";
              navigate(createRoute);
            }}
          />
        )}

        {/* Confirmation Modal */}
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={() =>
            setConfirmModal({ isOpen: false, type: "", adId: null })
          }
          title={
            confirmModal.type === "submit" ? "Submit for Approval" : "Close Job"
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {confirmModal.type === "submit"
                ? "Are you sure you want to submit this ad for approval? Once submitted, you won't be able to edit it until it's reviewed."
                : "Are you sure you want to close this job? This will remove it from active listings."}
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() =>
                  setConfirmModal({ isOpen: false, type: "", adId: null })
                }
              >
                Cancel
              </Button>
              <Button
                variant={confirmModal.type === "archive" ? "danger" : "primary"}
                onClick={handleConfirmAction}
              >
                {confirmModal.type === "submit" ? "Submit" : "Close"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdsList;
