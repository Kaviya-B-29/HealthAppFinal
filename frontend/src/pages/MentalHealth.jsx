import React, { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

const MOODS = ["Happy", "Neutral", "Sad", "Stressed", "Anxious"];

export default function MentalHealth() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ mood: "", notes: "" }); // notes optional
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await API.get("/mental-logs");
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setBanner({ type: "err", msg: "Failed to load mental health logs." });
    }
  };

  const valid = useMemo(() => form.mood.trim() !== "", [form.mood]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    setBanner(null);
    try {
      await API.post("/mental-logs", {
        mood: form.mood,
        notes: form.notes?.trim() || undefined,
      });
      setForm({ mood: "", notes: "" });
      await fetchLogs();
      setBanner({ type: "ok", msg: "Mental health entry added." });
    } catch (e) {
      console.error(e);
      setBanner({
        type: "err",
        msg: e?.response?.data?.message || "Failed to add entry.",
      });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!id) return;
    if (!confirm("Delete this entry?")) return;
    try {
      await API.delete(`/mental-logs/${id}`);
      setLogs((list) => list.filter((x) => x._id !== id));
      setBanner({ type: "ok", msg: "Entry deleted." });
    } catch (e) {
      console.error(e);
      setBanner({
        type: "err",
        msg: e?.response?.data?.message || "Failed to delete entry.",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Mental Health</h1>

      {banner && (
        <div
          className={`p-2 rounded ${
            banner.type === "ok" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {banner.msg}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid md:grid-cols-3 gap-3 bg-white p-4 rounded-xl shadow">
        <select
          name="mood"
          value={form.mood}
          onChange={handleChange}
          className="border rounded p-2"
          required
        >
          <option value="">Select mood</option>
          {MOODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleChange}
          className="border rounded p-2 md:col-span-2"
        />
        <button
          disabled={!valid || saving}
          className="md:col-span-3 bg-indigo-600 text-white rounded p-2 hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add Entry"}
        </button>
      </form>

      <div className="space-y-2">
        {logs.map((x) => (
          <div key={x._id} className="bg-white p-3 rounded-xl shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">{x.mood}</div>
              {x.notes && <div className="text-sm text-gray-600">{x.notes}</div>}
              <div className="text-xs text-gray-400">
                {x.date || x.createdAt ? new Date(x.date || x.createdAt).toLocaleString() : ""}
              </div>
            </div>
            <button
              onClick={() => onDelete(x._id)}
              className="text-red-600 text-sm hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-sm text-gray-500">No entries yet.</div>
        )}
      </div>
    </div>
  );
}
