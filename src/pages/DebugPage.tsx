import { useNavigate } from "react-router-dom";
import { NavHeader } from "@/components/dashboard/NavHeader";
import { Footer } from "@/components/dashboard/Footer";
import { dashboardService } from "@/services/dashboardService";
import type { SubjectData, Registry } from "@/types/subject";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, AreaChart, Area, ReferenceLine,
  Treemap,
} from "recharts";

const GREEN = "#00ff9f";
const RED = "#ff0055";
const NEUTRAL = "#94a3b8";
const YELLOW = "#f3e600";
const CYAN = "#00f3ff";
const PINK = "#ff0055";
const GRID = "rgba(0, 243, 255, 0.07)";
const CARD_BG = "#0a0a0c";

const tooltipStyle = {
  background: CARD_BG,
  border: `1px solid ${GRID}`,
  borderRadius: 4,
  fontSize: 11,
  fontFamily: "JetBrains Mono",
};

const SUBJECT_COLORS: Record<string, string> = {
  humanas: GREEN,
  linguagens: CYAN,
  matematica: YELLOW,
  natureza: PINK,
};

function getTreemapColor(level: number): string {
  if (level < 500) return "#ff0055";
  if (level < 650) return "#f3e600";
  if (level < 800) return "#00ff9f";
  return "#00f3ff";
}

const DebugPage = () => {
  const navigate = useNavigate();
  const allSubjects = dashboardService.getAllSubjects().filter(s => s.config.id !== "redacao");
  const redacao = dashboardService.getSubject("redacao");
  const redacaoReg = redacao?.registries[redacao.registries.length - 1];

  const { correct: totalCorrect, errors: totalErrors } = dashboardService.getTotalCorrectErrors();
  const totalFailures = totalErrors;
  const criticalZoneLevels = allSubjects.reduce((count, s) => {
    const reg = dashboardService.getLatestRegistry(s);
    if (!reg) return count;
    return count + reg.breakdown.filter(b => b.level < 650 && b.errors > 0).reduce((a, b) => a + b.errors, 0);
  }, 0);
  const integrity = totalCorrect + totalErrors > 0
    ? ((totalCorrect / (totalCorrect + totalErrors)) * 100).toFixed(1)
    : "0";

  const subjectErrors = allSubjects.map(s => {
    const reg = dashboardService.getLatestRegistry(s);
    const errs = reg ? reg.breakdown.reduce((a, b) => a + b.errors, 0) : 0;
    return { subject: s, errors: errs };
  }).sort((a, b) => b.errors - a.errors);
  const primaryTarget = subjectErrors[0]?.subject.config.title || "N/A";

  const treemapData = allSubjects.map(s => {
    const reg = dashboardService.getLatestRegistry(s);
    if (!reg) return null;
    return {
      name: s.config.shortName,
      children: reg.breakdown.filter(b => b.errors > 0).map(b => ({
        name: `NVL ${b.level}`,
        size: b.errors,
        level: b.level,
      })),
    };
  }).filter(Boolean);

  const radarUrgencyData = allSubjects.map(s => {
    const reg = dashboardService.getLatestRegistry(s);
    const errs = reg ? reg.breakdown.reduce((a, b) => a + b.errors, 0) : 0;
    return { subject: s.config.shortName, errors: errs };
  });

  const distributionData = allSubjects.map(s => {
    const reg = dashboardService.getLatestRegistry(s);
    if (!reg) return { name: s.config.shortName, base: 0, medio: 0, topo: 0 };
    const base = reg.breakdown.filter(b => b.level <= 500).reduce((a, b) => a + b.errors, 0);
    const medio = reg.breakdown.filter(b => b.level > 500 && b.level <= 700).reduce((a, b) => a + b.errors, 0);
    const topo = reg.breakdown.filter(b => b.level > 700).reduce((a, b) => a + b.errors, 0);
    return { name: s.config.shortName, base, medio, topo };
  });

  const allLevels = new Set<number>();
  allSubjects.forEach(s => {
    const reg = dashboardService.getLatestRegistry(s);
    reg?.breakdown.forEach(b => allLevels.add(b.level));
  });
  const sortedLevels = Array.from(allLevels).sort((a, b) => a - b);

  const cciData = sortedLevels.map(level => {
    const point: Record<string, number | string> = { level: String(level) };
    allSubjects.forEach(s => {
      const reg = dashboardService.getLatestRegistry(s);
      const b = reg?.breakdown.find(b => b.level === level);
      point[s.config.shortName] = b && b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0;
    });
    return point;
  });

  const interventionData = allSubjects.map(s => {
    const reg = dashboardService.getLatestRegistry(s);
    if (!reg) return null;
    const worst = [...reg.breakdown].sort((a, b) => {
      const impactA = a.errors * (1000 - a.level) / 100;
      const impactB = b.errors * (1000 - b.level) / 100;
      return impactB - impactA;
    })[0];
    if (!worst || worst.errors === 0) return null;
    const rate = worst.total > 0 ? Math.round((worst.correct / worst.total) * 100) : 0;
    const impact = (worst.errors * (1000 - worst.level) / 100).toFixed(1);
    return {
      subject: s.config.title,
      level: worst.level,
      impact,
      precision: `${rate}%`,
      errors: worst.errors,
      sample: worst.total,
    };
  }).filter(Boolean).sort((a, b) => Number(b!.impact) - Number(a!.impact));

  const rescueLogs = allSubjects.map(s => {
    const reg = dashboardService.getLatestRegistry(s);
    if (!reg) return null;
    const totalErrs = reg.breakdown.reduce((a, b) => a + b.errors, 0);
    const severity = totalErrs > 20 ? "CRÍTICO" : "ALERTA";
    return {
      id: s.config.id,
      subject: s.config.title,
      severity,
      message: reg.qualitative.errorPattern,
      detail: reg.qualitative.alert,
      questionLog: reg.questionLog || [],
      totalItems: (reg.questionLog || []).length,
    };
  }).filter(Boolean);

  const essayErrors = redacaoReg?.essayErrors || [];
  const competencies = redacaoReg?.competencies || [];

  const gapData = competencies.map(c => ({
    name: c.id,
    gap: c.max - c.score,
  }));

  return (
    <div className="min-h-screen bg-background">
      <NavHeader currentId="debug" onNavigate={navigate} />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* Top KPIs */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-card terminal-border rounded-lg p-3 sm:p-4">
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider mb-1">FALHAS TOTAIS</p>
            <p className="text-3xl sm:text-4xl font-display font-bold text-destructive">{totalFailures}</p>
            <p className="text-[9px] text-muted-foreground mt-1">LOG_COUNT</p>
          </div>
          <div className="bg-card terminal-border rounded-lg p-3 sm:p-4">
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider mb-1">ZONA CRÍTICA</p>
            <p className="text-3xl sm:text-4xl font-display font-bold text-chart-highlight">{criticalZoneLevels}</p>
            <p className="text-[9px] text-muted-foreground mt-1">NÍVEIS &lt; 650</p>
          </div>
          <div className="bg-card terminal-border rounded-lg p-3 sm:p-4">
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider mb-1">INTEGRIDADE</p>
            <p className="text-3xl sm:text-4xl font-display font-bold text-foreground">{integrity}%</p>
            <p className="text-[9px] text-muted-foreground mt-1">SYS_STATUS</p>
          </div>
          <div className="bg-card terminal-border rounded-lg p-3 sm:p-4">
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider mb-1">ALVO PRIMÁRIO</p>
            <p className="text-sm sm:text-lg font-display font-bold text-destructive">{primaryTarget}</p>
            <p className="text-[9px] text-muted-foreground mt-1">ALPHA_TARGET</p>
          </div>
        </section>

        {/* Treemap */}
        <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">MAPA_DE_INTEGRIDADE</span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">Visualização de densidade de erro (Treemap Analysis)</p>
          <ResponsiveContainer width="100%" height={280}>
            <Treemap
              data={treemapData as any}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="hsl(220,16%,4%)"
              content={<CustomTreemapContent />}
            />
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 text-[9px] text-muted-foreground">
            <span>MAPA DE CALOR:</span>
            <span className="text-destructive">● CRÍTICO (&lt;500)</span>
            <span className="text-chart-highlight">● ALERTA (&lt;650)</span>
            <span className="text-chart-correct">● ESTÁVEL (&lt;800)</span>
            <span className="text-primary">● SEGURO (&gt;800)</span>
          </div>
        </section>

        {/* Radar + Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">RADAR_DE_URGÊNCIA</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarUrgencyData}>
                <PolarGrid stroke={GRID} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: NEUTRAL }} />
                <PolarRadiusAxis tick={{ fontSize: 8, fill: NEUTRAL }} />
                <Radar dataKey="errors" stroke={RED} fill={RED} fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </section>

          <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">DISTRIBUIÇÃO_DE_CARGA</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: NEUTRAL }} />
                <YAxis tick={{ fontSize: 9, fill: NEUTRAL }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="base" name="BASE" stackId="a" fill={RED} fillOpacity={0.7} />
                <Bar dataKey="medio" name="MÉDIO" stackId="a" fill={YELLOW} fillOpacity={0.7} />
                <Bar dataKey="topo" name="TOPO" stackId="a" fill={GREEN} fillOpacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </div>

        {/* CCI Curves */}
        <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">CCI_PERFORMANCE_CURVES</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={cciData}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis dataKey="level" tick={{ fontSize: 9, fill: NEUTRAL }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: NEUTRAL }} />
              <Tooltip contentStyle={tooltipStyle} />
              {allSubjects.map(s => (
                <Line
                  key={s.config.id}
                  type="monotone"
                  dataKey={s.config.shortName}
                  stroke={SUBJECT_COLORS[s.config.id]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-2 text-[9px]">
            {allSubjects.map(s => (
              <span key={s.config.id} className="flex items-center gap-1">
                <span className="w-3 h-0.5 inline-block" style={{ background: SUBJECT_COLORS[s.config.id] }} />
                {s.config.shortName}
              </span>
            ))}
          </div>
        </section>

        {/* Essay Audit */}
        {redacaoReg && (
          <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">AUDITORIA: PRODUÇÃO TEXTUAL</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">Análise de falhas estruturais e gramaticais</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground mb-2">GAP por Competência (Alvo: 200)</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={gapData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: NEUTRAL }} />
                    <YAxis domain={[0, 200]} tick={{ fontSize: 9, fill: NEUTRAL }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="gap" fill={RED} fillOpacity={0.7} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground mb-2">Matriz de Desvios</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">TOTAL DE OCORRÊNCIAS</span>
                    <span className="text-destructive font-bold">{essayErrors.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Gramática</span>
                    <span className="text-foreground">{essayErrors.filter(e => e.type === "GRAMÁTICA").length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">COMPETÊNCIA CRÍTICA</span>
                    <span className="text-chart-highlight">C1 (Norma Culta)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Intervention Matrix */}
        <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">MATRIZ_DE_INTERVENÇÃO</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {interventionData.map((item, i) => (
              <div key={i} className="bg-secondary/30 terminal-border rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-primary uppercase tracking-wider">PRIORIDADE #{i + 1}</span>
                </div>
                <p className="text-sm font-bold text-foreground mb-2">{item!.subject}</p>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NÍVEL</span>
                    <span className="text-destructive">{item!.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fator de Impacto</span>
                    <span className="text-foreground">{item!.impact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precisão Local</span>
                    <span className="text-chart-highlight">{item!.precision}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 text-[9px]">
                  <span className="px-1.5 py-0.5 border border-destructive text-destructive">ERROS: {item!.errors}</span>
                  <span className="px-1.5 py-0.5 border border-border text-muted-foreground">AMOSTRA: {item!.sample}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recovery Logs */}
        <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">LOGS_DE_RESGATE</span>
          </div>
          <div className="space-y-4">
            {rescueLogs.map((log, i) => (
              <div key={i} className="border-l-2 border-destructive/40 pl-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                  <span className="text-[10px] text-muted-foreground">LOG_ID: {String(i + 1).padStart(3, "0")}</span>
                  <span className="text-xs font-bold text-foreground">{log!.subject}</span>
                  <span className={`px-1.5 py-0.5 text-[9px] border ${log!.severity === "CRÍTICO" ? "border-destructive text-destructive" : "border-chart-highlight text-chart-highlight"}`}>
                    [{log!.severity}]
                  </span>
                </div>
                <p className="text-xs text-secondary-foreground mb-1">{log!.message}</p>
                <p className="text-[10px] text-muted-foreground">{log!.detail}</p>
                <button
                  onClick={() => navigate(`/materia/${log!.id}`)}
                  className="text-[10px] text-primary hover:text-foreground transition-colors mt-1"
                >
                  Acessar →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Black Box Recovery */}
        <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">BLACK_BOX_RECOVERY: DETALHAMENTO</span>
          </div>
          <div className="space-y-6">
            {rescueLogs.filter(l => l!.questionLog.length > 0).map((log) => (
              <div key={log!.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{log!.subject}</span>
                    <span className="text-[9px] text-muted-foreground">LOG_ID: {log!.id.toUpperCase()}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Total: {log!.totalItems} Itens</span>
                </div>
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full text-xs min-w-[400px]">
                    <thead className="sticky top-0 bg-card">
                      <tr className="text-muted-foreground border-b border-border text-[10px] uppercase tracking-wider">
                        <th className="text-left py-2">QUESTÃO</th>
                        <th className="text-left py-2">DIFICULDADE (TRI)</th>
                        <th className="text-left py-2">RESULTADO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {log!.questionLog.map((q, qi) => (
                        <tr key={qi} className="border-b border-border/20">
                          <td className="py-1.5 text-muted-foreground">#{q.numero}</td>
                          <td className="py-1.5">
                            <span className={`px-1.5 py-0.5 text-[9px] border rounded ${
                              q.dificuldade === "Anulada" ? "border-border text-muted-foreground"
                              : Number(q.dificuldade) >= 800 ? "border-destructive text-destructive"
                              : Number(q.dificuldade) >= 600 ? "border-chart-highlight text-chart-highlight"
                              : "border-chart-correct text-chart-correct"
                            }`}>
                              {q.dificuldade}
                            </span>
                          </td>
                          <td className={`py-1.5 font-bold uppercase ${
                            q.situacao === "acerto" ? "text-chart-correct"
                            : q.situacao === "erro" ? "text-destructive"
                            : "text-muted-foreground"
                          }`}>
                            {q.situacao === "acerto" ? "ACERTO" : q.situacao === "erro" ? "ERRO" : "ANULADA"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

function CustomTreemapContent(props: any) {
  const { x, y, width, height, name, depth, level } = props;
  if (width < 20 || height < 20) return null;
  const fill = depth === 1 ? "hsl(220,16%,12%)" : getTreemapColor(level || 500);

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="hsl(220,16%,4%)" strokeWidth={2} />
      {width > 40 && height > 20 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle" fill="hsl(160,20%,85%)" fontSize={Math.min(10, width / 6)} fontFamily="JetBrains Mono">
          {name}
        </text>
      )}
    </g>
  );
}

export default DebugPage;
