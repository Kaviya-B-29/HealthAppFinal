import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addWorkout, getWorkouts, deleteWorkout } from "../controllers/workoutController.js";

const router = express.Router();

router.post("/", protect, addWorkout);
router.get("/", protect, getWorkouts);
router.delete("/:id", protect, deleteWorkout);

export default router;
