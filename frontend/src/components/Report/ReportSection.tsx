import { useState } from "react";
import { FileText, Download, Share2, Copy, Check, Twitter } from "lucide-react";
import { useRegions } from "@/hooks/useRegions";
import { useReport } from "@/hooks/useReport";
import { useOptimizer } from "@/hooks/useOptimizer";

export default function ReportSection() {
  const { data: geojson } = useRegions();
  const regions = geojson?.features?.map((f) => f.properties) || [];

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const reportMutation = useReport();

  const selectAll = () => {
    setSelectedIds(selectedIds.length === regions.length ? [] : regions.map((r) => r.id));
  };

  const toggleRegion = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleGenerate = () => {
    if (selectedIds.length === 0) return;
    reportMutation.mutate({ region_ids: selectedIds, include_forecast: true, include_optimization: true });
  };

  const handleCopy = () => {
    if (reportMutation.data?.summary) {
      navigator.clipboard.writeText(reportMutation.data.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const report = reportMutation.data;
  const tweetText = report
    ? encodeURIComponent(`Malaria control insights from VCOM-TZ: ${report.summary.substring(0, 100)}...`)
    : "";

  return (
    <section id="report" className="py-20 border-t border-green-200"
      style={{ background: "linear-gradient(180deg, transparent 0%, rgba(34,197,94,0.02) 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 mb-4 rounded-md text-[11px] font-bold uppercase tracking-wider"
            style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", color: "#16a34a" }}>
            NLP Reports
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
            Intelligent Report Generation
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto">
            Generate plain-language summaries using NLP with downloadable PDF reports and social sharing.
          </p>
        </div>

        {/* Background image accent */}
        <div className="relative mb-8 rounded-2xl overflow-hidden h-48">
          <img src="/images/top_right.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(245,245,244,0.95)] via-[rgba(220,252,231,0.6)] to-[rgba(245,245,244,0.95)]" />
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <p className="text-gray-700 text-sm max-w-md">AI-powered NLP transforms complex surveillance data into actionable insights</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Select Regions</label>
                <button onClick={selectAll} className="text-xs text-green-600 hover:text-green-700 font-medium">
                  {selectedIds.length === regions.length ? "Clear" : "All"}
                </button>
              </div>
              <div className="max-h-[260px] overflow-y-auto space-y-1 pr-1">
                {regions.map((r) => (
                  <label key={r.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-green-50 cursor-pointer">
                    <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleRegion(r.id)}
                      className="w-3.5 h-3.5 rounded border-green-400 text-green-600 focus:ring-green-500 bg-white" />
                    <span className="text-sm text-gray-900">{r.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate}
              disabled={reportMutation.isPending || selectedIds.length === 0}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white transition-all flex items-center justify-center gap-2">
              {reportMutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
              ) : (
                <><FileText className="w-4 h-4" /> Generate Report</>
              )}
            </button>
          </div>

          {/* Report output */}
          <div className="lg:col-span-2">
            {reportMutation.isError && (
              <div className="glass-card p-4 border-red-400 text-red-600 text-sm mb-4">
                Report generation failed. Please try again.
              </div>
            )}

            {report ? (
              <div className="space-y-4">
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
                    <span className="text-xs text-gray-500">{report.regions_analyzed} regions analyzed</span>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: "rgba(34,197,94,0.08)", borderLeft: "4px solid #22c55e" }}>
                    <p className="text-sm text-gray-800 leading-relaxed">{report.summary}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Model: {report.model_used}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {report.pdf_url && (
                    <a href={report.pdf_url} download className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors">
                      <Download className="w-4 h-4" /> Download PDF
                    </a>
                  )}

                  <button onClick={handleCopy}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-green-300 text-gray-700 hover:bg-green-50 transition-colors">
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy Summary"}
                  </button>

                  <a href={`https://twitter.com/intent/tweet?text=${tweetText}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-green-300 text-gray-700 hover:bg-green-50 transition-colors">
                    <Twitter className="w-4 h-4" /> Share
                  </a>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <FileText className="w-12 h-12 text-green-400/30 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Select regions and generate a report</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
