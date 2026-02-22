import { useState } from "react";
import { TrendingUp, AlertCircle } from "lucide-react";
import { useRegions } from "@/hooks/useRegions";
import { useForecast } from "@/hooks/useForecast";
import ForecastChart from "./ForecastChart";

const MODELS = ["prophet", "arima", "hybrid"] as const;

export default function ForecastSection() {
  const { data: geojson } = useRegions();
  const regions = geojson?.features?.map((f) => f.properties) || [];

  const [regionId, setRegionId] = useState<number | null>(null);
  const [model, setModel] = useState<string>("prophet");
  const [days, setDays] = useState(60);

  const { data: forecast, isLoading, isError } = useForecast(regionId, days, model);

  return (
    <section id="forecast" className="py-20 border-t border-green-200"
      style={{ background: "linear-gradient(180deg, transparent 0%, rgba(34,197,94,0.02) 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 mb-4 rounded-md text-[11px] font-bold uppercase tracking-wider"
            style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", color: "#16a34a" }}>
            Predictive Analytics
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
            Mosquito Population Forecast
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto">
            Hybrid forecasting using ARIMA + Prophet models for early outbreak warnings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card p-5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Region</label>
              <select value={regionId || ""} onChange={(e) => setRegionId(Number(e.target.value) || null)}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-gray-900 bg-white border border-green-300 focus:border-green-600 focus:outline-none transition-colors">
                <option value="">Select a region...</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="glass-card p-5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Model</label>
              <div className="flex flex-col gap-2">
                {MODELS.map((m) => (
                  <button key={m} onClick={() => setModel(m)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${model === m
                      ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                      : "bg-white text-gray-700 border border-green-300 hover:bg-green-50 hover:text-gray-900"}`}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Forecast Days</label>
              <input type="range" min={7} max={180} step={1} value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full accent-green-600" />
              <p className="text-center text-sm text-gray-700 mt-2 font-medium">{days} days</p>
            </div>

            {forecast && (
              <div className="glass-card p-5 space-y-3">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Region</span>
                    <span className="text-gray-900 font-medium">{forecast.region_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Model</span>
                    <span className="text-green-600 font-medium capitalize">{forecast.model_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Predicted</span>
                    <span className="text-gray-900 font-medium">
                      {(forecast.points.reduce((s, p) => s + p.predicted_density, 0) / forecast.points.length).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Peak</span>
                    <span className="text-amber-600 font-medium">
                      {Math.max(...forecast.points.map((p) => p.predicted_density)).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="lg:col-span-3 glass-card p-6 min-h-[400px] flex items-center justify-center">
            {!regionId ? (
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-green-400/30 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Select a region to view forecast</p>
              </div>
            ) : isLoading ? (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Generating forecast...</p>
              </div>
            ) : isError ? (
              <div className="text-center">
                <AlertCircle className="w-10 h-10 text-red-400/60 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Failed to load forecast. Please try again.</p>
              </div>
            ) : forecast ? (
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {forecast.region_name} — <span className="text-purple-400 capitalize">{forecast.model_type}</span>
                  </h3>
                  <span className="text-xs text-white/40">{forecast.forecast_days} day forecast</span>
                </div>
                <ForecastChart points={forecast.points} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
