import type { RegionAllocation } from "@/types";

interface Props {
  allocations: RegionAllocation[];
}

export default function AllocationTable({ allocations }: Props) {
  const totalITN = allocations.reduce((s, a) => s + a.itn_units, 0);
  const totalIRS = allocations.reduce((s, a) => s + a.irs_units, 0);
  const totalLarv = allocations.reduce((s, a) => s + a.larvicide_units, 0);
  const totalCost = allocations.reduce((s, a) => s + a.cost, 0);
  const totalPrev = allocations.reduce((s, a) => s + a.cases_prevented, 0);

  return (
    <div className="bg-white rounded-lg border border-green-200 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-green-200 bg-green-50">
        <h3 className="text-sm font-semibold text-gray-900">Allocation Results</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-green-50/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-green-200">Region</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-green-200">ITNs</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-green-200">IRS</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-green-200">Larvicide</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-green-200">Cost (TSH)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-green-200">Cases Prevented</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((a) => (
              <tr key={a.region_id} className="hover:bg-green-50/50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b border-green-100">{a.region_name}</td>
                <td className="px-4 py-3 text-sm text-gray-700 border-b border-green-100">{a.itn_units.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-gray-700 border-b border-green-100">{a.irs_units.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-gray-700 border-b border-green-100">{a.larvicide_units.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-gray-700 border-b border-green-100">{a.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-3 text-sm text-green-700 font-medium border-b border-green-100">{a.cases_prevented.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
              </tr>
            ))}
            <tr className="font-bold bg-green-50">
              <td className="px-4 py-3 text-sm text-gray-900">Total</td>
              <td className="px-4 py-3 text-sm text-gray-900">{totalITN.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{totalIRS.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{totalLarv.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
              <td className="px-4 py-3 text-sm text-green-700">{totalPrev.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
