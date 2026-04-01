import express from "express";
import { addTest, getTests } from "../controllers/test.controller.js";
import { isStaffOrAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", isStaffOrAdmin, getTests);
router.post("/", isStaffOrAdmin, addTest);

export default router;
