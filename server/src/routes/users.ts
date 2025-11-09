import express from 'express';
import {
  getUsers,
  getUser,
  updateUserRole,
  deleteUser
} from '../controllers/userController';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', adminOnly, getUsers);
router.get('/:id', getUser);
router.put('/:id/role', adminOnly, updateUserRole);
router.delete('/:id', adminOnly, deleteUser);

export default router;
