import Goal from "../models/Goal.js";
import Food from "../models/Food.js";
import Workout from "../models/Workout.js";

// Add Goal
export const addGoal = async (req, res) => {
  try {
    const { type, category, targetCalories, targetWorkoutMinutes } = req.body;

    if (!type || !category) {
      return res.status(400).json({ message: "Type and category are required" });
    }

    const goal = await Goal.create({
      user: req.user.id,
      type,
      category,
      targetCalories: targetCalories || 0,
      targetWorkoutMinutes: targetWorkoutMinutes || 0,
    });

    res.status(201).json(goal);
  } catch (err) {
    console.error("Add goal error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Goals + Auto-update completion
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id });

    // get today's logs
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const foods = await Food.find({ user: req.user.id, createdAt: { $gte: today } });
    const workouts = await Workout.find({ user: req.user.id, createdAt: { $gte: today } });

    const totalCalories = foods.reduce((s, f) => s + (f.calories || 0), 0);
    const totalWorkoutMinutes = workouts.reduce((s, w) => s + (w.duration || 0), 0);

    for (let goal of goals) {
      let shouldComplete = false;

      if (goal.category.toLowerCase() === "food" && goal.targetCalories > 0) {
        shouldComplete = totalCalories >= goal.targetCalories;
      }

      if (goal.category.toLowerCase() === "workout" && goal.targetWorkoutMinutes > 0) {
        shouldComplete = totalWorkoutMinutes >= goal.targetWorkoutMinutes;
      }

      if (shouldComplete !== goal.completed) {
        goal.completed = shouldComplete;
        await goal.save();
      }
    }

    res.json(goals);
  } catch (err) {
    console.error("Get goals error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Goal
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await goal.deleteOne();
    res.json({ message: "Goal deleted" });
  } catch (err) {
    console.error("Delete goal error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
