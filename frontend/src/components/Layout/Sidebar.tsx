import { useState } from "react";
import { RegionProperties } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  regions: RegionProperties[];
  selectedRegionId: number | null;
  onSelectRegion: (id: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

function getRiskVariant(score: number): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 0.6) return "destructive";
  if (score >= 0.3) return "secondary";
  return "default";
}

function getRiskLabel(score: number): string {
  if (score >= 0.8) return "Critical";
  if (score >= 0.6) return "High";
  if (score >= 0.3) return "Medium";
  return "Low";
}

function getRiskColor(score: number): string {
  if (score >= 0.8) return "bg-risk-critical";
  if (score >= 0.6) return "bg-risk-high";
  if (score >= 0.3) return "bg-risk-medium";
  return "bg-risk-low";
}

function RegionList({
  regions,
  selectedRegionId,
  onSelectRegion,
  searchQuery,
}: {
  regions: RegionProperties[];
  selectedRegionId: number | null;
  onSelectRegion: (id: number) => void;
  searchQuery: string;
}) {
  const filtered = regions.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ul className="space-y-1 p-2" role="listbox" aria-label="Select a region">
      {filtered.map((r) => (
        <li key={r.id}>
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
              "hover:bg-accent hover:shadow-sm",
              r.id === selectedRegionId
                ? "bg-primary/10 border border-primary/20 shadow-sm"
                : "border border-transparent"
            )}
            onClick={() => onSelectRegion(r.id)}
            role="option"
            aria-selected={r.id === selectedRegionId}
          >
            <div
              className={cn("w-2.5 h-2.5 rounded-full shrink-0", getRiskColor(r.risk_score))}
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {r.name}
              </div>
              <div className="text-xs text-muted-foreground">
                Risk: {(r.risk_score * 100).toFixed(0)}%
              </div>
            </div>
            <Badge
              variant={getRiskVariant(r.risk_score)}
              className="text-[10px] px-1.5 py-0 h-5 shrink-0"
            >
              {getRiskLabel(r.risk_score)}
            </Badge>
          </button>
        </li>
      ))}
      {filtered.length === 0 && (
        <li className="px-3 py-8 text-center text-sm text-muted-foreground">
          No regions match your search.
        </li>
      )}
    </ul>
  );
}

export default function Sidebar({
  regions,
  selectedRegionId,
  onSelectRegion,
  isOpen,
  onClose,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const handleSelect = (id: number) => {
    onSelectRegion(id);
    if (isMobile) onClose();
  };

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Regions</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {regions.length} available
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search regions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <RegionList
          regions={regions}
          selectedRegionId={selectedRegionId}
          onSelectRegion={handleSelect}
          searchQuery={searchQuery}
        />
      </ScrollArea>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Region Navigation</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className="hidden lg:flex flex-col w-64 border-r border-border bg-card shrink-0 h-[calc(100vh-4rem)] sticky top-16"
      role="navigation"
      aria-label="Region navigation"
    >
      {sidebarContent}
    </aside>
  );
}
