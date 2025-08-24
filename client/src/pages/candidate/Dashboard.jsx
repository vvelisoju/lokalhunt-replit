import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BriefcaseIcon,
  BookmarkIcon,
  UserIcon,
  DocumentIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import JobCard from "../../components/ui/JobCard";
import Loader from "../../components/ui/Loader";
import { useCandidate } from "../../context/CandidateContext";
import { useCandidateAuth } from "../../hooks/useCandidateAuth";

const Dashboard = () => {
  const { user } = useCandidateAuth();
  const { applications, fetchApplications, loading } = useCandidate();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    rejectedApplications: 0,
    interviewScheduled: 0,
    profileViews: 0,
    profileCompletion: 75,
    bookmarks: 0,
  });
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      // Only load if user exists and data hasn't been loaded yet
      if (!user || dataLoaded) return;

      try {
        // Fetch applications if fetchApplications is available
        if (fetchApplications && typeof fetchApplications === "function") {
          console.log("Fetching applications...");
          await fetchApplications();
          console.log(
            "Applications fetched, current applications:",
            applications,
          );
        }

        // Fetch dashboard stats - handle missing endpoint gracefully
        try {
          const response = await fetch("/api/candidates/dashboard/stats", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("candidateToken") || localStorage.getItem("token")}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data && isMounted) {
              setStats(result.data);
            }
          } else if (response.status === 404) {
            // Dashboard stats endpoint doesn't exist, use defaults
            console.info(
              "Dashboard stats endpoint not implemented, using defaults",
            );
          }
        } catch (statsError) {
          console.warn("Failed to load dashboard stats:", statsError);
          // Continue with default stats
        }

        if (isMounted) {
          setDataLoaded(true);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        if (isMounted) {
          setDataLoaded(true); // Set loaded even on error to prevent retries
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user, dataLoaded]); // Include dataLoaded to prevent re-runs

  const quickStats = [
    {
      name: t("stats.applications", "Applications"),
      value: applications?.length || stats.totalApplications || 0,
      icon: BriefcaseIcon,
      color: "blue",
      href: "/candidate/applications",
    },
    {
      name: t("stats.bookmarks", "Bookmarks"),
      value: stats.bookmarks || 0,
      icon: BookmarkIcon,
      color: "green",
      href: "/candidate/bookmarks",
    },
    {
      name: t("stats.profileViews", "Profile Views"),
      value: stats.profileViews || 0,
      icon: EyeIcon,
      color: "purple",
      href: "/candidate/profile",
    },
    {
      name: t("stats.resume", "Resume"),
      value: user?.resume
        ? t("stats.uploaded", "Uploaded")
        : t("stats.missing", "Missing"),
      icon: DocumentIcon,
      color: user?.resume ? "green" : "red",
      href: "/candidate/resume",
    },
  ];

  // Show loading until data is loaded and not in loading state
  if (!dataLoaded || loading) {
    return <Loader.Page />;
  }

  return (
    <div className="space-y-6">
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
          <div className="flex-shrink-0">
            <Link to="/candidate/jobs">
              <Button variant="primary" size="sm" className="w-full sm:w-auto">
                <BriefcaseIcon className="h-4 w-4 mr-2" />
                {t("dashboard.browseJobs", "Apply Jobs")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Completion Alert - Mobile optimized */}
      {/* {stats.profileCompletion < 100 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0">
            <UserIcon className="h-5 w-5 text-primary-600 sm:mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-primary-900">
                {t('dashboard.completeProfile', 'Complete your profile to get better job matches')}
              </h3>
              <div className="mt-2 flex items-center">
                <div className="flex-1 bg-primary-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-gradient-to-r from-primary-600 to-secondary-500 h-2 rounded-full" 
                    style={{ width: `${stats.profileCompletion}%` }}
                  ></div>
                </div>
                <span className="text-xs sm:text-sm text-primary-700 font-medium">
                  {t('sidebar.percentComplete', '{{percent}}% complete', { percent: stats.profileCompletion })}
                </span>
              </div>
            </div>
            <Link to="/candidate/profile" className="sm:ml-4">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                {t('dashboard.completeProfileButton', 'Complete Profile')}
              </Button>
            </Link>
          </div>
        </div>
      )} */}

      {/* Quick Stats - Mobile optimized grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} to={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                  <div
                    className={`
                    p-2 sm:p-3 rounded-lg mb-2 sm:mb-0
                    ${stat.color === "blue" ? "bg-blue-100" : ""}
                    ${stat.color === "green" ? "bg-green-100" : ""}
                    ${stat.color === "purple" ? "bg-purple-100" : ""}
                    ${stat.color === "red" ? "bg-red-100" : ""}
                  `}
                  >
                    <Icon
                      className={`
                      h-4 w-4 sm:h-6 sm:w-6
                      ${stat.color === "blue" ? "text-blue-600" : ""}
                      ${stat.color === "green" ? "text-green-600" : ""}
                      ${stat.color === "purple" ? "text-purple-600" : ""}
                      ${stat.color === "red" ? "text-red-600" : ""}
                    `}
                    />
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
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
                <Button>{t("applications.browseJobs", "Apply Jobs")}</Button>
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
                  // Handle the actual API response structure for applications
                  console.log("Processing application:", application); // Debug log

                  const jobData = {
                    id: jobId,
                    title:
                      application.title ||
                      application.ad?.title ||
                      application.job?.title ||
                      application.adTitle ||
                      "Job Title",
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
                    // bookmarkedCount:
                    //   application.ad?.bookmarkedCount ||
                    //   application.ad?._count?.bookmarks ||
                    //   application.bookmarkedCount ||
                    //   application.job?.bookmarkedCount ||
                    //   0,

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
