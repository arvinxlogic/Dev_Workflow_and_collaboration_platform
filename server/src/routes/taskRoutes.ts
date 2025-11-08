import { Router } from "express";
import {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from "../controllers/taskController";
import { authenticateToken, requireManager } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Anyone can view tasks
router.get("/", getTasks);

// Only ADMIN and PROJECT_MANAGER can create tasks
router.post("/", requireManager, createTask);

// Anyone can update their own task status
router.patch("/:taskId/status", updateTaskStatus);

// Only ADMIN and PROJECT_MANAGER can update task details
router.patch("/:taskId", requireManager, updateTask);

// Only ADMIN and PROJECT_MANAGER can delete tasks
router.delete("/:taskId", requireManager, deleteTask);

export default router;
