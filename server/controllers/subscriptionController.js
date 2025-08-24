const { createResponse, createErrorResponse } = require('../utils/response');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client globally
const prisma = new PrismaClient();

class SubscriptionController {

  // Get all available plans
  async getPlans(req, res, next) {
    try {
      const plans = await (req.prisma || prisma).plan.findMany({
        where: { isActive: true },
        orderBy: { priceMonthly: 'asc' }
      });

      res.json(createResponse('Plans retrieved successfully', plans));
    } catch (error) {
      next(error);
    }
  }

  // Create new subscription for employer
  async createSubscription(req, res, next) {
    try {
      const { 
        planId, 
        pricePerCandidate, 
        priceMonthly, 
        priceYearly,
        startDate,
        endDate,
        isAutoRenew = true,
        employerId: targetEmployerIdFromBody
      } = req.body;

      if (!planId) {
        return res.status(400).json(
          createErrorResponse('Plan ID is required', 400)
        );
      }

      // Determine target employer based on role and parameters
      let employer;
      const targetEmployerId = req.targetEmployerId || targetEmployerIdFromBody;

      if (req.user.role === 'BRANCH_ADMIN' && targetEmployerId) {
        // Branch Admin accessing specific employer
        employer = await (req.prisma || prisma).employer.findUnique({
          where: { id: targetEmployerId }
        });
      } else {
        // Regular employer accessing their own data
        employer = await (req.prisma || prisma).employer.findUnique({
          where: { userId: req.user.userId }
        });
      }

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Check if employer already has an active subscription
      const existingSubscription = await (req.prisma || prisma).subscription.findFirst({
        where: {
          employerId: employer.id,
          status: 'ACTIVE'
        },
        include: {
          plan: true
        }
      });

      // Allow upgrading from Self-Service free plan to paid plans
      if (existingSubscription) {
        // If current subscription is Self-Service (free plan), allow upgrading to paid plans
        if (existingSubscription.plan?.name === 'Self-Service') {
          // Cancel the existing free subscription before creating new one
          await (req.prisma || prisma).subscription.update({
            where: { id: existingSubscription.id },
            data: {
              status: 'CANCELLED',
              endDate: new Date(),
              updatedAt: new Date()
            }
          });
        } else {
          // For paid plans, don't allow duplicate active subscriptions
          return res.status(409).json(
            createErrorResponse('Employer already has an active subscription', 409)
          );
        }
      }

      // Verify plan exists
      const plan = await (req.prisma || prisma).plan.findUnique({
        where: { id: planId, isActive: true }
      });

      if (!plan) {
        return res.status(404).json(
          createErrorResponse('Plan not found', 404)
        );
      }

      // Determine subscription status based on plan type
      let subscriptionStatus = 'ACTIVE';
      if (plan.name === 'HR-Assist') {
        subscriptionStatus = 'PENDING_APPROVAL'; // Requires branch admin approval
      }

      // Create subscription
      const subscription = await (req.prisma || prisma).subscription.create({
        data: {
          employerId: employer.id,
          planId,
          pricePerCandidate: pricePerCandidate || plan.pricePerCandidate,
          priceMonthly: priceMonthly || plan.priceMonthly,
          priceYearly: priceYearly || plan.priceYearly,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : null,
          isAutoRenew,
          status: subscriptionStatus
        },
        include: {
          plan: true,
          employer: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      });

      res.status(201).json(
        createResponse('Subscription created successfully', subscription)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get employer's active subscription
  async getEmployerSubscription(req, res, next) {
    try {
      const { employerId } = req.params;
      const employerIdFromQuery = req.query.employerId;

      // Determine target employer ID based on role and parameters
      let targetEmployerId = employerId || employerIdFromQuery;

      if (!targetEmployerId) {
        // If no employerId provided, use current user's employer
        const employer = await (req.prisma || prisma).employer.findUnique({
          where: { userId: req.user.userId }
        });

        if (!employer) {
          return res.status(404).json(
            createErrorResponse('Employer profile not found', 404)
          );
        }
        targetEmployerId = employer.id;
      }

      // First try to get active subscription
      let subscription = await (req.prisma || prisma).subscription.findFirst({
        where: {
          employerId: targetEmployerId,
          status: 'ACTIVE'
        },
        include: {
          plan: true,
          employer: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // If no active subscription, get the most recent one (could be cancelled)
      if (!subscription) {
        subscription = await (req.prisma || prisma).subscription.findFirst({
          where: {
            employerId: targetEmployerId
          },
          include: {
            plan: true,
            employer: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      }

      // If still no subscription found, return null response (not an error)
      if (!subscription) {
        return res.json(createResponse('No subscription found', null));
      }

      // Calculate usage statistics
      const totalJobPosts = await (req.prisma || prisma).ad.count({
        where: { employerId: targetEmployerId }
      });

      const totalAllocations = await (req.prisma || prisma).allocation.count({
        where: { employerId: targetEmployerId }
      });

      const hiredCandidates = await (req.prisma || prisma).allocation.count({
        where: { 
          employerId: targetEmployerId,
          status: 'HIRED'
        }
      });

      const subscriptionWithUsage = {
        ...subscription,
        usage: {
          totalJobPosts,
          totalAllocations,
          hiredCandidates,
          remainingJobPosts: subscription.plan.maxJobPosts ? 
            Math.max(0, subscription.plan.maxJobPosts - totalJobPosts) : null,
          remainingShortlists: subscription.plan.maxShortlists ? 
            Math.max(0, subscription.plan.maxShortlists - totalAllocations) : null
        }
      };

      res.json(createResponse('Subscription retrieved successfully', subscriptionWithUsage));
    } catch (error) {
      next(error);
    }
  }

  // Cancel subscription (Branch Admin only)
  async cancelSubscription(req, res, next) {
    try {
      // Verify user is branch admin
      if (req.user.role !== 'BRANCH_ADMIN') {
        return res.status(403).json(
          createErrorResponse('Only branch admins can cancel subscriptions', 403)
        );
      }

      const { employerId } = req.body;

      if (!employerId) {
        return res.status(400).json(
          createErrorResponse('Employer ID is required', 400)
        );
      }

      // Verify employer exists
      const employer = await (req.prisma || prisma).employer.findUnique({
        where: { id: employerId },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Find active subscription for this employer
      const subscription = await (req.prisma || prisma).subscription.findFirst({
        where: {
          employerId: employer.id,
          status: { in: ['ACTIVE', 'PAST_DUE'] }
        }
      });

      if (!subscription) {
        return res.status(404).json(
          createErrorResponse('No active subscription found to cancel', 404)
        );
      }

      // Update subscription status
      const cancelledSubscription = await (req.prisma || prisma).subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED',
          endDate: new Date(),
          isAutoRenew: false,
          updatedAt: new Date()
        },
        include: {
          plan: true,
          employer: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      });

      res.json(createResponse('Subscription cancelled successfully', cancelledSubscription));
    } catch (error) {
      next(error);
    }
  }

  // Record a hire and update billing for HR-Assist plans
  async recordHire(req, res, next) {
    try {
      const { id } = req.params; // subscription id
      const { candidateId, allocationId } = req.body;

      if (!candidateId && !allocationId) {
        return res.status(400).json(
          createErrorResponse('Either candidateId or allocationId is required', 400)
        );
      }

      // Get employer
      const employer = await (req.prisma || prisma).employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Find subscription
      const subscription = await (req.prisma || prisma).subscription.findFirst({
        where: {
          id,
          employerId: employer.id,
          status: 'ACTIVE'
        },
        include: { plan: true }
      });

      if (!subscription) {
        return res.status(404).json(
          createErrorResponse('Active subscription not found', 404)
        );
      }

      // Update subscription with hire record
      const updatedSubscription = await (req.prisma || prisma).subscription.update({
        where: { id },
        data: {
          totalCandidatesHired: subscription.totalCandidatesHired + 1,
          totalAmountDue: subscription.pricePerCandidate ? 
            (subscription.totalCandidatesHired + 1) * subscription.pricePerCandidate : 
            subscription.totalAmountDue,
          updatedAt: new Date()
        },
        include: {
          plan: true
        }
      });

      res.json(createResponse('Hire recorded successfully', {
        subscription: updatedSubscription,
        billing: {
          candidatesHired: updatedSubscription.totalCandidatesHired,
          pricePerCandidate: updatedSubscription.pricePerCandidate,
          totalAmountDue: updatedSubscription.totalAmountDue
        }
      }));
    } catch (error) {
      next(error);
    }
  }

  // Get subscription history for employer
  async getSubscriptionHistory(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get employer
      const employer = await (req.prisma || prisma).employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      const [subscriptions, total] = await Promise.all([
        (req.prisma || prisma).subscription.findMany({
          where: { employerId: employer.id },
          skip,
          take: parseInt(limit),
          include: {
            plan: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        (req.prisma || prisma).subscription.count({
          where: { employerId: employer.id }
        })
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      };

      res.json(createResponse('Subscription history retrieved successfully', subscriptions, pagination));
    } catch (error) {
      next(error);
    }
  }

  // Approve subscription (Branch Admin only)
  async approveSubscription(req, res, next) {
    try {
      const { id } = req.params;

      // Verify user is branch admin
      if (req.user.role !== 'BRANCH_ADMIN') {
        return res.status(403).json(
          createErrorResponse('Only branch admins can approve subscriptions', 403)
        );
      }

      // Find subscription
      const subscription = await (req.prisma || prisma).subscription.findUnique({
        where: { id },
        include: {
          plan: true,
          employer: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      });

      if (!subscription) {
        return res.status(404).json(
          createErrorResponse('Subscription not found', 404)
        );
      }

      if (subscription.status !== 'PENDING_APPROVAL') {
        return res.status(400).json(
          createErrorResponse('Subscription is not pending approval', 400)
        );
      }

      // Update subscription status to active
      const approvedSubscription = await (req.prisma || prisma).subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          updatedAt: new Date()
        },
        include: {
          plan: true,
          employer: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      });

      res.json(createResponse('Subscription approved successfully', approvedSubscription));
    } catch (error) {
      next(error);
    }
  }

  // Reject subscription (Branch Admin only)
  async rejectSubscription(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // Verify user is branch admin
      if (req.user.role !== 'BRANCH_ADMIN') {
        return res.status(403).json(
          createErrorResponse('Only branch admins can reject subscriptions', 403)
        );
      }

      // Find subscription
      const subscription = await (req.prisma || prisma).subscription.findUnique({
        where: { id },
        include: {
          plan: true,
          employer: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      });

      if (!subscription) {
        return res.status(404).json(
          createErrorResponse('Subscription not found', 404)
        );
      }

      if (subscription.status !== 'PENDING_APPROVAL') {
        return res.status(400).json(
          createErrorResponse('Subscription is not pending approval', 400)
        );
      }

      // Update subscription status to rejected
      const rejectedSubscription = await (req.prisma || prisma).subscription.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          endDate: new Date(),
          updatedAt: new Date()
        },
        include: {
          plan: true,
          employer: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      });

      res.json(createResponse('Subscription rejected successfully', {
        subscription: rejectedSubscription,
        reason
      }));
    } catch (error) {
      next(error);
    }
  }

  // Get pending subscriptions for branch admin approval
  async getPendingSubscriptions(req, res, next) {
    try {
      // Verify user is branch admin
      if (req.user.role !== 'BRANCH_ADMIN') {
        return res.status(403).json(
          createErrorResponse('Only branch admins can view pending subscriptions', 403)
        );
      }

      const { page = 1, limit = 10, search = '' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build where clause for filtering
      const whereClause = {
        status: 'PENDING_APPROVAL',
        ...(search && {
          OR: [
            {
              employer: {
                user: {
                  name: { contains: search, mode: 'insensitive' }
                }
              }
            },
            {
              employer: {
                user: {
                  email: { contains: search, mode: 'insensitive' }
                }
              }
            },
            {
              employer: {
                companyName: { contains: search, mode: 'insensitive' }
              }
            }
          ]
        })
      };

      const [subscriptions, total] = await Promise.all([
        (req.prisma || prisma).subscription.findMany({
          where: whereClause,
          skip,
          take: parseInt(limit),
          include: {
            plan: true,
            employer: {
              include: {
                user: {
                  select: { name: true, email: true, phone: true }
                },
                companies: {
                  where: { isDefault: true },
                  select: { name: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        (req.prisma || prisma).subscription.count({
          where: whereClause
        })
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      };

      res.json(createResponse('Pending subscriptions retrieved successfully', subscriptions, pagination));
    } catch (error) {
      next(error);
    }
  }

  // Check subscription limits before performing actions
  async checkLimits(req, res, next) {
    try {
      const { action } = req.query; // 'job_post' or 'shortlist'

      // Get employer
      const employer = await (req.prisma || prisma).employer.findUnique({
        where: { userId: req.user.userId }
      });

      if (!employer) {
        return res.status(404).json(
          createErrorResponse('Employer profile not found', 404)
        );
      }

      // Get active subscription
      const subscription = await (req.prisma || prisma).subscription.findFirst({
        where: {
          employerId: employer.id,
          status: 'ACTIVE'
        },
        include: { plan: true }
      });

      if (!subscription) {
        return res.status(404).json(
          createErrorResponse('No active subscription found', 404)
        );
      }

      // Get current usage
      const [totalJobPosts, totalShortlists] = await Promise.all([
        (req.prisma || prisma).ad.count({ where: { employerId: employer.id } }),
        (req.prisma || prisma).allocation.count({ where: { employerId: employer.id } })
      ]);

      let canPerformAction = true;
      let message = 'Action allowed';
      let usage = {};

      if (action === 'job_post' && subscription.plan.maxJobPosts) {
        canPerformAction = totalJobPosts < subscription.plan.maxJobPosts;
        message = canPerformAction ? 
          'Job post allowed' : 
          `Job post limit reached (${subscription.plan.maxJobPosts})`;
        usage.jobPosts = {
          current: totalJobPosts,
          limit: subscription.plan.maxJobPosts,
          remaining: Math.max(0, subscription.plan.maxJobPosts - totalJobPosts)
        };
      }

      if (action === 'shortlist' && subscription.plan.maxShortlists) {
        canPerformAction = totalShortlists < subscription.plan.maxShortlists;
        message = canPerformAction ? 
          'Shortlist allowed' : 
          `Shortlist limit reached (${subscription.plan.maxShortlists})`;
        usage.shortlists = {
          current: totalShortlists,
          limit: subscription.plan.maxShortlists,
          remaining: Math.max(0, subscription.plan.maxShortlists - totalShortlists)
        };
      }

      res.json(createResponse(message, {
        canPerformAction,
        subscription: subscription.plan,
        usage
      }));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubscriptionController();