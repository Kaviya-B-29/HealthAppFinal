import express from "express";
import cors from "cors";
import morgan from "morgan";
import reminderRoutes from "./routes/reminderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import mentalRoutes from "./routes/mentalRoutes.js";
import userRoutes from "./routes/userRoutes.js"

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/mental-logs", mentalRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/reminders", reminderRoutes);
app.get("/", (req, res) => {
  res.send({ message: "Health & Wellness API is running..." });
});

export default app;

// after other routes

