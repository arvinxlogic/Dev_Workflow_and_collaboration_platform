import { Router } from "express";
import {
  getUsers,
  getUser,
  postUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.get("/:cognitoId", getUser);
router.post("/", postUser);
router.patch("/:userId", updateUser);
router.delete("/:userId", deleteUser);

export default router;
