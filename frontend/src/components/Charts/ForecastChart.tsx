import React from "react";
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
import styles from "./ForecastChart.module.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);

interface ForecastChartProps {
  forecast: ForecastResponse | undefined;
  isLoading: boolean;
}

const EmptyState: React.FC = () => (
  <div className={styles.emptyState}>
    <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-8 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div className={styles.emptyTitle}>No forecast data</div>
    <p className={styles.emptyDesc}>
      Select a region from the sidebar or click on the map to generate a mosquito density forecast.
    </p>
  </div>
);

const ForecastChart: React.FC<ForecastChartProps> = ({ forecast, isLoading }) => {
  if (isLoading) return <LoadingSpinner message="Generating forecast..." />;
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
        text: `${forecast.region_name} — ${forecast.model_type.toUpperCase()} (${forecast.forecast_days}d)`,
        font: { size: 13, weight: "600" as const },
        color: "#333",
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 6,
      },
      legend: {
        labels: { font: { size: 11 }, usePointStyle: true, pointStyle: "line" },
      },
    },
    scales: {
      y: {
        title: { display: true, text: "Density (per trap-night)", font: { size: 11 } },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        title: { display: true, text: "Date", font: { size: 11 } },
        ticks: { maxTicksLimit: 8, font: { size: 10 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className={styles.container} role="img" aria-label={`Forecast chart for ${forecast.region_name}`}>
      <div className={styles.chartWrap}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default React.memo(ForecastChart);
