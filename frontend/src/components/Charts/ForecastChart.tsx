import { memo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ForecastResponse } from "../../types";
import LoadingSpinner from "../Common/LoadingSpinner";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);

interface ForecastChartProps {
  forecast: ForecastResponse | undefined;
  isLoading: boolean;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-3" />
      <div className="text-sm font-medium text-foreground mb-1">No forecast data</div>
      <p className="text-xs text-muted-foreground max-w-xs">
        Select a region from the sidebar or click on the map to generate a mosquito density forecast.
      </p>
    </div>
  );
}

function ForecastChart({ forecast, isLoading }: ForecastChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 py-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-[250px] w-full rounded-lg" />
      </div>
    );
  }

  if (!forecast) return <EmptyState />;

  const labels = forecast.points.map((p) => p.date);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Predicted Density",
        data: forecast.points.map((p) => p.predicted_density),
        borderColor: "#1976d2",
        backgroundColor: "rgba(25, 118, 210, 0.08)",
        tension: 0.3,
        pointRadius: 1,
        borderWidth: 2,
        fill: false,
      },
      {
        label: "Upper CI (95%)",
        data: forecast.points.map((p) => p.upper_ci),
        borderColor: "rgba(244, 67, 54, 0.35)",
        borderDash: [4, 4],
        pointRadius: 0,
        borderWidth: 1,
        fill: false,
      },
      {
        label: "Lower CI (95%)",
        data: forecast.points.map((p) => p.lower_ci),
        borderColor: "rgba(76, 175, 80, 0.35)",
        borderDash: [4, 4],
        pointRadius: 0,
        borderWidth: 1,
        fill: "-1",
        backgroundColor: "rgba(25, 118, 210, 0.06)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `${forecast.region_name} \u2014 ${forecast.model_type.toUpperCase()} (${forecast.forecast_days}d)`,
        font: { size: 13, weight: "bold" as const },
        color: "#1a1a2e",
      },
      tooltip: {
        backgroundColor: "rgba(255,255,255,0.95)",
        titleColor: "#1a1a2e",
        bodyColor: "#4a4a4a",
        borderColor: "#e0e0e0",
        borderWidth: 1,
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 6,
      },
      legend: {
        labels: { font: { size: 11 }, usePointStyle: true, pointStyle: "line" as const, color: "#4a4a4a" },
      },
    },
    scales: {
      y: {
        title: { display: true, text: "Density (per trap-night)", font: { size: 11 }, color: "#6b7280" },
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { color: "#6b7280" },
      },
      x: {
        title: { display: true, text: "Date", font: { size: 11 }, color: "#6b7280" },
        ticks: { maxTicksLimit: 8, font: { size: 10 }, color: "#6b7280" },
        grid: { display: false },
      },
    },
  };

  return (
    <div role="img" aria-label={`Forecast chart for ${forecast.region_name}`}>
      <div className="relative">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default memo(ForecastChart);
