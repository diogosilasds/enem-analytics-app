interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  text: string;
}

export function InfoRow({ icon, label, text }: InfoRowProps) {
  return (
    <div className="flex gap-2">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xs text-secondary-foreground">{text}</p>
      </div>
    </div>
  );
}
