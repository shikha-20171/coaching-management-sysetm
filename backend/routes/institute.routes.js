import express from "express";
import { addInstitute, getInstitutes } from "../controllers/institute.controller.js";
import { isAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", getInstitutes);
router.post("/", isAdmin, addInstitute);

export default router;
