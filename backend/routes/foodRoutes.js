import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addFood, getFoods, deleteFood } from "../controllers/foodController.js";

const router = express.Router();

router.post("/", protect, addFood);
router.get("/", protect, getFoods);
router.delete("/:id", protect, deleteFood);

export default router;
