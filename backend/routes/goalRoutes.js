import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addGoal, getGoals, deleteGoal } from "../controllers/goalController.js";

const router = express.Router();

router.post("/", protect, addGoal);
router.get("/", protect, getGoals);
router.delete("/:id", protect, deleteGoal);

export default router;
