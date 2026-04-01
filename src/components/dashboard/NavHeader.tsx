import { useState } from "react";
import { Globe, BookOpen, Calculator, Microscope, PenTool, Menu, X, Bug, LayoutGrid, LogOut } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";

const subjectIcons: Record<string, React.ReactNode> = {
  humanas: <Globe className="w-4 h-4" />,
  linguagens: <BookOpen className="w-4 h-4" />,
  matematica: <Calculator className="w-4 h-4" />,
  natureza: <Microscope className="w-4 h-4" />,
  redacao: <PenTool className="w-4 h-4" />,
};

const shortLabels: Record<string, string> = {
  humanas: "HUM",
  linguagens: "LIN",
  matematica: "MAT",
  natureza: "NAT",
  redacao: "RED",
};

interface NavHeaderProps {
  currentId?: string;
  onNavigate: (path: string) => void;
}

export function NavHeader({ currentId, onNavigate }: NavHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const subjects = dashboardService.getAllSubjects();

  const handleNav = (path: string) => {
    setMenuOpen(false);
    onNavigate(path);
  };

  const isHome = currentId === undefined || currentId === "";

  return (
    <>
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => handleNav("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-primary font-display text-lg">›_</span>
              <div>
                <h1 className="text-base font-bold tracking-wider text-foreground font-display">
                  ENEM_LOG<span className="text-primary ml-1">.</span>
                </h1>
                <p className="text-[9px] text-primary/70 uppercase tracking-[0.3em] font-mono">Analytics System</p>
              </div>
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Debug first */}
              <button
                onClick={() => handleNav("/debug")}
                className={`nav-link-hover flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] uppercase tracking-wider transition-colors rounded font-mono relative ${
                  currentId === "debug"
                    ? "text-destructive bg-destructive/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bug className="w-4 h-4 text-destructive" />
                <span className={currentId === "debug" ? "text-destructive" : "text-destructive/70 group-hover:text-destructive"}>DBG</span>
              </button>

              {subjects.map((s) => (
                <button
                  key={s.config.id}
                  onClick={() => handleNav(`/materia/${s.config.id}`)}
                  className={`nav-link-hover flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] uppercase tracking-wider transition-colors rounded font-mono relative ${
                    s.config.id === currentId
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {subjectIcons[s.config.id]}
                  {shortLabels[s.config.id] || s.config.shortName}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* SAIR button — desktop only */}
            <button
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider border border-primary/40 text-primary hover:bg-primary/10 transition-colors rounded font-mono"
            >
              SAIR
              <LogOut className="w-3.5 h-3.5" />
            </button>

            {/* Hamburger button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col lg:hidden" style={{ backgroundColor: '#030304' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <button onClick={() => handleNav("/")} className="flex items-center gap-2.5">
              <span className="text-primary font-display text-xl">›_</span>
              <div>
                <span className="text-lg font-bold tracking-wider text-foreground font-display">
                  ENEM_<span className="text-primary">LOG</span>
                </span>
                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.25em] font-mono">Analytics System</p>
              </div>
            </button>
            <button onClick={() => setMenuOpen(false)} className="p-2 text-muted-foreground hover:text-foreground border border-border rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col items-center justify-center flex-1 px-5 gap-3">
            {/* Debug first */}
            <button
              onClick={() => handleNav("/debug")}
              className={`flex items-center gap-4 w-full max-w-sm px-5 py-4 text-sm uppercase tracking-widest transition-colors border rounded-md font-mono ${
                currentId === "debug"
                  ? "border-destructive/40 bg-destructive/5 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-destructive/30"
              }`}
            >
              <Bug className="w-5 h-5 text-destructive" />
              <span className="font-semibold text-destructive">DEBUG</span>
              {currentId === "debug" && <span className="ml-auto w-2.5 h-2.5 rounded-sm bg-destructive" />}
            </button>

            <button
              onClick={() => handleNav("/")}
              className={`flex items-center gap-4 w-full max-w-sm px-5 py-4 text-sm uppercase tracking-widest transition-colors border rounded-md font-mono ${
                isHome
                  ? "border-primary/40 bg-primary/5 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="font-semibold">VISÃO GERAL</span>
              {isHome && <span className="ml-auto w-2.5 h-2.5 rounded-sm bg-primary" />}
            </button>

            {subjects.map((s) => (
              <button
                key={s.config.id}
                onClick={() => handleNav(`/materia/${s.config.id}`)}
                className={`flex items-center gap-4 w-full max-w-sm px-5 py-4 text-sm uppercase tracking-widest transition-colors border rounded-md font-mono ${
                  s.config.id === currentId
                    ? "border-primary/40 bg-primary/5 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {subjectIcons[s.config.id]}
                <span className="font-semibold">{shortLabels[s.config.id] || s.config.shortName}</span>
                {s.config.id === currentId && <span className="ml-auto w-2.5 h-2.5 rounded-sm bg-primary" />}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
