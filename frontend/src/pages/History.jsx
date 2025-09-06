// src/pages/History.jsx
import React, { useEffect, useState } from "react";
import API from "../api/axios";
import WeeklyWorkoutChart from "../components/charts/WeeklyWorkoutChart";
import MacroDoughnut from "../components/charts/MacroDoughnut";
import MoodBar from "../components/charts/MoodBar";
import MetricCard from "../components/MetricCard";

/**
 * Return array of last n dates in YYYY-MM-DD format (oldest -> newest)
 */
function lastNDates(n) {
  return Array.from({ length: n }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

/**
 * Compute the inclusive start-of-period Date for a goal based on timeframe.
 * Accepts: 'daily' | 'weekly' | 'monthly' (defaults to 'weekly').
 */
function getPeriodStart(timeframe = "weekly") {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (timeframe === "daily") {
    // today at 00:00
    return start;
  } else if (timeframe === "weekly") {
    // last 7 full days including today -> start = today - 6 days
    start.setDate(start.getDate() - 6);
    return start;
  } else if (timeframe === "monthly") {
    // first day of this month at 00:00
    return new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    // fallback: weekly
    start.setDate(start.getDate() - 6);
    return start;
  }
}

/**
 * Safe number coercion: returns 0 for non-number-like values
 */
function toNumberSafe(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Convert a log's date field (wk.date or wk.createdAt) into a Date.
 */
function parseLogDate(log) {
  const raw = log?.date ?? log?.createdAt;
  return raw ? new Date(raw) : null;
}

export default function History() {
  const [workouts, setWorkouts] = useState([]);
  const [foods, setFoods] = useState([]);
  const [goals, setGoals] = useState([]);
  const [mental, setMental] = useState([]);
  const [generalStatus, setGeneralStatus] = useState("Average");
  const [focusAreas, setFocusAreas] = useState([]);
  const [evaluated, setEvaluated] = useState({
    workouts: [],
    foods: [],
    goals: [],
    mental: [],
  });
  const [sectionInsights, setSectionInsights] = useState({
    workouts: [],
    foods: [],
    goals: [],
    mental: [],
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [w, f, g, m] = await Promise.all([
        API.get("/workouts"),
        API.get("/foods"),
        API.get("/goals"),
        API.get("/mental-logs"),
      ]);
      analyzeData(w.data || [], f.data || [], g.data || [], m.data || []);
    } catch (err) {
      console.error("History.fetchAll error:", err);
    }
  };

  /**
   * Core analysis function:
   * - Evaluates workouts, foods, goals, and mental logs.
   * - Uses defensive checks to avoid stray "completed" flags.
   */
  const analyzeData = (w, f, g, m) => {
    setWorkouts(w);
    setFoods(f);
    setGoals(g);
    setMental(m);

    let overallScore = 0;
    const sections = { workouts: [], foods: [], goals: [], mental: [] };
    const focus = [];

    // ----------------------------
    // Workouts (per-log evaluation)
    // ----------------------------
    const evaluatedWorkouts = w.map((wk) => {
      const dur = toNumberSafe(wk.duration);
      if (dur >= 30) return { ...wk, status: "Healthy", note: "Great workout!" };
      if (dur >= 15) return { ...wk, status: "Average", note: "Try extending workouts." };
      return { ...wk, status: "Needs Improvement", note: "Workout too short. Aim 30+ mins." };
    });

    // weekly average check (using all workouts)
    const totalWorkoutMins = w.reduce((s, x) => s + toNumberSafe(x.duration), 0);
    const daysConsidered = 7;
    const avgPerDay = totalWorkoutMins / daysConsidered;
    if (avgPerDay < 30) {
      sections.workouts.push(`Average workout per day is low: ${Math.round(avgPerDay)} mins.`);
      overallScore -= 1;
      focus.push("Workouts");
    } else {
      sections.workouts.push("Good workout consistency!");
      overallScore += 1;
    }

    // ----------------------------
    // Foods (per-log evaluation)
    // ----------------------------
    const evaluatedFoods = f.map((fd) => {
      const calories = toNumberSafe(fd.calories);
      let status = "Healthy";
      let note = "Balanced meal.";
      if (calories > 800) {
        status = "Needs Improvement";
        note = "High calories. Try lighter meals.";
      } else if (toNumberSafe(fd.protein) < 10) {
        status = "Average";
        note = "Protein low. Add eggs, beans, etc.";
      }
      return { ...fd, status, note };
    });

    const avgCalories = f.length ? f.reduce((s, x) => s + toNumberSafe(x.calories), 0) / f.length : 0;
    if (avgCalories > 2300) {
      sections.foods.push("Your average calories are too high.");
      overallScore -= 1;
      focus.push("Nutrition");
    } else if (avgCalories > 0 && avgCalories < 1800) {
      sections.foods.push("Your average calories are low.");
      overallScore -= 1;
      focus.push("Nutrition");
    } else if (avgCalories > 0) {
      sections.foods.push("Calorie intake balanced.");
      overallScore += 1;
    } else {
      // no food logs at all - neutral
      sections.foods.push("No meals logged yet.");
    }

    // ----------------------------
    // Goals - robust logic
    // ----------------------------
    // We'll produce evaluatedGoals where each item has:
    // { ...gl, progress: number, target: number|null, completed: bool, note: string, timeframeStart, timeframeLabel }
    const evaluatedGoals = g.map((gl) => {
      // Defensive read
      const goal = { ...gl };
      const timeframe = (gl.timeframe || gl.period || "daily").toString().toLowerCase(); // daily/weekly/monthly
      const metric = (gl.metric || "").toString().toLowerCase(); // minutes/calories/protein/sessions/meals
      const type = (gl.type || "custom").toString().toLowerCase(); // workout/food/custom
      const targetRaw = gl.target;
      const target = Number.isFinite(Number(targetRaw)) ? Number(targetRaw) : null;
      const start = getPeriodStart(timeframe);

      // default progress 0
      let progress = 0;

      // Sum logs depending on type & metric, considering logs in [start, now]
      if (type === "workout") {
        // filter workouts within timeframe
        const relevant = w.filter((wk) => {
          const d = parseLogDate(wk);
          if (!d) return false;
          return d >= start;
        });

        if (metric === "minutes") {
          progress = relevant.reduce((s, wk) => s + toNumberSafe(wk.duration), 0);
        } else if (metric === "calories") {
          progress = relevant.reduce((s, wk) => s + toNumberSafe(wk.calories), 0);
        } else {
          // sessions
          progress = relevant.length;
        }
      } else if (type === "food") {
        const relevant = f.filter((fd) => {
          const d = parseLogDate(fd);
          if (!d) return false;
          return d >= start;
        });

        if (metric === "calories") {
          progress = relevant.reduce((s, fd) => s + toNumberSafe(fd.calories), 0);
        } else if (metric === "protein") {
          progress = relevant.reduce((s, fd) => s + toNumberSafe(fd.protein), 0);
        } else {
          progress = relevant.length; // meals
        }
      } else {
        // custom or other types: rely on boolean completed field or skip
        progress = null;
      }

      // Decide completion safely
      let completed = false;
      let note = "No target set for this goal.";
      if (target === null) {
        // No numeric target — if backend has a boolean `completed` field, reflect it; otherwise consider incomplete
        if (typeof gl.completed === "boolean") {
          completed = !!gl.completed;
          note = completed ? "Marked completed." : "Not completed.";
        } else {
          completed = false;
          note = "No numeric target configured.";
        }
      } else {
        // Ensure progress is numeric (if null -> cannot evaluate)
        const p = typeof progress === "number" ? progress : 0;
        completed = p >= target;
        note = completed ? "Goal achieved 🎉" : `Progress: ${p}/${target} ${metric || ""}`;
      }

      // build friendly timeframe label
      const timeframeLabel = timeframe === "daily" ? "today" : timeframe === "weekly" ? "this week" : timeframe === "monthly" ? "this month" : timeframe;

      return {
        ...goal,
        progress,
        target,
        completed,
        status: completed ? "Positive" : "Needs Improvement",
        note,
        timeframe,
        timeframeLabel,
        timeframeStart: start.toISOString(),
      };
    });

    const completedGoals = evaluatedGoals.filter((x) => x.completed).length;
    if (evaluatedGoals.length > 0) {
      if (completedGoals > evaluatedGoals.length / 2) {
        sections.goals.push("You’re achieving most of your goals.");
        overallScore += 1;
      } else {
        sections.goals.push("You need to complete more goals.");
        overallScore -= 1;
        focus.push("Goals");
      }
    } else {
      sections.goals.push("No goals set yet.");
    }

    // ----------------------------
    // Mental Health
    // ----------------------------
    const evaluatedMental = m.map((ml) => {
      const mood = (ml.mood || "").toString().toLowerCase();
      if (["happy", "neutral"].includes(mood)) return { ...ml, status: "Positive", note: "Good mood balance." };
      return { ...ml, status: "Needs Improvement", note: "Negative mood. Try meditation or journaling." };
    });

    const moodPositive = m.filter((x) => ["happy", "neutral"].includes((x.mood || "").toLowerCase())).length;
    if (m.length > 0) {
      if (moodPositive < m.length / 2) {
        sections.mental.push("Negative moods outweigh positives.");
        overallScore -= 1;
        focus.push("Mental Health");
      } else {
        sections.mental.push("Mostly positive moods.");
        overallScore += 1;
      }
    } else {
      sections.mental.push("No mental health logs yet.");
    }

    // ----------------------------
    // Overall health status
    // ----------------------------
    if (overallScore >= 3) setGeneralStatus("Healthy");
    else if (overallScore >= 1) setGeneralStatus("Average");
    else setGeneralStatus("Needs Improvement");

    setFocusAreas(focus);
    setEvaluated({
      workouts: evaluatedWorkouts,
      foods: evaluatedFoods,
      goals: evaluatedGoals,
      mental: evaluatedMental,
    });
    setSectionInsights(sections);
  };

  // Chart Data (weekly)
  const labels = lastNDates(7);
  const minutesPerDay = labels.map((d) =>
    workouts
      .filter((w) => new Date(w.date || w.createdAt).toISOString().slice(0, 10) === d)
      .reduce((s, x) => s + toNumberSafe(x.duration), 0)
  );
  const protein = foods.reduce((s, f) => s + toNumberSafe(f.protein), 0);
  const carbs = foods.reduce((s, f) => s + toNumberSafe(f.carbs), 0);
  const fat = foods.reduce((s, f) => s + toNumberSafe(f.fat), 0);
  const moodCounts = ["Happy", "Neutral", "Sad", "Stressed", "Anxious"].map((mood) =>
    mental.filter((x) => (x.mood || "").toLowerCase() === mood.toLowerCase()).length
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Overall Health Status */}
      <div
        className={`p-4 rounded-xl shadow text-white font-bold text-lg ${
          generalStatus === "Healthy"
            ? "bg-green-500"
            : generalStatus === "Average"
            ? "bg-yellow-500"
            : "bg-red-500"
        }`}
      >
        Overall Health Status: {generalStatus}
        {focusAreas.length > 0 && (
          <p className="text-sm mt-1 font-normal">⚠️ Focus more on: {focusAreas.join(", ")}.</p>
        )}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Workout Minutes"
          value={`${workouts.reduce((s, w) => s + toNumberSafe(w.duration), 0)} min`}
          subtitle="All-time"
          color="border-green-500"
        />
        <MetricCard
          title="Calories Logged"
          value={`${foods.reduce((s, f) => s + toNumberSafe(f.calories), 0)} kcal`}
          subtitle="All meals"
          color="border-yellow-400"
        />
        <MetricCard
          title="Goals Completed"
          value={`${evaluated.goals.filter((g) => g.completed).length}/${evaluated.goals.length}`}
          subtitle="Progress"
          color="border-indigo-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold text-indigo-600 mb-2">Workout Trend</h3>
          <WeeklyWorkoutChart labels={labels} data={minutesPerDay} />
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold text-indigo-600 mb-2">Macro Balance</h3>
          <MacroDoughnut protein={protein} carbs={carbs} fat={fat} />
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold text-indigo-600 mb-2">Mood History</h3>
          <MoodBar labels={["Happy", "Neutral", "Sad", "Stressed", "Anxious"]} data={moodCounts} />
        </div>
      </div>

      {/* Section Details */}
      <div className="space-y-6">
        {/* Workouts */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold text-indigo-600 mb-2">Workout Logs</h3>
          <ul className="list-disc pl-5 text-sm text-gray-600 mb-3">{sectionInsights.workouts.map((c, i) => <li key={i}>{c}</li>)}</ul>
          {evaluated.workouts.map((wk, i) => (
            <div key={i} className="flex justify-between text-sm border-b py-1">
              <span>{wk.type || "Workout"} - {wk.duration ?? 0} mins</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                wk.status === "Healthy" ? "bg-green-100 text-green-700" :
                wk.status === "Average" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>{wk.status}</span>
            </div>
          ))}
        </div>

        {/* Foods */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold text-indigo-600 mb-2">Food Logs</h3>
          <ul className="list-disc pl-5 text-sm text-gray-600 mb-3">{sectionInsights.foods.map((c, i) => <li key={i}>{c}</li>)}</ul>
          {evaluated.foods.map((fd, i) => (
            <div key={i} className="flex justify-between text-sm border-b py-1">
              <span>{fd.name || "Meal"} - {fd.calories ?? 0} kcal</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                fd.status === "Healthy" ? "bg-green-100 text-green-700" :
                fd.status === "Average" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>{fd.status}</span>
            </div>
          ))}
        </div>

        {/* Goals */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold text-indigo-600 mb-2">Goals</h3>
          <ul className="list-disc pl-5 text-sm text-gray-600 mb-3">{sectionInsights.goals.map((c, i) => <li key={i}>{c}</li>)}</ul>

          {evaluated.goals.map((gl, i) => {
            const goalName = gl.name || gl.title || `Goal ${i + 1}`;
            const progressLabel = gl.target !== null ? `${gl.progress ?? 0}/${gl.target}` : "No target";
            return (
              <div key={i} className="flex justify-between items-center text-sm border-b py-2">
                <div>
                  <div className="font-medium">{goalName} <span className="text-xs text-gray-500">({gl.timeframeLabel})</span></div>
                  <div className="text-xs text-gray-500 mt-1">{gl.note}</div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-0.5 rounded text-xs ${gl.completed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {gl.completed ? "Completed" : "Pending"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{progressLabel} {gl.metric ? gl.metric : ""}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mental Health */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold text-indigo-600 mb-2">Mental Health Logs</h3>
          <ul className="list-disc pl-5 text-sm text-gray-600 mb-3">{sectionInsights.mental.map((c, i) => <li key={i}>{c}</li>)}</ul>
          {evaluated.mental.map((ml, i) => (
            <div key={i} className="flex justify-between text-sm border-b py-1">
              <span>{ml.mood}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${ml.status === "Positive" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{ml.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
