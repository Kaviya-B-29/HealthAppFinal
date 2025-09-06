import React from "react";

export default function MetricCard({ title, value, subtitle, color }) {
  const border = color ? `border-t-4 ${color}` : "border-t-4 border-gray-200";
  return (
    <div className={`bg-white p-4 rounded-xl shadow ${border}`}>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );
}
