import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PlusIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

import KpiCards from "../../components/employer/KpiCards";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import JobCard from "../../components/ui/JobCard";
import { getAds } from "../../services/employer/ads";
import { getMous } from "../../services/employer/mou";
import { useRole } from "../../context/RoleContext";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentAds, setRecentAds] = useState([]);
  const [activeMou, setActiveMou] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Role context for Branch Admin functionality
  const roleContext = useRole();
  const {
    isAdminView = () => false,
    isBranchAdmin = () => false,
    can = () => false,
    targetEmployer = null,
    getCurrentEmployerId = () => null,
  } = roleContext || {};

  const isBranchAdminView = isAdminView(); // Use isAdminView from context

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load ads for stats and recent ads
      const adsResult = await getAds({ limit: 5 });
      if (adsResult.success) {
        const ads = adsResult.data.data || [];
        setRecentAds(ads);

        // Calculate stats
        const stats = {
          totalAds: ads.length,
          draft: ads.filter((ad) => ad.status === "DRAFT").length,
          pendingApproval: ads.filter((ad) => ad.status === "PENDING_APPROVAL")
            .length,
          approved: ads.filter((ad) => ad.status === "APPROVED").length,
          archived: ads.filter((ad) => ad.status === "ARCHIVED").length,
          allocatedCandidates: ads.reduce(
            (sum, ad) => sum + (ad._count?.allocations || 0),
            0,
          ),
        };
        setStats(stats);
      }

      // Load MOU info
      const mouResult = await getMous();
      if (mouResult.success) {
        const mous = mouResult.data || [];
        const active = mous.find((mou) => mou.status === "ACTIVE");
        setActiveMou(active);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
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
      <div className="py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isBranchAdminView ? "Employer Dashboard" : "Dashboard"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isBranchAdminView
                ? "Employer dashboard - Admin view"
                : "Manage your job postings and candidates"}
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              to={
                isBranchAdminView
                  ? `/branch-admin/employers/${getCurrentEmployerId()}/ads`
                  : "/employer/ads"
              }
            >
              <Button variant="secondary">
                <EyeIcon className="h-4 w-4 mr-2" />
                View All Ads
              </Button>
            </Link>
            {can("manage-own-ads") && (
              <Link
                to={
                  isBranchAdminView
                    ? `/branch-admin/employers/${getCurrentEmployerId()}/ads/new`
                    : "/employer/ads/new"
                }
              >
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create New Ad
                </Button>
              </Link>
            )}
            {/* Branch Admin specific actions - Removed for employer view */}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-8">
          <KpiCards stats={stats} />
        </div>

        {/* Recent Ads */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Job Ads
            </h2>
          </div>
          <div className="p-6">
            {recentAds.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recentAds.map((ad) => (
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
                      candidatesCount: ad._count?.allocations || 0,
                      applicationCount: ad._count?.allocations || 0,
                      status: ad.status,
                    }}
                    variant="employer"
                    applicationStatus={ad.status}
                    loading={{}}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No ads yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first job posting.
                </p>
                <div className="mt-6">
                  <Link
                    to={
                      isBranchAdminView
                        ? `/branch-admin/employers/${getCurrentEmployerId()}/ads/new`
                        : "/employer/ads/new"
                    }
                  >
                    <Button>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Your First Ad
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
