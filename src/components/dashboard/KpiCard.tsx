interface KpiCardProps {
  tag: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  variant?: "correct" | "error" | "highlight";
}

export function KpiCard({ tag, label, value, icon, variant }: KpiCardProps) {
  const tagClass = variant === "correct" ? "text-chart-correct border-chart-correct"
    : variant === "error" ? "text-destructive border-destructive"
    : variant === "highlight" ? "text-chart-highlight border-chart-highlight"
    : "text-primary border-primary";

  return (
    <div className="bg-card terminal-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-1.5 py-0.5 text-[9px] font-bold border ${tagClass} uppercase tracking-wider`}>{tag}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-display font-bold text-foreground tracking-tight">{value}</p>
    </div>
  );
}
