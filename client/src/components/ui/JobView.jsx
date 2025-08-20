import React from "react";
import {
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ClockIcon,
  StarIcon as StarOutlineIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import ReactMarkdown from "react-markdown";
import Button from "./Button";

const JobView = ({
  job,
  user,
  isAuthenticated,
  showActions = true,
  onApply,
  onBookmark,
  applying = false,
  bookmarking = false,
  isBookmarked = false,
  hasApplied = false,
  variant = "default",
}) => {
  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return "Not specified";
    if (min && max)
      return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    if (max) return `Up to ₹${max.toLocaleString()}`;
    return "Not specified";
  };

  const getJobTypeBadge = (jobType) => {
    const badges = {
      FULL_TIME: { label: "Full Time", class: "bg-green-100 text-green-800" },
      PART_TIME: { label: "Part Time", class: "bg-blue-100 text-blue-800" },
      CONTRACT: { label: "Contract", class: "bg-purple-100 text-purple-800" },
      FREELANCE: { label: "Freelance", class: "bg-orange-100 text-orange-800" },
      INTERNSHIP: { label: "Internship", class: "bg-pink-100 text-pink-800" },
    };
    return (
      badges[jobType] || {
        label: jobType || "Not specified",
        class: "bg-gray-100 text-gray-800",
      }
    );
  };

  if (!job) {
    return (
      <div className="text-center py-8 text-gray-500">
        Job information not available
      </div>
    );
  }

  const jobTypeBadge = getJobTypeBadge(job.jobType?.toUpperCase());
  const salary = formatSalary(
    job.categorySpecificFields?.salaryRange?.min ||
      job.categorySpecificFields?.salaryMin,
    job.categorySpecificFields?.salaryRange?.max ||
      job.categorySpecificFields?.salaryMax,
  );

  return (
    <div className="space-y-6">
      {/* Job Header */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 min-w-0 mb-6 lg:mb-0">
            <div className="flex items-start">
              {job.company?.logo && (
                <img
                  src={job.company.logo}
                  alt={job.company?.name}
                  className="w-16 h-16 rounded-lg object-cover mr-4 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                    {job.company?.name || "Company Name"}
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    {job.location?.name ||
                      job.location ||
                      "Location not specified"}
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    {formatDate(job.postedAt || job.createdAt)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${jobTypeBadge.class}`}
                  >
                    <BriefcaseIcon className="h-4 w-4 mr-1" />
                    {jobTypeBadge.label}
                  </span>
                  {job.experienceLevel && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {job.experienceLevel}
                    </span>
                  )}
                  {job.gender && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {job.gender}
                    </span>
                  )}
                  {job.educationQualification?.name && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {job.educationQualification.name}
                    </span>
                  )}
                  {job.vacancies && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      {job.vacancies}{" "}
                      {job.vacancies === 1 ? "Position" : "Positions"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
              {user?.role === "CANDIDATE" && (
                <>
                  <Button
                    onClick={onBookmark}
                    variant="outline"
                    disabled={bookmarking || !isAuthenticated}
                    className={`flex items-center transition-all duration-200 ${isBookmarked ? "border-yellow-400 bg-yellow-50" : ""}`}
                  >
                    {isBookmarked ? (
                      <StarSolidIcon className="h-5 w-5 mr-2 text-yellow-500" />
                    ) : (
                      <StarOutlineIcon className="h-5 w-5 mr-2" />
                    )}
                    {bookmarking
                      ? "Saving..."
                      : isBookmarked
                        ? "Bookmarked"
                        : "Bookmark"}
                  </Button>

                  <Button
                    onClick={onApply}
                    disabled={applying || hasApplied || !isAuthenticated}
                    className={`flex items-center px-6 py-3 text-lg font-medium transition-all duration-200 ${
                      hasApplied
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    }`}
                  >
                    {applying ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Applying...
                      </>
                    ) : hasApplied ? (
                      <>
                        <svg
                          className="h-5 w-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Applied
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-5 w-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        Apply Now
                      </>
                    )}
                  </Button>
                </>
              )}

              {!isAuthenticated && (
                <p className="text-sm text-gray-500 mt-2">
                  Please{" "}
                  <span className="text-primary-600 font-medium">sign in</span>{" "}
                  to apply or bookmark jobs
                </p>
              )}
            </div>
          )}
        </div>

        {/* Job Stats and Info */}
        <div className="border-t border-gray-200 mt-6 pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center">
                <CurrencyRupeeIcon className="h-6 w-6 text-green-600 mr-2" />
                <div>
                  <p className="text-xs text-green-600 font-medium">Salary</p>
                  <p className="font-bold text-green-800 text-lg">{salary}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center">
                <UserGroupIcon className="h-6 w-6 text-blue-600 mr-2" />
                <div>
                  <p className="text-xs text-blue-600 font-medium">
                    Applications
                  </p>
                  <p className="font-bold text-blue-800 text-lg">
                    {job.applicationCount || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center">
                <CalendarIcon className="h-6 w-6 text-purple-600 mr-2" />
                <div>
                  <p className="text-xs text-purple-600 font-medium">Posted</p>
                  <p className="font-bold text-purple-800 text-sm">
                    {formatDate(job.postedAt || job.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {job.categorySpecificFields?.experienceLevel && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center">
                  <BriefcaseIcon className="h-6 w-6 text-orange-600 mr-2" />
                  <div>
                    <p className="text-xs text-orange-600 font-medium">
                      Experience
                    </p>
                    <p className="font-bold text-orange-800 text-sm">
                      {job.categorySpecificFields.experienceLevel}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Job Description */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-4"></div>
          Job Description
        </h2>
        <div className="prose max-w-none text-gray-700 leading-relaxed">
          {job.description ? (
            <div className="markdown-content">
              <ReactMarkdown
                components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-gray-900 mt-5 mb-2 first:mt-0">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 text-gray-700 leading-relaxed last:mb-0">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 ml-4">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700 leading-relaxed">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-800">{children}</em>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
              }}
            >
                {job.description}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500 italic">
                No detailed description available for this position.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Skills and Requirements */}
      {job.categorySpecificFields?.skills &&
        job.categorySpecificFields.skills.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full mr-4"></div>
              Required Skills
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {job.categorySpecificFields.skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-3 text-center hover:shadow-md transition-all duration-200"
                >
                  <span className="text-sm font-semibold text-blue-800">
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      {/* Company Information */}
      {job.company && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-4"></div>
            About the Company
          </h2>
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start">
              {job.company.logo && (
                <div className="w-20 h-20 rounded-xl overflow-hidden mr-6 flex-shrink-0 shadow-lg border-2 border-white">
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {job.company.name}
                </h3>
                {job.company.description && (
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {job.company.description}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {job.company.industry && (
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                        Industry
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {job.company.industry}
                      </span>
                    </div>
                  )}
                  {job.company.size && (
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                        Company Size
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {job.company.size}
                      </span>
                    </div>
                  )}
                  {job.company.website && (
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                        Website
                      </span>
                      <a
                        href={job.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 font-semibold break-all"
                      >
                        {job.company.website}
                      </a>
                    </div>
                  )}
                  {job.company.location && (
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                        Location
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {job.company.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobView;
