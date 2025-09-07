const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { createResponse, createErrorResponse } = require("../utils/response");
const notificationController = require("./notificationController");

class BranchAdminController {
  // =======================
  // DASHBOARD AND STATS (NEW)
  // =======================

  // Get branch admin stats for dashboard
  async getStats(req, res, next) {
    try {
      // Get branch admin info to find assigned city
      const userId = req.user.userId || req.user.id;
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: userId },
        include: { assignedCity: true },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      const cityId = branchAdmin.assignedCityId;
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      // Get comprehensive stats
      const [
        totalAds,
        pendingApprovalAds,
        approvedAds,
        totalApplications,
        pendingScreenings,
        allocatedCandidates,
        activeMOUs,
        totalEmployers,
        recentActivity,
      ] = await Promise.all([
        // Total ads in city
        req.prisma.ad.count({
          where: { locationId: cityId },
        }),
        // Pending approval ads
        req.prisma.ad.count({
          where: { locationId: cityId, status: "PENDING_APPROVAL" },
        }),
        // Approved ads
        req.prisma.ad.count({
          where: { locationId: cityId, status: "APPROVED" },
        }),
        // Total applications
        req.prisma.allocation.count({
          where: {
            ad: { locationId: cityId },
          },
        }),
        // Pending screenings
        req.prisma.allocation.count({
          where: {
            status: "APPLIED",
            ad: { locationId: cityId, status: "APPROVED" },
          },
        }),
        // Allocated candidates
        req.prisma.allocation.count({
          where: {
            status: "APPLIED",
            ad: { locationId: cityId },
          },
        }),
        // Active MOUs
        req.prisma.mOU.count({
          where: {
            isActive: true,
            branchAdminId: branchAdmin.id,
          },
        }),
        // Total employers in city
        req.prisma.employer.count({
          where: {
            user: { isActive: true },
          },
        }),
        // Recent activity count (last 7 days)
        req.prisma.ad.count({
          where: {
            locationId: cityId,
            createdAt: { gte: lastWeek },
          },
        }),
      ]);

      const stats = {
        overview: {
          totalAds,
          pendingApproval: pendingApprovalAds,
          approvedAds,
          totalApplications,
        },
        screening: {
          pendingScreenings,
          allocatedCandidates,
          screeningRate:
            totalApplications > 0
              ? ((allocatedCandidates / totalApplications) * 100).toFixed(1)
              : 0,
        },
        mou: {
          activeMOUs,
          totalEmployers,
          mouCoverage:
            totalEmployers > 0
              ? ((activeMOUs / totalEmployers) * 100).toFixed(1)
              : 0,
        },
        activity: {
          recentActivity,
          cityName: branchAdmin.assignedCity?.name || "Unknown",
        },
      };

      res.json(createResponse("Statistics retrieved successfully", stats));
    } catch (error) {
      next(error);
    }
  }

  // Get quick actions for dashboard
  async getQuickActions(req, res, next) {
    try {
      // Get branch admin info
      const userId = req.user.userId || req.user.id;
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: userId },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      const cityId = branchAdmin.assignedCityId;

      // Get counts for quick actions
      const [
        pendingAds,
        pendingScreenings,
        expiringSoonMOUs,
        recentApplications,
      ] = await Promise.all([
        // Pending ads needing approval
        req.prisma.ad.count({
          where: { locationId: cityId, status: "PENDING_APPROVAL" },
        }),
        // Applications needing screening
        req.prisma.allocation.count({
          where: {
            status: "APPLIED",
            ad: { locationId: cityId, status: "APPROVED" },
          },
        }),
        // MOUs expiring in next 30 days
        req.prisma.mOU.count({
          where: {
            branchAdminId: branchAdmin.id,
            isActive: true,
            signedAt: {
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            },
          },
        }),
        // Recent applications (last 24 hours)
        req.prisma.allocation.count({
          where: {
            ad: { locationId: cityId },
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
            },
          },
        }),
      ]);

      const quickActions = [
        {
          id: "pending-ads",
          title: "Review Pending Ads",
          description: "Ads waiting for your approval",
          count: pendingAds,
          priority: pendingAds > 5 ? "high" : pendingAds > 0 ? "medium" : "low",
          action: "/branch-admin/ads-approvals",
        },
        {
          id: "pending-screenings",
          title: "Screen Candidates",
          description: "Applications requiring review",
          count: pendingScreenings,
          priority:
            pendingScreenings > 10
              ? "high"
              : pendingScreenings > 0
                ? "medium"
                : "low",
          action: "/branch-admin/screening",
        },
        {
          id: "expiring-mous",
          title: "Expiring MOUs",
          description: "MOUs expiring in 30 days",
          count: expiringSoonMOUs,
          priority: expiringSoonMOUs > 0 ? "high" : "low",
          action: "/branch-admin/mou",
        },
        {
          id: "recent-applications",
          title: "Recent Applications",
          description: "New applications (24h)",
          count: recentApplications,
          priority: "info",
          action: "/branch-admin/screening",
        },
      ];

      res.json(
        createResponse("Quick actions retrieved successfully", quickActions),
      );
    } catch (error) {
      next(error);
    }
  }

  // Get ads with filters (for branch admin dashboard)
  async getAds(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        status = "",
        categoryName = "",
        employerId = "",
        mouStatus = "",
        sortBy = "updatedAt",
        sortOrder = "desc",
      } = req.query;

      // Get branch admin info
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      const cityId = branchAdmin.assignedCityId;

      // Build where clause
      const where = {
        locationId: cityId,
        ...(status && { status }),
        ...(categoryName && { categoryName }),
        ...(employerId && { employerId }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            {
              employer: {
                user: { name: { contains: search, mode: "insensitive" } },
              },
            },
          ],
        }),
      };

      // Add MOU status filter if specified
      if (mouStatus) {
        if (mouStatus === "active") {
          where.employer = {
            ...where.employer,
            mous: {
              some: {
                isActive: true,
                branchAdminId: branchAdmin.id,
              },
            },
          };
        } else if (mouStatus === "inactive") {
          where.employer = {
            ...where.employer,
            mous: {
              none: {
                isActive: true,
                branchAdminId: branchAdmin.id,
              },
            },
          };
        }
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Get ads with pagination
      const [ads, totalCount] = await Promise.all([
        req.prisma.ad.findMany({
          where,
          include: {
            employer: {
              include: {
                user: {
                  select: { name: true, email: true },
                },
                mous: {
                  where: {
                    isActive: true,
                    branchAdminId: branchAdmin.id,
                  },
                  select: {
                    id: true,
                    feeType: true,
                    feeValue: true,
                    signedAt: true,
                  },
                },
              },
            },
            _count: {
              select: { allocations: true },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip: offset,
          take: parseInt(limit),
        }),
        req.prisma.ad.count({ where }),
      ]);

      const result = {
        ads: ads.map((ad) => ({
          ...ad,
          hasActiveMOU: ad.employer.mous.length > 0,
          applicationCount: ad._count.allocations,
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit),
        },
      };

      res.json(createResponse("Ads retrieved successfully", result));
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // PROFILE MANAGEMENT (NEW)
  // =======================

  // Get branch admin profile (NEW)
  async getProfile(req, res, next) {
    try {
      console.log(
        "Branch Admin getProfile - User ID:",
        req.user.userId || req.user.id,
      );

      const userId = req.user.userId || req.user.id;
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true,
              createdAt: true,
            },
          },
          assignedCity: {
            select: {
              id: true,
              name: true,
              state: true,
              country: true,
            },
          },
          mous: {
            where: { isActive: true },
            include: {
              employer: {
                include: {
                  user: {
                    select: { name: true, email: true },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          _count: {
            select: {
              mous: true,
            },
          },
        },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      // Get recent activity summary
      const cityId = branchAdmin.assignedCityId;
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const [
        pendingAdsCount,
        recentApprovals,
        pendingScreenings,
        recentAllocations,
      ] = await Promise.all([
        req.prisma.ad.count({
          where: { locationId: cityId, status: "PENDING_APPROVAL" },
        }),
        req.prisma.ad.count({
          where: {
            locationId: cityId,
            status: "APPROVED",
            approvedAt: { gte: lastWeek },
            approvedBy: req.user.userId,
          },
        }),
        req.prisma.allocation.count({
          where: {
            status: "APPLIED",
            ad: { locationId: cityId, status: "APPROVED" },
          },
        }),
        req.prisma.allocation.count({
          where: {
            status: "APPLIED",
            allocatedBy: req.user.userId,
            allocatedAt: { gte: lastWeek },
          },
        }),
      ]);

      const profileData = {
        ...branchAdmin,
        activitySummary: {
          pendingAds: pendingAdsCount,
          recentApprovals,
          pendingScreenings,
          recentAllocations,
        },
        hasActiveMOUs: branchAdmin.mous.length > 0,
      };

      res.json(createResponse("Profile retrieved successfully", profileData));
    } catch (error) {
      next(error);
    }
  }

  // Update branch admin profile (NEW)
  async updateProfile(req, res, next) {
    try {
      const { performanceMetrics } = req.body;
      const userId = req.user.userId || req.user.id;

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: userId },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      const updatedBranchAdmin = await req.prisma.branchAdmin.update({
        where: { userId: userId },
        data: {
          ...(performanceMetrics && { performanceMetrics }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          assignedCity: true,
        },
      });

      res.json(
        createResponse("Profile updated successfully", updatedBranchAdmin),
      );
    } catch (error) {
      next(error);
    }
  }

  // Get performance metrics (NEW)
  async getPerformance(req, res, next) {
    try {
      const { timeframe = "30" } = req.query; // days
      const days = parseInt(timeframe);

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
        include: { assignedCity: true },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const cityId = branchAdmin.assignedCityId;

      // Get performance metrics
      const [
        totalAdsReviewed,
        adsApproved,
        adsRejected,
        candidatesScreened,
        candidatesHired,
        averageReviewTime,
        totalApplicationsProcessed,
        currentPendingAds,
        currentPendingScreenings,
      ] = await Promise.all([
        // Ads reviewed in timeframe
        req.prisma.ad.count({
          where: {
            locationId: cityId,
            approvedBy: req.user.userId,
            approvedAt: { gte: startDate },
          },
        }),
        // Ads approved
        req.prisma.ad.count({
          where: {
            locationId: cityId,
            status: "APPROVED",
            approvedBy: req.user.userId,
            approvedAt: { gte: startDate },
          },
        }),
        // Ads rejected (closed)
        req.prisma.ad.count({
          where: {
            locationId: cityId,
            status: "CLOSED",
            updatedAt: { gte: startDate },
          },
        }),
        // Candidates screened
        req.prisma.allocation.count({
          where: {
            status: { in: ["SHORTLISTED", "APPLIED"] },
            allocatedBy: req.user.userId,
            updatedAt: { gte: startDate },
            ad: { locationId: cityId },
          },
        }),
        // Candidates allocated to employers
        req.prisma.allocation.count({
          where: {
            status: "APPLIED",
            allocatedBy: req.user.userId,
            allocatedAt: { gte: startDate },
            ad: { locationId: cityId },
          },
        }),
        // Average review time calculation would need more complex query
        null, // Placeholder for now
        // Total applications processed
        req.prisma.allocation.count({
          where: {
            allocatedBy: req.user.userId,
            updatedAt: { gte: startDate },
            ad: { locationId: cityId },
          },
        }),
        // Current pending items
        req.prisma.ad.count({
          where: { locationId: cityId, status: "PENDING_APPROVAL" },
        }),
        req.prisma.allocation.count({
          where: {
            status: "APPLIED",
            ad: { locationId: cityId, status: "APPROVED" },
          },
        }),
      ]);

      // Calculate rates
      const approvalRate =
        totalAdsReviewed > 0
          ? Math.round((adsApproved / totalAdsReviewed) * 100)
          : 0;

      const allocationRate =
        candidatesScreened > 0
          ? Math.round((candidatesHired / candidatesScreened) * 100)
          : 0;

      const performance = {
        timeframe: `${days} days`,
        city: branchAdmin.assignedCity,
        metrics: {
          adReview: {
            totalReviewed: totalAdsReviewed,
            approved: adsApproved,
            rejected: adsRejected,
            approvalRate: `${approvalRate}%`,
          },
          candidateScreening: {
            screened: candidatesScreened,
            allocated: candidatesHired,
            allocationRate: `${allocationRate}%`,
            totalProcessed: totalApplicationsProcessed,
          },
          currentWorkload: {
            pendingAds: currentPendingAds,
            pendingScreenings: currentPendingScreenings,
          },
          efficiency: {
            averageReviewTime: averageReviewTime || "N/A",
            dailyAverage: Math.round(totalApplicationsProcessed / days),
          },
        },
        targets: {
          dailyAdReviews: 10,
          dailyScreenings: 15,
          targetApprovalRate: "85%",
          targetAllocationRate: "70%",
        },
      };

      res.json(
        createResponse(
          "Performance metrics retrieved successfully",
          performance,
        ),
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

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      const ad = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          //    locationId: branchAdmin.assignedCityId,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
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
              country: true,
            },
          },
          employer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
              mous: {
                where: { isActive: true },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
          allocations: {
            include: {
              candidate: {
                select: {
                  id: true,
                  tags: true,
                  overallRating: true,
                  user: {
                    select: {
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              allocations: true,
            },
          },
        },
      });

      if (!ad) {
        return res
          .status(404)
          .json(createErrorResponse("Ad not found in your assigned city", 404));
      }

      // Calculate application statistics
      const applicationStats = {
        total: ad.allocations.length,
        applied: ad.allocations.filter((a) => a.status === "APPLIED").length,
        screened: ad.allocations.filter((a) => a.status === "SHORTLISTED")
          .length,
        allocated: ad.allocations.filter((a) => a.status === "APPLIED").length,
        shortlisted: ad.allocations.filter((a) => a.status === "SHORTLISTED")
          .length,
        hired: ad.allocations.filter((a) => a.status === "HIRED").length,
        rejected: ad.allocations.filter((a) => a.status === "REJECTED").length,
      };

      const adWithStats = {
        ...ad,
        applicationStats,
        hasActiveMOU: ad.employer.mous.length > 0,
        canApprove:
          ad.status === "PENDING_APPROVAL" && ad.employer.mous.length > 0,
      };

      // Trigger notification for profile view
      try {
        await notificationController.sendProfileViewNotification(
          req.user.userId,
          ad.employer.userId,
        );
      } catch (notificationError) {
        console.error(
          "Failed to send profile view notification:",
          notificationError,
        );
      }

      res.json(
        createResponse("Ad details retrieved successfully", adWithStats),
      );
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // APPLICATION MANAGEMENT (NEW & ENHANCED)
  // =======================

  // Enhanced applications list - rename existing method (ENHANCED)
  async getApplications(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        candidateName,
        companyName,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      // Build dynamic where conditions
      const where = {
        ad: {
          locationId: branchAdmin.assignedCityId,
          status: "APPROVED",
        },
      };

      if (status) {
        where.status = status;
      }

      if (candidateName) {
        where.candidate = {
          user: {
            name: {
              contains: candidateName,
              mode: "insensitive",
            },
          },
        };
      }

      if (companyName) {
        where.ad.company = {
          name: {
            contains: companyName,
            mode: "insensitive",
          },
        };
      }

      const [allocations, total] = await Promise.all([
        req.prisma.allocation.findMany({
          where,
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
                    city: true,
                  },
                },
              },
            },
            ad: {
              include: {
                company: {
                  select: {
                    name: true,
                    industry: true,
                  },
                },
                location: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
        }),
        req.prisma.allocation.count({ where }),
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
          "Applications retrieved successfully",
          allocations,
          pagination,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  // Get specific allocation details (NEW)
  async getApplication(req, res, next) {
    try {
      const { allocationId } = req.params;

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      const allocation = await req.prisma.allocation.findFirst({
        where: {
          id: allocationId,
          ad: {
            locationId: branchAdmin.assignedCityId,
          },
        },
        include: {
          candidate: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  city: true,
                  createdAt: true,
                },
              },
            },
          },
          ad: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  industry: true,
                  size: true,
                  website: true,
                },
              },
              location: true,
              employer: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                      phone: true,
                    },
                  },
                  mous: {
                    where: { isActive: true },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                  },
                },
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
              "Application not found in your assigned city",
              404,
            ),
          );
      }

      // Add additional context with simple calculations
      const enrichedAllocation = {
        ...allocation,
        canScreen: ["APPLIED"].includes(allocation.status),
        canAllocate: ["SHORTLISTED"].includes(allocation.status),
        hasActiveMOU: allocation.ad.employer.mous.length > 0,
        skillMatch: 85, // Placeholder - would calculate based on skills matching
        timeInStatus: "N/A", // Placeholder - would calculate time since last update
      };

      res.json(
        createResponse(
          "Application details retrieved successfully",
          enrichedAllocation,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  // Allocate candidate to employer (NEW)
  async allocateCandidate(req, res, next) {
    try {
      const { allocationId } = req.params;
      const { notes } = req.body;

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      // Verify allocation is in admin's city and can be allocated
      const allocation = await req.prisma.allocation.findFirst({
        where: {
          id: allocationId,
          ad: {
            locationId: branchAdmin.assignedCityId,
          },
          status: "SHORTLISTED",
        },
        include: {
          candidate: true,
          ad: {
            include: {
              employer: {
                include: {
                  mous: {
                    where: { isActive: true },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                  },
                },
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
              "Application not found or not eligible for allocation",
              404,
            ),
          );
      }

      // Check if employer has active MOU
      if (allocation.ad.employer.mous.length === 0) {
        return res
          .status(403)
          .json(
            createErrorResponse(
              "Cannot allocate candidate - employer has no active MOU",
              403,
            ),
          );
      }

      // Get MOU fee information
      const activeMOU = allocation.ad.employer.mous[0];

      // Update allocation to ALLOCATED status
      const updatedAllocation = await req.prisma.allocation.update({
        where: { id: allocationId },
        data: {
          status: "APPLIED",
          notes,
          allocatedBy: req.user.userId,
          allocatedAt: new Date(),
          feeType: activeMOU.feeType,
          feeValue: activeMOU.feeValue,
        },
        include: {
          candidate: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          ad: {
            include: {
              company: true,
              location: true,
              employer: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Send notification to candidate about allocation
      try {
        await notificationController.sendApplicationStatusNotification(
          updatedAllocation.candidate.userId,
          updatedAllocation.ad.title,
          "ALLOCATED",
          updatedAllocation.ad.company.name,
        );
      } catch (notificationError) {
        console.error(
          "Failed to send allocation notification:",
          notificationError,
        );
      }

      res.json(
        createResponse(
          "Candidate allocated to employer successfully",
          updatedAllocation,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // EXISTING METHODS (keep as-is)
  // =======================

  // Get pending ads for approval
  async getPendingAds(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        categoryName,
        search = "",
        status = "PENDING_APPROVAL",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
        include: { assignedCity: true },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      const where = {
        ...(status && { status }),
        //locationId: branchAdmin.assignedCityId,
        isActive: true,
        ...(categoryName && { categoryName }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { company: { name: { contains: search, mode: "insensitive" } } },
            {
              employer: {
                user: { name: { contains: search, mode: "insensitive" } },
              },
            },
          ],
        }),
      };

      const [ads, total] = await Promise.all([
        req.prisma.ad.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            company: true,
            location: true,
            employer: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
                mous: {
                  where: { isActive: true },
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
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

      res.json(
        createResponse("Pending ads retrieved successfully", ads, pagination),
      );
    } catch (error) {
      next(error);
    }
  }

  // Approve or reject ad
  async reviewAd(req, res, next) {
    try {
      const { adId } = req.params;
      const { action, notes } = req.body; // action: 'approve' or 'reject'

      if (!action || !["approve", "reject"].includes(action)) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Valid action is required (approve or reject)",
              400,
            ),
          );
      }

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      // Verify ad is in admin's city and pending approval
      const ad = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          locationId: branchAdmin.assignedCityId,
          status: "PENDING_APPROVAL",
        },
        include: {
          employer: {
            include: {
              mous: {
                where: { isActive: true },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      });

      if (!ad) {
        return res
          .status(404)
          .json(
            createErrorResponse("Ad not found or not eligible for review", 404),
          );
      }

      // Check if employer has active MOU
      if (action === "approve" && ad.employer.mous.length === 0) {
        return res
          .status(403)
          .json(
            createErrorResponse(
              "Cannot approve ad - employer has no active MOU",
              403,
            ),
          );
      }

      const newStatus = action === "approve" ? "APPROVED" : "REJECTED";
      const updateData = {
        status: newStatus,
      };

      if (action === "approve") {
        updateData.approvedAt = new Date();
        updateData.approvedBy = req.user.userId;
      } else {
        updateData.rejectedAt = new Date();
        updateData.rejectedBy = req.user.userId;
        updateData.rejectionReason = req.body.reason || "No reason provided";
      }

      const updatedAd = await req.prisma.ad.update({
        where: { id: adId },
        data: updateData,
        include: {
          company: true,
          location: true,
          employer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Send job match notifications when ad is approved
      if (action === "approve") {
        try {
          const jobDetails = {
            title: updatedAd.title,
            companyName: updatedAd.company.name,
            locationId: updatedAd.locationId,
            locationName: updatedAd.location?.name,
            categoryName: updatedAd.categoryName,
            salary: updatedAd.salaryMax
              ? `${updatedAd.salaryMin || 0} - ${updatedAd.salaryMax}`
              : "Competitive",
          };

          await notificationController.sendJobMatchNotifications(
            adId,
            jobDetails,
          );
        } catch (notificationError) {
          console.error(
            "Failed to send job match notifications:",
            notificationError,
          );
          // Don't fail the approval process if notifications fail
        }
      }

      // Send notification for application status change (if ad is approved/rejected)
      if (action === "approve") {
        try {
          await notificationController.sendApplicationStatusNotification(
            null, // Candidate ID not directly available here, needs to be fetched or passed
            updatedAd.title,
            "APPROVED",
            updatedAd.company.name,
            updatedAd.id,
          );
        } catch (notificationError) {
          console.error(
            "Failed to send ad approval notification:",
            notificationError,
          );
        }
      } else if (action === "reject") {
        try {
          await notificationController.sendApplicationStatusNotification(
            null, // Candidate ID not directly available here
            updatedAd.title,
            "REJECTED",
            updatedAd.company.name,
            updatedAd.id,
          );
        } catch (notificationError) {
          console.error(
            "Failed to send ad rejection notification:",
            notificationError,
          );
        }
      }

      res.json(createResponse(`Ad ${action}d successfully`, updatedAd));
    } catch (error) {
      next(error);
    }
  }

  // Get applications for screening (LEGACY - DEPRECATED)
  async getApplicationsForScreening(req, res, next) {
    try {
      const { page = 1, limit = 10, status = "APPLIED" } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      const where = {
        status,
        ad: {
          locationId: branchAdmin.assignedCityId,
          status: "APPROVED",
        },
      };

      const [allocations, total] = await Promise.all([
        req.prisma.allocation.findMany({
          where,
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
                    city: true,
                  },
                },
              },
            },
            ad: {
              include: {
                company: true,
                location: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        }),
        req.prisma.allocation.count({ where }),
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
          "Applications retrieved successfully",
          allocations,
          pagination,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  // Rate and screen candidate
  async screenCandidate(req, res, next) {
    try {
      const { allocationId } = req.params;
      const {
        ratings,
        overallRating,
        tags,
        notes,
        action, // 'screen' or 'allocate'
      } = req.body;

      if (!action || !["screen", "allocate"].includes(action)) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Valid action is required (screen or allocate)",
              400,
            ),
          );
      }

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      // Verify allocation is in admin's city
      const allocation = await req.prisma.allocation.findFirst({
        where: {
          id: allocationId,
          ad: {
            locationId: branchAdmin.assignedCityId,
          },
          status: { in: ["APPLIED", "SHORTLISTED"] },
        },
        include: {
          candidate: true,
          ad: {
            include: {
              employer: {
                include: {
                  mous: {
                    where: { isActive: true },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                  },
                },
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
              "Application not found or not eligible for screening",
              404,
            ),
          );
      }

      // Update candidate ratings (permanent)
      if (ratings || overallRating || tags) {
        const candidateUpdateData = {};

        if (ratings) {
          // Merge with existing ratings
          const existingRatings = allocation.candidate.ratings || {};
          candidateUpdateData.ratings = { ...existingRatings, ...ratings };

          // Store rating history
          const ratingHistory = allocation.candidate.ratingHistory || [];
          ratingHistory.push({
            date: new Date(),
            adminId: req.user.userId,
            ratings,
            notes,
          });
          candidateUpdateData.ratingHistory = ratingHistory;
        }

        if (overallRating) {
          candidateUpdateData.overallRating = overallRating;
        }

        if (tags) {
          // Merge with existing tags (avoid duplicates)
          const existingTags = allocation.candidate.tags || [];
          const newTags = [...new Set([...existingTags, ...tags])];
          candidateUpdateData.tags = newTags;
        }

        await req.prisma.candidate.update({
          where: { id: allocation.candidateId },
          data: candidateUpdateData,
        });
      }

      // Update allocation status and add fee information if allocating
      const allocationUpdateData = {
        status: action === "screen" ? "SHORTLISTED" : "APPLIED",
        notes,
        allocatedBy: req.user.userId,
        allocatedAt: action === "allocate" ? new Date() : null,
      };

      if (action === "allocate" && allocation.ad.employer.mous.length > 0) {
        const activeMOU = allocation.ad.employer.mous[0];
        allocationUpdateData.feeType = activeMOU.feeType;
        allocationUpdateData.feeValue = activeMOU.feeValue;
      }

      const updatedAllocation = await req.prisma.allocation.update({
        where: { id: allocationId },
        data: allocationUpdateData,
        include: {
          candidate: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          ad: {
            include: {
              company: true,
              location: true,
            },
          },
        },
      });

      // Send notification based on action
      if (action === "screen") {
        try {
          await notificationController.sendApplicationStatusNotification(
            updatedAllocation.candidate.userId,
            updatedAllocation.ad.title,
            "SHORTLISTED",
            updatedAllocation.ad.company.name,
          );
        } catch (notificationError) {
          console.error(
            "Failed to send candidate shortlisted notification:",
            notificationError,
          );
        }
      } else if (action === "allocate") {
        // The allocateCandidate function handles the notification for allocation.
        // If this method is called with action 'allocate', it means it's a direct
        // allocation after screening, so we might want a different notification
        // or rely on allocateCandidate logic. For now, assume allocateCandidate handles it.
      }

      res.json(
        createResponse(`Candidate ${action}ed successfully`, updatedAllocation),
      );
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // NEW MISSING METHODS
  // =======================

  // Get employers with pagination (all employers - no city restriction)
  async getEmployers(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        subscriptionStatus = "",
        planId = "",
        minActiveJobs = "",
        maxActiveJobs = "",
      } = req.query;

      const offset = (page - 1) * limit;

      // Get branch admin info
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      // Build where condition for all employers with active users
      const whereCondition = {
        user: {
          role: "EMPLOYER",
          isActive: true,
        },
      };

      // Add search filter - fix the OR condition structure
      if (search) {
        whereCondition.OR = [
          {
            user: {
              name: { contains: search, mode: "insensitive" },
            },
          },
          {
            user: {
              email: { contains: search, mode: "insensitive" },
            },
          },
          {
            companies: {
              some: {
                name: { contains: search, mode: "insensitive" },
                isActive: true,
              },
            },
          },
        ];
      }

      // Add subscription status filter
      if (subscriptionStatus) {
        if (subscriptionStatus === "NO_SUBSCRIPTION") {
          whereCondition.subscriptions = {
            none: {},
          };
        } else if (
          [
            "ACTIVE",
            "PENDING_APPROVAL",
            "EXPIRED",
            "CANCELLED",
            "PAST_DUE",
          ].includes(subscriptionStatus)
        ) {
          whereCondition.subscriptions = {
            some: { status: subscriptionStatus },
          };
        }
      }

      // Add plan filter
      if (
        planId &&
        planId !== "[object Object]" &&
        planId !== "undefined" &&
        planId.trim() !== ""
      ) {
        whereCondition.subscriptions = {
          some: {
            planId: planId,
            status: "ACTIVE",
          },
        };
      }

      const [employers, totalCount] = await Promise.all([
        req.prisma.employer.findMany({
          where: whereCondition,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                isActive: true,
                createdAt: true,
                city: {
                  select: {
                    name: true,
                    state: true,
                  },
                },
              },
            },
            companies: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                industry: true,
                size: true,
              },
            },
            subscriptions: {
              where: { status: "ACTIVE" },
              include: {
                plan: {
                  select: {
                    id: true,
                    name: true,
                    priceMonthly: true,
                    priceYearly: true,
                    maxJobPosts: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            ads: {
              where: {
                status: { in: ["APPROVED", "PENDING_APPROVAL"] },
                isActive: true,
              },
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
            mous: {
              where: {
                isActive: true,
                branchAdminId: branchAdmin.id,
              },
              select: {
                id: true,
                feeType: true,
                feeValue: true,
                signedAt: true,
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            _count: {
              select: {
                ads: {
                  where: {
                    status: { in: ["APPROVED", "PENDING_APPROVAL"] },
                    isActive: true,
                  },
                },
                companies: {
                  where: { isActive: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: parseInt(limit),
        }),
        req.prisma.employer.count({ where: whereCondition }),
      ]);

      // Filter by active jobs count if specified
      let filteredEmployers = employers;
      if (minActiveJobs || maxActiveJobs) {
        filteredEmployers = employers.filter((employer) => {
          const activeJobsCount = employer._count.ads;

          if (minActiveJobs && activeJobsCount < parseInt(minActiveJobs)) {
            return false;
          }

          if (maxActiveJobs && activeJobsCount > parseInt(maxActiveJobs)) {
            return false;
          }

          return true;
        });
      }

      // Enhance employer data with subscription details
      const enhancedEmployers = filteredEmployers.map((employer) => ({
        ...employer,
        subscriptionDetails: {
          hasActiveSubscription: employer.subscriptions.length > 0,
          currentPlan: employer.subscriptions[0]?.plan || null,
          subscriptionStatus:
            employer.subscriptions[0]?.status || "NO_SUBSCRIPTION",
          activeJobsCount: employer._count.ads,
          totalCompanies: employer._count.companies,
        },
        hasActiveMOU: employer.mous.length > 0,
        activeMOU: employer.mous[0] || null,
      }));

      const result = {
        employers: enhancedEmployers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: offset + parseInt(limit) < totalCount,
          hasPrev: page > 1,
        },
        summary: {
          totalEmployers: totalCount,
          activeSubscriptions: enhancedEmployers.filter(
            (e) => e.subscriptionDetails.hasActiveSubscription,
          ).length,
          noSubscription: enhancedEmployers.filter(
            (e) => !e.subscriptionDetails.hasActiveSubscription,
          ).length,
          totalActiveJobs: enhancedEmployers.reduce(
            (sum, e) => sum + e.subscriptionDetails.activeJobsCount,
            0,
          ),
        },
      };

      res.json(createResponse("Employers retrieved successfully", result));
    } catch (error) {
      console.error("Error fetching employers:", error);
      next(error);
    }
  }

  // Get candidates for screening
  async getScreeningCandidates(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const [candidates, totalCount] = await Promise.all([
        req.prisma.candidate.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
              },
            },
            _count: {
              select: {
                allocations: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: parseInt(limit),
        }),
        req.prisma.candidate.count(),
      ]);

      res.json({
        candidates,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: offset + parseInt(limit) < totalCount,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ error: "Failed to fetch candidates" });
    }
  }

  // Get report statistics
  async getReportsStatistics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const stats = {
        totalEmployers: await req.prisma.employer.count(),
        totalCandidates: await req.prisma.candidate.count(),
        totalAds: await req.prisma.ad.count(),
        totalAllocations: await req.prisma.allocation.count(),
        totalMous: await req.prisma.mOU.count(),
      };

      res.json({ statistics: stats });
    } catch (error) {
      console.error("Error fetching report statistics:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  }

  // Get activity logs
  async getActivityLogs(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // For now, return empty logs since we don't have activity logging implemented
      res.json({
        logs: [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalCount: 0,
          hasNext: false,
          hasPrev: false,
        },
      });
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  }

  // Get employer details
  async getEmployerDetails(req, res, next) {
    try {
      const { employerId } = req.params;

      const employer = await req.prisma.employer.findUnique({
        where: { id: employerId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
              createdAt: true,
            },
          },
          companies: {
            include: {
              city: true,
            },
          },
          ads: {
            include: {
              company: true,
              location: true,
            },
            orderBy: { createdAt: "desc" },
          },
          mous: {
            include: {
              branchAdmin: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          allocations: {
            include: {
              candidate: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                    },
                  },
                },
              },
              ad: {
                select: {
                  title: true,
                },
              },
            },
          },
          _count: {
            select: {
              ads: true,
              mous: true,
              allocations: true,
            },
          },
        },
      });

      if (!employer) {
        return res.status(404).json({ error: "Employer not found" });
      }

      res.json(employer);
    } catch (error) {
      console.error("Error fetching employer details:", error);
      res.status(500).json({ error: "Failed to fetch employer details" });
    }
  }

  // Get candidate profile for branch admins
  async getCandidateProfile(req, res, next) {
    try {
      const { candidateId } = req.params;

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.id },
        include: {
          assignedCity: true,
        },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json({ error: "Branch admin profile not found" });
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
            include: {
              ad: {
                select: { id: true, title: true },
                include: {
                  employer: {
                    include: {
                      user: {
                        select: { name: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      // Trigger notification for candidate profile view by branch admin
      try {
        await notificationController.sendProfileViewNotification(
          req.user.userId,
          candidate.userId,
        );
      } catch (notificationError) {
        console.error(
          "Failed to send profile view notification:",
          notificationError,
        );
      }

      res.json(candidate);
    } catch (error) {
      console.error("Error fetching candidate profile:", error);
      res.status(500).json({ error: "Failed to fetch candidate profile" });
    }
  }

  // Get admin profile
  async getProfile(req, res, next) {
    try {
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          assignedCity: {
            select: {
              id: true,
              name: true,
              state: true,
            },
          },
        },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json({ error: "Branch admin profile not found" });
      }

      res.json(branchAdmin);
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  }

  // Update admin profile
  async updateProfile(req, res, next) {
    try {
      const { name, phone, city, branchName, region, designation } = req.body;

      // Update user name if provided
      if (name) {
        await req.prisma.user.update({
          where: { id: req.user.id },
          data: { name },
        });
      }

      // Update branch admin profile
      const updatedProfile = await req.prisma.branchAdmin.update({
        where: { userId: req.user.id },
        data: {
          phone,
          city,
          branchName,
          region,
          designation,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating admin profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }

  // Update admin password
  async updatePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ error: "Current password and new password are required" });
      }

      // Get current user
      const user = await req.prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const bcrypt = require("bcryptjs");
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isValidPassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await req.prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedNewPassword },
      });

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ error: "Failed to update password" });
    }
  }

  // Get subscription plans for filtering
  async getSubscriptionPlans(req, res, next) {
    try {
      const plans = await req.prisma.plan.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          priceMonthly: true,
          priceYearly: true,
          maxJobPosts: true,
          maxShortlists: true,
          features: true,
        },
        orderBy: { name: "asc" },
      });

      res.json(
        createResponse("Subscription plans retrieved successfully", plans),
      );
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      next(error);
    }
  }

  // Approve ad
  async approveAd(req, res, next) {
    try {
      const { adId } = req.params;

      const ad = await req.prisma.ad.findUnique({
        where: { id: adId },
      });

      if (!ad) {
        return res.status(404).json(createErrorResponse("Ad not found", 404));
      }

      if (ad.status !== "PENDING_APPROVAL") {
        return res
          .status(400)
          .json(
            createErrorResponse("Ad is not in pending approval status", 400),
          );
      }

      // Update ad status
      const updatedAd = await req.prisma.ad.update({
        where: { id: adId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          approvedBy: req.user.userId,
        },
        include: {
          employer: {
            include: {
              user: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              state: true,
            },
          },
        },
      });

      // Send notification to employer about ad approval
      try {
        const notificationController = require("./notificationController");
        await notificationController.sendNotificationWithStorage(
          updatedAd.employer.user.id,
          "JOB_APPROVED",
          {
            jobTitle: updatedAd.title,
            adId: updatedAd.id,
          },
        );

        // Send job match notifications to candidates
        const jobDetails = {
          title: updatedAd.title,
          companyName: updatedAd.employer.user.name,
          locationId: updatedAd.locationId,
          locationName: updatedAd.location?.name,
          categoryName: updatedAd.categoryName,
          salary: updatedAd.salaryMax
            ? `${updatedAd.salaryMin || 0} - ${updatedAd.salaryMax}`
            : "Competitive",
        };

        await notificationController.sendJobMatchNotifications(
          updatedAd.id,
          jobDetails,
        );
      } catch (notificationError) {
        console.error(
          "Failed to send ad approval notification:",
          notificationError,
        );
        // Don't fail the main operation if notification fails
      }

      res.json(createResponse("Ad approved successfully", updatedAd));
    } catch (error) {
      next(error);
    }
  }

  // Reject ad
  async rejectAd(req, res, next) {
    try {
      const { adId } = req.params;
      const { rejectionReason } = req.body;

      // Update ad status
      const updatedAd = await req.prisma.ad.update({
        where: { id: adId },
        data: {
          status: "REJECTED",
          rejectedAt: new Date(),
          rejectedBy: req.user.userId,
          rejectionReason: rejectionReason || "Not specified",
        },
        include: {
          employer: {
            include: {
              user: true,
            },
          },
        },
      });

      // Send notification to employer about ad rejection
      try {
        const notificationController = require("./notificationController");
        await notificationController.sendNotificationWithStorage(
          updatedAd.employer.user.id,
          "JOB_REJECTED",
          {
            jobTitle: updatedAd.title,
            adId: updatedAd.id,
            reason: rejectionReason || "Please contact support for details",
          },
        );
      } catch (notificationError) {
        console.error(
          "Failed to send ad rejection notification:",
          notificationError,
        );
        // Don't fail the main operation if notification fails
      }

      res.json(createResponse("Ad rejected successfully", updatedAd));
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // EMPLOYER CRUD OPERATIONS (NEW)
  // =======================

  // Create new employer
  async createEmployer(req, res, next) {
    try {
      const {
        name,
        email,
        phone,
        password,
        cityId,
        description,
        website,
        linkedIn,
        companySize,
        industry,
      } = req.body;

      // Get branch admin info
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      // Check if user with email already exists
      const existingUser = await req.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res
          .status(400)
          .json(
            createErrorResponse("User with this email already exists", 400),
          );
      }

      // Hash password
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user and employer in transaction
      const result = await req.prisma.$transaction(async (prisma) => {
        // Create user
        const user = await prisma.user.create({
          data: {
            name,
            email,
            phone,
            passwordHash: hashedPassword,
            role: "EMPLOYER",
            cityId,
            isActive: true,
          },
        });

        // Create employer profile
        const employer = await prisma.employer.create({
          data: {
            userId: user.id,
            contactDetails: {
              description,
              website,
              linkedIn,
              companySize,
              industry,
            },
            createdBy: req.user.userId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
                city: {
                  select: {
                    id: true,
                    name: true,
                    state: true,
                    country: true,
                  },
                },
              },
            },
          },
        });

        // Send welcome notification to the new employer
        try {
          await notificationController.sendWelcomeNotification(
            user.id,
            name,
            user.email,
          );
        } catch (notificationError) {
          console.error(
            "Failed to send welcome notification:",
            notificationError,
          );
        }

        return employer;
      });

      res
        .status(201)
        .json(createResponse("Employer created successfully", result));
    } catch (error) {
      console.error("Error creating employer:", error);
      next(error);
    }
  }

  // Update employer
  async updateEmployer(req, res, next) {
    try {
      const { employerId } = req.params;
      const updateData = req.body;

      // Get branch admin info
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      // Check if employer exists
      const employer = await req.prisma.employer.findUnique({
        where: { id: employerId },
        include: { user: true },
      });

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer not found", 404));
      }

      // Update in transaction
      const result = await req.prisma.$transaction(async (prisma) => {
        // Update user if user data provided
        if (
          updateData.name ||
          updateData.email ||
          updateData.phone ||
          updateData.cityId
        ) {
          await prisma.user.update({
            where: { id: employer.userId },
            data: {
              ...(updateData.name && { name: updateData.name }),
              ...(updateData.email && { email: updateData.email }),
              ...(updateData.phone && { phone: updateData.phone }),
              ...(updateData.cityId && { cityId: updateData.cityId }),
            },
          });
        }

        // Update employer profile
        const updatedEmployer = await prisma.employer.update({
          where: { id: employerId },
          data: {
            ...(updateData.contactDetails && {
              contactDetails: updateData.contactDetails,
            }),
            updatedBy: req.user.userId,
            updatedAt: new Date(),
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
                city: {
                  select: {
                    id: true,
                    name: true,
                    state: true,
                    country: true,
                  },
                },
              },
            },
          },
        });

        return updatedEmployer;
      });

      res.json(createResponse("Employer updated successfully", result));
    } catch (error) {
      console.error("Error updating employer:", error);
      next(error);
    }
  }

  // Delete employer
  async deleteEmployer(req, res, next) {
    try {
      const { employerId } = req.params;

      // Get branch admin info
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
      });

      if (!branchAdmin) {
        return res
          .status(404)
          .json(createErrorResponse("Branch Admin profile not found", 404));
      }

      // Check if employer exists
      const employer = await req.prisma.employer.findUnique({
        where: { id: employerId },
        include: {
          companies: { where: { isActive: true } },
          ads: { where: { status: { in: ["APPROVED", "PENDING_APPROVAL"] } } },
          mous: { where: { isActive: true } },
        },
      });

      if (!employer) {
        return res
          .status(404)
          .json(createErrorResponse("Employer not found", 404));
      }

      // Check if employer has active dependencies
      if (
        employer.companies.length > 0 ||
        employer.ads.length > 0 ||
        employer.mous.length > 0
      ) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Cannot delete employer with active companies, ads, or MOUs. Please deactivate them first.",
              400,
            ),
          );
      }

      // Soft delete by deactivating user
      await req.prisma.user.update({
        where: { id: employer.userId },
        data: { isActive: false },
      });

      res.json(
        createResponse("Employer deleted successfully", { id: employerId }),
      );
    } catch (error) {
      console.error("Error deleting employer:", error);
      next(error);
    }
  }

  // Employer company management is now handled through standard employer routes with role-based access

  // Employer ad management is now handled through standard employer routes with role-based access
}

module.exports = new BranchAdminController();
