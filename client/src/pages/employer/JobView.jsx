import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Loader from "../../components/ui/Loader";
import JobView from "../../components/ui/JobView";
import { getAdById } from "../../services/employer/ads";
import { useAuth } from "../../context/AuthContext";
import { useRole } from "../../context/RoleContext";
import { useToast } from "../../components/ui/Toast";

const EmployerJobView = () => {
  const { adId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Role context for Branch Admin functionality
  const roleContext = useRole();
  const { isAdminView = () => false, getCurrentEmployerId = () => null } =
    roleContext || {};

  const isBranchAdminView = isAdminView();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  const loadJobDetail = useCallback(async () => {
    if (fetchingRef.current) return;

    try {
      fetchingRef.current = true;
      setLoading(true);

      // Get job details from employer API
      const response = await getAdById(adId);

      if (response.success && response.data) {
        const jobData = response.data;

        // Transform employer ad data to match JobView component format
        const transformedJob = {
          id: jobData.id,
          title: jobData.title,
          description: jobData.description,
          company: jobData.company || {
            name: jobData.companyName || "Company",
            logo: jobData.company?.logo,
            description: jobData.company?.description,
            industry: jobData.company?.industry,
            size: jobData.company?.size,
            website: jobData.company?.website,
            location: jobData.company?.location,
          },
          location:
            jobData.city ||
            jobData.location?.name ||
            jobData.location ||
            "Location not specified",
          jobType: jobData.employmentType || jobData.jobType || "Full Time",
          experienceLevel: jobData.experienceLevel,
          gender: jobData.gender,
          educationQualification: jobData.educationQualification,
          vacancies: jobData.vacancies,
          categorySpecificFields: {
            salaryRange: {
              min: jobData.salaryMin ? Number(jobData.salaryMin) : null,
              max: jobData.salaryMax ? Number(jobData.salaryMax) : null,
            },
            salaryMin: jobData.salaryMin ? Number(jobData.salaryMin) : null,
            salaryMax: jobData.salaryMax ? Number(jobData.salaryMax) : null,
            skills: jobData.skills
              ? typeof jobData.skills === "string"
                ? jobData.skills.split(",").map((s) => s.trim())
                : Array.isArray(jobData.skills)
                  ? jobData.skills
                  : []
              : [],
          },
          postedAt: jobData.createdAt,
          createdAt: jobData.createdAt,
          applicationCount:
            jobData._count?.allocations || jobData.applicationCount || 0,
          status: jobData.status,
          employer: jobData.employer || {
            id: jobData.employerId,
            user: {
              phone: jobData.employer?.user?.phone,
            },
          },
        };

        setJob(transformedJob);
      } else {
        showToast.error("Job not found");
        handleBackNavigation();
      }
    } catch (error) {
      console.error("Error loading job details:", error);
      showToast.error("Failed to load job details");
      handleBackNavigation();
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [adId, showToast]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadJobDetail();
    }
  }, [loadJobDetail, isAuthenticated, user]);

  const handleBackNavigation = () => {
    // Use browser back functionality
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-4">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Job Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={handleBackNavigation}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-4">
        {/* Back Button */}
        <button
          onClick={handleBackNavigation}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-all hover:translate-x-[-2px] group mb-8"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:mr-3 transition-all" />
          <span className="font-medium">Back</span>
        </button>

        {/* Employer Job View Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-blue-800">
                {isBranchAdminView ? "Employer Job View" : "Job Preview"}
              </h1>
              <p className="text-blue-600 text-sm">
                {isBranchAdminView
                  ? "Viewing job posting as posted by employer"
                  : "This is how your job posting appears to candidates"}
              </p>
            </div>
          </div>
        </div>

        {/* Reusable Job View Component */}
        <JobView
          job={job}
          user={user}
          isAuthenticated={isAuthenticated}
          showActions={false} // Employers don't need apply/bookmark actions on their own jobs
          variant="employer"
        />
      </div>
    </div>
  );
};

export default EmployerJobView;
