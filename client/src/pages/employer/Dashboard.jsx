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
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAds: 0,
    draft: 0,
    pendingApproval: 0,
    approved: 0,
    archived: 0,
    allocatedCandidates: 0,
  });
  const [recentAds, setRecentAds] = useState([]);
  const [activeMou, setActiveMou] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auth context for authentication state
  const { user, isAuthenticated, loading: authLoading } = useAuth();

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

  console.log("Dashboard: Role context:", roleContext);
  console.log("Dashboard: Auth state:", { user, isAuthenticated, authLoading });

  useEffect(() => {
    // Only load dashboard data if user is authenticated
    if (isAuthenticated && user) {
      loadDashboardData();
    }
    // No need to set loading false here as we start with false
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load ads for stats and recent ads
      const adsResult = await getAds({ limit: 5 });
      if (adsResult.success) {
        const ads = adsResult.data || [];
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
      } else {
        // Even if ads load fails, set empty stats to show dashboard
        setStats({
          totalAds: 0,
          draft: 0,
          pendingApproval: 0,
          approved: 0,
          archived: 0,
          allocatedCandidates: 0,
        });
        setRecentAds([]);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      // Set empty stats even on error to show dashboard
      setStats({
        totalAds: 0,
        draft: 0,
        pendingApproval: 0,
        approved: 0,
        archived: 0,
        allocatedCandidates: 0,
      });
      setRecentAds([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading only while authenticating or loading dashboard data (with timeout protection)
  if (authLoading || (isLoading && isAuthenticated)) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-sm text-gray-600">
            {authLoading ? "Authenticating..." : "Loading dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the dashboard (EmployerRoute should handle redirect)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-sm text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Optimized Header */}
      <div className="px-2 py-0 sm:px-4 sm:py-2">
        <div className="flex items-start justify-between sm:px-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {isBranchAdminView ? "Employer Dashboard" : "Dashboard"}
            </h1>
            <p className="text-gray-600 text-xs ">
              {isBranchAdminView
                ? "Employer dashboard - Admin view"
                : "Manage your job postings and candidates"}
            </p>
          </div>

          {/* New Ad Button - Top right aligned with Dashboard heading */}
          {can("manage-own-ads") && (
            <Link
              to={
                isBranchAdminView
                  ? `/branch-admin/employers/${getCurrentEmployerId()}/ads/new`
                  : "/employer/ads/new"
              }
              className="inline-block"
            >
              <Button className="justify-center">
                <PlusIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium">New</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile-Optimized KPI Cards */}
      <div className="px-0 py-2 sm:px-1 sm:py-4 mt-2">
        <KpiCards stats={stats} />
      </div>

      {/* Recent Ads Section - Enhanced for web */}
      <div>
        <div className="sm:shadow-lg sm:rounded-2xl sm:border sm:border-gray-200 sm:bg-white">
          <div className="px-4 py-3 sm:px-4 sm:py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg sm:text-2xl lg:text-lg font-semibold text-gray-900">
              Recent Job Ads
            </h2>
            {recentAds.length > 0 && (
              <Link
                to={
                  isBranchAdminView
                    ? `/branch-admin/employers/${getCurrentEmployerId()}/ads`
                    : "/employer/ads"
                }
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center transition-colors duration-200 hover:bg-blue-50 px-3 py-2 rounded-lg"
              >
                View All
                <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              </Link>
            )}
          </div>
          <div className="p-0 sm:p-4">
            {recentAds.length > 0 ? (
              <div className="space-y-0 sm:space-y-6 divide-y divide-gray-100 sm:divide-y-0">
                {recentAds.map((ad) => (
                  <div key={ad.id} className="pb-4 sm:pb-0">
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
                        rejectionReason: ad.rejectionReason || "",
                      }}
                      variant="employer"
                      applicationStatus={ad.status}
                      loading={{}}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <DocumentTextIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  No ads yet
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-6 px-4">
                  Get started by creating your first job posting to attract
                  candidates.
                </p>
                <Link
                  to={
                    isBranchAdminView
                      ? `/branch-admin/employers/${getCurrentEmployerId()}/ads/new`
                      : "/employer/ads/new"
                  }
                  className="inline-block"
                >
                  <Button className="px-6 py-3 text-sm font-medium">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Your First Ad
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
