import express from "express";
import {
  getCourses,
  addCourse,
} from "../controllers/course.controller.js";
import { isAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", getCourses);
router.post("/", isAdmin, addCourse);

export default router;
