import express from 'express';
import {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam
} from '../controllers/teamController';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTeams)
  .post(adminOnly, createTeam);

router.route('/:id')
  .get(getTeam)
  .put(adminOnly, updateTeam)
  .delete(adminOnly, deleteTeam);

export default router;
