import { Router } from "express";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController";
import { authenticateToken, requireManager, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Anyone authenticated can view projects
router.get("/", getProjects);

// Only ADMIN and PROJECT_MANAGER can create projects
router.post("/", requireManager, createProject);

// Only ADMIN and PROJECT_MANAGER can update projects
router.patch("/:projectId", requireManager, updateProject);

// Only ADMIN can delete projects
router.delete("/:projectId", requireAdmin, deleteProject);

export default router;
