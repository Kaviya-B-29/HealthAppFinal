import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function WeeklyWorkoutChart({ labels, data, borderColor="#4f46e5", backgroundColor="rgba(79,70,229,0.2)" }){
  const cfg = { labels, datasets: [{ label: "Minutes", data, borderColor, backgroundColor, fill: true, tension: 0.3 }] };
  return <Line data={cfg} />;
}
