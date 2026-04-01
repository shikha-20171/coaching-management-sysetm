import express from "express";
import {
  getAdminDashboard,
  getStudentDashboard,
} from "../controllers/dashboard.controller.js";
import { allowSelfOrRoles, isAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/admin", isAdmin, getAdminDashboard);
router.get("/student/:userId", allowSelfOrRoles((req) => req.params.userId, "admin", "staff"), getStudentDashboard);

export default router;
