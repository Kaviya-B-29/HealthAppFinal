import React, { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

export default function Nutrition() {
  const [meals, setMeals] = useState([]);
  const [form, setForm] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState(null); // {type:'ok'|'err', msg:string}

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const res = await API.get("/foods");
      setMeals(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setBanner({ type: "err", msg: "Failed to load meals." });
    }
  };

  const valid = useMemo(() => {
    const { name, calories, protein, carbs, fat } = form;
    const numsOk =
      [calories, protein, carbs, fat].every((v) => v !== "" && !isNaN(+v)) &&
      [+calories, +protein, +carbs, +fat].every((n) => n >= 0);
    return name.trim() !== "" && numsOk;
  }, [form]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setBanner(null);
    try {
      await API.post("/foods", {
        name: form.name.trim(),
        calories: +form.calories,
        protein: +form.protein,
        carbs: +form.carbs,
        fat: +form.fat,
      });
      setForm({ name: "", calories: "", protein: "", carbs: "", fat: "" });
      await fetchMeals();
      setBanner({ type: "ok", msg: "Meal added." });
    } catch (e) {
      console.error(e);
      setBanner({
        type: "err",
        msg: e?.response?.data?.message || "Failed to add meal.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id) => {
    if (!id) return;
    if (!confirm("Delete this meal?")) return;
    try {
      await API.delete(`/foods/${id}`);
      setMeals((list) => list.filter((m) => m._id !== id));
      setBanner({ type: "ok", msg: "Meal deleted." });
    } catch (e) {
      console.error(e);
      setBanner({
        type: "err",
        msg: e?.response?.data?.message || "Failed to delete meal.",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Food Log</h1>

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
          name="name"
          placeholder="Meal name"
          value={form.name}
          onChange={handleChange}
          className="border rounded p-2 md:col-span-2"
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
        <input
          name="protein"
          placeholder="Protein (g)"
          value={form.protein}
          onChange={handleChange}
          className="border rounded p-2"
          inputMode="numeric"
          required
        />
        <input
          name="carbs"
          placeholder="Carbs (g)"
          value={form.carbs}
          onChange={handleChange}
          className="border rounded p-2"
          inputMode="numeric"
          required
        />
        <input
          name="fat"
          placeholder="Fat (g)"
          value={form.fat}
          onChange={handleChange}
          className="border rounded p-2"
          inputMode="numeric"
          required
        />
        <button
          disabled={!valid || submitting}
          className={`md:col-span-5 bg-indigo-600 text-white rounded p-2 hover:bg-indigo-700 disabled:opacity-50`}
        >
          {submitting ? "Saving..." : "Add Meal"}
        </button>
      </form>

      <div className="space-y-2">
        {meals.map((m) => (
          <div key={m._id} className="bg-white p-3 rounded-xl shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">
                {m.name} — {m.calories} kcal
              </div>
              <div className="text-sm text-gray-600">
                {m.protein}g protein • {m.carbs}g carbs • {m.fat}g fat
              </div>
              <div className="text-xs text-gray-400">
                {m.date || m.createdAt ? new Date(m.date || m.createdAt).toLocaleString() : ""}
              </div>
            </div>
            <button
              onClick={() => onDelete(m._id)}
              className="text-red-600 text-sm hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
        {meals.length === 0 && (
          <div className="text-sm text-gray-500">No meals yet.</div>
        )}
      </div>
    </div>
  );
}
