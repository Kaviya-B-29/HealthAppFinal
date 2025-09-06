import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function MoodBar({ labels, data, colors }){
  const cfg = { labels, datasets: [{ label: "Count", data, backgroundColor: colors || ["#22c55e","#3b82f6","#f97316","#ef4444","#6b7280"] }] };
  return <Bar data={cfg} />;
}
