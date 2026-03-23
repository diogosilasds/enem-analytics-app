import { useNavigate } from "react-router-dom";
import { subjects, getLatestRegistry, getOverallAverage, getTotalCorrectErrors } from "@/data/subjects";
import { Target, TrendingUp, CheckCircle2, XCircle } from "lucide-react";

const GOAL = 750;

const Index = () => {
  const navigate = useNavigate();
  const average = getOverallAverage();
  const { correct, errors } = getTotalCorrectErrors();
  const progress = Math.min((average / GOAL) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground mb-3">
            ENEM <span className="text-primary">Analytics</span>
          </h1>
          <nav className="flex gap-2 flex-wrap">
            {subjects.map((s) => (
              <button
                key={s.config.id}
                onClick={() => navigate(`/materia/${s.config.id}`)}
                className="px-3 py-1.5 rounded-md text-xs font-mono font-medium bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {s.config.shortName}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Overall Stats */}
        <section className="bg-card border border-border rounded-xl p-6 glow-green">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Média Geral</span>
          </div>
          <div className="flex items-end gap-4 mb-4">
            <span className="text-5xl font-mono font-bold text-foreground">{average}</span>
            <div className="flex gap-4 pb-1">
              <span className="flex items-center gap-1 text-sm text-chart-correct">
                <CheckCircle2 className="w-4 h-4" /> {correct} acertos
              </span>
              <span className="flex items-center gap-1 text-sm text-chart-error">
                <XCircle className="w-4 h-4" /> {errors} erros
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-muted-foreground">
              <span>Progresso para meta</span>
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" /> {GOAL}
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Faltam <span className="text-primary font-semibold">{Math.max(GOAL - average, 0)}</span> pontos
            </p>
          </div>
        </section>

        {/* Subject Cards */}
        <section>
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Matérias</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((s) => {
              const reg = getLatestRegistry(s);
              const score = reg?.score;
              const goal = s.config.id === "redacao" ? 900 : 750;
              const pct = score ? Math.min((score / goal) * 100, 100) : 0;

              return (
                <button
                  key={s.config.id}
                  onClick={() => navigate(`/materia/${s.config.id}`)}
                  className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary/50 hover:glow-green transition-all group"
                >
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                    {s.config.shortName}
                  </p>
                  {score != null ? (
                    <>
                      <p className="text-3xl font-mono font-bold text-foreground group-hover:text-primary transition-colors">
                        {score}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{reg?.examRef}</p>
                      <div className="w-full h-1 bg-secondary rounded-full overflow-hidden mt-3">
                        <div
                          className="h-full bg-primary/60 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-lg font-mono text-muted-foreground mt-2">Sem dados</p>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
