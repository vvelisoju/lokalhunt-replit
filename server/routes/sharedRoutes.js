const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth'); // Assuming optionalAuth is here

// Get job preview by ID (works for all user roles, includes draft/pending for authorized users)
router.get('/jobs/:id/preview', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Build where condition based on authentication status
    let where = {
      id,
      isActive: true
    };

    // If user is not authenticated, only show approved jobs
    if (!req.user) {
      where.status = 'APPROVED';
    } else {
      // If user is authenticated, allow viewing based on role and ownership
      if (req.user.role === 'EMPLOYER') {
        // Employers can view their own jobs in any status
        const employer = await req.prisma.employer.findUnique({
          where: { userId: req.user.userId }
        });

        if (employer) {
          where.OR = [
            { status: 'APPROVED' }, // Anyone can view approved jobs
            {
              AND: [
                { employerId: employer.id },
                { status: { in: ['DRAFT', 'PENDING_APPROVAL'] } }
              ]
            }
          ];
        } else {
          where.status = 'APPROVED';
        }
      } else if (req.user.role === 'BRANCH_ADMIN' || req.user.role === 'SUPER_ADMIN') {
        // Branch admins and super admins can view all jobs
        // No additional status restriction needed
      } else {
        // Candidates and other roles can only see approved jobs
        where.status = 'APPROVED';
      }
    }

    const job = await req.prisma.ad.findFirst({
      where,
      include: {
        company: true,
        location: true,
        employer: {
          include: {
            user: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Transform job for frontend
    let transformedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      company: {
        id: job.company?.id,
        name: job.company?.name || 'Company Name',
        logo: job.company?.logo,
        industry: job.company?.industry,
        description: job.company?.description,
        website: job.company?.website
      },
      location: job.location ? `${job.location.name}, ${job.location.state}` : 'Remote',
      salary: job.salaryMin && job.salaryMax ?
        `₹${job.salaryMin} - ₹${job.salaryMax}` :
        job.salaryMin ? `₹${job.salaryMin}+` :
        'Negotiable',
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      vacancies: job.numberOfPositions || 1,
      postedAt: job.createdAt,
      jobType: job.employmentType || 'FULL_TIME',
      employmentType: job.employmentType || 'FULL_TIME',
      experienceLevel: job.experienceLevel || 'Not specified',
      skills: job.skills ? job.skills.split(',').map(skill => skill.trim()) : [],
      applicationCount: 0, // Will be updated with real count
      isBookmarked: false,
      hasApplied: false,
      status: job.status
    };

    // Check if the job is bookmarked by the current user
    if (req.user && req.user.role === 'CANDIDATE') {
      const candidate = await req.prisma.candidate.findUnique({
        where: { userId: req.user.userId }
      });
      if (candidate) {
        const bookmark = await req.prisma.bookmark.findFirst({
          where: {
            jobId: job.id,
            candidateId: candidate.id
          }
        });
        transformedJob.isBookmarked = !!bookmark;

        // Check if the candidate has applied for the job
        const application = await req.prisma.application.findFirst({
          where: {
            jobId: job.id,
            candidateId: candidate.id
          }
        });
        transformedJob.hasApplied = !!application;
      }
    }

    // Fetch actual application count if the user has permission
    if (req.user && (req.user.role === 'EMPLOYER' || req.user.role === 'BRANCH_ADMIN' || req.user.role === 'SUPER_ADMIN')) {
      const employer = await req.prisma.employer.findUnique({ where: { userId: req.user.userId } });
      if (employer && (job.employerId === employer.id || req.user.role === 'BRANCH_ADMIN' || req.user.role === 'SUPER_ADMIN')) {
        transformedJob.applicationCount = await req.prisma.application.count({ where: { jobId: job.id } });
      }
    }

    res.json(transformedJob);
  } catch (error) {
    next(error);
  }
});

// Get job by ID for public view (only approved jobs)
router.get('/jobs/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await req.prisma.ad.findFirst({
      where: {
        id,
        status: 'APPROVED',
        isActive: true
      },
      include: {
        company: true,
        location: true,
        employer: {
          include: {
            user: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }



    // Transform job for frontend
    const transformedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      company: {
        id: job.company?.id,
        name: job.company?.name || 'Company Name',
        logo: job.company?.logo,
        industry: job.job?.industry,
        description: job.company?.description,
        website: job.company?.website,
        size: job.company?.size
      },
      location: {
        id: job.location?.id,
        name: job.location?.name,
        state: job.location?.state
      },
      locationName: job.location?.name || 'Remote',
      locationState: job.location?.state || '',
      salary: job.salaryMin && job.salaryMax ?
        `₹${job.salaryMin} - ₹${job.salaryMax}` :
        job.salaryMin ? `₹${job.salaryMin}+` :
        'Negotiable',
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      vacancies: job.numberOfPositions || 1,
      postedAt: job.createdAt,
      jobType: job.employmentType || 'FULL_TIME',
      employmentType: job.employmentType || 'FULL_TIME',
      experienceLevel: job.experienceLevel || 'Not specified',
      skills: job.skills ? job.skills.split(',').map(skill => skill.trim()) : [],
      gender: job.gender,
      applicationCount: 0, // Placeholder, as this endpoint is public
      isBookmarked: false, // Placeholder, as this endpoint is public
      hasApplied: false, // Placeholder, as this endpoint is public
      status: job.status
    };

    res.json(transformedJob);
  } catch (error) {
    next(error);
  }
});

module.exports = router;