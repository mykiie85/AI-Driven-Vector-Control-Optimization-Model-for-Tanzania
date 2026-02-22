import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { RegionAllocation } from "@/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface Props {
  allocations: RegionAllocation[];
}

export default function AllocationCharts({ allocations }: Props) {
  const labels = allocations.map((a) => a.region_name);

  const barData = {
    labels,
    datasets: [
      { label: "ITNs", data: allocations.map((a) => a.itn_units), backgroundColor: "rgba(34,197,94,0.7)", borderRadius: 4 },
      { label: "IRS", data: allocations.map((a) => a.irs_units), backgroundColor: "rgba(245,158,11,0.7)", borderRadius: 4 },
      { label: "Larvicide", data: allocations.map((a) => a.larvicide_units), backgroundColor: "rgba(59,130,246,0.7)", borderRadius: 4 },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#374151", font: { size: 11 } } },
      tooltip: { backgroundColor: "rgba(255,255,255,0.95)", borderColor: "rgba(34,197,94,0.3)", borderWidth: 1, titleColor: "#111827", bodyColor: "#374151", padding: 10, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { color: "rgba(34,197,94,0.08)" }, ticks: { color: "#6b7280", font: { size: 10 } } },
      y: { grid: { color: "rgba(34,197,94,0.08)" }, ticks: { color: "#6b7280", font: { size: 10 } } },
    },
  };

  const pieData = {
    labels,
    datasets: [{
      data: allocations.map((a) => a.cases_prevented),
      backgroundColor: allocations.map((_, i) => {
        const colors = ["#22c55e", "#f59e0b", "#3b82f6", "#ef4444", "#06b6d4", "#ec4899", "#f97316", "#14b8a6", "#6366f1", "#84cc16", "#a855f7", "#0ea5e9", "#e11d48", "#10b981", "#eab308", "#22c55e"];
        return colors[i % colors.length];
      }),
      borderWidth: 0,
    }],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" as const, labels: { color: "#374151", font: { size: 10 }, boxWidth: 12, padding: 8 } },
      tooltip: { backgroundColor: "rgba(255,255,255,0.95)", borderColor: "rgba(34,197,94,0.3)", borderWidth: 1, titleColor: "#111827", bodyColor: "#374151", padding: 10, cornerRadius: 8 },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-card p-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Interventions by Region</h4>
        <div className="h-[260px]">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
      <div className="glass-card p-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Cases Prevented Distribution</h4>
        <div className="h-[260px]">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>
    </div>
  );
}
