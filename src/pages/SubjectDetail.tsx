import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSubjectDetail } from "@/hooks/useDashboard";
import { NavHeader } from "@/components/dashboard/NavHeader";
import { Footer } from "@/components/dashboard/Footer";
import { ArrowLeft, Calendar, ChevronDown } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  CartesianGrid, ComposedChart, Cell, Line, LineChart,
  ScatterChart, Scatter, ZAxis, ReferenceLine, ReferenceArea,
} from "recharts";

const GREEN = "hsl(170, 45%, 38%)";
const RED = "hsl(340, 70%, 48%)";
const NEUTRAL = "hsl(215, 12%, 42%)";
const YELLOW = "hsl(42, 60%, 50%)";
const CYAN = "hsl(180, 40%, 40%)";
const GRID = "hsl(170,15%,13%)";
const CARD_BG = "hsl(220,16%,7%)";

const tooltipStyle = {
  background: CARD_BG,
  border: `1px solid ${GRID}`,
  borderRadius: 4,
  fontSize: 11,
  fontFamily: "JetBrains Mono",
};

function getStatusColor(rate: number) {
  if (rate >= 80) return "text-chart-correct";
  if (rate >= 50) return "text-chart-highlight";
  return "text-destructive";
}

function getStatusLabel(rate: number) {
  if (rate === 100) return "DOMÍNIO";
  if (rate >= 80) return "ESTÁVEL";
  if (rate >= 50) return "INSTÁVEL";
  return "CRÍTICO";
}

const SubjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subject, reg, stats, registries } = useSubjectDetail(id || "");
  const [selectedRegIdx, setSelectedRegIdx] = useState(registries.length > 0 ? registries.length - 1 : 0);
  const activeReg = registries[selectedRegIdx] || reg;
  if (!subject || !reg || !stats) {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader currentId={id} onNavigate={navigate} />
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground text-lg">NO_DATA: Nenhum registro encontrado</p>
        </div>
      </div>
    );
  }

  const goal = subject.config.goal;
  const { totalCorrect, totalQuestions, hitRate, breakdownData } = stats;
  const totalErrors = totalQuestions - totalCorrect;
  const gap = goal - reg.score;

  const projectionData = (() => {
    const months = ["Jan/26", "Fev/26", "Mar/26", "Abr/26", "Mai/26", "Jun/26", "Jul/26", "Ago/26", "Set/26", "Out/26", "ENEM"];
    const delta = gap > 0 ? gap / 10 : 1;
    return months.map((m, i) => ({
      month: m,
      score: Math.min(Math.round(reg.score + delta * i), 950),
      meta: goal,
    }));
  })();

  const reqDelta = gap > 0 ? (gap / 10).toFixed(1) : "0.0";

  const baseLevels = reg.breakdown.filter(b => b.level <= 500);
  const opLevels = reg.breakdown.filter(b => b.level > 500 && b.level <= 700);
  const advLevels = reg.breakdown.filter(b => b.level > 700);
  const layerRate = (levels: typeof baseLevels) => {
    const t = levels.reduce((a, b) => a + b.total, 0);
    const c = levels.reduce((a, b) => a + b.correct, 0);
    return t > 0 ? Math.round((c / t) * 100) : 0;
  };
  const layerCount = (levels: typeof baseLevels) => levels.reduce((a, b) => a + b.total, 0);
  const baseRate = layerRate(baseLevels);
  const opRate = layerRate(opLevels);
  const advRate = layerRate(advLevels);
  const baseCount = layerCount(baseLevels);
  const opCount = layerCount(opLevels);
  const advCount = layerCount(advLevels);

  const scatterData = reg.breakdown.map(b => ({
    x: b.level,
    y: b.errors,
    z: b.total,
    rate: b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0,
    priority: b.errors > 2 && b.level < 700,
  }));

  const minLevel = Math.min(...reg.breakdown.map(b => b.level));
  const maxLevel = Math.max(...reg.breakdown.map(b => b.level));
  const midLevel = Math.round((minLevel + maxLevel) / 2);
  const maxErrors = Math.max(...reg.breakdown.map(b => b.errors));
  const midErrors = Math.round(maxErrors / 2);

  const paretoData = [...reg.breakdown]
    .filter(b => b.errors > 0)
    .sort((a, b) => b.errors - a.errors)
    .map(b => ({ level: String(b.level), errors: b.errors }));

  const elasticityData = reg.breakdown.map(b => ({
    level: String(b.level),
    taxa: b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0,
  }));

  const radarData = reg.breakdown.map(b => ({
    level: String(b.level),
    taxa: b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0,
    fullMark: 100,
  }));

  const volEffData = reg.breakdown.map(b => ({
    level: String(b.level),
    volume: b.total,
    efficiency: b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0,
  }));

  const rescuePlan = [
    { tier: "Base (400-500)", current: `${baseRate}%`, target: "100%", comment: "Blindar a base. Tolerância zero a erros." },
    { tier: "Operacional (500-700)", current: `${opRate}%`, target: "80%", comment: "Prioridade tática. Aqui se ganha volume." },
    { tier: "Alta Performance (700+)", current: `${advRate}%`, target: "40%", comment: "Refinamento secundário." },
  ];

  const examYear = reg.examRef.match(/\d{4}/)?.[0] || new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <NavHeader currentId={subject.config.id} onNavigate={navigate} />

      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-primary text-base sm:text-lg font-bold">SECTION://{subject.config.id.toUpperCase()}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 ml-8 sm:ml-10">
          <span className="flex items-center gap-1.5 text-[10px] text-primary">
            <span className="w-2 h-2 rounded-full bg-primary" />
            ACCESS://GRANTED
          </span>
          <span className="px-2 py-0.5 text-[10px] border border-border text-muted-foreground uppercase tracking-wider">
            TERMINAL ID: {examYear}
          </span>
          <span className="px-2 py-0.5 text-[10px] border border-primary/30 text-primary uppercase tracking-wider">
            SYNC_RDY
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-2 ml-8 sm:ml-10">
          SUBSYSTEM://TELEMETRY_CORE
        </p>
        <div className="h-px bg-gradient-to-r from-primary/40 via-primary/10 to-transparent mt-3" />
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-8 space-y-6">

        {/* 6 KPI Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiBox tag="NOTA ATUAL" value={String(reg.score)} sub="TRI Estimado" />
          <KpiBox tag="GAP META" value={String(gap)} sub="Pontos p/ alvo" prefix="-" variant={gap > 100 ? "error" : gap > 0 ? "highlight" : "correct"} />
          <KpiBox tag="EFICIÊNCIA" value={`${hitRate}`} sub={`${totalCorrect}/${totalQuestions} Acertos`} suffix="%" />
          <KpiBox tag="VOLUME" value={String(totalQuestions)} sub="Questões Feitas" />
          <KpiBox tag="ERROS" value={String(totalErrors)} sub="Pontos de Atenção" variant="error" />
          <KpiBox tag="RITMO" value={reg.timeSpent} sub="Tempo de Prova" variant="highlight" />
        </section>

        {/* Projection AreaChart */}
        <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">VETOR_DE_PROJEÇÃO</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 text-[10px] text-muted-foreground">
            <span>Linear_Growth_Algorithm_v2</span>
            <span className="text-primary">REQ_DELTA: +{reqDelta} PTS/NODE</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GREEN} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: NEUTRAL, fontFamily: "JetBrains Mono" }} />
              <YAxis domain={[400, 900]} tick={{ fontSize: 9, fill: NEUTRAL }} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={goal} stroke={YELLOW} strokeDasharray="5 5" label={{ value: `TARGET: ${goal}`, fill: YELLOW, fontSize: 10 }} />
              <Area type="monotone" dataKey="score" stroke={GREEN} fill="url(#projGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        {/* Cognitive layers + Maturity table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">REPROCESSAMENTO_COGNITIVO</span>
            </div>
            <div className="space-y-4">
              <CognitiveLayer label="CAMADA_BASE" rate={baseRate} count={baseCount} />
              <CognitiveLayer label="CAMADA_OPERACIONAL" rate={opRate} count={opCount} />
              <CognitiveLayer label="CAMADA_AVANÇADA" rate={advRate} count={advCount} offline={advCount === 0} />
            </div>
          </section>

          <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">MATRIZ_DE_MATURIDADE</span>
              <span className="text-[9px] text-muted-foreground">V4.0_STABLE</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] uppercase tracking-wider">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-2 pr-3">LEVEL_ID</th>
                    <th className="text-left py-2 pr-3">VOL_LOAD</th>
                    <th className="text-left py-2 pr-3">SYNC_EFFICIENCY</th>
                    <th className="text-left py-2">STATUS_MODE</th>
                  </tr>
                </thead>
                <tbody>
                  {reg.breakdown.map(b => {
                    const rate = b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0;
                    return (
                      <tr key={b.level} className="border-b border-border/50">
                        <td className="py-2 pr-3 text-primary">L_{b.level}</td>
                        <td className="py-2 pr-3 text-foreground">{b.total}u</td>
                        <td className="py-2 pr-3">
                          <span className={getStatusColor(rate)}>{rate}%</span>
                        </td>
                        <td className={`py-2 ${getStatusColor(rate)}`}>{getStatusLabel(rate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Scatter Plot */}
        <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">Matriz de Priorização</span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-1">Impacto (Erros) × Esforço (Dificuldade)</p>
          <p className="text-[10px] text-muted-foreground mb-4">Q. Sup. Esquerdo = Prioridade</p>

          <div className="flex flex-wrap gap-3 sm:gap-4 mb-3 text-[9px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Atacar</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-chart-highlight" /> Oportunidade</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground" /> Monitorar</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-chart-correct" /> Refinar</span>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis type="number" dataKey="x" name="Dificuldade" domain={[minLevel - 50, maxLevel + 50]} tick={{ fontSize: 9, fill: NEUTRAL }} label={{ value: "Dificuldade", position: "bottom", fill: NEUTRAL, fontSize: 10 }} />
              <YAxis type="number" dataKey="y" name="Erros" domain={[0, maxErrors + 1]} tick={{ fontSize: 9, fill: NEUTRAL }} label={{ value: "Erros (Impacto)", angle: -90, position: "insideLeft", fill: NEUTRAL, fontSize: 10 }} />
              <ZAxis type="number" dataKey="z" range={[60, 400]} name="Volume" />
              <ReferenceArea x1={minLevel - 50} x2={midLevel} y1={midErrors} y2={maxErrors + 1} fill="hsl(340,70%,48%)" fillOpacity={0.05} />
              <ReferenceArea x1={midLevel} x2={maxLevel + 50} y1={midErrors} y2={maxErrors + 1} fill="hsl(42,60%,50%)" fillOpacity={0.05} />
              <ReferenceArea x1={minLevel - 50} x2={midLevel} y1={0} y2={midErrors} fill="hsl(215,12%,42%)" fillOpacity={0.05} />
              <ReferenceArea x1={midLevel} x2={maxLevel + 50} y1={0} y2={midErrors} fill="hsl(170,45%,38%)" fillOpacity={0.05} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [v, name]} />
              <Scatter data={scatterData}>
                {scatterData.map((entry, i) => (
                  <Cell key={i} fill={entry.priority ? RED : GREEN} fillOpacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-[9px] text-muted-foreground">
            <span>● Prioridade</span>
            <span>● Manutenção</span>
            <span>● Tamanho = Volume</span>
          </div>
        </section>

        {/* Diagnostic + Rescue Plan */}
        <section className="bg-card terminal-border rounded-lg p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">DIAGNÓSTICO_SISTÊMICO</span>
          </div>
          <DiagRow label="PONTO_FORTE" text={reg.qualitative.strongPoint} variant="correct" />
          <DiagRow label="ZONA_CRÍTICA" text={reg.qualitative.criticalZone} variant="error" />
          <DiagRow label="PADRÃO_ERRO" text={reg.qualitative.errorPattern} variant="highlight" />

          <div className="mt-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">PLANO_DE_RESGATE</p>
            <div className="space-y-3">
              {rescuePlan.map((r, i) => (
                <div key={i} className="border-l-2 border-primary/30 pl-3">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-foreground">{r.tier}</span>
                    <span className="text-xs text-primary">{r.current} &gt;&gt; {r.target}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">// {r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pareto + Elasticity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">Pareto de Erros</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">Concentração de falhas por nível</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={paretoData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis type="number" tick={{ fontSize: 9, fill: NEUTRAL }} />
                <YAxis dataKey="level" type="category" tick={{ fontSize: 9, fill: NEUTRAL }} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="errors" name="Erros" fill={RED} fillOpacity={0.8} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {paretoData.length > 0 && (
              <p className="text-[10px] text-muted-foreground mt-2">
                O nível {paretoData[0].level} concentra a maior parte dos erros.
              </p>
            )}
          </section>

          <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">Elasticidade de Dificuldade</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">Sensibilidade à mudança de nível (Δ Taxa)</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={elasticityData}>
                <defs>
                  <linearGradient id="elGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CYAN} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis dataKey="level" tick={{ fontSize: 9, fill: NEUTRAL }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: NEUTRAL }} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="taxa" stroke={CYAN} fill="url(#elGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </section>
        </div>

        {/* Radar + Vol/Efficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">BALANÇO_COMPETÊNCIA</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={GRID} />
                <PolarAngleAxis dataKey="level" tick={{ fontSize: 9, fill: NEUTRAL }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8, fill: NEUTRAL }} />
                <Radar dataKey="taxa" stroke={GREEN} fill={GREEN} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </section>

          <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">ALGO_ABSTRACTION_MATRIX</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">VOL_VS_EFICIÊNCIA</p>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={volEffData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis dataKey="level" tick={{ fontSize: 9, fill: NEUTRAL }} />
                <YAxis yAxisId="left" tick={{ fontSize: 9, fill: NEUTRAL }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 9, fill: NEUTRAL }} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar yAxisId="left" dataKey="volume" name="LOAD_VOL" fill={GREEN} fillOpacity={0.6} radius={[2, 2, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="efficiency" name="SYNC_EFF" stroke={YELLOW} strokeWidth={2} dot={{ r: 3, fill: YELLOW }} />
              </ComposedChart>
            </ResponsiveContainer>
          </section>
        </div>

        {/* Performance Curve */}
        <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">OPERATIONAL_DENSITY_SYNC</span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">Curva de desempenho</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={elasticityData}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis dataKey="level" tick={{ fontSize: 9, fill: NEUTRAL }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: NEUTRAL }} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="taxa" stroke={GREEN} strokeWidth={2} dot={{ r: 3, fill: GREEN }} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* Detailed Table */}
        <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">Matriz detalhada</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border uppercase tracking-wider text-[10px]">
                  <th className="text-left py-2">Nível</th>
                  <th className="text-left py-2">Volume</th>
                  <th className="text-left py-2">✓</th>
                  <th className="text-left py-2">✗</th>
                  <th className="text-left py-2">Taxa</th>
                </tr>
              </thead>
              <tbody>
                {reg.breakdown.map(b => {
                  const rate = b.total > 0 ? ((b.correct / b.total) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={b.level} className="border-b border-border/30">
                      <td className="py-2 text-primary font-bold">{b.level}</td>
                      <td className="py-2 text-foreground">{b.total}</td>
                      <td className="py-2 text-chart-correct">{b.correct}</td>
                      <td className="py-2 text-destructive">{b.errors}</td>
                      <td className={`py-2 ${getStatusColor(Number(rate))}`}>{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

// Sub-components

function KpiBox({ tag, value, sub, prefix, suffix, variant }: {
  tag: string; value: string; sub: string; prefix?: string; suffix?: string;
  variant?: "correct" | "error" | "highlight";
}) {
  const valColor = variant === "correct" ? "text-chart-correct"
    : variant === "error" ? "text-destructive"
    : variant === "highlight" ? "text-chart-highlight"
    : "text-foreground";

  return (
    <div className="bg-card terminal-border rounded-lg p-3 sm:p-4">
      <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{tag}</p>
      <p className={`text-2xl sm:text-3xl font-display font-bold ${valColor} tracking-tight`}>
        {prefix}{value}{suffix}
      </p>
      <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

function CognitiveLayer({ label, rate, count, offline }: {
  label: string; rate: number; count: number; offline?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-[10px] text-muted-foreground">{count} PACKETS</span>
      </div>
      {offline ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">---</span>
          <span className="px-1.5 py-0.5 text-[9px] border border-border text-muted-foreground">OFFLINE</span>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-display font-bold ${getStatusColor(rate)}`}>{rate}%</span>
          <div className="flex-1 h-2 bg-secondary rounded-sm overflow-hidden">
            <div
              className={`h-full rounded-sm transition-all ${rate >= 80 ? "bg-chart-correct" : rate >= 50 ? "bg-chart-highlight" : "bg-destructive"}`}
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DiagRow({ label, text, variant }: { label: string; text: string; variant: "correct" | "error" | "highlight" }) {
  const borderColor = variant === "correct" ? "border-chart-correct" : variant === "error" ? "border-destructive" : "border-chart-highlight";
  const labelColor = variant === "correct" ? "text-chart-correct" : variant === "error" ? "text-destructive" : "text-chart-highlight";

  return (
    <div className={`border-l-2 ${borderColor} pl-3`}>
      <p className={`text-[10px] ${labelColor} uppercase tracking-wider mb-1`}>{label}</p>
      <p className="text-xs text-secondary-foreground">{text}</p>
    </div>
  );
}

export default SubjectDetail;
