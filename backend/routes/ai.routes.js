import express from "express";
import { analyzeStudent, askAssistant } from "../controllers/ai.controller.js";
import { isStaffOrAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/assist", askAssistant);
router.post("/analyze", isStaffOrAdmin, analyzeStudent);

export default router;
