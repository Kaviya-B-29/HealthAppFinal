// routes/userRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { updateUser,getUserProfile } from "../controllers/userController.js";

const router = express.Router();

// Get profile
router.get("/profile", protect, getUserProfile);

// Update profile
router.put("/profile", protect, updateUser);

export default router;
