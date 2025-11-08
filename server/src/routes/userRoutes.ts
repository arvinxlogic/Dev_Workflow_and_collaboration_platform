import { Router } from "express";
import { getUser, getUsers, postUser } from "../controllers/userController";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// Public route - for user registration
router.post("/", postUser);

// Protected routes
router.use(authenticateToken);

// Anyone authenticated can get users list
router.get("/", getUsers);

// Anyone authenticated can get their own user info
router.get("/:cognitoId", getUser);

export default router;
