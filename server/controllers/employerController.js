const { createResponse, createErrorResponse } = require('../utils/response');

class EmployerController {
  // =======================
  // PROFILE MANAGEMENT
  // =======================

  // Get employer profile (NEW)
  async getProfile(req, res, next) {
    try {
      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId },
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
              city: true,
              isActive: true,
              createdAt: true
            }
          },
          companies: {
            where: { isActive: true },
            include: {
              city: true
            },
            orderBy: { createdAt: 'desc' }
          },
          mous: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Get counts separately to avoid SelectionSetOnScalar error
      const [companiesCount, adsCount, mousCount] = await Promise.all([
        req.prisma.company.count({
          where: { employerId: employer.id, isActive: true }
        }),
        req.prisma.ad.count({
          where: { employerId: employer.id }
        }),
        req.prisma.mOU.count({
          where: { employerId: employer.id, isActive: true }
        })
      ]);

      // Get ads count for each company
      const companiesWithAdCount = await Promise.all(
        employer.companies.map(async (company) => {
          const adCount = await req.prisma.ad.count({
            where: { companyId: company.id }
          });
          return {
            ...company,
            adsCount: adCount
          };
        })
      );

      // Calculate profile completeness
      const profileFields = [
        employer.contactDetails,
        employer.user.phone,
        companiesCount > 0
      ];
      const completedFields = profileFields.filter(field => field).length;
      const profileCompleteness = Math.round((completedFields / profileFields.length) * 100);

      const profileData = {
        ...employer,
        companies: companiesWithAdCount,
        _count: {
          companies: companiesCount,
          ads: adsCount,
          mous: mousCount
        },
        profileCompleteness,
        hasActiveCompanies: companiesCount > 0,
        hasActiveMOU: mousCount > 0
      };

      res.json(createResponse('Profile retrieved successfully', profileData));
    } catch (error) {
      next(error);
    }
  }

  // Update employer profile
  async updateProfile(req, res, next) {
    try {
      const { contactDetails } = req.body;

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
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
              city: true
            }
          },
          companies: true,
          mous: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      res.json(createResponse('Profile updated successfully', updatedEmployer));
    } catch (error) {
      next(error);
    }
  }

  // Create company
  async createCompany(req, res, next) {
    try {
      const { name, description, city, cityId, logo, website, industry, size } = req.body;

      if (!name || (!cityId && !city)) {
        return res.status(400).json(
          createErrorResponse('Company name and city are required', 400)
        );
      }

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // If city name is provided instead of cityId, find the city
      let resolvedCityId = cityId;
      if (!cityId && city) {
        const foundCity = await req.prisma.city.findFirst({
          where: {
            name: { contains: city, mode: 'insensitive' }
          }
        });
        
        if (!foundCity) {
          return res.status(400).json(
            createErrorResponse('City not found. Please select a valid city.', 400)
          );
        }
        resolvedCityId = foundCity.id;
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
          size
        },
        include: {
          city: true
        }
      });

      res.status(201).json(createResponse('Company created successfully', company));
    } catch (error) {
      next(error);
    }
  }

  // Get companies
  async getCompanies(req, res, next) {
    try {
      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      const companies = await req.prisma.company.findMany({
        where: { 
          employerId: employer.id,
          isActive: true
        },
        include: {
          city: true,
          ads: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(createResponse('Companies retrieved successfully', companies));
    } catch (error) {
      next(error);
    }
  }

  // Update company
  async updateCompany(req, res, next) {
    try {
      const { companyId } = req.params;
      const { name, description, cityId, logo, website, industry, size } = req.body;

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Verify company ownership
      const company = await req.prisma.company.findFirst({
        where: {
          id: companyId,
          employerId: employer.id
        }
      });

      if (!company) {
        return res.status(404).json(
          createErrorResponse('Company not found', 404)
        );
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
          size
        },
        include: {
          city: true
        }
      });

      res.json(createResponse('Company updated successfully', updatedCompany));
    } catch (error) {
      next(error);
    }
  }

  // Create ad posting
  async createAd(req, res, next) {
    try {
      const {
        companyId,
        categoryName,
        categoryId,
        title,
        description,
        locationId,
        gender,
        educationQualificationId,
        skills,
        salaryMin,
        salaryMax,
        experienceLevel,
        employmentType,
        contactInfo,
        validUntil,
        status = 'DRAFT'
      } = req.body;

      if (!companyId || !categoryName || !title || !description || !locationId) {
        return res.status(400).json(
          createErrorResponse('Company, category, title, description and location are required', 400)
        );
      }

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Verify company ownership
      const company = await req.prisma.company.findFirst({
        where: {
          id: companyId,
          employerId: employer.id
        }
      });

      if (!company) {
        return res.status(404).json(
          createErrorResponse('Company not found', 404)
        );
      }

      // Check if employer has active MOU (allow creation but warn)
      const activeMOU = await req.prisma.mOU.findFirst({
        where: {
          employerId: employer.id,
          isActive: true
        }
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
          ...(educationQualificationId && { educationQualificationId })
        },
        include: {
          company: true,
          location: true,
          category: true,
          educationQualification: true
        }
      });

      // Return different messages based on MOU status
      if (!activeMOU) {
        res.status(201).json(createResponse(
          'Ad created successfully as draft. Note: Active MOU required for final approval by Branch Admin.', 
          { ...ad, mouWarning: true }
        ));
      } else {
        res.status(201).json(createResponse('Ad created successfully and sent for approval', ad));
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
        title, 
        description, 
        categoryName = 'Jobs',
        categoryId,
        companyId,
        city,
        employmentType,
        experienceLevel,
        salaryMin,
        salaryMax,
        skills,
        validUntil,
        gender,
        educationQualificationId
      } = req.body;

      // Validate required fields
      if (!title || !description || !companyId) {
        return res.status(400).json(
          createErrorResponse('Title, description, and company are required', 400)
        );
      }

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Check if ad exists and belongs to employer
      const existingAd = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          employerId: employer.id
        }
      });

      if (!existingAd) {
        return res.status(404).json(
          createErrorResponse('Ad not found', 404)
        );
      }

      // Get location ID if city is provided
      let locationId = null;
      if (city) {
        const location = await req.prisma.city.findUnique({
          where: { id: city }
        });
        if (location) {
          locationId = location.id;
        }
      }

      // Update the ad
      const updatedAd = await req.prisma.ad.update({
        where: { id: adId },
        data: {
          title,
          description,
          categoryName,
          gender,
          skills: skills ? skills.split(',').map(s => s.trim()).filter(s => s).join(', ') : null,
          salaryMin: salaryMin ? parseFloat(salaryMin) : null,
          salaryMax: salaryMax ? parseFloat(salaryMax) : null,
          experienceLevel,
          employmentType,
          validUntil: validUntil ? new Date(validUntil) : undefined,
          updatedAt: new Date(),
          ...(companyId && {
            company: {
              connect: { id: companyId }
            }
          }),
          ...(locationId && {
            location: {
              connect: { id: locationId }
            }
          }),
          ...(categoryId && {
            category: {
              connect: { id: categoryId }
            }
          }),
          ...(educationQualificationId && {
            educationQualification: {
              connect: { id: educationQualificationId }
            }
          })
        },
        include: {
          company: true,
          location: true,
          category: true,
          educationQualification: true
        }
      });

      res.json(createResponse('Ad updated successfully', updatedAd));
    } catch (error) {
      next(error);
    }
  }

  // Get ads
  async getAds(req, res, next) {
    try {
      const { page = 1, limit = 10, status, categoryName, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Build where condition with proper status filtering
      const where = {
        employerId: employer.id,
        ...(status && status.trim() && status !== 'ALL' && typeof status === 'string' && { status: status.trim() }),
        ...(categoryName && { categoryName }),
        ...(search && search.trim() && {
          OR: [
            { title: { contains: search.trim(), mode: 'insensitive' } },
            { description: { contains: search.trim(), mode: 'insensitive' } },
            { company: { name: { contains: search.trim(), mode: 'insensitive' } } },
            { location: { name: { contains: search.trim(), mode: 'insensitive' } } }
          ]
        })
      };

      const [ads, total] = await Promise.all([
        req.prisma.ad.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            company: true,
            location: true,
            allocations: {
              select: {
                id: true,
                status: true,
                candidate: {
                  select: {
                    id: true,
                    tags: true,
                    ratings: true,
                    overallRating: true,
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
          },
          orderBy: { createdAt: 'desc' }
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

      res.json(createResponse('Ads retrieved successfully', ads, pagination));
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

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Verify ad ownership
      const ad = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          employerId: employer.id
        }
      });

      if (!ad) {
        return res.status(404).json(
          createErrorResponse('Ad not found', 404)
        );
      }

      const [allocations, total] = await Promise.all([
        req.prisma.allocation.findMany({
          where: {
            adId: adId,
            status: { in: ['ALLOCATED', 'SHORTLISTED', 'HIRED', 'REJECTED'] }
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
                    city: true
                  }
                }
              }
            }
          },
          orderBy: { allocatedAt: 'desc' }
        }),
        req.prisma.allocation.count({
          where: {
            adId: adId,
            status: { in: ['ALLOCATED', 'SHORTLISTED', 'HIRED', 'REJECTED'] }
          }
        })
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      };

      res.json(createResponse('Allocated candidates retrieved successfully', allocations, pagination));
    } catch (error) {
      next(error);
    }
  }

  // Update candidate status
  async updateCandidateStatus(req, res, next) {
    try {
      const { allocationId } = req.params;
      const { status, notes } = req.body;

      if (!status || !['SHORTLISTED', 'HIRED', 'REJECTED'].includes(status)) {
        return res.status(400).json(
          createErrorResponse('Valid status is required (SHORTLISTED, HIRED, REJECTED)', 400)
        );
      }

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Verify allocation ownership
      const allocation = await req.prisma.allocation.findFirst({
        where: {
          id: allocationId,
          employerId: employer.id,
          status: { in: ['ALLOCATED', 'SHORTLISTED'] }
        }
      });

      if (!allocation) {
        return res.status(404).json(
          createErrorResponse('Allocation not found or cannot be updated', 404)
        );
      }

      const updatedAllocation = await req.prisma.allocation.update({
        where: { id: allocationId },
        data: {
          status,
          notes
        },
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
              title: true,
              company: {
                select: { name: true }
              }
            }
          }
        }
      });

      res.json(createResponse('Candidate status updated successfully', updatedAllocation));
    } catch (error) {
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

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      const company = await req.prisma.company.findFirst({
        where: {
          id: companyId,
          employerId: employer.id,
          isActive: true
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
                select: { allocations: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              ads: true
            }
          }
        }
      });

      if (!company) {
        return res.status(404).json(
          createErrorResponse('Company not found', 404)
        );
      }

      res.json(createResponse('Company details retrieved successfully', company));
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

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      const ad = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          employerId: employer.id
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              industry: true,
              size: true
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
          category: {
            select: {
              id: true,
              name: true
            }
          },
          educationQualification: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (!ad) {
        return res.status(404).json(
          createErrorResponse('Ad not found', 404)
        );
      }

      // Process category-specific fields for frontend compatibility
      let processedAd = { ...ad };
      if (ad.categorySpecificFields && ad.categoryName === 'Jobs') {
        const categoryFields = ad.categorySpecificFields;
        processedAd = {
          ...ad,
          jobType: categoryFields.employmentType || 'Full Time',
          employmentType: categoryFields.employmentType,
          experienceLevel: categoryFields.experienceLevel,
          skills: Array.isArray(categoryFields.skills) ? categoryFields.skills.join(', ') : '',
          salaryMin: categoryFields.salaryMin,
          salaryMax: categoryFields.salaryMax
        };
      }

      res.json(createResponse('Ad details retrieved successfully', processedAd));
    } catch (error) {
      next(error);
    }
  }

  // Submit ad for approval (NEW)
  async submitForApproval(req, res, next) {
    try {
      const { adId } = req.params;

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Check if ad exists and belongs to employer
      const existingAd = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          employerId: employer.id
        }
      });

      if (!existingAd) {
        return res.status(404).json(
          createErrorResponse('Ad not found', 404)
        );
      }

      // Update the ad status to PENDING_APPROVAL
      const submittedAd = await req.prisma.ad.update({
        where: { id: adId },
        data: { 
          status: 'PENDING_APPROVAL',
          updatedAt: new Date()
        },
        include: {
          company: true,
          location: true
        }
      });

      res.json(createResponse('Ad submitted for approval successfully', submittedAd));
    } catch (error) {
      next(error);
    }
  }

  // Archive ad (NEW)
  async archiveAd(req, res, next) {
    try {
      const { adId } = req.params;

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Verify ad ownership
      const adToArchive = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          employerId: employer.id
        }
      });

      if (!adToArchive) {
        return res.status(404).json(
          createErrorResponse('Ad not found', 404)
        );
      }

      // Update ad status to ARCHIVED
      const archivedAd = await req.prisma.ad.update({
        where: { id: adId },
        data: { 
          status: 'ARCHIVED',
          updatedAt: new Date()
        },
        include: {
          company: true,
          location: true
        }
      });

      res.status(200).json(createResponse('Ad archived successfully', archivedAd));
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

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      const where = {
        employerId: employer.id,
        ...(status && { isActive: status === 'active' })
      };

      const [mous, total] = await Promise.all([
        req.prisma.mOU.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        req.prisma.mOU.count({ where })
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      };

      res.json(createResponse('MOUs retrieved successfully', mous, pagination));
    } catch (error) {
      next(error);
    }
  }

  // Create/sign new MOU agreement (NEW)
  async createMOU(req, res, next) {
    try {
      const {
        branchAdminId,
        feeType,
        feeAmount,
        feePercentage,
        terms,
        notes
      } = req.body;

      if (!branchAdminId || !feeType || (!feeAmount && !feePercentage)) {
        return res.status(400).json(
          createErrorResponse('Branch admin, fee type, and fee amount/percentage are required', 400)
        );
      }

      if (!['FIXED', 'PERCENTAGE'].includes(feeType)) {
        return res.status(400).json(
          createErrorResponse('Fee type must be FIXED or PERCENTAGE', 400)
        );
      }

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Verify branch admin exists
      const branchAdmin = await req.prisma.branchAdmin.findUnique({
        where: { id: branchAdminId },
        include: {
          user: {
            select: { city: true }
          }
        }
      });

      if (!branchAdmin) {
        return res.status(404).json(
          createErrorResponse('Branch admin not found', 404)
        );
      }

      // Check for existing active MOU with same branch admin
      const existingMOU = await req.prisma.mOU.findFirst({
        where: {
          employerId: employer.id,
          branchAdminId: branchAdminId,
          isActive: true
        }
      });

      if (existingMOU) {
        return res.status(409).json(
          createErrorResponse('Active MOU already exists with this branch admin', 409)
        );
      }

      const mou = await req.prisma.mOU.create({
        data: {
          employerId: employer.id,
          branchAdminId,
          feeType,
          feeValue: feeType === 'FIXED' ? feeAmount : feePercentage,
          terms,
          notes,
          signedAt: new Date(),
          status: 'PENDING_APPROVAL',
          isActive: false
        },

      });

      res.status(201).json(createResponse('MOU created successfully and sent for approval', mou));
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // CANDIDATE SEARCH & MANAGEMENT (NEW)
  // =======================

  // Get all candidates for the employer (NEW)
  async getAllCandidates(req, res, next) {
    try {
      const { page = 1, limit = 20, search, status, skills } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Build search criteria
      let where = {
        user: {
          isActive: true,
          role: 'CANDIDATE'
        }
      };

      // Add search filter if provided
      if (search) {
        where.user.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Add skills filter if provided
      if (skills) {
        const skillArray = skills.split(',').map(skill => skill.trim());
        where.tags = {
          hasSome: skillArray
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
                city: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        req.prisma.candidate.count({ where })
      ]);

      // Process candidates to add computed fields
      const processedCandidates = candidates.map(candidate => {
        // Extract data from profile_data JSONB field
        const profileData = candidate.profile_data || {};
        const experienceData = candidate.experience || {};
        
        return {
          ...candidate,
          currentJobTitle: profileData.currentJobTitle || 'No title specified',
          experience: profileData.experience || experienceData.years || 0,
          expectedSalary: profileData.expectedSalary || profileData.salary || 0,
          currentLocation: profileData.currentLocation || candidate.user?.city || 'Not specified',
          skills: candidate.tags || [],
          bio: profileData.bio || profileData.summary || 'No bio available'
        };
      });

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      };

      res.json(createResponse('Candidates retrieved successfully', { candidates: processedCandidates }, pagination));
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
        excludeApplied = false
      } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Build search criteria
      let where = {
        user: {
          isActive: true,
          ...(cityId && { cityId })
        }
      };

      // Add skills filter if provided
      if (skills) {
        const skillArray = skills.split(',').map(skill => skill.trim());
        where.tags = {
          hasSome: skillArray
        };
      }

      // Add rating filter if provided
      if (minRating) {
        where.overallRating = {
          gte: parseFloat(minRating).toString()
        };
      }

      // Exclude candidates who already applied to employer's jobs
      if (excludeApplied === 'true') {
        where.allocations = {
          none: {
            employerId: employer.id
          }
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
                    state: true
                  }
                }
              }
            },
            _count: {
              select: {
                allocations: true
              }
            }
          },
          orderBy: [
            { overallRating: 'desc' },
            { updatedAt: 'desc' }
          ]
        }),
        req.prisma.candidate.count({ where })
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      };

      res.json(createResponse('Candidates retrieved successfully', candidates, pagination));
    } catch (error) {
      next(error);
    }
  }

  // Bookmark a candidate (NEW)
  async bookmarkCandidate(req, res, next) {
    try {
      const { candidateId } = req.params;
      const { notes } = req.body;

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Verify candidate exists
      const candidate = await req.prisma.candidate.findUnique({
        where: { id: candidateId },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      });

      if (!candidate) {
        return res.status(404).json(
          createErrorResponse('Candidate not found', 404)
        );
      }

      // Check if already bookmarked
      const existingBookmark = await req.prisma.employerBookmark.findUnique({
        where: {
          employerId_candidateId: {
            employerId: employer.id,
            candidateId: candidateId
          }
        }
      });

      if (existingBookmark) {
        return res.status(409).json(
          createErrorResponse('Candidate already bookmarked', 409)
        );
      }

      const bookmark = await req.prisma.employerBookmark.create({
        data: {
          employerId: employer.id,
          candidateId,
          notes
        },
        include: {
          candidate: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  city: {
                    select: { name: true, state: true }
                  }
                }
              }
            }
          }
        }
      });

      res.status(201).json(createResponse('Candidate bookmarked successfully', bookmark));
    } catch (error) {
      next(error);
    }
  }

  // Remove candidate bookmark (NEW)
  async removeBookmark(req, res, next) {
    try {
      const { candidateId } = req.params;

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      const deleted = await req.prisma.employerBookmark.deleteMany({
        where: {
          employerId: employer.id,
          candidateId: candidateId
        }
      });

      if (deleted.count === 0) {
        return res.status(404).json(
          createErrorResponse('Bookmark not found', 404)
        );
      }

      res.json(createResponse('Bookmark removed successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Get bookmarked candidates (NEW)
  async getBookmarkedCandidates(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const employer = await req.prisma.employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
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
                      select: { name: true, state: true }
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        req.prisma.employerBookmark.count({ where: { employerId: employer.id } })
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      };

      res.json(createResponse('Bookmarked candidates retrieved successfully', bookmarks, pagination));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployerController();