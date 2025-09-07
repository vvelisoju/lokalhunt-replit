import React, { useEffect, useState, useCallback } from "react";
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

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    profile,
    fetchProfile,
    applications,
    fetchApplications,
    bookmarks,
    fetchBookmarks,
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
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCheckComplete, setOnboardingCheckComplete] = useState(false);
  const [testNotificationLoading, setTestNotificationLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Optimized data fetching - fetch all required data in one go
  const fetchAllDashboardData = useCallback(async () => {
    if (!user || initialLoadComplete) return;

    console.log("Starting dashboard data fetch...");
    setDataLoaded(false);

    try {
      // Fetch all data concurrently to reduce loading time
      const [
        profileResponse,
        onboardingResponse,
        applicationsResponse,
        statsResponse,
      ] = await Promise.allSettled([
        fetchProfile && typeof fetchProfile === "function"
          ? fetchProfile(false)
          : Promise.resolve(),
        candidateApi.getOnboardingData(),
        fetchApplications && typeof fetchApplications === "function"
          ? fetchApplications({}, false)
          : Promise.resolve(),
        candidateApi.getDashboardStats(),
      ]);

      // Handle profile data
      if (profileResponse.status === "fulfilled") {
        console.log("Profile data loaded");
      }

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
        setStats(statsResponse.value.data);
        console.log("Dashboard stats loaded");
      } else {
        console.warn("Failed to load dashboard stats");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setDataLoaded(true);
      setOnboardingCheckComplete(true);
      setInitialLoadComplete(true);
    }
  }, [user, initialLoadComplete]);

  // Single effect to handle all initial data loading
  useEffect(() => {
    if (user && !initialLoadComplete) {
      fetchAllDashboardData();
    }
  }, [user, fetchAllDashboardData]);

  const handleOnboardingComplete = useCallback((data) => {
    console.log("Onboarding completed:", data);
    setShowOnboarding(false);
    // Clear localStorage flags since onboarding is now completed in database
    localStorage.removeItem("onboardingProgress");
    localStorage.removeItem("showOnboarding");
    localStorage.setItem("onboardingCompleted", "true");

    // Reset initial load to trigger fresh data fetch
    setInitialLoadComplete(false);
    setDataLoaded(false);
  }, []);

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

  // Show loading until onboarding check is complete and data is loaded
  if (loading || !dataLoaded || !onboardingCheckComplete) {
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
    <div className="space-y-4 sm:space-y-6  sm:p-0">
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
      {stats.profileCompletion > 0 && stats.profileCompletion < 100 && (
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

      {/* Recent Applications - Mobile optimized */}
      <Card>
        <Card.Header>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <Card.Title className="text-lg">
              {t("applications.recent", "Recent Applications")}
            </Card.Title>
            <Link to="/candidate/applications">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                {t("applications.viewAll", "View All")}
              </Button>
            </Link>
          </div>
        </Card.Header>
        <Card.Content>
          {!applications ||
          !Array.isArray(applications) ||
          applications.length === 0 ? (
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
          ) : (
            <div className="space-y-4">
              {(applications && Array.isArray(applications) ? applications : [])
                .slice(0, 5)
                .map((application) => {
                  // Ensure we have a valid job ID
                  const jobId =
                    application.adId ||
                    application.job?.id ||
                    application.jobId;

                  if (!jobId) {
                    console.warn(
                      "Missing job ID for application:",
                      application,
                    );
                    return null;
                  }

                  // Transform application data to match shared JobCard expectations
                  const jobData = {
                    id: jobId,
                    title:
                      application.title ||
                      application.ad?.title ||
                      application.job?.title ||
                      application.adTitle ||
                      "Job Title",
                    employer: application?.ad.employer,
                    description:
                      application.description ||
                      application.ad?.description ||
                      application.job?.description ||
                      application.adDescription,
                    location:
                      application.location ||
                      application.city ||
                      application.ad?.city ||
                      application.job?.location ||
                      application.job?.city?.name ||
                      "Location not specified",
                    locationName:
                      application.city ||
                      application.location ||
                      application.ad?.city ||
                      application.job?.city?.name,
                    locationState:
                      application.state || application.job?.city?.state,
                    salary:
                      application.salary ||
                      application.salaryRange ||
                      application.ad?.salary ||
                      application.job?.salary,
                    salaryRange:
                      application.salaryRange ||
                      application.ad?.salaryRange ||
                      application.job?.salaryRange,
                    jobType:
                      application.employmentType ||
                      application.jobType ||
                      application.ad?.employmentType ||
                      application.job?.jobType ||
                      application.job?.employmentType ||
                      "Full Time",
                    skills:
                      application.skills ||
                      application.requirements ||
                      application.ad?.skills ||
                      application.job?.skills ||
                      application.job?.requirements ||
                      [],
                    postedAt:
                      application.postedAt ||
                      application.createdAt ||
                      application.ad?.createdAt ||
                      application.job?.createdAt,
                    candidatesCount:
                      application.ad?.candidatesCount ||
                      application.ad?.applicationCount ||
                      application.ad?._count?.allocations ||
                      application.applicationCount ||
                      application.job?.applicationCount ||
                      0,

                    company: {
                      name:
                        application.companyName ||
                        application.employerName ||
                        application.company?.name ||
                        application.ad?.company?.name ||
                        application.job?.company?.name ||
                        application.ad?.employerName ||
                        application.job?.employerName ||
                        "Company",
                      industry:
                        application.company?.industry ||
                        application.ad?.company?.industry ||
                        application.job?.company?.industry,
                    },
                    hasApplied: true, // Since these are applications, user has already applied
                  };

                  return (
                    <JobCard
                      key={application.id}
                      job={jobData}
                      variant="application"
                      applicationStatus={application.status}
                      applicationDate={application.createdAt}
                      showApplicationDate={true}
                      onClick={() => {
                        // Navigate to candidate job details with 'from' parameter for proper back navigation
                        navigate(`/candidate/jobs/${jobId}?from=dashboard`);
                      }}
                      onWithdraw={() => {
                        console.log("Withdraw application:", application.id);
                      }}
                      loading={{
                        apply: false,
                        bookmark: false,
                        withdraw: false,
                      }}
                    />
                  );
                })
                .filter(Boolean)}
            </div>
          )}
        </Card.Content>
      </Card>

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
