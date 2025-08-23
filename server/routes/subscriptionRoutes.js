const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken, requireRole, requireRoleOrAdminAccess } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.get('/plans', subscriptionController.getPlans);

// Protected routes (authentication required)
router.use(authenticateToken);

// Subscription management - now supports Branch Admin access with employerId parameter
router.post('/', requireRoleOrAdminAccess('EMPLOYER'), subscriptionController.createSubscription);
router.get('/current', requireRoleOrAdminAccess('EMPLOYER'), subscriptionController.getEmployerSubscription);
router.get('/history', requireRoleOrAdminAccess('EMPLOYER'), subscriptionController.getSubscriptionHistory);
router.patch('/cancel', requireRole('BRANCH_ADMIN'), subscriptionController.cancelSubscription);
router.patch('/:id/cancel', requireRole('BRANCH_ADMIN'), subscriptionController.cancelSubscription);
router.post('/:id/hire', requireRoleOrAdminAccess('EMPLOYER'), subscriptionController.recordHire);

// Utility routes
router.get('/check-limits', requireRoleOrAdminAccess('EMPLOYER'), subscriptionController.checkLimits);

// Admin routes (for getting any employer's subscription by employerId in path)
router.get('/:employerId', requireRole('BRANCH_ADMIN'), subscriptionController.getEmployerSubscription);

// Branch Admin routes
router.get('/pending', requireRole('BRANCH_ADMIN'), subscriptionController.getPendingSubscriptions);
router.post('/subscriptions/:id/approve', requireRole('BRANCH_ADMIN'), subscriptionController.approveSubscription);
router.post('/subscriptions/:id/reject', requireRole('BRANCH_ADMIN'), subscriptionController.rejectSubscription);


module.exports = router;