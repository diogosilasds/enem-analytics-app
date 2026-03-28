interface StatBoxProps {
  label: string;
  tag: string;
  value: number;
  variant?: "correct" | "error";
}

export function StatBox({ label, tag, value, variant }: StatBoxProps) {
  const borderColor = variant === "correct"
    ? "border-chart-correct"
    : variant === "error"
    ? "border-destructive"
    : "border-border";

  const tagColor = variant === "correct"
    ? "text-chart-correct border-chart-correct"
    : variant === "error"
    ? "text-destructive border-destructive"
    : "text-muted-foreground border-border";

  const valueColor = variant === "correct"
    ? "text-chart-correct"
    : variant === "error"
    ? "text-destructive"
    : "text-foreground";

  return (
    <div className={`terminal-border ${borderColor} rounded-lg px-4 py-3 min-w-[100px] flex-1 lg:flex-none`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`px-1.5 py-0.5 text-[9px] font-bold border ${tagColor} uppercase tracking-wider`}>
          {tag}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-3xl font-display font-bold ${valueColor} tracking-tight`}>{value}</p>
    </div>
  );
}
