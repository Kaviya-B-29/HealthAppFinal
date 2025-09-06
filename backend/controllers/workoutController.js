import Workout from "../models/Workout.js";

// Add Workout
export const addWorkout = async (req, res) => {
  try {
    const { type, duration } = req.body;
    if (!type || !duration)
      return res.status(400).json({ message: "Type and duration required" });

    const workout = await Workout.create({ ...req.body, user: req.user.id });
    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Workouts
export const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Workout
export const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: "Workout not found" });

    if (workout.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    await workout.deleteOne();
    res.json({ message: "Workout deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
