const RISK_LEVELS = [
  { label: "Low (0-30%)", color: "var(--risk-low)" },
  { label: "Medium (30-60%)", color: "var(--risk-medium)" },
  { label: "High (60-80%)", color: "var(--risk-high)" },
  { label: "Critical (80%+)", color: "var(--risk-critical)" },
];

export default function Legend() {
  return (
    <div
      className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-medium border border-border p-3"
      role="img"
      aria-label="Risk score legend: Low 0 to 30 percent green, Medium 30 to 60 percent orange, High 60 to 80 percent red, Critical above 80 percent dark red"
    >
      <div className="text-xs font-semibold text-foreground mb-2">Risk Score</div>
      <div className="space-y-1.5">
        {RISK_LEVELS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0 border border-white shadow-sm"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className="text-[11px] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
