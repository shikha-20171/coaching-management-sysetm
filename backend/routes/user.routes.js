import express from "express";
import {
  changeMyPassword,
  getMyWorkspace,
  updateMyProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/workspace", getMyWorkspace);
router.patch("/profile", updateMyProfile);
router.patch("/password", changeMyPassword);

export default router;
