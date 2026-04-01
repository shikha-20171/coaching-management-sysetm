import express from "express";
import { addAttendance, getAttendance } from "../controllers/attendance.controller.js";
import { isStaffOrAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", isStaffOrAdmin, getAttendance);
router.post("/", isStaffOrAdmin, addAttendance);

export default router;
