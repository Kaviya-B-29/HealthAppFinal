import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  duration: Number,
  distance: Number,
  calories: Number,
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const Workout = mongoose.model("Workout", workoutSchema);
export default Workout;
