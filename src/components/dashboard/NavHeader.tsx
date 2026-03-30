import { useState } from "react";
import { Globe, BookOpen, Calculator, Microscope, PenTool, Wifi, Clock, Menu, X, Bug, LayoutGrid, Settings } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";

const subjectIcons: Record<string, React.ReactNode> = {
  humanas: <Globe className="w-5 h-5" />,
  linguagens: <BookOpen className="w-5 h-5" />,
  matematica: <Calculator className="w-5 h-5" />,
  natureza: <Microscope className="w-5 h-5" />,
  redacao: <PenTool className="w-5 h-5" />,
};

function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

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
                <p className="text-[10px] text-primary/70 uppercase tracking-[0.3em] font-mono">Analytics System</p>
              </div>
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {subjects.map((s) => (
                <button
                  key={s.config.id}
                  onClick={() => handleNav(`/materia/${s.config.id}`)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors rounded font-mono ${
                    s.config.id === currentId
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {subjectIcons[s.config.id]}
                  {s.config.shortName}
                </button>
              ))}
              <button
                onClick={() => handleNav("/debug")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors rounded font-mono ${
                  currentId === "debug"
                    ? "text-destructive bg-destructive/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Bug className="w-4 h-4" />
                DEBUG
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <Wifi className="w-3 h-3 text-primary" /> NET: 5G
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {getCurrentTime()}
              </span>
            </div>

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

      {/* Mobile overlay menu — full screen, opaque, matching screenshot */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col lg:hidden" style={{ backgroundColor: '#030304' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <button onClick={() => handleNav("/")} className="flex items-center gap-2.5">
              <span className="text-primary font-display text-xl">›_</span>
              <div>
                <span className="text-lg font-bold tracking-wider text-foreground font-display italic">
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
          <nav className="flex flex-col px-5 py-6 gap-3 flex-1">
            {/* Visão Geral */}
            <button
              onClick={() => handleNav("/")}
              className={`flex items-center gap-4 w-full px-5 py-4 text-sm uppercase tracking-widest transition-colors border rounded-md font-mono ${
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
                className={`flex items-center gap-4 w-full px-5 py-4 text-sm uppercase tracking-widest transition-colors border rounded-md font-mono ${
                  s.config.id === currentId
                    ? "border-primary/40 bg-primary/5 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {subjectIcons[s.config.id]}
                <span className="font-semibold">{s.config.shortName}</span>
                {s.config.id === currentId && <span className="ml-auto w-2.5 h-2.5 rounded-sm bg-primary" />}
              </button>
            ))}

            <button
              onClick={() => handleNav("/debug")}
              className={`flex items-center gap-4 w-full px-5 py-4 text-sm uppercase tracking-widest transition-colors border rounded-md font-mono ${
                currentId === "debug"
                  ? "border-primary/40 bg-primary/5 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-semibold">DEBUG_MODE</span>
              {currentId === "debug" && <span className="ml-auto w-2.5 h-2.5 rounded-sm bg-primary" />}
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
