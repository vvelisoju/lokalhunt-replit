const { createResponse, createErrorResponse } = require("../utils/response");
const notificationController = require("./notificationController");

class EmployerController {
  // Helper method to get employer - supports both regular access and admin view
  async getEmployer(req) {
    let employer;

    console.log(
      `[CONTROLLER DEBUG] getEmployer called - UserRole: ${req.user.role}, TargetEmployerId: ${req.targetEmployerId}, IsAdminAccess: ${req.isAdminAccess}`,
    );

    // For admin access (Branch Admin viewing employer data)
    if (req.isAdminAccess && req.targetEmployerId) {
      console.log(
        `[CONTROLLER DEBUG] Getting employer by ID: ${req.targetEmployerId}`,
      );
      employer = await req.prisma.employer.findUnique({
        where: { id: req.targetEmployerId },
      });
    } else if (req.user.role === "EMPLOYER") {
      // Regular employer access
      console.log(
        `[CONTROLLER DEBUG] Getting employer by userId: ${req.user.userId}`,
      );
      employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId },
      });
    } else if (req.user.role === "BRANCH_ADMIN" && req.targetEmployerId) {
      // Branch Admin with employerId in request
      console.log(
        `[CONTROLLER DEBUG] Branch Admin getting employer by ID: ${req.targetEmployerId}`,
      );
      employer = await req.prisma.employer.findUnique({
        where: { id: req.targetEmployerId },
      });
    }

    console.log(
      `[CONTROLLER DEBUG] Found employer: ${employer ? employer.id : "null"}`,
    );
    return employer;
  }
  // =======================
  // DASHBOARD STATS
  // =======================

  // Get dashboard statistics (NEW)
  async getDashboardStats(req, res, next) {
    try {
      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      // Get all ads for this employer
      const allAds = await req.prisma.ad.findMany({
        where: { employerId: employer.id },
        include: {
          _count: {
            select: {
              allocations: true,
            },
          },
        },
      });

      // Get job views count for all employer's ads
      const jobViews = await req.prisma.jobView.count({
        where: {
          ad: {
            employerId: employer.id,
          },
        },
      });

      // Get bookmarked candidates count
      const bookmarkedCandidates = await req.prisma.employerBookmark.count({
        where: { employerId: employer.id },
      });

      // Calculate stats
      const stats = {
        totalAds: allAds.length,
        draft: allAds.filter((ad) => ad.status === "DRAFT").length,
        pendingApproval: allAds.filter((ad) => ad.status === "PENDING_APPROVAL")
          .length,
        approved: allAds.filter((ad) => ad.status === "APPROVED").length,
        archived: allAds.filter((ad) => ad.status === "CLOSED").length,
        jobViews: jobViews,
        allocatedCandidates: allAds.reduce(
          (sum, ad) => sum + (ad._count?.allocations || 0),
          0,
        ),
        bookmarkedCandidates: bookmarkedCandidates,
      };

      res.json(createResponse("Dashboard stats retrieved successfully", stats));
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // PROFILE MANAGEMENT
  // =======================

  // Get employer profile (NEW)
  async getProfile(req, res, next) {
    try {
      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      const employerWithUser = await req.prisma.employer.findUnique({
        where: { id: employer.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              cityId: true,
              isActive: true,
              createdAt: true,
            },
          },
          companies: {
            where: { isActive: true },
            include: {
              city: true,
            },
            orderBy: { createdAt: "desc" },
          },
          mous: {
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });

      // Get counts separately to avoid SelectionSetOnScalar error
      const [companiesCount, adsCount, mousCount] = await Promise.all([
        req.prisma.company.count({
          where: { employerId: employerWithUser.id, isActive: true },
        }),
        req.prisma.ad.count({
          where: { employerId: employerWithUser.id },
        }),
        req.prisma.mOU.count({
          where: { employerId: employerWithUser.id, isActive: true },
        }),
      ]);

      // Get ads count for each company
      const companiesWithAdCount = await Promise.all(
        employerWithUser.companies.map(async (company) => {
          const adCount = await req.prisma.ad.count({
            where: { companyId: company.id },
          });
          return {
            ...company,
            adsCount: adCount,
          };
        }),
      );

      // Calculate profile completeness
      const profileFields = [
        employerWithUser.contactDetails,
        employerWithUser.user.phone,
        companiesCount > 0,
      ];
      const completedFields = profileFields.filter((field) => field).length;
      const profileCompleteness = Math.round(
        (completedFields / profileFields.length) * 100,
      );

      const profileData = {
        ...employerWithUser,
        companies: companiesWithAdCount,
        _count: {
          companies: companiesCount,
          ads: adsCount,
          mous: mousCount,
        },
        profileCompleteness,
        hasActiveCompanies: companiesCount > 0,
        hasActiveMOU: mousCount > 0,
      };

      res.json(createResponse("Profile retrieved successfully", profileData));
    } catch (error) {
      next(error);
    }
  }

  // Update employer profile
  async updateProfile(req, res, next) {
    try {
      const { contactDetails } = req.body;

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      const updatedEmployer = await req.prisma.employer.update({
        where: { userId: req.user.userId },
        data: { contactDetails },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              cityId: true,
            },
          },
          companies: true,
          mous: {
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      res.json(createResponse("Profile updated successfully", updatedEmployer));
    } catch (error) {
      next(error);
    }
  }

  // Create company
  async createCompany(req, res, next) {
    try {
      const {
        name,
        description,
        city,
        cityId,
        logo,
        website,
        industry,
        size,
        isDefault = false,
      } = req.body;

      if (!name || (!cityId && !city)) {
        return res
          .status(400)
          .json(createErrorResponse("Company name and city are required", 400));
      }

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      // Get employer with user data for notifications
      const employerWithUser = await req.prisma.employer.findUnique({
        where: { id: employer.id },
        include: { user: true },
      });

      // If this is a new employer registration, send a notification
      if (!employerWithUser.user.employerId) {
        // Assuming user.employerId is null for new employers
        await notificationController.sendEmployerRegistrationNotification(
          employerWithUser.user.id,
          employerWithUser.user.name,
          employerWithUser.user.email,
        );
      }

      // If city name is provided instead of cityId, find the city
      let resolvedCityId = cityId;
      if (!cityId && city) {
        const foundCity = await req.prisma.city.findFirst({
          where: {
            name: { contains: city, mode: "insensitive" },
          },
        });

        if (!foundCity) {
          return res
            .status(400)
            .json(
              createErrorResponse(
                "City not found. Please select a valid city.",
                400,
              ),
            );
        }
        resolvedCityId = foundCity.id;
      }

      // Check if this is the first company for the employer
      const existingCompaniesCount = await req.prisma.company.count({
        where: {
          employerId: employer.id,
          isActive: true,
        },
      });

      // If this is the first company, make it default automatically
      const shouldBeDefault = existingCompaniesCount === 0 || isDefault;

      // If setting as default, update other companies to not be default
      if (shouldBeDefault) {
        await req.prisma.company.updateMany({
          where: {
            employerId: employer.id,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      const company = await req.prisma.company.create({
        data: {
          employerId: employer.id,
          name,
          description,
          cityId: resolvedCityId,
          logo,
          website,
          industry,
          size,
          isDefault: shouldBeDefault,
        },
        include: {
          city: true,
        },
      });

      res
        .status(201)
        .json(createResponse("Company created successfully", company));
    } catch (error) {
      next(error);
    }
  }

  // Get companies
  async getCompanies(req, res, next) {
    try {
      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      const companies = await req.prisma.company.findMany({
        where: {
          employerId: employer.id,
          isActive: true,
        },
        include: {
          city: true,
          ads: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json(createResponse("Companies retrieved successfully", companies));
    } catch (error) {
      next(error);
    }
  }

  // Update company
  async updateCompany(req, res, next) {
    try {
      const { companyId } = req.params;
      const {
        name,
        description,
        cityId,
        logo,
        website,
        industry,
        size,
        isDefault,
      } = req.body;

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      // Verify company ownership
      const company = await req.prisma.company.findFirst({
        where: {
          id: companyId,
          employerId: employer.id,
        },
      });

      if (!company) {
        return res
          .status(404)
          .json(createErrorResponse("Company not found", 404));
      }

      // If setting as default, update other companies to not be default
      if (isDefault === true) {
        await req.prisma.company.updateMany({
          where: {
            employerId: employer.id,
            id: { not: companyId },
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      // Ensure at least one company is default
      if (isDefault === false && company.isDefault) {
        const otherCompanies = await req.prisma.company.findMany({
          where: {
            employerId: employer.id,
            id: { not: companyId },
            isActive: true,
          },
          orderBy: { createdAt: "asc" },
          take: 1,
        });

        if (otherCompanies.length > 0) {
          await req.prisma.company.update({
            where: { id: otherCompanies[0].id },
            data: { isDefault: true },
          });
        }
      }

      const updatedCompany = await req.prisma.company.update({
        where: { id: companyId },
        data: {
          name,
          description,
          cityId,
          logo,
          website,
          industry,
          size,
          ...(isDefault !== undefined && { isDefault }),
        },
        include: {
          city: true,
        },
      });

      res.json(createResponse("Company updated successfully", updatedCompany));
    } catch (error) {
      next(error);
    }
  }

  // Create ad posting
  async createAd(req, res, next) {
    try {
      const {
        employerId, // For Branch Admin usage
        companyId,
        categoryName,
        categoryId,
        title,
        description,
        gender,
        educationQualificationId,
        skills,
        salaryMin,
        salaryMax,
        experienceLevel,
        employmentType,
        contactInfo,
        validUntil,
        status = "DRAFT",
      } = req.body;

      if (!companyId || !categoryName || !title || !description) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Company, category, title, and description are required",
              400,
            ),
          );
      }

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      // Get employer with user data for notifications
      const employerWithUser = await req.prisma.employer.findUnique({
        where: { id: employer.id },
        include: { user: true },
      });

      // Verify company ownership and get location
      const company = await req.prisma.company.findFirst({
        where: {
          id: companyId,
          employerId: employer.id,
        },
        include: {
          city: true,
        },
      });

      if (!company) {
        return res
          .status(404)
          .json(createErrorResponse("Company not found", 404));
      }

      // Get locationId from company
      const locationId = company.cityId;

      // Check if employer has active MOU (allow creation but warn)
      const activeMOU = await req.prisma.mOU.findFirst({
        where: {
          employerId: employer.id,
          isActive: true,
        },
      });

      const ad = await req.prisma.ad.create({
        data: {
          employerId: employer.id,
          companyId,
          categoryName,
          title,
          description,
          locationId,
          gender,
          skills,
          salaryMin: salaryMin ? parseFloat(salaryMin) : null,
          salaryMax: salaryMax ? parseFloat(salaryMax) : null,
          experienceLevel,
          employmentType,
          contactInfo,
          validUntil: validUntil ? new Date(validUntil) : undefined,
          status: status, // Use status from request (DRAFT or PENDING_APPROVAL)
          ...(categoryId && { categoryId }),
          ...(educationQualificationId && { educationQualificationId }),
        },
        include: {
          company: true,
          location: true,
          category: true,
          educationQualification: true,
        },
      });

      // If status is PENDING_APPROVAL, trigger notification
      if (status === "PENDING_APPROVAL") {
        await notificationController.sendAdApprovalNotification(
          employerWithUser.user.id,
          employerWithUser.user.name,
          employerWithUser.user.email,
          ad.id,
          ad.title,
        );
      }

      // Return different messages based on MOU status
      if (!activeMOU) {
        res
          .status(201)
          .json(
            createResponse(
              "Ad created successfully as draft. Note: Active MOU required for final approval by Branch Admin.",
              { ...ad, mouWarning: true },
            ),
          );
      } else {
        res
          .status(201)
          .json(
            createResponse("Ad created successfully and sent for approval", ad),
          );
      }
    } catch (error) {
      next(error);
    }
  }

  // Update ad
  async updateAd(req, res, next) {
    try {
      const { adId } = req.params;
      const {
        companyId,
        categoryName,
        categoryId,
        title,
        description,
        gender,
        educationQualificationId,
        skills,
        salaryMin,
        salaryMax,
        experienceLevel,
        employmentType,
        contactInfo,
        validUntil,
        status,
      } = req.body;

      // Validate required fields
      if (!title || !description || !companyId) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Title, description, and company are required",
              400,
            ),
          );
      }

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      // Check if ad exists and belongs to employer
      const existingAd = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          employerId: employer.id,
        },
      });

      if (!existingAd) {
        return res.status(404).json(createErrorResponse("Ad not found", 404));
      }

      // Get employer with user data for notifications
      const employerWithUser = await req.prisma.employer.findUnique({
        where: { id: employer.id },
        include: { user: true },
      });

      // Verify company ownership and get location
      const company = await req.prisma.company.findFirst({
        where: {
          id: companyId,
          employerId: employer.id,
        },
        include: {
          city: true,
        },
      });

      if (!company) {
        return res
          .status(404)
          .json(createErrorResponse("Company not found", 404));
      }

      // Get locationId from company
      const locationId = company.cityId;

      // Update the ad
      const updatedAd = await req.prisma.ad.update({
        where: { id: adId },
        data: {
          title,
          description,
          categoryName,
          gender,
          skills: skills
            ? skills
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
                .join(", ")
            : null,
          salaryMin: salaryMin ? parseFloat(salaryMin) : null,
          salaryMax: salaryMax ? parseFloat(salaryMax) : null,
          experienceLevel,
          employmentType,
          validUntil: validUntil ? new Date(validUntil) : undefined,
          updatedAt: new Date(),
          ...(companyId && {
            company: {
              connect: { id: companyId },
            },
          }),
          location: {
            connect: { id: locationId },
          },
          ...(categoryId && {
            category: {
              connect: { id: categoryId },
            },
          }),
          ...(educationQualificationId && {
            educationQualification: {
              connect: { id: educationQualificationId },
            },
          }),
        },
        include: {
          company: true,
          location: true,
          category: true,
          educationQualification: true,
        },
      });

      // If the ad status was changed to PENDING_APPROVAL, trigger notification
      if (
        updatedAd.status === "PENDING_APPROVAL" &&
        existingAd.status !== "PENDING_APPROVAL"
      ) {
        await notificationController.sendAdApprovalNotification(
          employerWithUser.user.id,
          employerWithUser.user.name,
          employerWithUser.user.email,
          updatedAd.id,
          updatedAd.title,
        );
      }

      res.json(createResponse("Ad updated successfully", updatedAd));
    } catch (error) {
      next(error);
    }
  }

  // Get ads
  async getAds(req, res, next) {
    try {
      const { page = 1, limit = 10, status, categoryName, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      let where = {};

      // Get employer for the request
      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      // Build where condition based on employer
      where = {
        employerId: employer.id,
        ...(categoryName && { categoryName }),
        ...(search &&
          search.trim() && {
            OR: [
              { title: { contains: search.trim(), mode: "insensitive" } },
              { description: { contains: search.trim(), mode: "insensitive" } },
              {
                company: {
                  name: { contains: search.trim(), mode: "insensitive" },
                },
              },
              {
                location: {
                  name: { contains: search.trim(), mode: "insensitive" },
                },
              },
            ],
          }),
      };

      // Add status filter only if a specific status is provided and it's not "ALL" or empty
      // Handle both string and potential object cases
      let statusValue = status;
      if (typeof status === "object" && status !== null) {
        statusValue = status.value || status.toString();
      }

      if (
        statusValue &&
        typeof statusValue === "string" &&
        statusValue.trim() &&
        statusValue !== "ALL" &&
        statusValue !== "[object Object]"
      ) {
        where.status = statusValue.trim();
      }

      const [ads, total] = await Promise.all([
        req.prisma.ad.findMany({
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
                bookmarks: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        req.prisma.ad.count({ where }),
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      };

      res.json(createResponse("Ads retrieved successfully", ads, pagination));
    } catch (error) {
      console.error("Error in getAds:", error);
      return res
        .status(500)
        .json(
          createResponse(false, "Failed to fetch ads", null, "INTERNAL_ERROR"),
        );
    }
  }

  // Get single ad by ID (NEW)
  async getAdById(req, res, next) {
    try {
      const { adId } = req.params;

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      const ad = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          employerId: employer.id,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              description: true,
              industry: true,
              size: true,
              website: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              state: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          educationQualification: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          employer: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  phone: true,
                },
              },
            },
          },
          _count: {
            select: {
              allocations: true,
              bookmarks: true,
            },
          },
        },
      });

      if (!ad) {
        return res.status(404).json(createErrorResponse("Ad not found", 404));
      }

      res.json(createResponse("Ad retrieved successfully", ad));
    } catch (error) {
      next(error);
    }
  }

  // Get allocated candidates for an ad
  async getAllocatedCandidates(req, res, next) {
    try {
      const { adId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      // Verify ad ownership
      const ad = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          employerId: employer.id,
        },
      });

      if (!ad) {
        return res.status(404).json(createErrorResponse("Ad not found", 404));
      }

      const [allocations, total] = await Promise.all([
        req.prisma.allocation.findMany({
          where: {
            adId: adId,
            status: { in: ["HIRED", "SHORTLISTED", "HIRED", "REJECTED"] },
          },
          skip,
          take: parseInt(limit),
          include: {
            candidate: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                    cityId: true,
                  },
                },
              },
            },
          },
          orderBy: { allocatedAt: "desc" },
        }),
        req.prisma.allocation.count({
          where: {
            adId: adId,
            status: { in: ["APPLIED", "SHORTLISTED", "HIRED", "REJECTED"] },
          },
        }),
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      };

      res.json(
        createResponse(
          "Allocated candidates retrieved successfully",
          allocations,
          pagination,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  // Update candidate status
  async updateCandidateStatus(req, res, next) {
    try {
      const { allocationId } = req.params;
      const { status, notes } = req.body;

      const validStatuses = [
        "APPLIED",
        "SHORTLISTED",
        "INTERVIEW_SCHEDULED",
        "INTERVIEW_COMPLETED",
        "HIRED",
        "HOLD",
        "REJECTED",
      ];

      if (!status || !validStatuses.includes(status)) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              `Valid status is required. Allowed values: ${validStatuses.join(", ")}`,
              400,
            ),
          );
      }

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      // Verify allocation ownership - allow updating from various states
      const allocation = await req.prisma.allocation.findFirst({
        where: {
          id: allocationId,
          employerId: employer.id,
        },
        include: {
          candidate: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          ad: {
            select: {
              title: true,
              company: {
                select: { name: true },
              },
            },
          },
        },
      });

      if (!allocation) {
        return res
          .status(404)
          .json(
            createErrorResponse(
              `Allocation with ID ${allocationId} not found or you don't have permission to update it`,
              404,
            ),
          );
      }

      // Allow any status transition - employers can update to any status
      const currentStatus = allocation.status;

      console.log(
        `[STATUS UPDATE] Updating allocation ${allocationId} from ${currentStatus} to ${status}`,
      );

      const updatedAllocation = await req.prisma.allocation.update({
        where: { id: allocationId },
        data: {
          status,
          notes: notes || allocation.notes, // Keep existing notes if new ones not provided
          updatedAt: new Date(),
        },
        include: {
          candidate: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          ad: {
            select: {
              title: true,
              company: {
                select: { name: true },
              },
            },
          },
        },
      });

      // Send application status notification to candidate
      try {
        await notificationController.sendApplicationStatusNotification(
          allocation.candidate.user.id,
          employer.id,
          allocation.adId,
          status,
          allocation.ad.title,
          allocation.ad.company.name,
        );
      } catch (notificationError) {
        console.error(
          "Failed to send application status notification:",
          notificationError,
        );
        // Don't fail the status update if notification fails
      }

      res.json(
        createResponse(
          `Candidate status updated successfully from ${currentStatus} to ${status}`,
          updatedAllocation,
        ),
      );
    } catch (error) {
      console.error("Error updating candidate status:", error);
      next(error);
    }
  }

  // =======================
  // COMPANY MANAGEMENT (NEW METHODS)
  // =======================

  // Get specific company details (NEW)
  async getCompany(req, res, next) {
    try {
      const { companyId } = req.params;

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      const company = await req.prisma.company.findFirst({
        where: {
          id: companyId,
          employerId: employer.id,
          isActive: true,
        },
        include: {
          city: true,
          ads: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
              _count: {
                select: { allocations: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              ads: true,
            },
          },
        },
      });

      if (!company) {
        return res
          .status(404)
          .json(createErrorResponse("Company not found", 404));
      }

      res.json(
        createResponse("Company details retrieved successfully", company),
      );
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // AD MANAGEMENT (NEW METHODS)
  // =======================

  // Get specific ad details (NEW)
  async getAd(req, res, next) {
    try {
      const { adId } = req.params;

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      const ad = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          employerId: employer.id,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              industry: true,
              size: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              state: true,
              country: true,
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

      if (!ad) {
        return res.status(404).json(createErrorResponse("Ad not found", 404));
      }

      // Process category-specific fields for frontend compatibility
      let processedAd = { ...ad };
      if (ad.categorySpecificFields && ad.categoryName === "Jobs") {
        const categoryFields = ad.categorySpecificFields;
        processedAd = {
          ...ad,
          jobType: categoryFields.employmentType || "Full Time",
          employmentType: categoryFields.employmentType,
          experienceLevel: categoryFields.experienceLevel,
          skills: Array.isArray(categoryFields.skills)
            ? categoryFields.skills.join(", ")
            : "",
          salaryMin: categoryFields.salaryMin,
          salaryMax: categoryFields.salaryMax,
        };
      }

      res.json(
        createResponse("Ad details retrieved successfully", processedAd),
      );
    } catch (error) {
      next(error);
    }
  }

  // Submit ad for approval (NEW)
  async submitForApproval(req, res, next) {
    try {
      const { adId } = req.params;

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      // Check if ad exists and belongs to employer
      const existingAd = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          employerId: employer.id,
          status: "DRAFT",
        },
      });

      if (!existingAd) {
        return res.status(404).json(createErrorResponse("Ad not found", 404));
      }

      // Get employer with user data for notifications
      const employerWithUser = await req.prisma.employer.findUnique({
        where: { id: employer.id },
        include: { user: true },
      });

      // Update the ad status to PENDING_APPROVAL
      const submittedAd = await req.prisma.ad.update({
        where: { id: adId },
        data: {
          status: "PENDING_APPROVAL",
          updatedAt: new Date(),
        },
        include: {
          company: true,
          location: true,
        },
      });

      // Send notification to branch admin
      await notificationController.sendAdApprovalNotification(
        employerWithUser.user.id,
        employerWithUser.user.name,
        employerWithUser.user.email,
        submittedAd.id,
        submittedAd.title,
      );

      res.json(
        createResponse("Ad submitted for approval successfully", submittedAd),
      );
    } catch (error) {
      next(error);
    }
  }

  // Archive ad (NEW)
  async archiveAd(req, res, next) {
    try {
      const { adId } = req.params;

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      // Verify ad ownership
      const adToArchive = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          employerId: employer.id,
          status: "APPROVED",
        },
      });

      if (!adToArchive) {
        return res.status(404).json(createErrorResponse("Ad not found", 404));
      }

      // Update ad status to CLOSED
      const archivedAd = await req.prisma.ad.update({
        where: { id: adId },
        data: {
          status: "CLOSED",
          updatedAt: new Date(),
        },
        include: {
          company: true,
          location: true,
        },
      });

      if (archivedAd.status === "CLOSED") {
        // Send job closed notifications to applied candidates
        try {
          await notificationController.sendJobClosedNotifications(
            adId,
            archivedAd.title,
            archivedAd.company.name,
          );
        } catch (notificationError) {
          console.error(
            "Failed to send job closed notifications:",
            notificationError,
          );
          // Don't fail the deactivation process if notification fails
        }
      }

      res
        .status(200)
        .json(createResponse("Ad closed successfully", archivedAd));
    } catch (error) {
      next(error);
    }
  }

  // Reopen ad (NEW)
  async reopenAd(req, res, next) {
    try {
      const { adId } = req.params;

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      // Verify ad ownership and that it's closed
      const adToReopen = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          employerId: employer.id,
          status: "CLOSED",
        },
      });

      if (!adToReopen) {
        return res
          .status(404)
          .json(createErrorResponse("Closed ad not found", 404));
      }

      // Update ad status back to APPROVED (since it was already approved before closing)
      const reopenedAd = await req.prisma.ad.update({
        where: { id: adId },
        data: {
          status: "APPROVED",
          updatedAt: new Date(),
        },
        include: {
          company: true,
          location: true,
        },
      });

      res
        .status(200)
        .json(createResponse("Ad reopened successfully", reopenedAd));
    } catch (error) {
      next(error);
    }
  }

  // Deactivate ad
  async deactivateAd(req, res, next) {
    try {
      const { adId } = req.params;

      // Find the ad and ensure it belongs to the employer
      const ad = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          employerId: req.user.employerId,
        },
        include: {
          company: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!ad) {
        return res.status(404).json(createErrorResponse("Ad not found", 404));
      }

      // Update the ad to inactive
      const updatedAd = await req.prisma.ad.update({
        where: { id: adId },
        data: { isActive: false },
      });

      // Send job closed notifications to applied candidates
      try {
        await notificationController.sendJobClosedNotifications(
          adId,
          ad.title,
          ad.company.name,
        );
      } catch (notificationError) {
        console.error(
          "Failed to send job closed notifications:",
          notificationError,
        );
        // Don't fail the deactivation process if notification fails
      }

      res.json(createResponse("Ad deactivated successfully", updatedAd));
    } catch (error) {
      next(error);
    }
  }

  // Delete ad
  async deleteAd(req, res, next) {
    try {
      const { adId } = req.params;

      // Find the ad and ensure it belongs to the employer
      const ad = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          employerId: req.user.employerId,
        },
        include: {
          company: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!ad) {
        return res.status(404).json(createErrorResponse("Ad not found", 404));
      }

      // Send job closed notifications to applied candidates before deletion
      try {
        await notificationController.sendJobClosedNotifications(
          adId,
          ad.title,
          ad.company.name,
        );
      } catch (notificationError) {
        console.error(
          "Failed to send job closed notifications:",
          notificationError,
        );
        // Don't fail the deletion process if notification fails
      }

      // Delete all related data first
      await Promise.all([
        req.prisma.allocation.deleteMany({ where: { adId } }),
        req.prisma.bookmark.deleteMany({ where: { adId } }),
      ]);

      // Delete the ad
      await req.prisma.ad.delete({ where: { id: adId } });

      res.json(createResponse("Ad deleted successfully"));
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // MOU MANAGEMENT (NEW)
  // =======================

  // Get all MOU agreements (NEW)
  async getMOUs(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      let where = {};

      // Get employer using helper method
      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      where = {
        employerId: employer.id,
        ...(status && { isActive: status === "active" }),
      };

      const [mous, total] = await Promise.all([
        req.prisma.mOU.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: "desc" },
        }),
        req.prisma.mOU.count({ where }),
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      };

      res.json(createResponse("MOUs retrieved successfully", mous, pagination));
    } catch (error) {
      next(error);
    }
  }

  // Create/sign new MOU agreement (NEW)
  async createMOU(req, res, next) {
    try {
      const { branchAdminId, feeType, feeAmount, feePercentage, terms, notes } =
        req.body;

      if (!branchAdminId || !feeType || (!feeAmount && !feePercentage)) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Branch admin, fee type, and fee amount/percentage are required",
              400,
            ),
          );
      }

      if (!["FIXED", "PERCENTAGE"].includes(feeType)) {
        return res
          .status(400)
          .json(
            createErrorResponse("Fee type must be FIXED or PERCENTAGE", 400),
          );
      }

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      // Verify branch admin exists
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { id: branchAdminId },
        include: {
          user: {
            select: { city: true },
          },
        },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch admin not found", 404));
      }

      // Check for existing active MOU with same branch admin
      const existingMOU = await req.prisma.mOU.findFirst({
        where: {
          employerId: employer.id,
          branchAdminId: branchAdminId,
          isActive: true,
        },
      });

      if (existingMOU) {
        return res
          .status(409)
          .json(
            createErrorResponse(
              "Active MOU already exists with this branch admin",
              409,
            ),
          );
      }

      const mou = await req.prisma.mOU.create({
        data: {
          employerId: employer.id,
          branchAdminId,
          feeType,
          feeValue: feeType === "FIXED" ? feeAmount : feePercentage,
          terms,
          notes,
          signedAt: new Date(),
          status: "PENDING_APPROVAL",
          isActive: false,
        },
      });

      res
        .status(201)
        .json(
          createResponse("MOU created successfully and sent for approval", mou),
        );
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // CANDIDATE SEARCH & MANAGEMENT (NEW)
  // =======================

  // Get candidate profile for employers
  async getCandidateProfile(req, res, next) {
    try {
      const { candidateId } = req.params;

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      const candidate = await req.prisma.candidate.findUnique({
        where: { id: candidateId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              profileImage: true,
              createdAt: true,
              city: {
                select: { name: true, state: true },
              },
            },
          },
          allocations: {
            where: {
              ad: {
                employerId: employer.id,
              },
            },
            include: {
              ad: {
                select: { id: true, title: true },
              },
            },
          },
        },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate not found", 404));
      }

      // Check if employer has access to this candidate (through job applications)
      if (candidate.allocations.length === 0) {
        return res
          .status(403)
          .json(
            createErrorResponse(
              "Access denied - candidate has not applied to your jobs",
              403,
            ),
          );
      }

      res.json(
        createResponse("Candidate profile retrieved successfully", candidate),
      );
    } catch (error) {
      next(error);
    }
  }

  // Get all candidates allocated to this employer's ads or available candidates
  async getAllCandidates(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        skills,
        minRating,
        cityId,
      } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get employer to verify they exist
      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      // Build search criteria - only show candidates who applied to this employer's approved ads
      let where = {
        user: {
          isActive: true,
          ...(cityId && { cityId }),
        },
        // Only show candidates who have applied to this employer's approved ads
        allocations: {
          some: {
            employerId: employer.id,
            ad: {
              status: "APPROVED",
            },
          },
        },
      };

      // Add skills filter if provided
      if (skills) {
        const skillArray = skills.split(",").map((skill) => skill.trim());
        where.tags = {
          hasSome: skillArray,
        };
      }

      // Add rating filter if provided
      if (minRating) {
        where.overallRating = {
          gte: parseFloat(minRating).toString(),
        };
      }

      // Add search filter if provided
      if (search) {
        const searchTerms = search.split(" ").filter((term) => term.length > 0);
        where.OR = [
          {
            user: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            user: {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          // Search in skills/tags
          {
            tags: {
              hasSome: searchTerms,
            },
          },
        ];
      }

      const [allCandidates, total] = await Promise.all([
        req.prisma.candidate.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                cityId: true,
                city: {
                  select: {
                    id: true,
                    name: true,
                    state: true,
                  },
                },
              },
            },
            allocations: {
              where: {
                employerId: employer.id,
                ad: {
                  status: "APPROVED",
                },
              },
              include: {
                ad: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
            _count: {
              select: {
                allocations: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        req.prisma.candidate.count({ where }),
      ]);

      // Get employer bookmarks
      const bookmarks = await req.prisma.employerBookmark.findMany({
        where: { employerId: employer.id },
        select: { candidateId: true },
      });
      const bookmarkedCandidateIds = new Set(
        bookmarks.map((b) => b.candidateId),
      );

      // Ensure each candidate has required properties and proper structure
      const processedCandidates = allCandidates.map((candidate) => ({
        ...candidate,
        id:
          candidate.id ||
          candidate.candidateId ||
          Math.random().toString(36).substr(2, 9),
        user: candidate.user || {},
        name: candidate.name || candidate.user?.name || "Unknown",
        email: candidate.email || candidate.user?.email || "",
        skills: Array.isArray(candidate.skills)
          ? candidate.skills
          : typeof candidate.skills === "string"
            ? candidate.skills.split(",").map((s) => s.trim())
            : [],
        allocations: Array.isArray(candidate.allocations)
          ? candidate.allocations
          : [],
        experience:
          candidate.experience ||
          candidate.experienceYears ||
          candidate.totalExperience ||
          0,
        currentLocation: candidate.currentLocation || candidate.location || "",
        expectedSalary: candidate.expectedSalary || "",
        currentJobTitle: candidate.currentJobTitle || candidate.jobTitle || "",
        profile_data: candidate.profile_data || {},
        isPremium: Boolean(candidate.isPremium),
        isBookmarked: bookmarkedCandidateIds.has(candidate.id),
      }));

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      };

      res.json(
        createResponse(
          "Applied candidates retrieved successfully",
          { candidates: processedCandidates },
          pagination,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  // Search candidates by skills, city, and experience (NEW)
  async searchCandidates(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        skills,
        cityId,
        experienceLevel,
        minRating,
        excludeApplied = false,
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      // Build search criteria
      let where = {
        user: {
          isActive: true,
          ...(cityId && { cityId }),
        },
      };

      // Add skills filter if provided
      if (skills) {
        const skillArray = skills.split(",").map((skill) => skill.trim());
        where.tags = {
          hasSome: skillArray,
        };
      }

      // Add rating filter if provided
      if (minRating) {
        where.overallRating = {
          gte: parseFloat(minRating).toString(),
        };
      }

      // Exclude candidates who already applied to employer's jobs
      if (excludeApplied === "true") {
        where.allocations = {
          none: {
            employerId: employer.id,
          },
        };
      }

      const [candidates, total] = await Promise.all([
        req.prisma.candidate.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: {
                  select: {
                    name: true,
                    state: true,
                  },
                },
              },
            },
            _count: {
              select: {
                allocations: true,
              },
            },
          },
          orderBy: [{ overallRating: "desc" }, { updatedAt: "desc" }],
        }),
        req.prisma.candidate.count({ where }),
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      };

      res.json(
        createResponse(
          "Candidates retrieved successfully",
          candidates,
          pagination,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  // Bookmark a candidate (NEW)
  async bookmarkCandidate(req, res, next) {
    try {
      const { candidateId } = req.params;
      const { notes } = req.body;

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      // Verify candidate exists
      const candidate = await req.prisma.candidate.findUnique({
        where: { id: candidateId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              city: {
                select: {
                  name: true,
                  state: true,
                },
              },
            },
          },
        },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate not found", 404));
      }

      // Check if already bookmarked
      const existingBookmark = await req.prisma.employerBookmark.findUnique({
        where: {
          employerId_candidateId: {
            employerId: employer.id,
            candidateId: candidateId,
          },
        },
      });

      if (existingBookmark) {
        return res
          .status(409)
          .json(createErrorResponse("Candidate already bookmarked", 409));
      }

      const bookmark = await req.prisma.employerBookmark.create({
        data: {
          employerId: employer.id,
          candidateId,
          notes,
        },
        include: {
          candidate: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  city: {
                    select: { name: true, state: true },
                  },
                },
              },
            },
          },
        },
      });

      // Send notification for new candidate registration
      await notificationController.sendNewCandidateNotification(
        candidate.user.id,
        candidate.user.name,
        candidate.user.email,
      );

      res
        .status(201)
        .json(createResponse("Candidate bookmarked successfully", bookmark));
    } catch (error) {
      next(error);
    }
  }

  // Remove candidate bookmark (NEW)
  async removeBookmark(req, res, next) {
    try {
      const { candidateId } = req.params;

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      const deleted = await req.prisma.employerBookmark.deleteMany({
        where: {
          employerId: employer.id,
          candidateId: candidateId,
        },
      });

      if (deleted.count === 0) {
        return res
          .status(404)
          .json(createErrorResponse("Bookmark not found", 404));
      }

      res.json(createResponse("Bookmark removed successfully"));
    } catch (error) {
      next(error);
    }
  }

  // Get bookmarked candidates (NEW)
  async getBookmarkedCandidates(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const employer = await this.getEmployer(req);

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer profile not found", 404));
      }

      const [bookmarks, total] = await Promise.all([
        req.prisma.employerBookmark.findMany({
          where: { employerId: employer.id },
          skip,
          take: parseInt(limit),
          include: {
            candidate: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                    city: {
                      select: { name: true, state: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        req.prisma.employerBookmark.count({
          where: { employerId: employer.id },
        }),
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      };

      res.json(
        createResponse(
          "Bookmarked candidates retrieved successfully",
          bookmarks,
          pagination,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // CANDIDATE PROFILE ACCESS
  // =======================

  // Get candidate profile for employers
  async getCandidateProfile(req, res, next) {
    try {
      const { candidateId } = req.params;

      if (!candidateId) {
        return res
          .status(400)
          .json(createErrorResponse("Candidate ID is required", 400));
      }

      // Find the candidate with complete profile data
      const candidate = await req.prisma.candidate.findUnique({
        where: { id: candidateId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              cityId: true,
              isActive: true,
              createdAt: true,
              city: {
                select: {
                  id: true,
                  name: true,
                  state: true,
                },
              },
            },
          },
        },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate not found", 404));
      }

      // Build comprehensive profile data for employer view
      const profileData = candidate.profileData || {};

      // Include job preferences from dedicated candidate columns
      const jobPreferences = {
        jobTitles: candidate.preferredJobTitles || [],
        preferredRoles: candidate.preferredJobTitles || [],
        industry: candidate.preferredIndustries || [],
        locations: candidate.preferredLocations || [],
        preferredLocations: candidate.preferredLocations || [],
        jobTypes: candidate.preferredJobTypes || [],
        languages: candidate.preferredLanguages || [],
        salaryRange: {
          min: candidate.preferredSalaryMin,
          max: candidate.preferredSalaryMax,
        },
        workType: candidate.remoteWorkPreference,
        shiftPreference: candidate.shiftPreference,
        experienceLevel: candidate.experienceLevel,
        noticePeriod: candidate.noticePeriod,
        travelWillingness: candidate.travelWillingness,
        currentEmploymentStatus: candidate.currentEmploymentStatus,
      };

      // Format response data
      const candidateProfile = {
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        user: candidate.user,
        profileData: {
          ...profileData,
          jobPreferences,
        },
        // Individual fields for compatibility
        preferredJobTitles: candidate.preferredJobTitles,
        preferredIndustries: candidate.preferredIndustries,
        preferredLocations: candidate.preferredLocations,
        preferredJobTypes: candidate.preferredJobTypes,
        preferredLanguages: candidate.preferredLanguages,
        preferredSalaryMin: candidate.preferredSalaryMin,
        preferredSalaryMax: candidate.preferredSalaryMax,
        remoteWorkPreference: candidate.remoteWorkPreference,
        shiftPreference: candidate.shiftPreference,
        experienceLevel: candidate.experienceLevel,
        noticePeriod: candidate.noticePeriod,
        travelWillingness: candidate.travelWillingness,
        currentEmploymentStatus: candidate.currentEmploymentStatus,
        availabilityStatus: candidate.availabilityStatus,
        skillsWithExperience: candidate.skillsWithExperience,
        resumeUrl: candidate.resumeUrl,
        resumeFileName: candidate.resumeFileName,
        profilePhoto: candidate.profilePhoto,
        coverPhoto: candidate.coverPhoto,
        // Include experience and education from profileData
        experience: profileData.experience || [],
        education: profileData.education || [],
        skills: profileData.skills || [],
        jobPreferences: jobPreferences,
      };

      res.json(
        createResponse(
          "Candidate profile retrieved successfully",
          candidateProfile,
        ),
      );
    } catch (error) {
      console.error("Error fetching candidate profile:", error);
      next(error);
    }
  }
}

const employerController = new EmployerController();

// Bind all methods to preserve 'this' context
Object.getOwnPropertyNames(Object.getPrototypeOf(employerController))
  .filter(
    (name) =>
      name !== "constructor" && typeof employerController[name] === "function",
  )
  .forEach((name) => {
    employerController[name] =
      employerController[name].bind(employerController);
  });

module.exports = employerController;
