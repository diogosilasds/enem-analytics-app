import { useNavigate } from "react-router-dom";
import { subjects, getLatestRegistry, getOverallAverage, getTotalCorrectErrors } from "@/data/subjects";
import { Globe, BookOpen, Calculator, Microscope, PenTool, Wifi, Clock } from "lucide-react";

const GOAL = 750;

const subjectIcons: Record<string, React.ReactNode> = {
  humanas: <Globe className="w-4 h-4" />,
  linguagens: <BookOpen className="w-4 h-4" />,
  matematica: <Calculator className="w-4 h-4" />,
  natureza: <Microscope className="w-4 h-4" />,
  redacao: <PenTool className="w-4 h-4" />,
};

const subjectModules: Record<string, string> = {
  humanas: "MOD_01",
  linguagens: "MOD_02",
  matematica: "MOD_03",
  natureza: "MOD_04",
  redacao: "MOD_05",
};

function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

const Index = () => {
  const navigate = useNavigate();
  const average = getOverallAverage();
  const { correct, errors } = getTotalCorrectErrors();
  const totalQuestions = correct + errors;
  const progress = Math.min((average / GOAL) * 100, 100);

  return (
    <div className="min-h-screen bg-background scanline">
      {/* Header */}
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-primary text-lg">›_</span>
              <div>
                <h1 className="text-base font-bold tracking-wider text-foreground">
                  ENEM_LOG
                  <span className="text-primary ml-1 animate-pulse-glow">. .</span>
                </h1>
                <p className="text-[10px] text-primary uppercase tracking-[0.3em]">Analytics System</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {subjects.map((s) => (
                <button
                  key={s.config.id}
                  onClick={() => navigate(`/materia/${s.config.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
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

      {/* Mobile nav */}
      <div className="md:hidden border-b border-border px-4 py-2 overflow-x-auto">
        <div className="flex gap-1">
          {subjects.map((s) => (
            <button
              key={s.config.id}
              onClick={() => navigate(`/materia/${s.config.id}`)}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
            >
              {subjectIcons[s.config.id]}
              {s.config.shortName}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Section title */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-foreground italic">
            Central de Inteligência
          </h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Visão geral do sistema</p>
          <div className="h-px bg-gradient-to-r from-primary/60 via-primary/20 to-transparent mt-3" />
        </div>

        {/* Stats panel */}
        <section className="bg-card terminal-border rounded-lg p-6 glow-green">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
            {/* Left: Average + Progress */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 text-[10px] font-bold border border-primary text-primary uppercase tracking-wider">SYS_AVG</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Média Geral vs Meta</span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-6xl md:text-7xl font-display font-bold text-foreground text-glow tracking-tight">
                  {average}
                </span>
                <span className="text-2xl md:text-3xl text-muted-foreground font-display">/ {GOAL}</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                  <span>[OBJ_PROGRESS]</span>
                  <span className="text-primary">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-secondary rounded-sm overflow-hidden">
                  <div
                    className="h-full text-primary progress-segmented rounded-sm transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Stat cards */}
            <div className="flex flex-row lg:flex-col gap-3">
              <StatBox label="QUESTÕES" tag="Q_TOT" value={totalQuestions} />
              <StatBox label="ACERTOS" tag="ACK" value={correct} variant="correct" />
              <StatBox label="ERROS" tag="ERR" value={errors} variant="error" />
            </div>
          </div>
        </section>

        {/* Subject title */}
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-foreground italic">
            Módulos
          </h2>
          <div className="h-px bg-gradient-to-r from-primary/40 to-transparent mt-2" />
        </div>

        {/* Subject Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => {
            const reg = getLatestRegistry(s);
            const score = reg?.score;
            const goal = s.config.id === "redacao" ? 900 : 750;
            const pct = score ? Math.min((score / goal) * 100, 100) : 0;
            const totalC = reg ? reg.breakdown.reduce((a, b) => a + b.correct, 0) : 0;
            const totalQ = reg ? reg.breakdown.reduce((a, b) => a + b.correct + b.errors, 0) : 0;
            const efficiency = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;

            return (
              <button
                key={s.config.id}
                onClick={() => navigate(`/materia/${s.config.id}`)}
                className="bg-card terminal-border rounded-lg p-5 text-left hover:glow-green-strong transition-all group relative overflow-hidden"
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-primary text-[10px] font-bold tracking-wider">
                      {subjectModules[s.config.id]}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] border border-border text-muted-foreground uppercase tracking-wider">
                      ACTV
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                    <span className="text-[10px] text-primary uppercase tracking-wider">ON</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4 leading-tight">
                  {s.config.title}
                </h3>

                {score != null ? (
                  <>
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Score</p>
                        <p className="text-5xl font-display font-bold text-foreground group-hover:text-glow transition-all tracking-tight">
                          {score}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-display font-bold text-primary">{efficiency}%</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Efic.</p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                        <span>[SYS_LOAD]</span>
                        <span>{pct.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-sm transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-lg text-muted-foreground mt-2">Sem dados</p>
                )}
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
};

function StatBox({
  label,
  tag,
  value,
  variant,
}: {
  label: string;
  tag: string;
  value: number;
  variant?: "correct" | "error";
}) {
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

export default Index;
