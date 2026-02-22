import { useEffect, useRef } from "react";
import { OptimizationResponse } from "../../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileBarChart, DollarSign, TrendingDown, Wallet } from "lucide-react";
import { gsap } from "gsap";

interface ResultsPanelProps {
  result: OptimizationResponse | undefined;
}

const USD_TO_TZS = 2650;

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <FileBarChart className="h-10 w-10 text-muted-foreground/30 mb-3" />
      <p className="text-sm text-muted-foreground">
        Run the optimizer above to see allocation results here.
      </p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  subValue?: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
      <div className={`p-2 rounded-md ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        <div className="text-lg font-semibold text-foreground">{value}</div>
        {subValue && (
          <div className="text-xs text-muted-foreground">{subValue}</div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && tableRef.current) {
      const rows = tableRef.current.querySelectorAll("tr");
      gsap.fromTo(
        rows,
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, stagger: 0.04, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [result]);

  if (!result) return <EmptyState />;

  return (
    <div role="region" aria-label="Optimization results" className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <FileBarChart className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Results</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard
          icon={Wallet}
          label="Budget"
          value={`$${result.total_budget.toLocaleString()}`}
          subValue={`TZS ${(result.total_budget * USD_TO_TZS).toLocaleString()}`}
          color="bg-blue-500"
        />
        <MetricCard
          icon={DollarSign}
          label="Used"
          value={`$${result.total_cost.toLocaleString()}`}
          subValue={`TZS ${(result.total_cost * USD_TO_TZS).toLocaleString()}`}
          color="bg-amber-500"
        />
        <MetricCard
          icon={TrendingDown}
          label="Cases Prevented"
          value={result.total_cases_prevented.toLocaleString()}
          color="bg-emerald-500"
        />
      </div>

      <div ref={tableRef} className="rounded-lg border border-border overflow-hidden">
        <Table aria-label="Resource allocation per region">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Region</TableHead>
              <TableHead className="text-right">ITNs</TableHead>
              <TableHead className="text-right">IRS</TableHead>
              <TableHead className="text-right">Larvicide</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.allocations.map((a) => (
              <TableRow key={a.region_id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">{a.region_name}</TableCell>
                <TableCell className="text-right tabular-nums">{a.itn_units.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{a.irs_units.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{a.larvicide_units.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <span className="tabular-nums">${a.cost.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground block">
                    TZS {(a.cost * USD_TO_TZS).toLocaleString()}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
