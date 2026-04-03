import express from "express";
import { getAuthDemoData, getAuthEvents, login, register } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/demo-data", getAuthDemoData);
router.get("/events", verifyToken, isAdmin, getAuthEvents);

export default router;
