import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getReminders } from "../controllers/reminderController.js";

const router = express.Router();

// Get reminders + comments for logged in user
router.get("/", protect, getReminders);

export default router;
