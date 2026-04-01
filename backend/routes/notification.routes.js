import express from "express";
import {
  addNotification,
  getNotifications,
} from "../controllers/notification.controller.js";
import { isStaffOrAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", getNotifications);
router.post("/", isStaffOrAdmin, addNotification);

export default router;
