const { createResponse, createErrorResponse } = require('../utils/response');

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
        include: { assignedCity: true }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
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
        recentActivity
      ] = await Promise.all([
        // Total ads in city
        req.prisma.ad.count({
          where: { locationId: cityId }
        }),
        // Pending approval ads
        req.prisma.ad.count({
          where: { locationId: cityId, status: 'PENDING_APPROVAL' }
        }),
        // Approved ads
        req.prisma.ad.count({
          where: { locationId: cityId, status: 'APPROVED' }
        }),
        // Total applications
        req.prisma.allocation.count({
          where: {
            ad: { locationId: cityId }
          }
        }),
        // Pending screenings
        req.prisma.allocation.count({
          where: {
            status: 'APPLIED',
            ad: { locationId: cityId, status: 'APPROVED' }
          }
        }),
        // Allocated candidates
        req.prisma.allocation.count({
          where: {
            status: 'ALLOCATED',
            ad: { locationId: cityId }
          }
        }),
        // Active MOUs
        req.prisma.mOU.count({
          where: {
            isActive: true,
            branchAdminId: branchAdmin.id
          }
        }),
        // Total employers in city
        req.prisma.employer.count({
          where: {
            user: { isActive: true }
          }
        }),
        // Recent activity count (last 7 days)
        req.prisma.ad.count({
          where: {
            locationId: cityId,
            createdAt: { gte: lastWeek }
          }
        })
      ]);

      const stats = {
        overview: {
          totalAds,
          pendingApproval: pendingApprovalAds,
          approvedAds,
          totalApplications
        },
        screening: {
          pendingScreenings,
          allocatedCandidates,
          screeningRate: totalApplications > 0 ? ((allocatedCandidates / totalApplications) * 100).toFixed(1) : 0
        },
        mou: {
          activeMOUs,
          totalEmployers,
          mouCoverage: totalEmployers > 0 ? ((activeMOUs / totalEmployers) * 100).toFixed(1) : 0
        },
        activity: {
          recentActivity,
          cityName: branchAdmin.assignedCity?.name || 'Unknown'
        }
      };

      res.json(createResponse('Statistics retrieved successfully', stats));
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
        where: { userId: userId }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      const cityId = branchAdmin.assignedCityId;

      // Get counts for quick actions
      const [
        pendingAds,
        pendingScreenings,
        expiringSoonMOUs,
        recentApplications
      ] = await Promise.all([
        // Pending ads needing approval
        req.prisma.ad.count({
          where: { locationId: cityId, status: 'PENDING_APPROVAL' }
        }),
        // Applications needing screening
        req.prisma.allocation.count({
          where: {
            status: 'APPLIED',
            ad: { locationId: cityId, status: 'APPROVED' }
          }
        }),
        // MOUs expiring in next 30 days
        req.prisma.mOU.count({
          where: {
            branchAdminId: branchAdmin.id,
            isActive: true,
            signedAt: {
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            }
          }
        }),
        // Recent applications (last 24 hours)
        req.prisma.allocation.count({
          where: {
            ad: { locationId: cityId },
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
            }
          }
        })
      ]);

      const quickActions = [
        {
          id: 'pending-ads',
          title: 'Review Pending Ads',
          description: 'Ads waiting for your approval',
          count: pendingAds,
          priority: pendingAds > 5 ? 'high' : pendingAds > 0 ? 'medium' : 'low',
          action: '/branch-admin/ads-approvals'
        },
        {
          id: 'pending-screenings',
          title: 'Screen Candidates',
          description: 'Applications requiring review',
          count: pendingScreenings,
          priority: pendingScreenings > 10 ? 'high' : pendingScreenings > 0 ? 'medium' : 'low',
          action: '/branch-admin/screening'
        },
        {
          id: 'expiring-mous',
          title: 'Expiring MOUs',
          description: 'MOUs expiring in 30 days',
          count: expiringSoonMOUs,
          priority: expiringSoonMOUs > 0 ? 'high' : 'low',
          action: '/branch-admin/mou'
        },
        {
          id: 'recent-applications',
          title: 'Recent Applications',
          description: 'New applications (24h)',
          count: recentApplications,
          priority: 'info',
          action: '/branch-admin/screening'
        }
      ];

      res.json(createResponse('Quick actions retrieved successfully', quickActions));
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
        search = '',
        status = '',
        categoryName = '',
        employerId = '',
        mouStatus = '',
        sortBy = 'updatedAt',
        sortOrder = 'desc'
      } = req.query;

      // Get branch admin info
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
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
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { employer: { user: { name: { contains: search, mode: 'insensitive' } } } }
          ]
        })
      };

      // Add MOU status filter if specified
      if (mouStatus) {
        if (mouStatus === 'active') {
          where.employer = {
            ...where.employer,
            mous: {
              some: {
                isActive: true,
                branchAdminId: branchAdmin.id
              }
            }
          };
        } else if (mouStatus === 'inactive') {
          where.employer = {
            ...where.employer,
            mous: {
              none: {
                isActive: true,
                branchAdminId: branchAdmin.id
              }
            }
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
                  select: { name: true, email: true }
                },
                mous: {
                  where: {
                    isActive: true,
                    branchAdminId: branchAdmin.id
                  },
                  select: { id: true, feeType: true, feeValue: true, signedAt: true }
                }
              }
            },
            _count: {
              select: { allocations: true }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: offset,
          take: parseInt(limit)
        }),
        req.prisma.ad.count({ where })
      ]);

      const result = {
        ads: ads.map(ad => ({
          ...ad,
          hasActiveMOU: ad.employer.mous.length > 0,
          applicationCount: ad._count.allocations
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit)
        }
      };

      res.json(createResponse('Ads retrieved successfully', result));
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
      console.log('Branch Admin getProfile - User ID:', req.user.userId || req.user.id);
      
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
              createdAt: true
            }
          },
          assignedCity: {
            select: {
              id: true,
              name: true,
              state: true,
              country: true
            }
          },
          mous: {
            where: { isActive: true },
            include: {
              employer: {
                include: {
                  user: {
                    select: { name: true, email: true }
                  }
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          _count: {
            select: {
              mous: true
            }
          }
        }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      // Get recent activity summary
      const cityId = branchAdmin.assignedCityId;
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const [
        pendingAdsCount,
        recentApprovals,
        pendingScreenings,
        recentAllocations
      ] = await Promise.all([
        req.prisma.ad.count({
          where: { locationId: cityId, status: 'PENDING_APPROVAL' }
        }),
        req.prisma.ad.count({
          where: { 
            locationId: cityId, 
            status: 'APPROVED',
            approvedAt: { gte: lastWeek },
            approvedBy: req.user.userId
          }
        }),
        req.prisma.allocation.count({
          where: {
            status: 'APPLIED',
            ad: { locationId: cityId, status: 'APPROVED' }
          }
        }),
        req.prisma.allocation.count({
          where: {
            status: 'ALLOCATED',
            allocatedBy: req.user.userId,
            allocatedAt: { gte: lastWeek }
          }
        })
      ]);

      const profileData = {
        ...branchAdmin,
        activitySummary: {
          pendingAds: pendingAdsCount,
          recentApprovals,
          pendingScreenings,
          recentAllocations
        },
        hasActiveMOUs: branchAdmin.mous.length > 0
      };

      res.json(createResponse('Profile retrieved successfully', profileData));
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
        where: { userId: userId }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      const updatedBranchAdmin = await req.prisma.branchAdmin.update({
        where: { userId: userId },
        data: {
          ...(performanceMetrics && { performanceMetrics })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          assignedCity: true
        }
      });

      res.json(createResponse('Profile updated successfully', updatedBranchAdmin));
    } catch (error) {
      next(error);
    }
  }

  // Get performance metrics (NEW)
  async getPerformance(req, res, next) {
    try {
      const { timeframe = '30' } = req.query; // days
      const days = parseInt(timeframe);
      
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
        include: { assignedCity: true }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
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
        candidatesAllocated,
        averageReviewTime,
        totalApplicationsProcessed,
        currentPendingAds,
        currentPendingScreenings
      ] = await Promise.all([
        // Ads reviewed in timeframe
        req.prisma.ad.count({
          where: {
            locationId: cityId,
            approvedBy: req.user.userId,
            approvedAt: { gte: startDate }
          }
        }),
        // Ads approved
        req.prisma.ad.count({
          where: {
            locationId: cityId,
            status: 'APPROVED',
            approvedBy: req.user.userId,
            approvedAt: { gte: startDate }
          }
        }),
        // Ads rejected (archived)
        req.prisma.ad.count({
          where: {
            locationId: cityId,
            status: 'ARCHIVED',
            updatedAt: { gte: startDate }
          }
        }),
        // Candidates screened
        req.prisma.allocation.count({
          where: {
            status: { in: ['SCREENED', 'ALLOCATED'] },
            allocatedBy: req.user.userId,
            updatedAt: { gte: startDate },
            ad: { locationId: cityId }
          }
        }),
        // Candidates allocated to employers
        req.prisma.allocation.count({
          where: {
            status: 'ALLOCATED',
            allocatedBy: req.user.userId,
            allocatedAt: { gte: startDate },
            ad: { locationId: cityId }
          }
        }),
        // Average review time calculation would need more complex query
        null, // Placeholder for now
        // Total applications processed
        req.prisma.allocation.count({
          where: {
            allocatedBy: req.user.userId,
            updatedAt: { gte: startDate },
            ad: { locationId: cityId }
          }
        }),
        // Current pending items
        req.prisma.ad.count({
          where: { locationId: cityId, status: 'PENDING_APPROVAL' }
        }),
        req.prisma.allocation.count({
          where: {
            status: 'APPLIED',
            ad: { locationId: cityId, status: 'APPROVED' }
          }
        })
      ]);

      // Calculate rates
      const approvalRate = totalAdsReviewed > 0 ? 
        Math.round((adsApproved / totalAdsReviewed) * 100) : 0;
      
      const allocationRate = candidatesScreened > 0 ? 
        Math.round((candidatesAllocated / candidatesScreened) * 100) : 0;

      const performance = {
        timeframe: `${days} days`,
        city: branchAdmin.assignedCity,
        metrics: {
          adReview: {
            totalReviewed: totalAdsReviewed,
            approved: adsApproved,
            rejected: adsRejected,
            approvalRate: `${approvalRate}%`
          },
          candidateScreening: {
            screened: candidatesScreened,
            allocated: candidatesAllocated,
            allocationRate: `${allocationRate}%`,
            totalProcessed: totalApplicationsProcessed
          },
          currentWorkload: {
            pendingAds: currentPendingAds,
            pendingScreenings: currentPendingScreenings
          },
          efficiency: {
            averageReviewTime: averageReviewTime || 'N/A',
            dailyAverage: Math.round(totalApplicationsProcessed / days)
          }
        },
        targets: {
          dailyAdReviews: 10,
          dailyScreenings: 15,
          targetApprovalRate: '85%',
          targetAllocationRate: '70%'
        }
      };

      res.json(createResponse('Performance metrics retrieved successfully', performance));
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
        where: { userId: req.user.userId }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      const ad = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          locationId: branchAdmin.assignedCityId
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
              size: true,
              website: true
            }
          },
          location: {
            select: {
              id: true,
              name: true,
              state: true,
              country: true
            }
          },
          employer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true
                }
              },
              mous: {
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
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
                      email: true
                    }
                  }
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              allocations: true
            }
          }
        }
      });

      if (!ad) {
        return res.status(404).json(
          createErrorResponse('Ad not found in your assigned city', 404)
        );
      }

      // Calculate application statistics
      const applicationStats = {
        total: ad.allocations.length,
        applied: ad.allocations.filter(a => a.status === 'APPLIED').length,
        screened: ad.allocations.filter(a => a.status === 'SCREENED').length,
        allocated: ad.allocations.filter(a => a.status === 'ALLOCATED').length,
        shortlisted: ad.allocations.filter(a => a.status === 'SHORTLISTED').length,
        hired: ad.allocations.filter(a => a.status === 'HIRED').length,
        rejected: ad.allocations.filter(a => a.status === 'REJECTED').length
      };

      const adWithStats = {
        ...ad,
        applicationStats,
        hasActiveMOU: ad.employer.mous.length > 0,
        canApprove: ad.status === 'PENDING_APPROVAL' && ad.employer.mous.length > 0
      };

      res.json(createResponse('Ad details retrieved successfully', adWithStats));
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
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      // Build dynamic where conditions
      const where = {
        ad: {
          locationId: branchAdmin.assignedCityId,
          status: 'APPROVED'
        }
      };

      if (status) {
        where.status = status;
      }

      if (candidateName) {
        where.candidate = {
          user: {
            name: {
              contains: candidateName,
              mode: 'insensitive'
            }
          }
        };
      }

      if (companyName) {
        where.ad.company = {
          name: {
            contains: companyName,
            mode: 'insensitive'
          }
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
                    city: true
                  }
                }
              }
            },
            ad: {
              include: {
                company: {
                  select: {
                    name: true,
                    industry: true
                  }
                },
                location: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder }
        }),
        req.prisma.allocation.count({ where })
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      };

      res.json(createResponse('Applications retrieved successfully', allocations, pagination));
    } catch (error) {
      next(error);
    }
  }

  // Get specific allocation details (NEW)
  async getApplication(req, res, next) {
    try {
      const { allocationId } = req.params;

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      const allocation = await req.prisma.allocation.findFirst({
        where: {
          id: allocationId,
          ad: {
            locationId: branchAdmin.assignedCityId
          }
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
                  createdAt: true
                }
              }
            }
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
                  website: true
                }
              },
              location: true,
              employer: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                      phone: true
                    }
                  },
                  mous: {
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                  }
                }
              }
            }
          }
        }
      });

      if (!allocation) {
        return res.status(404).json(
          createErrorResponse('Application not found in your assigned city', 404)
        );
      }

      // Add additional context with simple calculations
      const enrichedAllocation = {
        ...allocation,
        canScreen: ['APPLIED'].includes(allocation.status),
        canAllocate: ['SCREENED'].includes(allocation.status),
        hasActiveMOU: allocation.ad.employer.mous.length > 0,
        skillMatch: 85, // Placeholder - would calculate based on skills matching
        timeInStatus: 'N/A' // Placeholder - would calculate time since last update
      };

      res.json(createResponse('Application details retrieved successfully', enrichedAllocation));
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
        where: { userId: req.user.userId }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      // Verify allocation is in admin's city and can be allocated
      const allocation = await req.prisma.allocation.findFirst({
        where: {
          id: allocationId,
          ad: {
            locationId: branchAdmin.assignedCityId
          },
          status: 'SCREENED'
        },
        include: {
          candidate: true,
          ad: {
            include: {
              employer: {
                include: {
                  mous: {
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                  }
                }
              }
            }
          }
        }
      });

      if (!allocation) {
        return res.status(404).json(
          createErrorResponse('Application not found or not eligible for allocation', 404)
        );
      }

      // Check if employer has active MOU
      if (allocation.ad.employer.mous.length === 0) {
        return res.status(403).json(
          createErrorResponse('Cannot allocate candidate - employer has no active MOU', 403)
        );
      }

      // Get MOU fee information
      const activeMOU = allocation.ad.employer.mous[0];

      // Update allocation to ALLOCATED status
      const updatedAllocation = await req.prisma.allocation.update({
        where: { id: allocationId },
        data: {
          status: 'ALLOCATED',
          notes,
          allocatedBy: req.user.userId,
          allocatedAt: new Date(),
          feeType: activeMOU.feeType,
          feeValue: activeMOU.feeValue
        },
        include: {
          candidate: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true
                }
              }
            }
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
                      email: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      res.json(createResponse('Candidate allocated to employer successfully', updatedAllocation));
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
      const { page = 1, limit = 10, categoryName } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
        include: { assignedCity: true }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      const where = {
        status: 'PENDING_APPROVAL',
        locationId: branchAdmin.assignedCityId,
        isActive: true,
        ...(categoryName && { categoryName })
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
                    phone: true
                  }
                },
                mous: {
                  where: { isActive: true },
                  orderBy: { createdAt: 'desc' },
                  take: 1
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }),
        req.prisma.ad.count({ where })
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      };

      res.json(createResponse('Pending ads retrieved successfully', ads, pagination));
    } catch (error) {
      next(error);
    }
  }

  // Approve or reject ad
  async reviewAd(req, res, next) {
    try {
      const { adId } = req.params;
      const { action, notes } = req.body; // action: 'approve' or 'reject'

      if (!action || !['approve', 'reject'].includes(action)) {
        return res.status(400).json(
          createErrorResponse('Valid action is required (approve or reject)', 400)
        );
      }

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      // Verify ad is in admin's city and pending approval
      const ad = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          locationId: branchAdmin.assignedCityId,
          status: 'PENDING_APPROVAL'
        },
        include: {
          employer: {
            include: {
              mous: {
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          }
        }
      });

      if (!ad) {
        return res.status(404).json(
          createErrorResponse('Ad not found or not eligible for review', 404)
        );
      }

      // Check if employer has active MOU
      if (action === 'approve' && ad.employer.mous.length === 0) {
        return res.status(403).json(
          createErrorResponse('Cannot approve ad - employer has no active MOU', 403)
        );
      }

      const newStatus = action === 'approve' ? 'APPROVED' : 'ARCHIVED';
      const updatedAd = await req.prisma.ad.update({
        where: { id: adId },
        data: {
          status: newStatus,
          approvedAt: action === 'approve' ? new Date() : null,
          approvedBy: action === 'approve' ? req.user.userId : null
        },
        include: {
          company: true,
          location: true,
          employer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      res.json(createResponse(`Ad ${action}d successfully`, updatedAd));
    } catch (error) {
      next(error);
    }
  }

  // Get applications for screening (LEGACY - DEPRECATED)
  async getApplicationsForScreening(req, res, next) {
    try {
      const { page = 1, limit = 10, status = 'APPLIED' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      const where = {
        status,
        ad: {
          locationId: branchAdmin.assignedCityId,
          status: 'APPROVED'
        }
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
                    city: true
                  }
                }
              }
            },
            ad: {
              include: {
                company: true,
                location: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }),
        req.prisma.allocation.count({ where })
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      };

      res.json(createResponse('Applications retrieved successfully', allocations, pagination));
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
        action // 'screen' or 'allocate'
      } = req.body;

      if (!action || !['screen', 'allocate'].includes(action)) {
        return res.status(400).json(
          createErrorResponse('Valid action is required (screen or allocate)', 400)
        );
      }

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      // Verify allocation is in admin's city
      const allocation = await req.prisma.allocation.findFirst({
        where: {
          id: allocationId,
          ad: {
            locationId: branchAdmin.assignedCityId
          },
          status: { in: ['APPLIED', 'SCREENED'] }
        },
        include: {
          candidate: true,
          ad: {
            include: {
              employer: {
                include: {
                  mous: {
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                  }
                }
              }
            }
          }
        }
      });

      if (!allocation) {
        return res.status(404).json(
          createErrorResponse('Application not found or not eligible for screening', 404)
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
            notes
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
          data: candidateUpdateData
        });
      }

      // Update allocation status and add fee information if allocating
      const allocationUpdateData = {
        status: action === 'screen' ? 'SCREENED' : 'ALLOCATED',
        notes,
        allocatedBy: req.user.userId,
        allocatedAt: action === 'allocate' ? new Date() : null
      };

      if (action === 'allocate' && allocation.ad.employer.mous.length > 0) {
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
                  phone: true
                }
              }
            }
          },
          ad: {
            include: {
              company: true,
              location: true
            }
          }
        }
      });

      res.json(createResponse(`Candidate ${action}ed successfully`, updatedAllocation));
    } catch (error) {
      next(error);
    }
  }

  // Manage MOUs
  async createMOU(req, res, next) {
    try {
      const { 
        employerId, 
        title, 
        description, 
        feeStructure, 
        validUntil, 
        terms, 
        isActive = true,
        // Legacy support for old format
        feeType, 
        feeValue, 
        fileUrl 
      } = req.body;

      // Validate required fields
      if (!employerId) {
        return res.status(400).json(
          createErrorResponse('Employer ID is required', 400)
        );
      }

      // Get the current branch admin ID
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      // Handle both new frontend format and legacy format
      let mouData;
      if (title && feeStructure) {
        // New frontend format
        if (!title || !feeStructure || !feeStructure.type) {
          return res.status(400).json(
            createErrorResponse('Title and fee structure are required', 400)
          );
        }

        if (!['FIXED', 'PERCENTAGE'].includes(feeStructure.type)) {
          return res.status(400).json(
            createErrorResponse('Fee type must be FIXED or PERCENTAGE', 400)
          );
        }

        const feeValue = feeStructure.type === 'FIXED' 
          ? feeStructure.amount 
          : feeStructure.percentage;

        if (!feeValue || isNaN(parseFloat(feeValue))) {
          return res.status(400).json(
            createErrorResponse('Valid fee amount/percentage is required', 400)
          );
        }

        mouData = {
          employerId,
          branchAdminId: branchAdmin.id,
          feeType: feeStructure.type,
          feeValue: parseFloat(feeValue),
          terms: description || null,
          notes: title || null,
          status: 'APPROVED', // Auto-approve since created by branch admin
          signedAt: validUntil ? new Date(validUntil) : new Date(),
          fileUrl: fileUrl || null,
          version: '1.0',
          isActive: Boolean(isActive)
        };
      } else {
        // Legacy format
        if (!feeType || !feeValue) {
          return res.status(400).json(
            createErrorResponse('Fee type and fee value are required', 400)
          );
        }

        mouData = {
          employerId,
          branchAdminId: branchAdmin.id,
          feeType,
          feeValue: parseFloat(feeValue),
          terms: description || null,
          notes: title || null,
          status: 'PENDING_APPROVAL',
          signedAt: new Date(),
          fileUrl: fileUrl || null,
          version: '1.0',
          isActive: Boolean(isActive)
        };
      }

      // Check for existing active MOU with same branch admin
      const existingMOU = await req.prisma.mOU.findFirst({
        where: {
          employerId,
          branchAdminId: branchAdmin.id,
          isActive: true
        }
      });

      if (existingMOU && mouData.isActive) {
        return res.status(409).json(
          createErrorResponse('Active MOU already exists with this branch admin', 409)
        );
      }

      // Deactivate previous MOUs for this employer if creating an active MOU
      if (mouData.isActive) {
        await req.prisma.mOU.updateMany({
          where: { 
            employerId,
            isActive: true 
          },
          data: { isActive: false }
        });
      }

      const mou = await req.prisma.mOU.create({
        data: mouData,
        include: {
          employer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          branchAdmin: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      res.status(201).json(createResponse('MOU created successfully', mou));
    } catch (error) {
      console.error('Error creating MOU:', error);
      next(error);
    }
  }

  // Update MOU (NEW)
  async updateMOU(req, res, next) {
    try {
      const { mouId } = req.params;
      const { 
        title, 
        description, 
        feeStructure, 
        validUntil, 
        terms, 
        isActive = true,
        // Legacy support for old format
        feeType, 
        feeValue 
      } = req.body;

      // Get the current branch admin ID
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      // Check if MOU exists and belongs to this branch admin
      const existingMOU = await req.prisma.mOU.findUnique({
        where: { id: mouId }
      });

      if (!existingMOU) {
        return res.status(404).json(
          createErrorResponse('MOU not found', 404)
        );
      }

      if (existingMOU.branchAdminId !== branchAdmin.id) {
        return res.status(403).json(
          createErrorResponse('You can only update MOUs you created', 403)
        );
      }

      // Handle both new frontend format and legacy format
      let updateData;
      if (title && feeStructure) {
        // New frontend format
        if (!feeStructure.type) {
          return res.status(400).json(
            createErrorResponse('Fee structure type is required', 400)
          );
        }

        if (!['FIXED', 'PERCENTAGE'].includes(feeStructure.type)) {
          return res.status(400).json(
            createErrorResponse('Fee type must be FIXED or PERCENTAGE', 400)
          );
        }

        const feeValue = feeStructure.type === 'FIXED' 
          ? feeStructure.amount 
          : feeStructure.percentage;

        if (!feeValue || isNaN(parseFloat(feeValue))) {
          return res.status(400).json(
            createErrorResponse('Valid fee amount/percentage is required', 400)
          );
        }

        updateData = {
          feeType: feeStructure.type,
          feeValue: parseFloat(feeValue),
          terms: description || null,
          notes: title || null,
          isActive: Boolean(isActive)
        };
      } else {
        // Legacy format
        if (!feeType || !feeValue) {
          return res.status(400).json(
            createErrorResponse('Fee type and fee value are required', 400)
          );
        }

        updateData = {
          feeType,
          feeValue: parseFloat(feeValue),
          terms: terms || null,
          isActive: Boolean(isActive)
        };
      }

      const updatedMOU = await req.prisma.mOU.update({
        where: { id: mouId },
        data: updateData,
        include: {
          employer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          branchAdmin: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      res.json(createResponse('MOU updated successfully', updatedMOU));
    } catch (error) {
      console.error('Error updating MOU:', error);
      next(error);
    }
  }

  // Get city statistics
  async getCityStats(req, res, next) {
    try {
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId },
        include: { assignedCity: true }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      const cityId = branchAdmin.assignedCityId;

      // Get various statistics
      const [
        totalAds,
        pendingAds,
        approvedAds,
        totalApplications,
        pendingScreenings,
        totalAllocations,
        totalCandidates,
        totalEmployers
      ] = await Promise.all([
        req.prisma.ad.count({ where: { locationId: cityId, isActive: true } }),
        req.prisma.ad.count({ where: { locationId: cityId, status: 'PENDING_APPROVAL' } }),
        req.prisma.ad.count({ where: { locationId: cityId, status: 'APPROVED' } }),
        req.prisma.allocation.count({
          where: {
            ad: { locationId: cityId }
          }
        }),
        req.prisma.allocation.count({
          where: {
            status: 'APPLIED',
            ad: { locationId: cityId, status: 'APPROVED' }
          }
        }),
        req.prisma.allocation.count({
          where: {
            status: 'ALLOCATED',
            ad: { locationId: cityId }
          }
        }),
        req.prisma.user.count({
          where: { cityId, role: 'CANDIDATE', isActive: true }
        }),
        req.prisma.user.count({
          where: { cityId, role: 'EMPLOYER', isActive: true }
        })
      ]);

      const stats = {
        city: branchAdmin.assignedCity,
        ads: {
          total: totalAds,
          pending: pendingAds,
          approved: approvedAds
        },
        applications: {
          total: totalApplications,
          pendingScreening: pendingScreenings,
          allocated: totalAllocations
        },
        users: {
          candidates: totalCandidates,
          employers: totalEmployers
        }
      };

      res.json(createResponse('City statistics retrieved successfully', stats));
    } catch (error) {
      next(error);
    }
  }

  // Get employers in city
  async getCityEmployers(req, res, next) {
    try {
      const { page = 1, limit = 10, hasActiveMOU } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      const where = {
        cityId: branchAdmin.assignedCityId,
        role: 'EMPLOYER',
        isActive: true
      };

      const [employers, total] = await Promise.all([
        req.prisma.user.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            employer: {
              include: {
                companies: {
                  select: {
                    id: true,
                    name: true,
                    industry: true
                  }
                },
                mous: {
                  where: hasActiveMOU === 'true' ? { isActive: true } : {},
                  orderBy: { createdAt: 'desc' },
                  take: 1
                },
                ads: {
                  select: {
                    id: true,
                    status: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        req.prisma.user.count({ where })
      ]);

      // Filter by MOU status if requested
      let filteredEmployers = employers;
      if (hasActiveMOU === 'true') {
        filteredEmployers = employers.filter(emp => 
          emp.employer && emp.employer.mous.length > 0
        );
      } else if (hasActiveMOU === 'false') {
        filteredEmployers = employers.filter(emp => 
          !emp.employer || emp.employer.mous.length === 0
        );
      }

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredEmployers.length,
        pages: Math.ceil(filteredEmployers.length / parseInt(limit)),
        hasNext: skip + parseInt(limit) < filteredEmployers.length,
        hasPrev: parseInt(page) > 1
      };

      res.json(createResponse('Employers retrieved successfully', filteredEmployers, pagination));
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // NEW MISSING METHODS
  // =======================

  // Get employers with pagination
  async getEmployers(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', status = '' } = req.query;
      const offset = (page - 1) * limit;

      const whereCondition = {
        user: {
          role: 'EMPLOYER'
        }
      };

      if (search) {
        whereCondition.OR = [
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { companyName: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (status) {
        whereCondition.user.isActive = status === 'ACTIVE';
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
                isActive: true,
                createdAt: true
              }
            },
            _count: {
              select: {
                ads: true,
                mous: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: parseInt(limit)
        }),
        req.prisma.employer.count({ where: whereCondition })
      ]);

      res.json({
        employers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: offset + parseInt(limit) < totalCount,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Error fetching employers:', error);
      res.status(500).json({ error: 'Failed to fetch employers' });
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
                createdAt: true
              }
            },
            _count: {
              select: {
                allocations: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: parseInt(limit)
        }),
        req.prisma.candidate.count()
      ]);

      res.json({
        candidates,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: offset + parseInt(limit) < totalCount,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Error fetching candidates:', error);
      res.status(500).json({ error: 'Failed to fetch candidates' });
    }
  }

  // Get all MOUs
  async getMous(req, res, next) {
    try {
      const mous = await req.prisma.mOU.findMany({
        include: {
          employer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          branchAdmin: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ mous });
    } catch (error) {
      console.error('Error fetching MOUs:', error);
      res.status(500).json({ error: 'Failed to fetch MOUs' });
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
        totalMous: await req.prisma.mOU.count()
      };

      res.json({ statistics: stats });
    } catch (error) {
      console.error('Error fetching report statistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
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
          hasPrev: false
        }
      });
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
  }

  // Get employer details
  async getEmployerDetails(req, res, next) {
    try {
      const { employerId } = req.params
      
      const employer = await req.prisma.employer.findUnique({
        where: { id: employerId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
              createdAt: true
            }
          },
          companies: {
            include: {
              city: true
            }
          },
          ads: {
            include: {
              company: true,
              location: true
            },
            orderBy: { createdAt: 'desc' }
          },
          mous: {
            include: {
              branchAdmin: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true
                    }
                  }
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          allocations: {
            include: {
              candidate: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true
                    }
                  }
                }
              },
              ad: {
                select: {
                  title: true
                }
              }
            }
          },
          _count: {
            select: {
              ads: true,
              mous: true,
              allocations: true
            }
          }
        }
      })

      if (!employer) {
        return res.status(404).json({ error: 'Employer not found' })
      }

      res.json(employer)
    } catch (error) {
      console.error('Error fetching employer details:', error)
      res.status(500).json({ error: 'Failed to fetch employer details' })
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
              updatedAt: true
            }
          },
          assignedCity: {
            select: {
              id: true,
              name: true,
              state: true
            }
          }
        }
      })

      if (!branchAdmin) {
        return res.status(404).json({ error: 'Branch admin profile not found' })
      }

      res.json(branchAdmin)
    } catch (error) {
      console.error('Error fetching admin profile:', error)
      res.status(500).json({ error: 'Failed to fetch profile' })
    }
  }

  // Update admin profile
  async updateProfile(req, res, next) {
    try {
      const { name, phone, city, branchName, region, designation } = req.body

      // Update user name if provided
      if (name) {
        await req.prisma.user.update({
          where: { id: req.user.id },
          data: { name }
        })
      }

      // Update branch admin profile
      const updatedProfile = await req.prisma.branchAdmin.update({
        where: { userId: req.user.id },
        data: {
          phone,
          city,
          branchName,
          region,
          designation
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      })

      res.json(updatedProfile)
    } catch (error) {
      console.error('Error updating admin profile:', error)
      res.status(500).json({ error: 'Failed to update profile' })
    }
  }

  // Update admin password
  async updatePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' })
      }

      // Get current user
      const user = await req.prisma.user.findUnique({
        where: { id: req.user.id }
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Verify current password
      const bcrypt = require('bcryptjs')
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' })
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10)

      // Update password
      await req.prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedNewPassword }
      })

      res.json({ message: 'Password updated successfully' })
    } catch (error) {
      console.error('Error updating password:', error)
      res.status(500).json({ error: 'Failed to update password' })
    }
  }

  // Approve ad
  async approveAd(req, res, next) {
    try {
      const { adId } = req.params
      
      const updatedAd = await req.prisma.ad.update({
        where: { id: adId },
        data: { status: 'APPROVED' }
      })

      res.json({ message: 'Ad approved successfully', ad: updatedAd })
    } catch (error) {
      console.error('Error approving ad:', error)
      res.status(500).json({ error: 'Failed to approve ad' })
    }
  }

  // Reject ad
  async rejectAd(req, res, next) {
    try {
      const { adId } = req.params
      const { reason } = req.body
      
      const updatedAd = await req.prisma.ad.update({
        where: { id: adId },
        data: { 
          status: 'DRAFT'
        }
      })

      res.json({ message: 'Ad rejected successfully', ad: updatedAd })
    } catch (error) {
      console.error('Error rejecting ad:', error)
      res.status(500).json({ error: 'Failed to reject ad' })
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
        industry 
      } = req.body;

      // Get branch admin info
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      // Check if user with email already exists
      const existingUser = await req.prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json(
          createErrorResponse('User with this email already exists', 400)
        );
      }

      // Hash password
      const bcrypt = require('bcryptjs');
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
            role: 'EMPLOYER',
            cityId,
            isActive: true
          }
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
              industry
            },
            createdBy: req.user.userId
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
                    country: true
                  }
                }
              }
            }
          }
        });

        return employer;
      });

      res.status(201).json(createResponse('Employer created successfully', result));
    } catch (error) {
      console.error('Error creating employer:', error);
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
        where: { userId: req.user.userId }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      // Check if employer exists
      const employer = await req.prisma.employer.findUnique({
        where: { id: employerId },
        include: { user: true }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer not found', 404)
        );
      }

      // Update in transaction
      const result = await req.prisma.$transaction(async (prisma) => {
        // Update user if user data provided
        if (updateData.name || updateData.email || updateData.phone || updateData.cityId) {
          await prisma.user.update({
            where: { id: employer.userId },
            data: {
              ...(updateData.name && { name: updateData.name }),
              ...(updateData.email && { email: updateData.email }),
              ...(updateData.phone && { phone: updateData.phone }),
              ...(updateData.cityId && { cityId: updateData.cityId })
            }
          });
        }

        // Update employer profile
        const updatedEmployer = await prisma.employer.update({
          where: { id: employerId },
          data: {
            ...(updateData.contactDetails && { contactDetails: updateData.contactDetails }),
            updatedBy: req.user.userId,
            updatedAt: new Date()
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
                    country: true
                  }
                }
              }
            }
          }
        });

        return updatedEmployer;
      });

      res.json(createResponse('Employer updated successfully', result));
    } catch (error) {
      console.error('Error updating employer:', error);
      next(error);
    }
  }

  // Delete employer
  async deleteEmployer(req, res, next) {
    try {
      const { employerId } = req.params;

      // Get branch admin info
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { userId: req.user.userId }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch Admin profile not found', 404)
        );
      }

      // Check if employer exists
      const employer = await req.prisma.employer.findUnique({
        where: { id: employerId },
        include: {
          companies: { where: { isActive: true } },
          ads: { where: { status: { in: ['APPROVED', 'PENDING_APPROVAL'] } } },
          mous: { where: { isActive: true } }
        }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer not found', 404)
        );
      }

      // Check if employer has active dependencies
      if (employer.companies.length > 0 || employer.ads.length > 0 || employer.mous.length > 0) {
        return res.status(400).json(
          createErrorResponse(
            'Cannot delete employer with active companies, ads, or MOUs. Please deactivate them first.',
            400
          )
        );
      }

      // Soft delete by deactivating user
      await req.prisma.user.update({
        where: { id: employer.userId },
        data: { isActive: false }
      });

      res.json(createResponse('Employer deleted successfully', { id: employerId }));
    } catch (error) {
      console.error('Error deleting employer:', error);
      next(error);
    }
  }

  // =======================
  // EMPLOYER COMPANY MANAGEMENT
  // =======================

  // Get companies for specific employer
  async getEmployerCompanies(req, res, next) {
    try {
      const { employerId } = req.params;

      // Verify employer exists and belongs to branch admin's assigned city
      const employer = await req.prisma.employer.findFirst({
        where: {
          id: employerId,
          user: { isActive: true }
        },
        include: {
          companies: {
            include: {
              city: { select: { id: true, name: true, state: true } }
            }
          }
        }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer not found', 404)
        );
      }

      res.json(createResponse('Companies retrieved successfully', {
        companies: employer.companies,
        total: employer.companies.length
      }));
    } catch (error) {
      next(error);
    }
  }

  // Create company for employer
  async createEmployerCompany(req, res, next) {
    try {
      const { employerId } = req.params;
      const {
        name,
        description,
        industry,
        companySize,
        website,
        cityId,
        address,
        logoUrl
      } = req.body;

      // Verify employer exists
      const employer = await req.prisma.employer.findUnique({
        where: { id: employerId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer not found', 404)
        );
      }

      const company = await req.prisma.company.create({
        data: {
          name,
          description,
          industry,
          companySize,
          website,
          cityId,
          address,
          logoUrl,
          employerId
        },
        include: {
          city: { select: { id: true, name: true, state: true } }
        }
      });

      res.status(201).json(createResponse('Company created successfully', company));
    } catch (error) {
      next(error);
    }
  }

  // Update company for employer
  async updateEmployerCompany(req, res, next) {
    try {
      const { employerId, companyId } = req.params;
      const updateData = req.body;

      // Verify company belongs to the employer
      const company = await req.prisma.company.findFirst({
        where: {
          id: companyId,
          employerId
        }
      });

      if (!company) {
        return res.status(404).json(
          createErrorResponse('Company not found for this employer', 404)
        );
      }

      const updatedCompany = await req.prisma.company.update({
        where: { id: companyId },
        data: updateData,
        include: {
          city: { select: { id: true, name: true, state: true } }
        }
      });

      res.json(createResponse('Company updated successfully', updatedCompany));
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // EMPLOYER AD MANAGEMENT
  // =======================

  // Get ads for specific employer
  async getEmployerAds(req, res, next) {
    try {
      const { employerId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where = {
        company: { employerId }
      };

      if (status) {
        where.status = status;
      }

      const [ads, totalCount] = await Promise.all([
        req.prisma.ad.findMany({
          where,
          include: {
            company: {
              select: { id: true, name: true, industry: true }
            },
            location: {
              select: { id: true, name: true, state: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        req.prisma.ad.count({ where })
      ]);

      const totalPages = Math.ceil(totalCount / take);

      res.json(createResponse('Ads retrieved successfully', {
        data: ads,
        pagination: {
          page: parseInt(page),
          limit: take,
          total: totalCount,
          totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }));
    } catch (error) {
      next(error);
    }
  }

  // Create ad for employer
  async createEmployerAd(req, res, next) {
    try {
      const { employerId } = req.params;
      const {
        companyId,
        categoryName,
        title,
        description,
        locationId,
        validUntil,
        categorySpecificFields,
        contactInfo
      } = req.body;

      // Verify company belongs to the employer
      const company = await req.prisma.company.findFirst({
        where: {
          id: companyId,
          employerId
        }
      });

      if (!company) {
        return res.status(404).json(
          createErrorResponse('Company not found for this employer', 404)
        );
      }

      const ad = await req.prisma.ad.create({
        data: {
          employerId,
          companyId,
          categoryName,
          title,
          description,
          locationId,
          validUntil: validUntil ? new Date(validUntil) : undefined,
          categorySpecificFields: categorySpecificFields || {},
          contactInfo: contactInfo || {},
          status: 'DRAFT'
        },
        include: {
          company: true,
          location: true
        }
      });

      res.status(201).json(createResponse('Ad created successfully', ad));
    } catch (error) {
      next(error);
    }
  }

  // Update ad for employer
  async updateEmployerAd(req, res, next) {
    try {
      const { employerId, adId } = req.params;
      const updateData = req.body;

      // Verify ad belongs to the employer
      const ad = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          company: { employerId }
        }
      });

      if (!ad) {
        return res.status(404).json(
          createErrorResponse('Ad not found for this employer', 404)
        );
      }

      // Prepare update data
      const dataToUpdate = { ...updateData };
      if (updateData.validUntil) {
        dataToUpdate.validUntil = new Date(updateData.validUntil);
      }

      const updatedAd = await req.prisma.ad.update({
        where: { id: adId },
        data: dataToUpdate,
        include: {
          company: {
            select: { id: true, name: true, industry: true }
          },
          location: {
            select: { id: true, name: true, state: true }
          }
        }
      });

      res.json(createResponse('Ad updated successfully', updatedAd));
    } catch (error) {
      next(error);
    }
  }

  // Submit ad for approval
  async submitEmployerAdForApproval(req, res, next) {
    try {
      const { employerId, adId } = req.params;

      // Verify ad belongs to the employer
      const ad = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          company: { employerId }
        }
      });

      if (!ad) {
        return res.status(404).json(
          createErrorResponse('Ad not found for this employer', 404)
        );
      }

      if (ad.status !== 'DRAFT') {
        return res.status(400).json(
          createErrorResponse('Only draft ads can be submitted for approval', 400)
        );
      }

      const updatedAd = await req.prisma.ad.update({
        where: { id: adId },
        data: {
          status: 'PENDING_APPROVAL'
        },
        include: {
          company: {
            select: { id: true, name: true, industry: true }
          },
          location: {
            select: { id: true, name: true, state: true }
          }
        }
      });

      res.json(createResponse('Ad submitted for approval successfully', updatedAd));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BranchAdminController();