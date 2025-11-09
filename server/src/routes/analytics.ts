import express from 'express';
import { getDashboardStats, getProjectAnalytics, getUserStats } from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Dashboard statistics
router.get('/dashboard-stats', getDashboardStats);

// Project analytics
router.get('/project/:projectId', getProjectAnalytics);

// User statistics
router.get('/user-stats', getUserStats);

export default router;
