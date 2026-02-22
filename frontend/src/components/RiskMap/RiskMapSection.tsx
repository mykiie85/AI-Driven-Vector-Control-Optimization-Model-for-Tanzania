import { useState } from "react";
import { MapPin, AlertTriangle, Users, Activity } from "lucide-react";
import { useRegions } from "@/hooks/useRegions";
import MapView from "@/components/Map/MapView";

function getRiskClass(score: number) {
  if (score >= 0.75) return "risk-critical";
  if (score >= 0.6) return "risk-high";
  if (score >= 0.4) return "risk-medium";
  return "risk-low";
}

function getRiskLabel(score: number) {
  if (score >= 0.75) return "Critical";
  if (score >= 0.6) return "High";
  if (score >= 0.4) return "Medium";
  return "Low";
}

export default function RiskMapSection() {
  const { data: geojson, isLoading } = useRegions();
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

  const regions = geojson?.features?.map((f) => f.properties) || [];
  const selected = regions.find((r) => r.id === selectedRegion);

  return (
    <section id="risk-maps" className="py-20 border-t border-green-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 mb-4 rounded-md text-[11px] font-bold uppercase tracking-wider"
            style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", color: "#16a34a" }}>
            Geospatial Analysis
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
            Malaria Risk by Region
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto text-base">
            Interactive map of Tanzania's 16 regions with risk scoring based on surveillance data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Region list */}
          <div className="lg:col-span-1 bg-white rounded-lg border border-green-200 p-0 overflow-hidden max-h-[600px] flex flex-col shadow-sm">
            <div className="px-4 py-3 border-b border-green-200 bg-green-50">
              <h3 className="text-sm font-semibold text-gray-900">Regions ({regions.length})</h3>
            </div>
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="p-4 text-sm text-gray-400">Loading regions...</div>
              ) : (
                regions
                  .sort((a, b) => b.risk_score - a.risk_score)
                  .map((r) => (
                    <button key={r.id}
                      onClick={() => setSelectedRegion(r.id === selectedRegion ? null : r.id)}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between border-b border-green-100 transition-colors hover:bg-green-50 ${selectedRegion === r.id ? "bg-green-100" : ""}`}>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{r.name}</span>
                        <span className="block text-xs text-gray-500 mt-0.5">
                          Pop: {r.population?.toLocaleString() || "N/A"}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getRiskClass(r.risk_score)}`}>
                        {(r.risk_score * 100).toFixed(0)}%
                      </span>
                    </button>
                  ))
              )}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2 glass-card p-2 min-h-[500px]">
            <MapView geojson={geojson} selectedRegion={selectedRegion} onSelectRegion={setSelectedRegion} />
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-1 space-y-4">
            {selected ? (
              <>
                <div className="glass-card p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{selected.name}</h3>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${getRiskClass(selected.risk_score)}`}>
                    {getRiskLabel(selected.risk_score)} Risk
                  </span>
                </div>

                <div className="glass-card p-4 flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600">Population</p>
                    <p className="text-lg font-bold text-gray-900">{selected.population?.toLocaleString() || "N/A"}</p>
                  </div>
                </div>

                <div className="glass-card p-4 flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600">Risk Score</p>
                    <p className="text-lg font-bold text-gray-900">{(selected.risk_score * 100).toFixed(1)}%</p>
                  </div>
                </div>

                <div className="glass-card p-4 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600">Area</p>
                    <p className="text-lg font-bold text-gray-900">{selected.area_km2?.toLocaleString() || "N/A"} km²</p>
                  </div>
                </div>

                <a href="#forecast" className="block text-center py-2.5 px-4 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors">
                  View Forecast
                </a>
              </>
            ) : (
              <div className="glass-card p-8 text-center">
                <AlertTriangle className="w-8 h-8 text-green-400/40 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Select a region to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
