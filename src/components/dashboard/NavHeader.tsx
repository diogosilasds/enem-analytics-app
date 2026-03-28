import { Globe, BookOpen, Calculator, Microscope, PenTool, Wifi, Clock } from "lucide-react";
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
  const subjects = dashboardService.getAllSubjects();

  return (
    <header className="border-b border-border px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => onNavigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-primary text-lg">›_</span>
            <div>
              <h1 className="text-base font-bold tracking-wider text-foreground">
                ENEM_LOG<span className="text-primary ml-1 animate-pulse-glow">. .</span>
              </h1>
              <p className="text-[10px] text-primary uppercase tracking-[0.3em]">Analytics System</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {subjects.map((s) => (
              <button
                key={s.config.id}
                onClick={() => onNavigate(`/materia/${s.config.id}`)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                  s.config.id === currentId ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                {subjectIcons[s.config.id]}
                {s.config.shortName}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-primary" /> NET: 5G
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {getCurrentTime()}
          </span>
        </div>
      </div>
    </header>
  );
}
