import express from "express";
import {
  addStudent,
  deleteStudent,
  getStudents,
} from "../controllers/student.controller.js";
import { isAdmin, isStaffOrAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", isStaffOrAdmin, getStudents);
router.post("/", isAdmin, addStudent);
router.delete("/:id", isAdmin, deleteStudent);

export default router;
