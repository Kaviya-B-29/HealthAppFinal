import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

export default function MacroDoughnut({ protein=0, carbs=0, fat=0, colors=["#ef4444","#f59e0b","#10b981"] }){
  const data = { labels: ["Protein","Carbs","Fat"], datasets: [{ data: [protein, carbs, fat], backgroundColor: colors }] };
  return <Doughnut data={data} />;
}
