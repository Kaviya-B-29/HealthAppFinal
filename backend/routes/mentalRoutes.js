import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addMentalLog, getMentalLogs, deleteMentalLog } from "../controllers/mentalLogController.js";

const router = express.Router();

router.post("/", protect, addMentalLog);
router.get("/", protect, getMentalLogs);
router.delete("/:id", protect, deleteMentalLog);

export default router;
