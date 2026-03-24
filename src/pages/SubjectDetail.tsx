import { useParams, useNavigate } from "react-router-dom";
import { getSubject, getLatestRegistry, subjects } from "@/data/subjects";
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertTriangle, Lightbulb, Target, Wifi, Globe, BookOpen, Calculator, Microscope, PenTool } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  CartesianGrid, ComposedChart, Cell, Line,
} from "recharts";

const GREEN = "hsl(160, 100%, 50%)";
const RED = "hsl(340, 90%, 55%)";
const NEUTRAL = "hsl(215, 15%, 45%)";
const YELLOW = "hsl(45, 93%, 58%)";

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

const SubjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const subject = getSubject(id || "");

  if (!subject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Matéria não encontrada</p>
      </div>
    );
  }

  const reg = getLatestRegistry(subject);
  const goal = subject.config.id === "redacao" ? 900 : 750;

  if (!reg) {
    return (
      <div className="min-h-screen bg-background scanline">
        <NavHeader currentId={subject.config.id} navigate={navigate} />
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground text-lg">Nenhum registro encontrado</p>
        </div>
      </div>
    );
  }

  const totalCorrect = reg.breakdown.reduce((a, b) => a + b.correct, 0);
  const totalErrors = reg.breakdown.reduce((a, b) => a + b.errors, 0);
  const totalQuestions = totalCorrect + totalErrors;
  const hitRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const breakdownData = reg.breakdown.map((b) => ({
    level: `N${b.level}`,
    acertos: b.correct,
    erros: b.errors,
    taxa: b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0,
  }));

  const radarData = reg.breakdown.map((b) => ({
    level: `N${b.level}`,
    taxa: b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0,
    fullMark: 100,
  }));

  return (
    <div className="min-h-screen bg-background scanline">
      <NavHeader currentId={subject.config.id} navigate={navigate} />

      {/* Section header */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-primary text-lg">›_</span>
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-foreground italic">
            Section://{subject.config.id}
          </h2>
        </div>
        <div className="flex items-center gap-4 ml-10">
          <span className="flex items-center gap-1.5 text-[10px] text-primary">
            <span className="w-2 h-2 rounded-full bg-primary" />
            ACCESS://GRANTED
          </span>
          <span className="px-2 py-0.5 text-[10px] border border-border text-muted-foreground uppercase tracking-wider">
            TERMINAL ID: {new Date().getFullYear()}
          </span>
        </div>
        <div className="h-px bg-gradient-to-r from-primary/60 via-primary/20 to-transparent mt-3" />
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-8 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard tag="SCR" label="Nota" value={String(reg.score)} icon={<Target className="w-4 h-4 text-primary" />} />
          <KpiCard tag="TMR" label="Tempo" value={reg.timeSpent} icon={<Clock className="w-4 h-4 text-chart-highlight" />} variant="highlight" />
          <KpiCard tag="ACK" label="Acertos" value={`${totalCorrect}/${totalQuestions}`} icon={<CheckCircle2 className="w-4 h-4 text-chart-correct" />} variant="correct" />
          <KpiCard tag="EFC" label="Taxa" value={`${hitRate}%`} icon={<XCircle className="w-4 h-4 text-destructive" />} variant="error" />
        </div>

        {/* Progress */}
        <div className="bg-card terminal-border rounded-lg p-4">
          <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            <span>[OBJ_PROGRESS] Meta: {goal}</span>
            <span className="text-primary">{reg.score}/{goal} — {((reg.score / goal) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 bg-secondary rounded-sm overflow-hidden">
            <div
              className="h-full text-primary progress-segmented rounded-sm"
              style={{ width: `${Math.min((reg.score / goal) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card terminal-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">TRI</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Análise por Nível</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={breakdownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(160,30%,15%)" />
                <XAxis dataKey="level" tick={{ fontSize: 10, fill: NEUTRAL, fontFamily: "JetBrains Mono" }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: NEUTRAL }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: NEUTRAL }} />
                <Tooltip
                  contentStyle={{ background: "hsl(220,16%,9%)", border: "1px solid hsl(160,30%,15%)", borderRadius: 4, fontSize: 11, fontFamily: "JetBrains Mono" }}
                />
                <Bar yAxisId="left" dataKey="acertos" name="Acertos" radius={[2, 2, 0, 0]}>
                  {breakdownData.map((_, i) => <Cell key={i} fill={GREEN} fillOpacity={0.7} />)}
                </Bar>
                <Bar yAxisId="left" dataKey="erros" name="Erros" radius={[2, 2, 0, 0]}>
                  {breakdownData.map((_, i) => <Cell key={i} fill={RED} fillOpacity={0.5} />)}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="taxa" name="Taxa %" stroke={YELLOW} strokeWidth={2} dot={{ r: 3, fill: YELLOW }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card terminal-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">RDR</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Radar de Desempenho</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(160,30%,15%)" />
                <PolarAngleAxis dataKey="level" tick={{ fontSize: 10, fill: NEUTRAL, fontFamily: "JetBrains Mono" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: NEUTRAL }} />
                <Radar name="Taxa %" dataKey="taxa" stroke={GREEN} fill={GREEN} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Horizontal bar */}
        <div className="bg-card terminal-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">CMP</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Acertos vs Erros por Nível</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={breakdownData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(160,30%,15%)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: NEUTRAL }} />
              <YAxis dataKey="level" type="category" tick={{ fontSize: 10, fill: NEUTRAL, fontFamily: "JetBrains Mono" }} width={45} />
              <Tooltip contentStyle={{ background: "hsl(220,16%,9%)", border: "1px solid hsl(160,30%,15%)", borderRadius: 4, fontSize: 11 }} />
              <Bar dataKey="acertos" name="Acertos" stackId="a" fill={GREEN} fillOpacity={0.8} />
              <Bar dataKey="erros" name="Erros" stackId="a" fill={RED} fillOpacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Qualitative */}
        <div className="bg-card terminal-border rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">DIAG</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Análise Qualitativa</span>
          </div>

          <InfoRow icon={<CheckCircle2 className="w-4 h-4 text-chart-correct" />} label="Ponto Forte" text={reg.qualitative.strongPoint} />
          <InfoRow icon={<AlertTriangle className="w-4 h-4 text-chart-highlight" />} label="Zona Crítica" text={reg.qualitative.criticalZone} />
          <InfoRow icon={<XCircle className="w-4 h-4 text-destructive" />} label="Padrão de Erro" text={reg.qualitative.errorPattern} />
          <InfoRow icon={<AlertTriangle className="w-4 h-4 text-destructive" />} label="Alerta" text={reg.qualitative.alert} />

          {reg.qualitative.triAnalysis.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">› Análise TRI</p>
              <ul className="space-y-1">
                {reg.qualitative.triAnalysis.map((t, i) => (
                  <li key={i} className="text-xs text-secondary-foreground pl-4 border-l-2 border-primary/30">{t}</li>
                ))}
              </ul>
            </div>
          )}

          {reg.qualitative.actionPlan.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-chart-highlight" /> Plano de Ação
              </p>
              <ul className="space-y-1">
                {reg.qualitative.actionPlan.map((a, i) => (
                  <li key={i} className="text-xs text-secondary-foreground pl-4 border-l-2 border-chart-highlight/40">{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

function NavHeader({ currentId, navigate }: { currentId: string; navigate: (path: string) => void }) {
  return (
    <header className="border-b border-border px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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
                onClick={() => navigate(`/materia/${s.config.id}`)}
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

function KpiCard({ tag, label, value, icon, variant }: { tag: string; label: string; value: string; icon: React.ReactNode; variant?: string }) {
  const tagClass = variant === "correct" ? "text-chart-correct border-chart-correct"
    : variant === "error" ? "text-destructive border-destructive"
    : variant === "highlight" ? "text-chart-highlight border-chart-highlight"
    : "text-primary border-primary";

  return (
    <div className="bg-card terminal-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-1.5 py-0.5 text-[9px] font-bold border ${tagClass} uppercase tracking-wider`}>{tag}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-display font-bold text-foreground tracking-tight">{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
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

export default SubjectDetail;
