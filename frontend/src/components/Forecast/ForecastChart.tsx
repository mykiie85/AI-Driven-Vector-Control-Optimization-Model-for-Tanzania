import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { ForecastPoint } from "@/types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface Props {
  points: ForecastPoint[];
}

export default function ForecastChart({ points }: Props) {
  const labels = points.map((p) => p.date);
  const data = {
    labels,
    datasets: [
      {
        label: "Upper CI",
        data: points.map((p) => p.upper_ci),
        borderColor: "transparent",
        backgroundColor: "rgba(34,197,94,0.1)",
        fill: "+1",
        pointRadius: 0,
      },
      {
        label: "Predicted Density",
        data: points.map((p) => p.predicted_density),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.15)",
        fill: false,
        pointRadius: 0,
        borderWidth: 2.5,
        tension: 0.3,
      },
      {
        label: "Lower CI",
        data: points.map((p) => p.lower_ci),
        borderColor: "transparent",
        backgroundColor: "rgba(34,197,94,0.1)",
        fill: "-1",
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderColor: "rgba(34,197,94,0.3)",
        borderWidth: 1,
        titleColor: "#111827",
        bodyColor: "#374151",
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(34,197,94,0.08)" },
        ticks: { color: "#6b7280", maxTicksLimit: 10, font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(34,197,94,0.08)" },
        ticks: { color: "#6b7280", font: { size: 11 } },
        title: { display: true, text: "Mosquito Density", color: "#6b7280", font: { size: 12 } },
      },
    },
  };

  return (
    <div className="h-[350px]">
      <Line data={data} options={options} />
    </div>
  );
}
