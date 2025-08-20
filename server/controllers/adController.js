const { createResponse, createErrorResponse } = require('../utils/response');

class AdController {
  // Get all approved ads (public endpoint)
  async getAds(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        cityId, 
        categoryName = 'Jobs', 
        search, 
        skills,
        experienceLevel,
        employmentType,
        salaryMin,
        salaryMax
      } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);

      let where = {
        status: 'APPROVED',
        isActive: true,
        categoryName,
        ...(cityId && { locationId: cityId })
      };

      // Add search functionality
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { company: { name: { contains: search, mode: 'insensitive' } } }
        ];
      }

      // Category-specific filters for Jobs
      if (categoryName === 'Jobs') {
        if (skills) {
          const skillsArray = skills.split(',').map(s => s.trim());
          where.skills = {
            contains: skillsArray.join(' '),
            mode: 'insensitive'
          };
        }
        
        if (experienceLevel) {
          where.experienceLevel = experienceLevel;
        }
        
        if (employmentType) {
          where.employmentType = employmentType;
        }
        
        if (salaryMin || salaryMax) {
          if (salaryMin) {
            where.salaryMin = { gte: parseFloat(salaryMin) };
          }
          if (salaryMax) {
            where.salaryMax = { lte: parseFloat(salaryMax) };
          }
        }
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
                size: true
              }
            },
            location: {
              select: {
                id: true,
                name: true,
                state: true
              }
            },
            employer: {
              select: {
                isVerified: true
              }
            },
            _count: {
              select: {
                allocations: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        req.prisma.ad.count({ where })
      ]);

      // Add bookmark status if user is authenticated
      let adsWithBookmarks = ads;
      if (req.user && req.user.role === 'CANDIDATE') {
        const candidate = await req.prisma.candidate.findUnique({
          where: { userId: req.user.userId }
        });

        if (candidate) {
          const bookmarks = await req.prisma.bookmark.findMany({
            where: {
              candidateId: candidate.id,
              adId: { in: ads.map(ad => ad.id) }
            }
          });

          const bookmarkedAdIds = new Set(bookmarks.map(b => b.adId));
          adsWithBookmarks = ads.map(ad => ({
            ...ad,
            isBookmarked: bookmarkedAdIds.has(ad.id)
          }));
        }
      }

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      };

      res.json(createResponse('Ads retrieved successfully', adsWithBookmarks, pagination));
    } catch (error) {
      next(error);
    }
  }

  // Get ad by ID (public endpoint)
  async getAdById(req, res, next) {
    try {
      const { adId } = req.params;

      const ad = await req.prisma.ad.findFirst({
        where: {
          id: adId,
          status: 'APPROVED',
          isActive: true
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              description: true,
              logo: true,
              website: true,
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
          employer: {
            select: {
              isVerified: true,
              user: {
                select: {
                  name: true
                }
              }
            }
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
          createErrorResponse('Job posting not found', 404)
        );
      }

      // Add bookmark status and application status if user is authenticated
      let adWithUserStatus = ad;
      if (req.user && req.user.role === 'CANDIDATE') {
        const candidate = await req.prisma.candidate.findUnique({
          where: { userId: req.user.userId }
        });

        if (candidate) {
          const [bookmark, application] = await Promise.all([
            req.prisma.bookmark.findUnique({
              where: {
                candidateId_adId: {
                  candidateId: candidate.id,
                  adId: adId
                }
              }
            }),
            req.prisma.allocation.findFirst({
              where: {
                candidateId: candidate.id,
                adId: adId
              }
            })
          ]);

          adWithUserStatus = {
            ...ad,
            isBookmarked: !!bookmark,
            applicationStatus: application?.status || null,
            hasApplied: !!application
          };
        }
      }

      res.json(createResponse('Ad retrieved successfully', adWithUserStatus));
    } catch (error) {
      next(error);
    }
  }

  // Get categories
  async getCategories(req, res, next) {
    try {
      // For now, return static categories. In future, make this dynamic
      const categories = [
        {
          id: 'jobs',
          name: 'Jobs',
          description: 'Find your dream job in your city',
          isActive: true
        },
        {
          id: 'deals',
          name: 'Local Deals',
          description: 'Exclusive deals from local businesses',
          isActive: false // Coming soon
        },
        {
          id: 'events',
          name: 'Events',
          description: 'Local events and meetups',
          isActive: false // Coming soon
        },
        {
          id: 'classifieds',
          name: 'Classifieds',
          description: 'Buy, sell, and trade locally',
          isActive: false // Coming soon
        }
      ];

      res.json(createResponse('Categories retrieved successfully', categories));
    } catch (error) {
      next(error);
    }
  }

  // Get cities with active ads
  async getCities(req, res, next) {
    try {
      const cities = await req.prisma.city.findMany({
        where: {
          isActive: true,
          ads: {
            some: {
              status: 'APPROVED',
              isActive: true
            }
          }
        },
        include: {
          _count: {
            select: {
              ads: {
                where: {
                  status: 'APPROVED',
                  isActive: true
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.json(createResponse('Cities retrieved successfully', cities));
    } catch (error) {
      next(error);
    }
  }

  // Search suggestions
  async getSearchSuggestions(req, res, next) {
    try {
      const { query, type = 'all', cityId } = req.query;

      if (!query || query.length < 2) {
        return res.json(createResponse('Search suggestions', []));
      }

      const suggestions = [];

      // Job titles and company names
      if (type === 'all' || type === 'jobs') {
        const [jobTitles, companies] = await Promise.all([
          req.prisma.ad.findMany({
            where: {
              status: 'APPROVED',
              isActive: true,
              categoryName: 'Jobs',
              title: { contains: query, mode: 'insensitive' },
              ...(cityId && { locationId: cityId })
            },
            select: { title: true },
            distinct: ['title'],
            take: 5
          }),
          req.prisma.company.findMany({
            where: {
              name: { contains: query, mode: 'insensitive' },
              isActive: true
            },
            select: { name: true },
            distinct: ['name'],
            take: 5
          })
        ]);

        suggestions.push(
          ...jobTitles.map(job => ({ 
            type: 'job_title', 
            value: job.title 
          })),
          ...companies.map(company => ({ 
            type: 'company', 
            value: company.name 
          }))
        );
      }

      // Skills (from master data)
      if (type === 'all' || type === 'skills') {
        const skills = await req.prisma.skill.findMany({
          where: {
            name: { contains: query, mode: 'insensitive' },
            isActive: true
          },
          select: { name: true },
          take: 5
        });

        suggestions.push(
          ...skills.map(skill => ({ 
            type: 'skill', 
            value: skill.name 
          }))
        );
      }

      res.json(createResponse('Search suggestions retrieved', suggestions.slice(0, 10)));
    } catch (error) {
      next(error);
    }
  }

  // Get similar ads
  async getSimilarAds(req, res, next) {
    try {
      const { adId } = req.params;
      const { limit = 5 } = req.query;

      const originalAd = await req.prisma.ad.findUnique({
        where: { id: adId },
        select: {
          categoryName: true,
          locationId: true,
          skills: true,
          experienceLevel: true,
          employmentType: true
        }
      });

      if (!originalAd) {
        return res.status(404).json(
          createErrorResponse('Ad not found', 404)
        );
      }

      // Find similar ads based on category, location, and category-specific fields
      const similarAds = await req.prisma.ad.findMany({
        where: {
          id: { not: adId },
          status: 'APPROVED',
          isActive: true,
          categoryName: originalAd.categoryName,
          locationId: originalAd.locationId
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              industry: true
            }
          },
          location: {
            select: {
              id: true,
              name: true,
              state: true
            }
          }
        },
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      });

      res.json(createResponse('Similar ads retrieved successfully', similarAds));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdController();