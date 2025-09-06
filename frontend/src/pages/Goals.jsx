import React, { useEffect, useState } from "react";
import API from "../api/axios";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({
    type: "",
    category: "",
    targetCalories: "",
    targetWorkoutMinutes: "",
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await API.get("/goals");
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.type ||
      !formData.category ||
      (!formData.targetCalories && !formData.targetWorkoutMinutes)
    ) {
      alert("Fill in all fields (at least one target).");
      return;
    }

    try {
      await API.post("/goals", formData);
      setFormData({
        type: "",
        category: "",
        targetCalories: "",
        targetWorkoutMinutes: "",
      });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      console.error("Failed to delete goal", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Goals</h2>

      {/* Add Goal Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-xl p-4 mb-6 space-y-3"
      >
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border rounded p-2"
        >
          <option value="">Select Goal Type</option>
          <option value="Daily">Daily Goal</option>
          <option value="Weekly">Weekly Goal</option>
          <option value="Monthly">Monthly Goal</option>
        </select>

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border rounded p-2"
        >
          <option value="">Select Category</option>
          <option value="Weight Loss">Weight Loss</option>
          <option value="Weight Gain">Weight Gain</option>
          <option value="General Health">General Health</option>
        </select>

        <input
          type="number"
          name="targetCalories"
          placeholder="Target Calories (optional)"
          value={formData.targetCalories}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />

        <input
          type="number"
          name="targetWorkoutMinutes"
          placeholder="Target Workout Minutes (optional)"
          value={formData.targetWorkoutMinutes}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Add Goal
        </button>
      </form>

      {/* Goals List */}
      <div className="bg-white shadow rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-3">Your Goals</h3>
        {goals.length === 0 ? (
          <p className="text-gray-500">No goals yet.</p>
        ) : (
          <ul className="space-y-2">
            {goals.map((goal, i) => (
              <li
                key={goal._id}
                className="flex justify-between items-center border-b py-2"
              >
                <div>
                  <p className="font-medium">
                    {goal.type} Goal – {goal.category}
                  </p>
                  {goal.targetCalories > 0 && (
                    <p className="text-sm text-gray-600">
                      Target Calories: {goal.targetCalories} kcal
                    </p>
                  )}
                  {goal.targetWorkoutMinutes > 0 && (
                    <p className="text-sm text-gray-600">
                      Target Workouts: {goal.targetWorkoutMinutes} mins
                    </p>
                  )}
                  <p
                    className={`text-xs font-bold ${
                      goal.completed ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {goal.completed ? "Completed" : "In Progress"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(goal._id)}
                  className="text-red-500 text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
