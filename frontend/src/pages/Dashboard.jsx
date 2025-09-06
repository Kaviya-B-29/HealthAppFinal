import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import MetricCard from "../components/MetricCard";
import WeeklyWorkoutChart from "../components/charts/WeeklyWorkoutChart";
import MacroDoughnut from "../components/charts/MacroDoughnut";
import MoodBar from "../components/charts/MoodBar";

function lastNDates(n) {
  return Array.from({ length: n }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

function sendNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

export default function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [foods, setFoods] = useState([]);
  const [goals, setGoals] = useState([]);
  const [mental, setMental] = useState([]);
  const [recs, setRecs] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
    requestNotificationPermission();
  }, []);

  const fetchAll = async () => {
    try {
      const [w, f, g, m] = await Promise.all([
        API.get("/workouts"),
        API.get("/foods"),
        API.get("/goals"),
        API.get("/mental-logs"),
      ]);
      setWorkouts(w.data || []);
      setFoods(f.data || []);
      setGoals(g.data || []);
      setMental(m.data || []);
      computeRecommendations(w.data || [], f.data || [], g.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const computeRecommendations = (w, f, g) => {
    const weekMins = w.reduce((s, x) => s + (x.duration || 0), 0);
    const caloriesToday = new Date().toISOString().slice(0, 10);
    const todayCals = f
      .filter(
        (x) =>
          (new Date(x.createdAt || x.date)).toISOString().slice(0, 10) ===
          caloriesToday
      )
      .reduce((s, x) => s + (x.calories || 0), 0);

    const tips = [];
    if (weekMins < 150)
      tips.push(
        `You logged ${weekMins} mins this week. Try a 20-min walk today.`
      );
    if (todayCals > 2200)
      tips.push(
        `You've consumed ${todayCals} kcal today. Consider lighter dinner or a walk.`
      );
    if (!tips.length) tips.push("You're on track — keep it up!");
    setRecs(tips);
  };

  // Metrics
  const totalMinutes = workouts.reduce((s, w) => s + (w.duration || 0), 0);
  const totalCalories = foods.reduce((s, f) => s + (f.calories || 0), 0);
  const protein = foods.reduce((s, f) => s + (f.protein || 0), 0);
  const carbs = foods.reduce((s, f) => s + (f.carbs || 0), 0);
  const fat = foods.reduce((s, f) => s + (f.fat || 0), 0);

  const labels = lastNDates(7);
  const minutesPerDay = labels.map((d) =>
    workouts
      .filter(
        (w) =>
          (new Date(w.date || w.createdAt)).toISOString().slice(0, 10) === d
      )
      .reduce((s, x) => s + (x.duration || 0), 0)
  );
  const moodCounts = ["Happy", "Neutral", "Sad", "Stressed", "Anxious"].map(
    (m) =>
      mental.filter(
        (x) => (x.mood || "").toLowerCase() === m.toLowerCase()
      ).length
  );

  // 🔹 Reminders
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      const today = new Date().toISOString().slice(0, 10);

      if (now.getHours() === 19) {
        const minsToday = workouts
          .filter(
            (w) =>
              (new Date(w.date || w.createdAt)).toISOString().slice(0, 10) ===
              today
          )
          .reduce((s, x) => s + (x.duration || 0), 0);
        if (minsToday < 30) {
          sendNotification(
            "Reminder: Quick Workout",
            "You’ve logged under 30 mins today — try a short walk or yoga."
          );
        }
      }

      if (now.getHours() === 14 || now.getHours() === 21) {
        const mealsToday = foods.filter(
          (f) =>
            (new Date(f.date || f.createdAt)).toISOString().slice(0, 10) ===
            today
        );
        if (mealsToday.length === 0) {
          sendNotification(
            "Reminder: Log Meals",
            "Don’t forget to track what you ate today!"
          );
        }
      }

      if (now.getHours() === 20) {
        const moodToday = mental.some(
          (m) =>
            (new Date(m.date || m.createdAt)).toISOString().slice(0, 10) ===
            today
        );
        if (!moodToday) {
          sendNotification(
            "Reminder: Mood Check-In",
            "Log how you’re feeling today — it helps track your wellness."
          );
        }
      }

      if (now.getHours() === 18 && goals.length > 0) {
        sendNotification(
          "Reminder: Review Goals",
          "Take a moment to check your goals and progress today."
        );
      }
    }, 60_000);

    return () => clearInterval(id);
  }, [workouts, foods, mental, goals]);

  async function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">Here's your health snapshot.</p>
        </div>
        <button
          onClick={() => navigate("/history")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Track Entire Wellness
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Workout minutes (all-time)"
          value={`${totalMinutes} min`}
          subtitle={`${workouts.length} sessions`}
          color="border-green-500"
        />
        <MetricCard
          title="Calories logged (all-time)"
          value={`${totalCalories} kcal`}
          subtitle={`${foods.length} meals`}
          color="border-yellow-400"
        />
        <MetricCard
          title="Active Goals"
          value={goals.length}
          subtitle="Tap Goals to view progress"
          color="border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2 text-indigo-600">
            Weekly Workout Minutes
          </h3>
          <WeeklyWorkoutChart
            labels={labels}
            data={minutesPerDay}
            borderColor="#0ea5a8"
            backgroundColor="rgba(14,165,168,0.12)"
          />
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2 text-indigo-600">Today macros</h3>
          <MacroDoughnut
            protein={protein}
            carbs={carbs}
            fat={fat}
            colors={["#ef4444", "#f59e0b", "#10b981"]}
          />
          <div className="mt-4 space-y-1 text-sm text-gray-600">
            <div>Protein: {protein} g</div>
            <div>Carbs: {carbs} g</div>
            <div>Fat: {fat} g</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-2 text-indigo-600">
          Mood (last logs)
        </h3>
        <MoodBar
          labels={["Happy", "Neutral", "Sad", "Stressed", "Anxious"]}
          data={moodCounts}
          colors={["#22c55e", "#3b82f6", "#f97316", "#ef4444", "#6b7280"]}
        />
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-2 text-indigo-600">Recommendations</h3>
        <ul className="list-disc pl-5">
          {recs.map((r, i) => (
            <li key={i} className="py-1 text-sm">
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
