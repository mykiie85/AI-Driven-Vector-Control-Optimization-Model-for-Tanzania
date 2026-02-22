import { useState } from "react";
import { DollarSign, Zap, PieChart as PieIcon } from "lucide-react";
import { useRegions } from "@/hooks/useRegions";
import { useOptimizer } from "@/hooks/useOptimizer";
import AllocationTable from "./AllocationTable";
import AllocationCharts from "./AllocationCharts";

export default function OptimizerSection() {
  const { data: geojson } = useRegions();
  const regions = geojson?.features?.map((f) => f.properties) || [];

  const [budget, setBudget] = useState(500000);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const optimizeMutation = useOptimizer();

  const toggleRegion = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelectedIds(selectedIds.length === regions.length ? [] : regions.map((r) => r.id));
  };

  const handleOptimize = () => {
    if (!budget || selectedIds.length === 0) return;
    optimizeMutation.mutate({ budget_usd: budget, region_ids: selectedIds });
  };

  const result = optimizeMutation.data;

  return (
    <section id="budget" className="py-20 border-t border-green-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 mb-4 rounded-md text-[11px] font-bold uppercase tracking-wider"
            style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", color: "#16a34a" }}>
            Resource Optimization
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
            Budget Allocation Optimizer
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto">
            Maximize malaria cases prevented through optimal distribution of ITNs, IRS, and larvicides.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card p-5">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                <DollarSign className="w-3.5 h-3.5" /> Total Budget (TSH)
              </label>
              <input type="number" min={1000} step={10000} value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-gray-900 bg-white border border-green-300 focus:border-green-600 focus:outline-none transition-colors" />
              <p className="text-xs text-gray-600 mt-2">TSH {budget.toLocaleString()}</p>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Regions</label>
                <button onClick={selectAll}
                  className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors">
                  {selectedIds.length === regions.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="max-h-[240px] overflow-y-auto space-y-1 pr-1">
                {regions.map((r) => (
                  <label key={r.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-green-50 cursor-pointer transition-colors">
                    <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleRegion(r.id)}
                      className="w-3.5 h-3.5 rounded border-green-400 text-green-600 focus:ring-green-500 focus:ring-offset-0 bg-white" />
                    <span className="text-sm text-gray-900">{r.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={handleOptimize}
              disabled={optimizeMutation.isPending || selectedIds.length === 0}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:hover:bg-green-600 text-white transition-all flex items-center justify-center gap-2">
              {optimizeMutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Optimizing...</>
              ) : (
                <><Zap className="w-4 h-4" /> Run Optimization</>
              )}
            </button>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {optimizeMutation.isError && (
              <div className="glass-card p-4 border-red-400 text-red-600 text-sm">
                Optimization failed. Please try again with a valid budget and regions.
              </div>
            )}

            {result && (
              <>
                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg border border-green-200 p-5 text-center shadow-sm">
                    <p className="text-2xl font-bold text-green-600">{result.total_cases_prevented.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs text-gray-600 mt-1">Cases Prevented</p>
                  </div>
                  <div className="bg-white rounded-lg border border-green-200 p-5 text-center shadow-sm">
                    <p className="text-2xl font-bold text-gray-900">{result.total_cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs text-gray-600 mt-1">Total Cost (TSH)</p>
                  </div>
                  <div className="bg-white rounded-lg border border-green-200 p-5 text-center shadow-sm">
                    <p className="text-2xl font-bold text-emerald-600">{result.allocations.length}</p>
                    <p className="text-xs text-gray-600 mt-1">Regions Optimized</p>
                  </div>
                </div>

                <AllocationTable allocations={result.allocations} />
                <AllocationCharts allocations={result.allocations} />
              </>
            )}

            {!result && !optimizeMutation.isError && (
              <div className="glass-card p-12 text-center">
                <PieIcon className="w-12 h-12 text-green-400/30 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Enter a budget and select regions, then run optimization</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
