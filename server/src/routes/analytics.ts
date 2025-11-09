import express from 'express';
import { getDashboardStats, getProjectAnalytics } from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/project/:projectId', getProjectAnalytics);

export default router;
