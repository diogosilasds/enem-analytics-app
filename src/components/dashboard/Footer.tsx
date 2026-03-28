export function Footer() {
  return (
    <footer className="border-t border-border py-4 mt-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            System Status: ONLINE
          </span>
        </div>
        <span>ENEM_ANALYTICS_KERNEL_V4.2.0</span>
        <div className="text-center sm:text-right">
          <p>© 2026 Neural Analytics Corp</p>
          <p>Dev: Diogo Silas // AI Core Integration</p>
        </div>
      </div>
    </footer>
  );
}
