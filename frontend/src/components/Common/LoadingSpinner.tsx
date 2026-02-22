import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "default";
}

export default function LoadingSpinner({
  message = "Loading...",
  size = "default",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        size === "default" ? "py-16" : "py-6"
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className={cn(
          "animate-spin text-primary",
          size === "default" ? "h-8 w-8" : "h-5 w-5"
        )}
        aria-hidden="true"
      />
      <span className={cn(
        "text-muted-foreground",
        size === "default" ? "text-sm" : "text-xs"
      )}>
        {message}
      </span>
      <span className="sr-only">{message}</span>
    </div>
  );
}

export function SkeletonLoader({ lines = 3 }: { lines?: number }) {
  return (
    <div role="status" aria-label="Loading content" className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}
