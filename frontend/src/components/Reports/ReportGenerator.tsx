import { useState } from "react";
import { useReport } from "../../hooks/useReport";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { FileText, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ReportGeneratorProps {
  selectedRegionIds: number[];
}

export default function ReportGenerator({ selectedRegionIds }: ReportGeneratorProps) {
  const { mutate, data, isPending, error } = useReport();
  const [includeOptions, setIncludeOptions] = useState({ forecast: true, optimization: true });

  const handleGenerate = () => {
    if (selectedRegionIds.length === 0) return;
    mutate(
      {
        region_ids: selectedRegionIds,
        include_forecast: includeOptions.forecast,
        include_optimization: includeOptions.optimization,
      },
      {
        onSuccess: () => {
          toast.success("Report generated successfully!");
        },
        onError: () => {
          toast.error("Failed to generate report. Please try again.");
        },
      }
    );
  };

  const noRegions = selectedRegionIds.length === 0;

  return (
    <div role="region" aria-label="Report generator" className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">NLP Report Generator</h3>
      </div>

      <fieldset className="space-y-3">
        <legend className="sr-only">Report options</legend>
        <div className="flex items-center gap-2">
          <Checkbox
            id="include-forecast"
            checked={includeOptions.forecast}
            onCheckedChange={(checked) =>
              setIncludeOptions((p) => ({ ...p, forecast: checked === true }))
            }
          />
          <Label htmlFor="include-forecast" className="cursor-pointer">
            Include Forecast Data
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="include-optimization"
            checked={includeOptions.optimization}
            onCheckedChange={(checked) =>
              setIncludeOptions((p) => ({ ...p, optimization: checked === true }))
            }
          />
          <Label htmlFor="include-optimization" className="cursor-pointer">
            Include Optimization Results
          </Label>
        </div>
      </fieldset>

      <Button
        onClick={handleGenerate}
        disabled={isPending || noRegions}
        aria-busy={isPending}
        className="w-full sm:w-auto"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Report
          </>
        )}
      </Button>

      {noRegions && (
        <p className="text-xs text-muted-foreground">
          Select a region first to generate a report.
        </p>
      )}

      {isPending && (
        <div className="space-y-3 pt-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to generate report. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {data && (
        <div className="mt-4">
          <Separator className="mb-4" />
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
              AI-Generated Summary
            </div>
            <p className="text-sm text-foreground leading-relaxed">{data.summary}</p>
            <div className="mt-3 text-xs text-muted-foreground">
              {data.regions_analyzed} region(s) analyzed &middot; Model: {data.model_used}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
