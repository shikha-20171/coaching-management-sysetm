import express from "express";
import {
  getBatches,
  addBatch,
} from "../controllers/batch.controller.js";
import { isAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", getBatches);
router.post("/", isAdmin, addBatch);

export default router;
