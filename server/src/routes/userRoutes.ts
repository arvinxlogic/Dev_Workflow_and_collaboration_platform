import { Router } from "express";
import {
  getUser,
  getUsers,
  postUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.post("/", postUser);
router.get("/:cognitoId", getUser);
router.patch("/:userId", updateUser);
router.delete("/:userId", deleteUser);

export default router;
