import express from "express";
import { getAdminReports } from "../controllers/report.controller.js";
import { isAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/admin", isAdmin, getAdminReports);

export default router;
