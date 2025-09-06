import React, { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState({
    type: "",
    duration: "",
    distance: "",
    calories: "",
  });
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const res = await API.get("/workouts");
      setWorkouts(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setBanner({ type: "err", msg: "Failed to load workouts." });
    }
  };

  const valid = useMemo(() => {
    const { type, duration, distance, calories } = form;
    const filled = [type, duration, distance, calories].every((v) => `${v}`.trim() !== "");
    const numsOk = [duration, distance, calories].every((v) => !isNaN(+v) && +v > 0);
    return filled && numsOk;
  }, [form]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    setBanner(null);
    try {
      await API.post("/workouts", {
        type: form.type.trim(),
        duration: +form.duration,
        distance: +form.distance,
        calories: +form.calories,
      });
      setForm({ type: "", duration: "", distance: "", calories: "" });
      await fetchWorkouts();
      setBanner({ type: "ok", msg: "Workout added." });
    } catch (e) {
      console.error(e);
      setBanner({
        type: "err",
        msg: e?.response?.data?.message || "Failed to add workout.",
      });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!id) return;
    if (!confirm("Delete this workout?")) return;
    try {
      await API.delete(`/workouts/${id}`);
      setWorkouts((list) => list.filter((w) => w._id !== id));
      setBanner({ type: "ok", msg: "Workout deleted." });
    } catch (e) {
      console.error(e);
      setBanner({
        type: "err",
        msg: e?.response?.data?.message || "Failed to delete workout.",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Workouts</h1>

      {banner && (
        <div
          className={`p-2 rounded ${
            banner.type === "ok" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {banner.msg}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid md:grid-cols-5 gap-3 bg-white p-4 rounded-xl shadow">
        <input
          name="type"
          placeholder="Type (Run, Yoga...)"
          value={form.type}
          onChange={handleChange}
          className="border rounded p-2 md:col-span-2"
          required
        />
        <input
          name="duration"
          placeholder="Duration (min)"
          value={form.duration}
          onChange={handleChange}
          className="border rounded p-2"
          inputMode="numeric"
          required
        />
        <input
          name="distance"
          placeholder="Distance (km)"
          value={form.distance}
          onChange={handleChange}
          className="border rounded p-2"
          inputMode="numeric"
          required
        />
        <input
          name="calories"
          placeholder="Calories"
          value={form.calories}
          onChange={handleChange}
          className="border rounded p-2"
          inputMode="numeric"
          required
        />
        <button
          disabled={!valid || saving}
          className="md:col-span-5 bg-indigo-600 text-white rounded p-2 hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add Workout"}
        </button>
      </form>

      <div className="space-y-2">
        {workouts.map((w) => (
          <div key={w._id} className="bg-white p-3 rounded-xl shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">
                {w.type} — {w.duration} min
              </div>
              <div className="text-sm text-gray-600">
                {w.distance} km • {w.calories} kcal
              </div>
              <div className="text-xs text-gray-400">
                {w.date || w.createdAt ? new Date(w.date || w.createdAt).toLocaleString() : ""}
              </div>
            </div>
            <button
              onClick={() => onDelete(w._id)}
              className="text-red-600 text-sm hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
        {workouts.length === 0 && (
          <div className="text-sm text-gray-500">No workouts yet.</div>
        )}
      </div>
    </div>
  );
}
