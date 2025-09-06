import FoodLog from "../models/Food.js";
import Workout from "../models/Workout.js";
import MentalHealth from "../models/MentalLog.js";
import Goal from "../models/Goal.js";

// Track last seen reminders per user (in-memory for demo; can move to DB)
const lastSeenReminders = {};

export const getReminders = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [foodLogs, workouts, mentalLogs, goals] = await Promise.all([
      FoodLog.find({ user: userId, createdAt: { $gte: today } }),
      Workout.find({ user: userId, createdAt: { $gte: today } }),
      MentalHealth.find({ user: userId, createdAt: { $gte: today } }),
      Goal.find({ user: userId }),
    ]);

    let reminders = [];

    // --- Food ---
    if (foodLogs.length === 0) {
      reminders.push("Don't forget to log your meals today!");
    }

    // --- Workout ---
    if (workouts.length === 0) {
      reminders.push("You haven't logged any workouts today. Stay active!");
    } else {
      const totalCalories = workouts.reduce((s, w) => s + (w.calories || 0), 0);
      const totalMinutes = workouts.reduce((s, w) => s + (w.duration || 0), 0);

      if (totalCalories < 300 || totalMinutes < 30) {
        reminders.push("Try to complete at least 30 mins of workout or burn 300 calories today.");
      }
    }

    // --- Mental health ---
    if (mentalLogs.length === 0) {
      reminders.push("Remember to log your mood today.");
    } else {
      const sadCount = mentalLogs.filter((m) => m.mood?.toLowerCase() === "sad").length;
      if (sadCount > 0) {
        reminders.push("You seem sad today. Consider meditation or journaling.");
      }
    }

    // --- Goals ---
    const totalCalories = foodLogs.reduce((s, f) => s + (f.calories || 0), 0);
    const totalWorkoutMinutes = workouts.reduce((s, w) => s + (w.duration || 0), 0);

    goals.forEach((goal) => {
      let completed = goal.completed;

      if (goal.category.toLowerCase() === "food" && goal.targetCalories > 0) {
        completed = totalCalories >= goal.targetCalories;
      }

      if (goal.category.toLowerCase() === "workout" && goal.targetWorkoutMinutes > 0) {
        completed = totalWorkoutMinutes >= goal.targetWorkoutMinutes;
      }

      if (!completed) {
        reminders.push(`${goal.type} Goal (${goal.category}) is not completed yet.`);
      }
    });

    const lastSeen = lastSeenReminders[userId] || [];
    const newReminders = reminders.filter((r) => !lastSeen.includes(r));

    res.json({
      reminders: newReminders,
      allReminders: reminders,
      hasNew: newReminders.length > 0,
    });
  } catch (err) {
    console.error("Reminders error:", err);
    res.status(500).json({ message: "Error generating reminders" });
  }
};

export const markRemindersViewed = async (req, res) => {
  const userId = req.user._id;
  lastSeenReminders[userId] = req.body?.reminders || [];
  res.json({ message: "Reminders marked as viewed" });
};
