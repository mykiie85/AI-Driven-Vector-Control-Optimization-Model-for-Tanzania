import { useState } from "react";
import { RegionProperties, OptimizationRequest } from "../../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetFormProps {
  regions: RegionProperties[];
  onSubmit: (request: OptimizationRequest) => void;
  isLoading: boolean;
}

const USD_TO_TZS = 2650;

export default function BudgetForm({ regions, onSubmit, isLoading }: BudgetFormProps) {
  const [budget, setBudget] = useState<number>(50000);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleRegion = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(regions.map((r) => r.id));
  const clearAll = () => setSelectedIds([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0 || budget <= 0) return;
    onSubmit({ budget_usd: budget, region_ids: selectedIds });
  };

  const tzsAmount = budget > 0 ? (budget * USD_TO_TZS).toLocaleString() : "0";

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Budget optimization form"
      className="space-y-5"
    >
      <div className="flex items-center gap-2 mb-1">
        <DollarSign className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Budget Optimizer</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget-input">Total Budget (USD)</Label>
        <Input
          id="budget-input"
          type="number"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          min={1}
          aria-describedby="budget-hint"
        />
        <div className="text-sm font-medium text-primary">
          &asymp; TZS {tzsAmount}
        </div>
        <p id="budget-hint" className="text-xs text-muted-foreground">
          Minimum $1. Allocated across selected regions by risk weight.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label id="region-list-label">Target Regions</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={selectedIds.length === regions.length ? clearAll : selectAll}
          >
            {selectedIds.length === regions.length ? "Clear All" : "Select All"}
          </Button>
        </div>

        <ScrollArea className="h-[200px] rounded-lg border border-border">
          <div
            className="p-2 space-y-1"
            role="group"
            aria-labelledby="region-list-label"
          >
            {regions.map((r) => (
              <label
                key={r.id}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer transition-colors text-sm",
                  selectedIds.includes(r.id)
                    ? "bg-primary/5 border border-primary/20"
                    : "hover:bg-accent border border-transparent"
                )}
              >
                <Checkbox
                  checked={selectedIds.includes(r.id)}
                  onCheckedChange={() => toggleRegion(r.id)}
                  aria-label={`${r.name} - Risk ${(r.risk_score * 100).toFixed(0)}%`}
                />
                <span className="text-foreground">{r.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {(r.risk_score * 100).toFixed(0)}%
                </span>
              </label>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || selectedIds.length === 0}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Optimizing...
          </>
        ) : (
          "Run Optimization"
        )}
      </Button>

      {selectedIds.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {selectedIds.length} of {regions.length} regions selected
        </p>
      )}
    </form>
  );
}
