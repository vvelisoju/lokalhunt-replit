const express = require("express");
const { createResponse, createErrorResponse } = require("../utils/response");
const { optionalAuth } = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router();

// Public routes that don't require authentication

// =======================
// PUBLIC JOB DATA
// =======================

// Get public job statistics
router.get("/stats", async (req, res, next) => {
  try {
    // Get basic platform statistics
    const [totalJobs, totalCompanies, totalCandidates, totalCities] =
      await Promise.all([
        prisma.ad.count({
          where: {
            status: "APPROVED",
            isActive: true,
          },
        }),
        prisma.company.count({
          where: { isActive: true },
        }),
        prisma.candidate.count(),
        prisma.city.count({
          where: { isActive: true },
        }),
      ]);

    const stats = {
      jobs: totalJobs,
      companies: totalCompanies,
      candidates: totalCandidates,
      cities: totalCities,
    };

    res.json(
      createResponse("Platform statistics retrieved successfully", stats),
    );
  } catch (error) {
    next(error);
  }
});

// Get all cities
router.get("/cities", async (req, res, next) => {
  try {
    const { stateId } = req.query;

    const where = {
      isActive: true,
      ...(stateId && { stateId }),
    };

    const cities = await prisma.city.findMany({
      where,
      select: {
        id: true,
        name: true,
        state: true,
      },
      orderBy: [{ name: "asc" }],
    });

    res.json(createResponse("Cities retrieved successfully", cities));
  } catch (error) {
    next(error);
  }
});

// Get featured/popular jobs for landing page
router.get("/jobs/featured", async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    const featuredJobs = await prisma.ad.findMany({
      where: {
        status: "APPROVED",
        isActive: true,
        // Prioritize jobs with higher engagement or recent postings
      },
      take: parseInt(limit),
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            industry: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            state: true,
          },
        },
        _count: {
          select: {
            allocations: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    // Transform jobs for frontend
    const transformedJobs = featuredJobs.map((job) => {
      const salaryMin = job.salaryMin ? Number(job.salaryMin) : null;
      const salaryMax = job.salaryMax ? Number(job.salaryMax) : null;

      return {
        id: job.id,
        title: job.title,
        company: {
          name: job.company.name,
          logo: job.company.logo,
        },
        location: job.location
          ? `${job.location.name}, ${job.location.state}`
          : "Remote",
        salary:
          salaryMin && salaryMax
            ? `₹${salaryMin} - ₹${salaryMax}`
            : salaryMin
              ? `₹${salaryMin}+`
              : "Negotiable",
        vacancies: job.numberOfPositions || 1,
        postedAt: job.createdAt,
        jobType: job.employmentType || "Full Time",
        featured: true,
        experienceLevel: job.experienceLevel || "Not specified",
      };
    });

    res.json(
      createResponse("Featured jobs retrieved successfully", transformedJobs),
    );
  } catch (error) {
    next(error);
  }
});

// Get job categories with counts
router.get("/categories", async (req, res, next) => {
  try {
    // Get all job categories from database
    const categories = await prisma.jobCategory.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Add job counts to categories (simplified approach for now)
    const categoriesWithCounts = categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      count: 0, // Will be updated when jobs are properly categorized
    }));

    res.json(
      createResponse(
        "Job categories retrieved successfully",
        categoriesWithCounts,
      ),
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    next(error);
  }
});

// Get education qualifications
router.get("/education-qualifications", async (req, res, next) => {
  try {
    const qualifications = await prisma.educationQualification.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        sortOrder: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    res.json(
      createResponse(
        "Education qualifications retrieved successfully",
        qualifications,
      ),
    );
  } catch (error) {
    console.error("Error fetching education qualifications:", error);
    next(error);
  }
});

// Get education qualifications
router.get("/education-qualifications", async (req, res, next) => {
  try {
    const qualifications = await prisma.educationQualification.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        sortOrder: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    res.json(
      createResponse(
        "Education qualifications retrieved successfully",
        qualifications,
      ),
    );
  } catch (error) {
    console.error("Error fetching education qualifications:", error);
    next(error);
  }
});

// Get job roles
router.get("/job-roles", async (req, res, next) => {
  try {
    const { category } = req.query;

    const where = {
      isActive: true,
      ...(category && { category }),
    };

    const jobRoles = await prisma.jobRole.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        sortOrder: true,
      },
      orderBy: [
        { category: "asc" },
        { sortOrder: "asc" },
      ],
    });

    res.json(
      createResponse(
        "Job roles retrieved successfully",
        jobRoles,
      ),
    );
  } catch (error) {
    console.error("Error fetching job roles:", error);
    next(error);
  }
});

// Get popular cities
router.get("/cities", async (req, res, next) => {
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        state: true,
        _count: {
          select: {
            ads: {
              where: {
                status: "APPROVED",
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: {
        ads: {
          _count: "desc",
        },
      },
      take: 20,
    });

    const transformedCities = cities.map((city) => ({
      id: city.id,
      name: city.name,
      state: city.state,
      jobCount: city._count.ads,
    }));

    res.json(createResponse("Cities retrieved successfully", transformedCities));
  } catch (error) {
    next(error);
  }
});

// Search jobs (public endpoint with limited info)
router.get("/jobs/search", optionalAuth, async (req, res, next) => {
  try {
    console.log("=== JOBS SEARCH ENDPOINT HIT ===", req.query);
    const {
      page = 1,
      limit = 12,
      search,
      location,
      category,
      jobType,
      experience,
      salaryRange,
      sortBy = "newest",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let where = {
      status: "APPROVED",
      isActive: true,
    };

    // Add search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Location filter
    if (location) {
      where.location = {
        OR: [
          { name: { contains: location, mode: "insensitive" } },
          { state: { contains: location, mode: "insensitive" } },
        ],
      };
    }

    // Job type filter
    if (jobType && jobType !== "") {
      const jobTypes = Array.isArray(jobType) ? jobType : [jobType];
      where.employmentType = {
        in: jobTypes,
      };
    }

    // Experience level filter
    if (experience && experience !== "") {
      const experienceLevels = Array.isArray(experience)
        ? experience
        : [experience];
      where.experienceLevel = {
        in: experienceLevels,
      };
    }

    // Category filter
    if (category && category !== "") {
      where.categoryName = category;
    }

    // Salary range filter
    if (salaryRange && salaryRange !== "") {
      if (salaryRange.includes("+")) {
        // Min salary filter (e.g., "100000+")
        const minSalary = parseInt(salaryRange.replace("+", ""));
        where.AND = [
          ...(where.AND || []),
          {
            salaryMin: {
              gte: minSalary,
            },
          },
        ];
      } else {
        // Range filter (e.g., "25000-50000")
        const [minSalary, maxSalary] = salaryRange.split("-").map(Number);
        where.AND = [
          ...(where.AND || []),
          {
            AND: [
              {
                salaryMin: {
                  gte: minSalary,
                },
              },
              {
                salaryMax: {
                  lte: maxSalary,
                },
              },
            ],
          },
        ];
      }
    }

    // Set up sorting
    let orderBy = [{ createdAt: "desc" }]; // default
    switch (sortBy) {
      case "oldest":
        orderBy = [{ createdAt: "asc" }];
        break;
      case "salary-high":
        orderBy = [{ salaryMax: "desc" }];
        break;
      case "salary-low":
        orderBy = [{ salaryMin: "asc" }];
        break;
      case "relevance":
        // For relevance, we'd need more complex scoring
        orderBy = [{ updatedAt: "desc" }];
        break;
    }

    const [jobs, total] = await Promise.all([
      prisma.ad.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              industry: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              state: true,
            },
          },
          _count: {
            select: {
              allocations: true,
            },
          },
        },
        orderBy,
      }),
      prisma.ad.count({ where }),
    ]);

    // Transform jobs for frontend with status checking if authenticated
    let transformedJobs = jobs.map((job) => {
      const salaryMin = job.salaryMin ? Number(job.salaryMin) : null;
      const salaryMax = job.salaryMax ? Number(job.salaryMax) : null;

      return {
        id: job.id,
        title: job.title,
        company: {
          name: job.company.name,
          logo: job.company.logo,
        },
        location: job.location
          ? `${job.location.name}, ${job.location.state}`
          : "Remote",
        salary:
          salaryMin && salaryMax
            ? `₹${salaryMin} - ₹${salaryMax}`
            : salaryMin
              ? `₹${salaryMin}+`
              : "Negotiable",
        vacancies: job.numberOfPositions || 1,
        postedAt: job.createdAt,
        jobType:
          job.employmentType?.toLowerCase()?.replace("_", "-") || "full-time",
        featured: false, // Public search doesn't show featured status
        experienceLevel: job.experienceLevel || "Not specified",
        description: job.description?.substring(0, 150) + "..." || "",
        skills: job.skills
          ? job.skills.split(",").map((skill) => skill.trim())
          : [],
        applicationCount: job._count?.allocations || 0,
        isBookmarked: false,
        hasApplied: false,
      };
    });

    // Add status information for authenticated candidates
    if (req.user && req.user.role === "CANDIDATE") {
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (candidate) {
        // Get all bookmarks and applications for this candidate
        const [bookmarks, applications] = await Promise.all([
          prisma.bookmark.findMany({
            where: {
              candidateId: candidate.id,
              adId: { in: jobs.map((job) => job.id) },
            },
            select: { adId: true },
          }),
          prisma.allocation.findMany({
            where: {
              candidateId: candidate.id,
              adId: { in: jobs.map((job) => job.id) },
            },
            select: { adId: true },
          }),
        ]);

        const bookmarkedJobIds = new Set(bookmarks.map((b) => b.adId));
        const appliedJobIds = new Set(applications.map((a) => a.adId));

        // Update job status
        transformedJobs = transformedJobs.map((job) => ({
          ...job,
          isBookmarked: bookmarkedJobIds.has(job.id),
          hasApplied: appliedJobIds.has(job.id),
        }));
      }
    }

    const response = {
      jobs: transformedJobs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    };

    res.json(createResponse("Jobs retrieved successfully", response));
  } catch (error) {
    next(error);
  }
});

// Get single job by ID for candidates with status info
router.get("/candidates/jobs/:id", optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== "CANDIDATE") {
      return res.status(403).json(createErrorResponse("Access denied", 403));
    }

    const job = await prisma.ad.findFirst({
      where: {
        id,
        status: "APPROVED",
        isActive: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            industry: true,
            description: true,
            website: true,
            size: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            state: true,
          },
        },
        employer: {
          select: {
            isVerified: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json(createErrorResponse("Job not found", 404));
    }

    // Get candidate
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user.userId },
    });

    if (!candidate) {
      return res.status(404).json(createErrorResponse("Candidate profile not found", 404));
    }

    // Transform job for frontend with proper type conversion
    const salaryMin = job.salaryMin ? Number(job.salaryMin) : null;
    const salaryMax = job.salaryMax ? Number(job.salaryMax) : null;

    let transformedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      company: {
        id: job.company?.id,
        name: job.company?.name || "Company Name",
        logo: job.company?.logo,
        industry: job.company?.industry,
        description: job.company?.description,
        website: job.company?.website,
        size: job.company?.size,
        location: job.company?.location,
      },
      location: job.location
        ? {
            id: job.location.id,
            name: job.location.name,
            state: job.location.state,
          }
        : null,
      locationName: job.location?.name,
      locationState: job.location?.state,
      salary:
        salaryMin && salaryMax
          ? `₹${salaryMin} - ₹${salaryMax}`
          : salaryMin
            ? `₹${salaryMin}+`
            : "Negotiable",
      salaryMin: salaryMin,
      salaryMax: salaryMax,
      numberOfPositions: job.numberOfPositions,
      vacancies: job.numberOfPositions || 1,
      postedAt: job.createdAt,
      jobType: job.employmentType || "FULL_TIME",
      employmentType: job.employmentType || "FULL_TIME",
      experienceLevel: job.experienceLevel || "Not specified",
      skills: job.skills
        ? job.skills.split(",").map((skill) => skill.trim())
        : [],
      gender: job.gender,
      educationQualification: job.educationQualification,
      applicationCount: 0,
      isBookmarked: false,
      hasApplied: false,
      status: job.status,
    };

    // Get application count
    const applicationCount = await prisma.allocation.count({
      where: {
        adId: id,
      },
    });
    transformedJob.applicationCount = applicationCount;

    // Get bookmark and application status for this candidate
    const [bookmark, application] = await Promise.all([
      prisma.bookmark.findUnique({
        where: {
          candidateId_adId: {
            candidateId: candidate.id,
            adId: id,
          },
        },
      }),
      prisma.allocation.findFirst({
        where: {
          candidateId: candidate.id,
          adId: id,
        },
      }),
    ]);

    transformedJob = {
      ...transformedJob,
      isBookmarked: !!bookmark,
      applicationStatus: application?.status || null,
      hasApplied: !!application,
    };

    res.json(createResponse("Job retrieved successfully", transformedJob));
  } catch (error) {
    next(error);
  }
});

// Get single job by ID (public endpoint) - MUST be after /jobs/search
router.get("/jobs/:id", optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.ad.findFirst({
      where: {
        id,
        status: "APPROVED",
        isActive: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            industry: true,
            description: true,
            website: true,
            size: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            state: true,
          },
        },
        employer: {
          select: {
            isVerified: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json(createErrorResponse("Job not found", 404));
    }

    // Transform job for frontend with proper type conversion
    const salaryMin = job.salaryMin ? Number(job.salaryMin) : null;
    const salaryMax = job.salaryMax ? Number(job.salaryMax) : null;

    let transformedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      company: {
        id: job.company?.id,
        name: job.company?.name || "Company Name",
        logo: job.company?.logo,
        industry: job.company?.industry,
        description: job.company?.description,
        website: job.company?.website,
        size: job.company?.size,
        location: job.company?.location,
      },
      location: job.location
        ? {
            id: job.location.id,
            name: job.location.name,
            state: job.location.state,
          }
        : null,
      locationName: job.location?.name,
      locationState: job.location?.state,
      salary:
        salaryMin && salaryMax
          ? `₹${salaryMin} - ₹${salaryMax}`
          : salaryMin
            ? `₹${salaryMin}+`
            : "Negotiable",
      salaryMin: salaryMin,
      salaryMax: salaryMax,
      numberOfPositions: job.numberOfPositions,
      vacancies: job.numberOfPositions || 1,
      postedAt: job.createdAt,
      jobType: job.employmentType || "FULL_TIME",
      employmentType: job.employmentType || "FULL_TIME",
      experienceLevel: job.experienceLevel || "Not specified",
      skills: job.skills
        ? job.skills.split(",").map((skill) => skill.trim())
        : [],
      gender: job.gender,
      educationQualification: job.educationQualification,
      applicationCount: 0, // Will be updated with real count
      isBookmarked: false,
      hasApplied: false,
      status: job.status,
    };

    // Get application count for all users
    const applicationCount = await prisma.allocation.count({
      where: {
        adId: id,
      },
    });
    transformedJob.applicationCount = applicationCount;

    // Add bookmark status and application status if user is authenticated
    if (req.user && req.user.role === "CANDIDATE") {
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (candidate) {
        console.log(
          `Checking status for candidate ${candidate.id} on job ${id}`,
        );

        const [bookmark, application] = await Promise.all([
          prisma.bookmark.findUnique({
            where: {
              candidateId_adId: {
                candidateId: candidate.id,
                adId: id,
              },
            },
          }),
          prisma.allocation.findFirst({
            where: {
              candidateId: candidate.id,
              adId: id,
            },
          }),
        ]);

        console.log(
          `Bookmark found: ${!!bookmark}, Application found: ${!!application}`,
        );

        transformedJob = {
          ...transformedJob,
          isBookmarked: !!bookmark,
          applicationStatus: application?.status || null,
          hasApplied: !!application,
        };
      }
    }

    res.json(createResponse("Job retrieved successfully", transformedJob));
  } catch (error) {
    next(error);
  }
});

// Get job preview by ID (for DRAFT and PENDING_APPROVAL jobs) - MUST be after /jobs/search
router.get("/jobs/:id/preview", optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.ad.findFirst({
      where: {
        id,
        status: {
          in: ["DRAFT", "PENDING_APPROVAL"],
        },
        isActive: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            industry: true,
            description: true,
            website: true,
            size: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            state: true,
          },
        },
        employer: {
          select: {
            isVerified: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        educationQualification: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!job) {
      return res
        .status(404)
        .json(
          createErrorResponse(
            "Job not found or not available for preview",
            404,
          ),
        );
    }

    // Transform job for frontend (same structure as approved jobs)
    let transformedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      status: job.status,
      company: {
        id: job.company?.id,
        name: job.company?.name || "Company Name",
        logo: job.company?.logo,
        industry: job.company?.industry,
        description: job.company?.description,
        website: job.company?.website,
        size: job.company?.size,
        location: job.company?.location,
      },
      location: job.location
        ? `${job.location.name}, ${job.location.state}`
        : "Remote",
      salary: job.categorySpecificFields?.salaryRange
        ? `₹${job.categorySpecificFields.salaryRange.min} - ₹${job.categorySpecificFields.salaryRange.max}`
        : "Negotiable",
      categorySpecificFields: job.categorySpecificFields,
      vacancies: job.numberOfPositions || 1,
      postedAt: job.createdAt,
      updatedAt: job.updatedAt,
      jobType: job.categorySpecificFields?.employmentType || "FULL_TIME",
      experienceLevel: job.categorySpecificFields?.experienceLevel,
      skills: job.categorySpecificFields?.skills || [],
      category: job.category,
      educationQualification: job.educationQualification,
      gender: job.gender,
      applicationCount: 0, // Preview jobs don't show application counts
      isBookmarked: false, // Preview jobs can't be bookmarked
      hasApplied: false, // Preview jobs can't be applied to
    };

    res.json(
      createResponse("Job preview retrieved successfully", transformedJob),
    );
  } catch (error) {
    next(error);
  }
});

// Get testimonials/reviews (mock data for now)
router.get("/testimonials", async (req, res, next) => {
  try {
    const testimonials = [
      {
        id: 1,
        name: "Rajesh Kumar",
        role: "Software Engineer",
        avatar: "👨‍💻",
        rating: 5,
        review:
          "LokalHunt helped me find my dream job in my hometown. The local focus made all the difference in connecting with the right opportunities.",
      },
      {
        id: 2,
        name: "Priya Sharma",
        role: "Marketing Manager",
        avatar: "👩‍💼",
        rating: 5,
        review:
          "LokalHunt simplifies the hiring journey with smart filters, real-time updates, and personalized recommendations. It saves time and connects with meaningful opportunities.",
      },
      {
        id: 3,
        name: "Arjun Reddy",
        role: "Business Owner",
        avatar: "👨‍💼",
        rating: 5,
        review:
          "LokalHunt offers a streamlined platform for job seekers and employers. Its intuitive interface, quick application process, and reliable listings make job searching efficient and effective.",
      },
    ];

    res.json(
      createResponse("Testimonials retrieved successfully", testimonials),
    );
  } catch (error) {
    next(error);
  }
});

// =======================
// PUBLIC COMPANY DATA
// =======================

// Get companies with filtering and pagination
router.get("/companies", async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      industry,
      size,
      location,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let where = {
      isActive: true,
    };

    // Add search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Industry filter
    if (industry && industry !== "") {
      where.industry = { contains: industry, mode: "insensitive" };
    }

    // Size filter
    if (size && size !== "") {
      where.size = size;
    }

    // Location filter
    if (location && location !== "") {
      where.city = {
        name: { contains: location, mode: "insensitive" },
      };
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          city: {
            select: {
              id: true,
              name: true,
              state: true,
            },
          },
          _count: {
            select: {
              ads: {
                where: {
                  status: "APPROVED",
                  isActive: true,
                },
              },
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
      }),
      prisma.company.count({ where }),
    ]);

    // Transform companies for frontend
    const transformedCompanies = companies.map((company) => ({
      id: company.id,
      name: company.name,
      description: company.description,
      industry: company.industry,
      size: company.size,
      logo: company.logo,
      website: company.website,
      city: company.city,
      openJobs: company._count.ads,
      createdAt: company.createdAt,
    }));

    const response = {
      companies: transformedCompanies,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    };

    res.json(createResponse("Companies retrieved successfully", response));
  } catch (error) {
    next(error);
  }
});

// =======================
// PUBLIC CANDIDATE DATA
// =======================

// Get public candidate profile
router.get("/candidates/:candidateId/profile", async (req, res, next) => {
  try {
    const { candidateId } = req.params;

    // Get candidate profile with user information
    const candidate = await prisma.candidate.findUnique({
      where: {
        id: candidateId,
        // Only show profiles that are marked as public (you might want to add this field)
        // For now, we'll show all profiles - you can add privacy settings later
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!candidate) {
      return res
        .status(404)
        .json(createErrorResponse("Candidate profile not found", 404));
    }

    // Transform candidate data for public view (remove sensitive information)
    const publicProfile = {
      id: candidate.id,
      firstName: candidate.firstName || candidate.user?.firstName,
      lastName: candidate.lastName || candidate.user?.lastName,
      profilePhoto: candidate.profilePhoto,
      coverPhoto: candidate.coverPhoto,
      user: {
        name: candidate.user?.name,
        email: candidate.user?.email, // You might want to hide this for privacy
        firstName: candidate.user?.firstName,
        lastName: candidate.user?.lastName,
      },
      profileData: candidate.profileData,
      experience: candidate.experience,
      education: candidate.education,
      skills: candidate.skills,
      ratings: candidate.ratings,
      jobPreferences: candidate.jobPreferences,
      location: candidate.location,
      phone: candidate.phone,
      headline: candidate.headline,
      currentJobTitle: candidate.currentJobTitle,
      summary: candidate.summary,
    };

    res.json(
      createResponse("Candidate profile retrieved successfully", publicProfile),
    );
  } catch (error) {
    console.error("Error getting public candidate profile:", error);
    next(error);
  }
});

const { ObjectStorageService } = require("../objectStorage");

// Serve profile images
router.get("/images/profiles/:userId/:fileName", async (req, res) => {
  try {
    const { userId, fileName } = req.params;
    const filePath = `profiles/${userId}/${fileName}`;

    const objectStorageService = new ObjectStorageService();
    const file = objectStorageService.bucket.file(filePath);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Get file metadata for proper content type
    const [metadata] = await file.getMetadata();

    // Set appropriate headers
    res.set({
      "Content-Type": metadata.contentType || "image/jpeg",
      "Cache-Control": "public, max-age=86400", // Cache for 1 day
      "Content-Length": metadata.size,
    });

    // Stream the file
    const stream = file.createReadStream();

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error streaming file" });
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error("Error serving profile image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve cover images
router.get("/images/covers/:userId/:fileName", async (req, res) => {
  try {
    const { userId, fileName } = req.params;
    const filePath = `covers/${userId}/${fileName}`;

    const objectStorageService = new ObjectStorageService();
    const file = objectStorageService.bucket.file(filePath);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Get file metadata for proper content type
    const [metadata] = await file.getMetadata();

    // Set appropriate headers
    res.set({
      "Content-Type": metadata.contentType || "image/jpeg",
      "Cache-Control": "public, max-age=86400", // Cache for 1 day
      "Content-Length": metadata.size,
    });

    // Stream the file
    const stream = file.createReadStream();

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error streaming file" });
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error("Error serving cover image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve resume files
router.get("/files/resumes/:userId/:fileName", async (req, res) => {
  try {
    const { userId, fileName } = req.params;
    const filePath = `resumes/${userId}/${fileName}`;

    const objectStorageService = new ObjectStorageService();
    const file = objectStorageService.bucket.file(filePath);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Get file metadata
    const [metadata] = await file.getMetadata();

    // Set appropriate headers for PDF download
    res.set({
      "Content-Type": metadata.contentType || "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "private, max-age=3600", // Cache for 1 hour, private for resumes
      "Content-Length": metadata.size,
    });

    // Stream the file
    const stream = file.createReadStream();

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error streaming file" });
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error("Error serving resume:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get skills
router.get("/skills", async (req, res, next) => {
  try {
    const { category } = req.query;

    const where = {
      ...(category && { category }),
    };

    const skills = await prisma.skill.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
      },
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
    });

    res.json(
      createResponse(
        "Skills retrieved successfully",
        skills,
      ),
    );
  } catch (error) {
    console.error("Error fetching skills:", error);
    next(error);
  }
});

// Get skills
  getSkills: async (category = null) => {
    const url = category
      ? `${API_BASE_URL}/public/skills?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/public/skills`;
    const response = await fetch(url);
    return handleResponse(response);
  },

module.exports = router;