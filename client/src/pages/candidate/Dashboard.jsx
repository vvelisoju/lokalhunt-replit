import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BriefcaseIcon,
  BookmarkIcon,
  UserIcon,
  DocumentIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import JobCard from "../../components/ui/JobCard";
import Loader from "../../components/ui/Loader";
import Alert from "../../components/ui/Alert";
import OnboardingWizard from "../../components/candidate/OnboardingWizard";
import { useCandidate } from "../../context/CandidateContext";
import { useCandidateAuth } from "../../hooks/useCandidateAuth";
import { candidateApi } from "../../services/candidateApi";
import api from "../../services/api";
import safeAreaManager from "../../utils/safeArea";
import { useToast } from "../../components/ui/Toast";

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    applications,
    fetchApplications,
    loading,
  } = useCandidate();
  const { user } = useCandidateAuth();

  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    rejectedApplications: 0,
    interviewScheduled: 0,
    profileViews: 0,
    profileCompletion: 75,
    bookmarks: 0,
    hasResume: false,
  });
  const [showProfileCompletion, setShowProfileCompletion] = useState(() => {
    // Initialize from localStorage or default to true
    const cached = localStorage.getItem('showProfileCompletion');
    return cached !== null ? JSON.parse(cached) : true;
  });
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCheckComplete, setOnboardingCheckComplete] = useState(false);
  const [testNotificationLoading, setTestNotificationLoading] = useState(false);
  const [initialRenderComplete, setInitialRenderComplete] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    apply: null,
    remove: null,
    withdraw: null,
  });
  const { success: showSuccess, error: showError } = useToast();

  // Check if we have enough data to render the dashboard
  const hasMinimalDataToRender = useMemo(() => {
    return (
      user && 
      onboardingCheckComplete && 
      (applications !== null || stats !== null)
    );
  }, [user, onboardingCheckComplete, applications, stats]);

  // Optimized data fetching - background updates without blocking UI
  const fetchAllDashboardData = useCallback(async (isInitialLoad = false) => {
    if (!user) return;

    console.log("Starting dashboard data fetch...", isInitialLoad ? "(initial)" : "(background)");
    
    // Only show loading on absolute first load when we have no data at all
    if (isInitialLoad && !user) {
      setBackgroundLoading(true);
    }

    try {
      // Fetch only essential data for dashboard
      const [
        onboardingResponse,
        applicationsResponse,
        statsResponse,
      ] = await Promise.allSettled([
        candidateApi.getOnboardingData(),
        fetchApplications && typeof fetchApplications === "function"
          ? fetchApplications({}, false)
          : Promise.resolve(),
        candidateApi.getDashboardStats(),
      ]);

      // Handle onboarding data
      if (onboardingResponse.status === "fulfilled") {
        const onboardingData =
          onboardingResponse.value?.data?.data?.onboardingProgress;
        if (onboardingData) {
          const isCompleted = onboardingData.isCompleted;
          setShowOnboarding(!isCompleted);
          console.log(
            "Onboarding status:",
            isCompleted ? "completed" : "pending",
          );
        } else {
          // Fallback to localStorage check
          const onboardingCompleted = localStorage.getItem(
            "onboardingCompleted",
          );
          const hideOnboarding =
            localStorage.getItem("showOnboarding") === "false";
          setShowOnboarding(!onboardingCompleted && !hideOnboarding);
        }
      } else {
        console.warn("Onboarding check failed, using fallback");
        const onboardingCompleted = localStorage.getItem("onboardingCompleted");
        const hideOnboarding =
          localStorage.getItem("showOnboarding") === "false";
        setShowOnboarding(!onboardingCompleted && !hideOnboarding);
      }

      // Handle applications data
      if (applicationsResponse.status === "fulfilled") {
        console.log("Applications data loaded");
      }

      // Handle stats data
      if (statsResponse.status === "fulfilled" && statsResponse.value?.data) {
        const statsData = statsResponse.value.data?.data;
        setStats(statsData);
        
        // Update profile completion visibility based on actual data
        if (statsData?.profileCompletion !== undefined) {
          const shouldShow = statsData.profileCompletion > 0 && statsData.profileCompletion < 100;
          setShowProfileCompletion(shouldShow);
          localStorage.setItem('showProfileCompletion', JSON.stringify(shouldShow));
        }
        
        console.log("Dashboard stats loaded");
      } else {
        console.warn("Failed to load dashboard stats");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setOnboardingCheckComplete(true);
      if (isInitialLoad && !initialRenderComplete) {
        setBackgroundLoading(false);
        setInitialRenderComplete(true);
      }
    }
  }, [user, fetchApplications]);

  // Initial data loading - only run once when user is available
  useEffect(() => {
    if (user && !initialRenderComplete) {
      fetchAllDashboardData(true);
    }
  }, [user, initialRenderComplete]); // Removed fetchAllDashboardData to prevent infinite loops

  // Background refresh - update data without blocking UI
  useEffect(() => {
    if (user && initialRenderComplete) {
      // Refresh data in background every 30 seconds
      const refreshInterval = setInterval(() => {
        fetchAllDashboardData(false);
      }, 30000);

      return () => clearInterval(refreshInterval);
    }
  }, [user, initialRenderComplete, fetchAllDashboardData]);

  // Initialize safe area manager
  useEffect(() => {
    safeAreaManager.init();
  }, []);

  const handleOnboardingComplete = useCallback((data) => {
    console.log("Onboarding completed:", data);
    setShowOnboarding(false);
    // Clear localStorage flags since onboarding is now completed in database
    localStorage.removeItem("onboardingProgress");
    localStorage.removeItem("showOnboarding");
    localStorage.setItem("onboardingCompleted", "true");

    // Background refresh of data after onboarding
    fetchAllDashboardData(false);
  }, [fetchAllDashboardData]);

  // Test notification handler
  const handleTestNotification = async () => {
    try {
      setTestNotificationLoading(true);
      const response = await api.post("/api/notifications/push/test", {
        title: "🎉 Test Notification - LokalHunt",
        body: `Hi ${user?.firstName || "there"}! Your push notifications are working perfectly. You'll receive job alerts and updates right here!`,
      });

      console.log("Test notification sent:", response.data);

      // Show success message (you could add a toast notification here)
      alert("Test notification sent successfully! Check your device.");
    } catch (error) {
      console.error("Test notification failed:", error);
      alert(
        `Test notification failed: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setTestNotificationLoading(false);
    }
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

  // Show loading only on very first load when we have no data at all
  if (!hasMinimalDataToRender && !user) {
    return <Loader.Page />;
  }

  if (showOnboarding) {
    return (
      <OnboardingWizard onComplete={handleOnboardingComplete} user={user} />
    );
  }

  const quickStats = [
    {
      name: t("stats.applications", "Applications"),
      value: applications?.length || 0,
      icon: BriefcaseIcon,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      href: "/candidate/applications",
      trend: applications?.length > 0 ? "stable" : "none",
    },
    {
      name: t("stats.appliedJobs", "Applied Jobs"),
      value: applications?.length || 0,
      icon: BriefcaseIcon,
      color: applications?.length > 0 ? "green" : "gray",
      bgColor: applications?.length > 0 ? "bg-green-50" : "bg-gray-50",
      iconColor: applications?.length > 0 ? "text-green-600" : "text-gray-600",
      href: "/candidate/applications",
      trend: applications?.length > 0 ? "up" : "none",
    },
    {
      name: t("stats.bookmarks", "Bookmarks"),
      value: stats.bookmarks || 0,
      icon: BookmarkIcon,
      color: "emerald",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      href: "/candidate/bookmarks",
      trend: stats.bookmarks > 0 ? "stable" : "none",
    },
    {
      name: t("stats.profileViews", "Profile Views"),
      value: stats.profileViews || 0,
      icon: EyeIcon,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      href: "/candidate/profile",
      trend:
        stats.profileViews > 5
          ? "up"
          : stats.profileViews > 0
            ? "stable"
            : "none",
    },
  ];

  // Calculate actual application count from both sources (redundant if applications are fetched correctly)
  const actualApplicationCount = Math.max(
    applications?.length || 0,
    stats.totalApplications || 0,
  );

  return (
    <div className="space-y-4 sm:space-y-6 sm:p-0">
      {/* Debug Safe Area Values */}
      {/* <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-xs font-mono">
        <div className="font-bold mb-2">🔍 Safe Area Debug Info:</div>
        
        {/* Native Android Data */}
      {/* <div className="mb-2">
          <div className="font-semibold">🤖 Native Android WindowInsets:</div>
          <div>• Received: {safeAreaManager.nativeInsetsReceived ? 'YES' : 'NO'}</div>
          {window.androidSafeAreaInsets && (
            <div>• Raw data: {JSON.stringify(window.androidSafeAreaInsets)}</div>
          )}
        </div>
        
        {/* CSS Detection */}
      {/* <div className="mb-2">
          <div className="font-semibold">📏 CSS Detection:</div>
          <div>• env(safe-area-inset-top): <span style={{paddingLeft: 'env(safe-area-inset-top, 0px)'}} className="bg-red-200">env(safe-area-inset-top, 0px)</span></div>
          <div>• env(safe-area-inset-bottom): <span style={{paddingBottom: 'env(safe-area-inset-bottom, 0px)'}} className="bg-red-200">env(safe-area-inset-bottom, 0px)</span></div>
        </div>
        
        {/* Applied Values */}
      {/* <div className="mb-2">
          <div className="font-semibold">✅ Applied Values:</div>
          <div>• --safe-area-inset-top: <span style={{paddingLeft: 'var(--safe-area-inset-top)'}} className="bg-blue-200">{getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top').trim() || '0px'}</span></div>
          <div>• --safe-area-inset-bottom: <span style={{paddingBottom: 'var(--safe-area-inset-bottom)'}} className="bg-blue-200">{getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom').trim() || '0px'}</span></div>
        </div>
        
        {/* SafeArea Manager Status */}
      {/* <div className="mb-2">
          <div className="font-semibold">⚙️ SafeArea Manager:</div>
          <div>• Has support: {safeAreaManager.hasSafeAreas() ? 'YES' : 'NO'}</div>
          <div>• Platform: {window.Capacitor ? window.Capacitor.getPlatform() : 'web'}</div>
          <div>• Values: {JSON.stringify(safeAreaManager.getSafeAreas())}</div>
        </div>
        
        {/* Visual Test */}
      {/* <div>
          <div className="font-semibold">🎯 Visual Test:</div>
          <div>Header padding: <span className="mobile-header bg-green-200 inline-block px-2 py-1">Should be ZERO on regular devices</span></div>
        </div>
      </div> */}

      {/* Welcome Section - Mobile optimized */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {user?.firstName
                ? `Welcome back, ${user.firstName}!`
                : "Welcome back!"}
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              {t(
                "dashboard.subtitle",
                "Here's what's happening with your job search today.",
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link to="/candidate/jobs">
              <Button variant="primary" size="sm" className="w-full sm:w-auto">
                <BriefcaseIcon className="h-4 w-4 mr-2" />
                {t("dashboard.browseJobs", "Find Jobs")}
              </Button>
            </Link>
            {/* <Button 
              variant="outline" 
              size="sm" 
              className="w-full sm:w-auto"
              onClick={handleTestNotification}
              disabled={testNotificationLoading}
            >
              {testNotificationLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  🔔 Test Notification
                </>
              )}
            </Button> */}
          </div>
        </div>
      </div>

      {/* Resume Upload Alert */}

      {/* Profile Completion Alert - Mobile optimized */}
      {showProfileCompletion && stats.profileCompletion > 0 && stats.profileCompletion < 100 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0">
            <UserIcon className="h-5 w-5 text-primary-600 sm:mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-primary-900">
                {t(
                  "dashboard.completeProfile",
                  "Complete your profile to get better job matches",
                )}
              </h3>
              <div className="mt-2 flex items-center">
                <div className="flex-1 bg-primary-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-gradient-to-r from-primary-600 to-secondary-500 h-2 rounded-full"
                    style={{ width: `${stats.profileCompletion}%` }}
                  ></div>
                </div>
                <span className="text-xs sm:text-sm text-primary-700 font-medium whitespace-nowrap">
                  {stats.profileCompletion}% complete
                </span>
              </div>
            </div>
            <Link to="/candidate/profile" className="sm:ml-4">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                {t("dashboard.completeProfileButton", "Complete Profile")}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Enhanced Quick Stats - Mobile Native Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          const getTrendIcon = (trend) => {
            if (trend === "up") return "↗️";
            if (trend === "down") return "↘️";
            if (trend === "stable") return "➡️";
            return "";
          };

          return (
            <Link key={stat.name} to={stat.href}>
              <Card className="hover:shadow-lg active:shadow-sm active:scale-[0.98] transition-all duration-200 cursor-pointer h-full overflow-hidden border-0 shadow-sm hover:shadow-md">
                <div className="flex flex-col items-center text-center p-3 sm:p-5 relative">
                  {/* Trend Indicator */}
                  {stat.trend !== "none" && (
                    <div className="absolute top-2 right-2 text-xs opacity-70">
                      {getTrendIcon(stat.trend)}
                    </div>
                  )}

                  {/* Enhanced Icon with Background */}
                  <div
                    className={`${stat.bgColor} rounded-2xl p-3 sm:p-4 mb-2 sm:mb-3 shadow-sm`}
                  >
                    <Icon
                      className={`h-5 w-5 sm:h-7 sm:w-7 ${stat.iconColor}`}
                    />
                  </div>

                  {/* Stats Content */}
                  <div className="space-y-1">
                    {/* Value - More Prominent */}
                    <p className="text-xl sm:text-3xl font-bold text-gray-900 leading-none tracking-tight">
                      {stat.value}
                    </p>

                    {/* Label - Refined Typography */}
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 leading-tight px-1">
                      {stat.name}
                    </p>
                  </div>

                  {/* Subtle Bottom Accent */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                      stat.color === "blue"
                        ? "bg-blue-200"
                        : stat.color === "green"
                          ? "bg-green-200"
                          : stat.color === "emerald"
                            ? "bg-emerald-200"
                            : stat.color === "purple"
                              ? "bg-purple-200"
                              : "bg-gray-200"
                    }`}
                  ></div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Applications - Direct display like bookmarks */}
      <div className="space-y-2">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("applications.recent", "Recent Applications")}
          </h2>
          <Link to="/candidate/applications">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              {t("applications.viewAll", "View All")}
            </Button>
          </Link>
        </div>

        {/* Applications List */}
        {!applications ||
        !Array.isArray(applications) ||
        applications.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t("applications.noApplications", "No applications yet")}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t(
                  "applications.startApplying",
                  "Start applying to jobs to track your applications here.",
                )}
              </p>
              <Link to="/candidate/jobs" className="mt-4 inline-block">
                <Button>{t("applications.browseJobs", "Find Jobs")}</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {(applications && Array.isArray(applications) ? applications : [])
              .slice(0, 5)
              .map((job) => {
                // Ensure we have a valid job ID
                const jobId = job?.id;

                if (!jobId) {
                  console.warn("Missing job ID for application:");
                  return null;
                }

                // Transform job data to match shared JobCard expectations
                const jobData = {
                  id: jobId,
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
                    showApplicationDate={true}
                    onClick={() => {
                      // Navigate to candidate job details with 'from' parameter for proper back navigation
                      navigate(`/candidate/jobs/${jobId}?from=dashboard`);
                    }}
                    onWithdraw={() => {
                      console.log(
                        "Withdraw application:",
                        job.applicationInfo?.id,
                      );
                      handleWithdrawApplication(job.applicationInfo?.id);
                    }}
                    loading={{
                      apply: false,
                      bookmark: false,
                      withdraw:
                        actionLoading.withdraw === job.applicationInfo?.id,
                    }}
                  />
                );
              })
              .filter(Boolean)}
          </div>
        )}
      </div>

      {/* Recommended Jobs */}
      <Card>
        <Card.Header>
          <Card.Title>{t("jobs.recommended", "Recommended Jobs")}</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t("jobs.noJobs", "No recommendations yet")}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t(
                "jobs.checkBack",
                "Complete your profile to get personalized job recommendations.",
              )}
            </p>
            <Link to="/candidate/profile" className="mt-4 inline-block">
              <Button>
                {t("dashboard.completeProfileButton", "Complete Profile")}
              </Button>
            </Link>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Dashboard;
