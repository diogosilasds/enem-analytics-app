import { useParams, useNavigate } from "react-router-dom";
import { getSubject, getLatestRegistry } from "@/data/subjects";
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertTriangle, Lightbulb, Target } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  CartesianGrid, ComposedChart, Cell,
} from "recharts";

const GREEN = "hsl(142, 60%, 50%)";
const RED = "hsl(0, 72%, 55%)";
const NEUTRAL = "hsl(215, 15%, 50%)";
const YELLOW = "hsl(45, 93%, 58%)";

const SubjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const subject = getSubject(id || "");

  if (!subject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-mono">Matéria não encontrada</p>
      </div>
    );
  }

  const reg = getLatestRegistry(subject);
  const goal = subject.config.id === "redacao" ? 900 : 750;

  if (!reg) {
    return (
      <div className="min-h-screen bg-background">
        <Header title={subject.config.title} onBack={() => navigate("/")} />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground font-mono text-lg">Nenhum registro encontrado</p>
          <p className="text-sm text-muted-foreground mt-2">Adicione dados de simulado para esta matéria.</p>
        </div>
      </div>
    );
  }

  const totalCorrect = reg.breakdown.reduce((a, b) => a + b.correct, 0);
  const totalErrors = reg.breakdown.reduce((a, b) => a + b.errors, 0);
  const totalQuestions = totalCorrect + totalErrors;
  const hitRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Chart data: breakdown by level
  const breakdownData = reg.breakdown.map((b) => ({
    level: b.level,
    acertos: b.correct,
    erros: b.errors,
    taxa: b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0,
  }));

  // Radar data from breakdown
  const radarData = reg.breakdown.map((b) => ({
    level: `N${b.level}`,
    taxa: b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0,
    fullMark: 100,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header title={subject.config.title} onBack={() => navigate("/")} />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard icon={<Target className="w-4 h-4 text-primary" />} label="Nota" value={String(reg.score)} />
          <KpiCard icon={<Clock className="w-4 h-4 text-chart-highlight" />} label="Tempo" value={reg.timeSpent} />
          <KpiCard icon={<CheckCircle2 className="w-4 h-4 text-chart-correct" />} label="Acertos" value={`${totalCorrect}/${totalQuestions}`} />
          <KpiCard icon={<XCircle className="w-4 h-4 text-chart-error" />} label="Taxa" value={`${hitRate}%`} />
        </div>

        {/* Progress to goal */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex justify-between text-xs font-mono text-muted-foreground mb-1">
            <span>Meta: {goal}</span>
            <span>{reg.score}/{goal}</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.min((reg.score / goal) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Breakdown: Bar + Line */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Análise por Nível TRI</h3>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={breakdownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,18%)" />
                <XAxis dataKey="level" tick={{ fontSize: 11, fill: NEUTRAL }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: NEUTRAL }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: NEUTRAL }} />
                <Tooltip
                  contentStyle={{ background: "hsl(220,14%,11%)", border: "1px solid hsl(220,14%,18%)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: NEUTRAL }}
                />
                <Bar yAxisId="left" dataKey="acertos" name="Acertos" radius={[4, 4, 0, 0]}>
                  {breakdownData.map((_, i) => (
                    <Cell key={i} fill={GREEN} fillOpacity={0.7} />
                  ))}
                </Bar>
                <Bar yAxisId="left" dataKey="erros" name="Erros" radius={[4, 4, 0, 0]}>
                  {breakdownData.map((_, i) => (
                    <Cell key={i} fill={RED} fillOpacity={0.5} />
                  ))}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="taxa" name="Taxa %" stroke={YELLOW} strokeWidth={2} dot={{ r: 3, fill: YELLOW }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Radar */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Radar de Desempenho</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220,14%,18%)" />
                <PolarAngleAxis dataKey="level" tick={{ fontSize: 10, fill: NEUTRAL }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: NEUTRAL }} />
                <Radar name="Taxa %" dataKey="taxa" stroke={GREEN} fill={GREEN} fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Acertos vs Erros bar chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Acertos vs Erros por Nível</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={breakdownData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,18%)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: NEUTRAL }} />
              <YAxis dataKey="level" type="category" tick={{ fontSize: 11, fill: NEUTRAL }} width={45} />
              <Tooltip
                contentStyle={{ background: "hsl(220,14%,11%)", border: "1px solid hsl(220,14%,18%)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="acertos" name="Acertos" stackId="a" fill={GREEN} fillOpacity={0.8} />
              <Bar dataKey="erros" name="Erros" stackId="a" fill={RED} fillOpacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Qualitative Analysis */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Análise Qualitativa</h3>

          <InfoRow icon={<CheckCircle2 className="w-4 h-4 text-chart-correct" />} label="Ponto Forte" text={reg.qualitative.strongPoint} />
          <InfoRow icon={<AlertTriangle className="w-4 h-4 text-chart-highlight" />} label="Zona Crítica" text={reg.qualitative.criticalZone} />
          <InfoRow icon={<XCircle className="w-4 h-4 text-chart-error" />} label="Padrão de Erro" text={reg.qualitative.errorPattern} />
          <InfoRow icon={<AlertTriangle className="w-4 h-4 text-chart-error" />} label="Alerta" text={reg.qualitative.alert} />

          {reg.qualitative.triAnalysis.length > 0 && (
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase mb-1">Análise TRI</p>
              <ul className="space-y-1">
                {reg.qualitative.triAnalysis.map((t, i) => (
                  <li key={i} className="text-sm text-secondary-foreground pl-4 border-l-2 border-primary/30">{t}</li>
                ))}
              </ul>
            </div>
          )}

          {reg.qualitative.actionPlan.length > 0 && (
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase mb-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-chart-highlight" /> Plano de Ação
              </p>
              <ul className="space-y-1">
                {reg.qualitative.actionPlan.map((a, i) => (
                  <li key={i} className="text-sm text-secondary-foreground pl-4 border-l-2 border-chart-highlight/40">{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="border-b border-border px-4 py-4">
      <div className="max-w-5xl mx-auto flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold font-mono text-foreground">{title}</h1>
      </div>
    </header>
  );
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs font-mono text-muted-foreground uppercase">{label}</span>
      </div>
      <p className="text-2xl font-mono font-bold text-foreground">{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  return (
    <div className="flex gap-2">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-mono text-muted-foreground uppercase">{label}</p>
        <p className="text-sm text-secondary-foreground">{text}</p>
      </div>
    </div>
  );
}

export default SubjectDetail;
