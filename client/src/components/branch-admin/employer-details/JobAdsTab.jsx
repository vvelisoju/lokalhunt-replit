import React from "react";
import {
  DocumentTextIcon,
  PlusIcon,
  CheckBadgeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Button from "../../ui/Button";
import JobCard from "../../ui/JobCard";

const JobAdsTab = ({
  employer,
  onCreateAd,
  onEditAd,
  onViewAd,
  onRefresh, // Callback to refresh employer data after approve/reject
  getStatusBadge,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Job Advertisements
        </h3>
        <Button
          onClick={onCreateAd}
          icon={PlusIcon}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create Ad
        </Button>
      </div>
      <div className="p-6">
        {employer.ads && employer.ads.length > 0 ? (
          <div className="space-y-4">
            {employer.ads.map((ad) => {
              // Transform ad data to match JobCard expected format
              const jobData = {
                id: ad.id,
                title: ad.title,
                description: ad.description,
                company: ad.company || {
                  name: ad.companyName || "Company",
                  logo: ad.company?.logo,
                },
                location:
                  ad.location?.name ||
                  ad.company?.city?.name ||
                  "Location not specified",
                jobType:
                  ad.categorySpecificFields?.employmentType || "Full Time",
                salary:
                  ad.categorySpecificFields?.salaryMin &&
                  ad.categorySpecificFields?.salaryMax
                    ? {
                        min: ad.categorySpecificFields.salaryMin,
                        max: ad.categorySpecificFields.salaryMax,
                      }
                    : null,
                skills: ad.categorySpecificFields?.skills || [],
                postedAt: ad.createdAt,
                candidatesCount:
                  ad._count?.applications || ad.applicationsCount || 0,
                status: ad.status,
                validUntil: ad.validUntil,
                experienceLevel: ad.categorySpecificFields?.experienceLevel,
              };

              return (
                <div key={ad.id} className="relative">
                  <JobCard
                    key={ad.id}
                    job={jobData}
                    variant="employer"
                    applicationStatus={ad.status}
                    userRole="BRANCH_ADMIN"
                    onRefresh={onRefresh} // Pass the refresh callback
                    showApplicationDate={false}
                    showCandidatesCount={true}
                    loading={{}}
                    className="hover:shadow-lg transition-shadow"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              No job advertisements posted yet
            </p>
            <Button
              onClick={onCreateAd}
              icon={PlusIcon}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create First Ad
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobAdsTab;