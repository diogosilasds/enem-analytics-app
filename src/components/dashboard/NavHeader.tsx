import { useState } from "react";
import { Globe, BookOpen, Calculator, Microscope, PenTool, Wifi, Clock, Menu, X, Bug } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";

const subjectIcons: Record<string, React.ReactNode> = {
  humanas: <Globe className="w-4 h-4" />,
  linguagens: <BookOpen className="w-4 h-4" />,
  matematica: <Calculator className="w-4 h-4" />,
  natureza: <Microscope className="w-4 h-4" />,
  redacao: <PenTool className="w-4 h-4" />,
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

  return (
    <>
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => handleNav("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-primary text-lg">›_</span>
              <div>
                <h1 className="text-base font-bold tracking-wider text-foreground">
                  ENEM_LOG<span className="text-primary ml-1">.</span>
                </h1>
                <p className="text-[10px] text-primary/70 uppercase tracking-[0.3em]">Analytics System</p>
              </div>
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {subjects.map((s) => (
                <button
                  key={s.config.id}
                  onClick={() => handleNav(`/materia/${s.config.id}`)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors rounded ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors rounded ${
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
            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
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

      {/* Mobile overlay menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-background/98 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button onClick={() => handleNav("/")} className="flex items-center gap-2">
              <span className="text-primary text-lg">›_</span>
              <span className="text-base font-bold tracking-wider text-foreground">ENEM_LOG</span>
            </button>
            <button onClick={() => setMenuOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex flex-col px-4 py-6 gap-1">
            {subjects.map((s) => (
              <button
                key={s.config.id}
                onClick={() => handleNav(`/materia/${s.config.id}`)}
                className={`flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-colors rounded-lg ${
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
              className={`flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-colors rounded-lg ${
                currentId === "debug"
                  ? "text-destructive bg-destructive/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Bug className="w-4 h-4" />
              DEBUG
            </button>
          </nav>
          <div className="px-4 pt-4 border-t border-border mx-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-primary" /> NET: 5G
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {getCurrentTime()}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
