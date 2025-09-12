const transformJobForResponse = (jobData, options = {}) => {
  const {
    source = "ad", // 'ad', 'application', 'bookmark'
    hasApplied = false,
    isBookmarked = false,
    applicationStatus = null,
    applicationDate = null,
    bookmarkDate = null,
    includeApplicationInfo = false,
  } = options;

  // Handle different data sources
  let job, application, bookmark;

  if (source === "application") {
    application = jobData;
    job = jobData.ad;
  } else if (source === "bookmark") {
    bookmark = jobData;
    job = jobData.ad;
  } else {
    job = jobData;
  }

  if (!job) {
    console.warn("transformJobForResponse: No job data found");
    return null;
  }

  // Extract salary information with proper type conversion
  const salaryMin = job.salaryMin ? Number(job.salaryMin) : null;
  const salaryMax = job.salaryMax ? Number(job.salaryMax) : null;

  // Format salary display
  let salary = "Salary not disclosed";
  if (salaryMin && salaryMax) {
    salary = `₹${salaryMin.toLocaleString()} - ₹${salaryMax.toLocaleString()}`;
  } else if (salaryMin) {
    salary = `₹${salaryMin.toLocaleString()}+`;
  }

  // Build standardized job response
  const transformedJob = {
    id: job.id,
    title: job.title,
    description: job.description,

    // Company information
    company: {
      id: job.company?.id,
      name: job.company?.name || job.employerName || "Company",
      logo: job.company?.logo,
      industry: job.company?.industry,
    },

    // Employer information (for backward compatibility)
    employer: job.employer
      ? {
          user: {
            name: job.employer.user?.name,
            email: job.employer.user?.email,
            phone: job.employer.user?.phone,
          },
        }
      : undefined,

    // Location information
    location: job.location
      ? `${job.location.name}, ${job.location.state}`
      : "Remote",
    locationName: job.location?.name,
    locationState: job.location?.state,
    locationId: job.location?.id,

    categoryId: job.categoryId,

    // Job details
    jobType: job.employmentType || "Full Time",
    employmentType: job.employmentType || "Full Time",
    experienceLevel: job.experienceLevel || "Not specified",
    gender: job.gender,

    // Salary information
    salary: salary,
    salaryRange: salary,
    salaryMin: salaryMin,
    salaryMax: salaryMax,

    // Skills and requirements
    skills: job.skills
      ? Array.isArray(job.skills)
        ? job.skills
        : job.skills.split(",").map((skill) => skill.trim())
      : [],

    // Dates
    postedAt: job.createdAt,
    createdAt: job.createdAt,

    // Counts and metrics
    candidatesCount: job._count?.allocations || job.applicationCount || 0,
    applicationCount: job._count?.allocations || job.applicationCount || 0,

    // Application/Bookmark status
    hasApplied: hasApplied,
    isBookmarked: isBookmarked,
    applicationStatus: applicationStatus,

    // Additional fields
    status: job.status || "APPROVED",
    numberOfPositions: job.numberOfPositions,
    vacancies: job.numberOfPositions || 1,
  };

  // Add application-specific information if needed
  if (includeApplicationInfo && application) {
    transformedJob.applicationInfo = {
      id: application.id,
      status: application.status,
      appliedAt: application.createdAt,
      notes: application.notes,
    };
  }

  // Add bookmark-specific information if needed
  if (includeApplicationInfo && bookmark) {
    transformedJob.bookmarkInfo = {
      id: bookmark.id,
      bookmarkedAt: bookmark.createdAt,
    };
  }

  return transformedJob;
};

const transformJobsArrayForResponse = (jobsArray, options = {}) => {
  if (!Array.isArray(jobsArray)) {
    console.warn("transformJobsArrayForResponse: Input is not an array");
    return [];
  }

  return jobsArray
    .map((jobData) => transformJobForResponse(jobData, options))
    .filter(Boolean); // Remove any null/undefined results
};

module.exports = {
  transformJobForResponse,
  transformJobsArrayForResponse,
};
