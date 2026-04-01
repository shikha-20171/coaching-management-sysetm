import express from "express";
import { addFee, getFees, markFeePaid } from "../controllers/fees.controller.js";
import { isAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", isAdmin, getFees);
router.post("/", isAdmin, addFee);
router.patch("/:id/pay", isAdmin, markFeePaid);

export default router;
