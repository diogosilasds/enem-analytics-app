import { useNavigate } from "react-router-dom";
import { useDashboardOverview } from "@/hooks/useDashboard";
import { dashboardService } from "@/services/dashboardService";
import { NavHeader } from "@/components/dashboard/NavHeader";
import { Footer } from "@/components/dashboard/Footer";
import { StatBox } from "@/components/dashboard/StatBox";
import { AlertTriangle } from "lucide-react";

const subjectModules: Record<string, string> = {
  humanas: "MOD_01",
  linguagens: "MOD_02",
  matematica: "MOD_03",
  natureza: "MOD_04",
  redacao: "MOD_05",
};

const Index = () => {
  const navigate = useNavigate();
  const { subjects, average, correct, errors, totalQuestions } = useDashboardOverview();

  // Calculate weighted average: each subject's goal contributes to overall target
  const totalGoal = subjects.reduce((sum, s) => sum + s.config.goal, 0);
  const overallTarget = Math.round(totalGoal / subjects.length); // ~780
  const progress = Math.min((average / overallTarget) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      <NavHeader onNavigate={navigate} />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wider text-foreground">
            Central de Inteligência
          </h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Visão geral do sistema</p>
          <div className="h-px bg-gradient-to-r from-primary/40 via-primary/10 to-transparent mt-3" />
        </div>

        {/* Stats panel */}
        <section className="bg-card terminal-border rounded-lg p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 text-[10px] font-bold border border-primary text-primary uppercase tracking-wider">SYS_AVG</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Média Geral vs Meta</span>
              </div>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-5xl sm:text-6xl md:text-7xl font-display font-bold text-foreground tracking-tight">{average}</span>
                <span className="text-xl sm:text-2xl md:text-3xl text-muted-foreground font-display">/ {overallTarget}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                  <span>[OBJ_PROGRESS]</span>
                  <span className="text-primary">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-secondary rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-sm transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-row lg:flex-col gap-3">
              <StatBox label="QUESTÕES" tag="Q_TOT" value={totalQuestions} />
              <StatBox label="ACERTOS" tag="ACK" value={correct} variant="correct" />
              <StatBox label="ERROS" tag="ERR" value={errors} variant="error" />
            </div>
          </div>
        </section>

        <div>
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-foreground">Módulos</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Selecione um módulo para análise detalhada</p>
          <div className="h-px bg-gradient-to-r from-primary/30 to-transparent mt-2" />
        </div>

        {/* Subject Cards + Audit Logs in same grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => {
            const reg = dashboardService.getLatestRegistry(s);
            const score = reg?.score;
            const goal = s.config.goal;
            const pct = score ? Math.min((score / goal) * 100, 100) : 0;

            return (
              <button
                key={s.config.id}
                onClick={() => navigate(`/materia/${s.config.id}`)}
                className="clip-chip bg-card relative overflow-hidden p-5 text-left hover:bg-card/80 transition-all group"
                style={{
                  borderLeft: '2px solid hsl(var(--primary))',
                  borderTop: '1px solid hsl(var(--border))',
                  borderRight: '1px solid hsl(var(--border))',
                  borderBottom: '1px solid hsl(var(--border))',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-primary text-[10px] font-bold tracking-wider">{subjectModules[s.config.id]}</span>
                    <span className="px-1.5 py-0.5 text-[9px] border border-border text-muted-foreground uppercase tracking-wider">ACTV</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[10px] text-primary uppercase tracking-wider">ON</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4 leading-tight">{s.config.title}</h3>

                {score != null ? (
                  <>
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Score</p>
                        <p className="text-4xl sm:text-5xl font-display font-bold text-foreground transition-all tracking-tight">{score}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl sm:text-2xl font-display font-bold text-primary">{pct.toFixed(1)}%</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Efic.</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                        <span>[SYS_LOAD]</span>
                        <span>{pct.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-sm overflow-hidden">
                        <div className="h-full bg-primary rounded-sm transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-lg text-muted-foreground mt-2">NO_DATA</p>
                )}
              </button>
            );
          })}

          {/* Audit Logs Card — inside the grid */}
          <button
            onClick={() => navigate("/debug")}
            className="clip-chip bg-card relative overflow-hidden p-5 text-left hover:bg-card/80 transition-all"
            style={{
              borderLeft: '2px solid hsl(var(--chart-highlight))',
              borderTop: '1px solid hsl(var(--border))',
              borderRight: '1px solid hsl(var(--border))',
              borderBottom: '1px solid hsl(var(--border))',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[9px] font-bold border border-chart-highlight text-chart-highlight uppercase tracking-wider">SYS_DIAG</span>
                <span className="px-1.5 py-0.5 text-[9px] border border-chart-highlight text-chart-highlight uppercase tracking-wider">WARN</span>
              </div>
              <AlertTriangle className="w-4 h-4 text-chart-highlight" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">AUDIT LOGS</h3>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Logs Registrados</p>
                <p className="text-4xl sm:text-5xl font-display font-bold text-chart-highlight">{totalQuestions}</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] border border-destructive text-destructive uppercase tracking-wider">[CRITICAL]</span>
            </div>
            <span className="text-[10px] text-primary uppercase tracking-wider">
              VISUALIZAR MATRIZ →
            </span>
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
