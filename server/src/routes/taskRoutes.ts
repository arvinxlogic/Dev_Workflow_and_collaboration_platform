import { Router } from "express";
import {
  createTask,
  getTasks,
  getUserTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getTaskComments,
  createComment,
} from "../controllers/taskController";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:taskId/status", updateTaskStatus);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);
router.get("/user/:userId", getUserTasks);
router.get("/:taskId/comments", getTaskComments);
router.post("/comments", createComment);

export default router;
