import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET routes - all users can view
router.get('/', getTasks);
router.get('/:id', getTask);

// POST - admin only
router.post('/', adminOnly, createTask);

// ✅ FIXED: PUT - Remove adminOnly middleware (controller handles permissions)
router.put('/:id', updateTask);

// DELETE - admin only
router.delete('/:id', adminOnly, deleteTask);

export default router;
