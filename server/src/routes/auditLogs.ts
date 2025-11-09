import express from 'express';
import { getAuditLogs, getUserActivity } from '../controllers/auditLogController';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/', getAuditLogs);
router.get('/user/:userId', getUserActivity);

export default router;
