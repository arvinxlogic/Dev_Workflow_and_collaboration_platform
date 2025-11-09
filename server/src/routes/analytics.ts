import express from 'express';
import { getDashboardStats, getProjectAnalytics, getUserStats, getAdminAnalytics } from '../controllers/analyticsController';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Dashboard statistics (user, manager, or admin)
router.get('/dashboard-stats', getDashboardStats);

// Project analytics (user, manager, or admin)
router.get('/project/:projectId', getProjectAnalytics);

// User statistics
router.get('/user-stats', getUserStats);

// ADMIN analytics (PROTECTED endpoint)
router.get('/admin', adminOnly, getAdminAnalytics);

export default router;
