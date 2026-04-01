import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavHeader } from "@/components/dashboard/NavHeader";
import { Footer } from "@/components/dashboard/Footer";
import { dashboardService } from "@/services/dashboardService";
import { ArrowLeft, Calendar } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from "recharts";

const GREEN = "#00ff9f";
const RED = "#ff0055";
const NEUTRAL = "#94a3b8";
const YELLOW = "#f3e600";
const GRID = "rgba(0, 243, 255, 0.07)";
const CARD_BG = "#0a0a0c";

const tooltipStyle = {
  background: CARD_BG,
  border: `1px solid ${GRID}`,
  borderRadius: 4,
  fontSize: 11,
  fontFamily: "JetBrains Mono",
};

const RedacaoDetail = () => {
  const navigate = useNavigate();
  const subject = dashboardService.getSubject("redacao");
  const [selectedRegIdx, setSelectedRegIdx] = useState(0);

  if (!subject || subject.registries.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader currentId="redacao" onNavigate={navigate} />
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground text-lg">NO_DATA</p>
        </div>
      </div>
    );
  }

  const safeIdx = Math.min(selectedRegIdx, subject.registries.length - 1);
  const reg = subject.registries[safeIdx];
  const competencies = reg.competencies || [];
  const totalScore = reg.score;
  const goal = subject.config.goal;

  const radarData = competencies.map(c => ({
    subject: c.id,
    score: c.score,
    fullMark: c.max,
  }));

  const barData = competencies.map(c => ({
    name: c.id,
    score: c.score,
    max: c.max,
    gap: c.max - c.score,
  }));

  const discrepancyData = competencies.map(c => ({
    name: c.id,
    value: c.max - c.score,
  }));

  const essayErrors = reg.essayErrors || [];
  const transcription = reg.transcription || [];
  const correctorTips = reg.correctorTips || [];
  const guidelines = reg.guidelines || [];
  const errorLines = new Set(essayErrors.map(e => e.line));

  const gaugePercent = Math.min((totalScore / 1000) * 100, 100);
  const gaugeColor = totalScore >= goal ? GREEN : totalScore >= goal * 0.8 ? YELLOW : RED;

  return (
    <div className="min-h-screen bg-background">
      <NavHeader currentId="redacao" onNavigate={navigate} />

      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-primary text-base sm:text-lg font-bold">SECTION://REDAÇÃO</span>
          </div>

          {/* Registry selector */}
          <div className="flex items-center gap-2 ml-8 sm:ml-auto">
            {subject.registries.map((r, idx) => {
              const year = r.examRef.match(/\d{4}/)?.[0] || "????";
              const dateFormatted = new Date(r.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" });
              const isActive = idx === safeIdx;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRegIdx(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider border rounded transition-colors ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span className="font-bold">{year}</span>
                  <span className="hidden sm:inline text-[10px] opacity-70">• {dateFormatted}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 ml-8 sm:ml-10">
          <span className="flex items-center gap-1.5 text-[10px] text-primary">
            <span className="w-2 h-2 rounded-full bg-primary" />
            ACCESS://GRANTED
          </span>
          <span className="px-2 py-0.5 text-[10px] border border-border text-muted-foreground uppercase tracking-wider">
            TERMINAL ID: {reg.examRef.match(/\d{4}/)?.[0] || "2026"}
          </span>
          <span className="px-2 py-0.5 text-[10px] border border-primary/30 text-primary uppercase tracking-wider">
            SYNC_RDY
          </span>
        </div>
        <div className="h-px bg-gradient-to-r from-primary/40 via-primary/10 to-transparent mt-3" />
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-8 space-y-6">

        {reg.theme && (
          <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Tema da Proposta</p>
            <p className="text-sm text-foreground italic">"{reg.theme}"</p>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-card terminal-border rounded-lg p-4 sm:p-5 flex flex-col items-center justify-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">Nota Final</p>
            <div className="relative w-40 h-40 sm:w-48 sm:h-48">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="85" fill="none" stroke="hsl(220,16%,12%)" strokeWidth="12" strokeDasharray="401 133" strokeLinecap="round" transform="rotate(135 100 100)" />
                <circle cx="100" cy="100" r="85" fill="none" stroke={gaugeColor} strokeWidth="12" strokeDasharray={`${gaugePercent * 4.01} ${534 - gaugePercent * 4.01}`} strokeLinecap="round" transform="rotate(135 100 100)" opacity={0.9} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl sm:text-5xl font-display font-bold text-foreground">{totalScore}</span>
                <span className="text-[10px] text-muted-foreground">Meta: {goal}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 justify-center">
              {competencies.map(c => (
                <div key={c.id} className={`px-2 py-1 text-[10px] font-bold border rounded ${c.score >= c.max ? "border-chart-correct text-chart-correct" : "border-chart-highlight text-chart-highlight"}`}>
                  {c.id}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">Matriz de Competências</p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={GRID} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: GREEN }} />
                <PolarRadiusAxis angle={90} domain={[0, 200]} tick={{ fontSize: 8, fill: NEUTRAL }} />
                <Radar dataKey="score" stroke={GREEN} fill={GREEN} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </section>
        </div>

        {/* Competency cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {competencies.map(c => {
            const pct = c.max > 0 ? Math.round((c.score / c.max) * 100) : 0;
            return (
              <div key={c.id} className="bg-card terminal-border rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] sm:text-xs font-bold ${c.score >= c.max ? "text-chart-correct" : "text-chart-highlight"}`}>{c.id}: {c.name}</span>
                </div>
                <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">{c.score}</p>
                <div className="w-full h-1.5 bg-secondary rounded-sm overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-sm transition-all ${c.score >= c.max ? "bg-chart-correct" : "bg-chart-highlight"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 leading-tight">{c.description.substring(0, 60)}...</p>
              </div>
            );
          })}
        </section>

        <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Composição Linear do Score</p>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={barData} layout="vertical" stackOffset="expand" barSize={24}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" hide />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine x={goal / 1000} stroke={YELLOW} strokeDasharray="3 3" label={{ value: `META: ${goal}`, fill: YELLOW, fontSize: 9 }} />
              <Bar dataKey="score" stackId="a" fill={GREEN} fillOpacity={0.8} />
              <Bar dataKey="gap" stackId="a" fill="hsl(220,16%,12%)" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2 text-[9px] text-muted-foreground">
            {competencies.map(c => <span key={c.id}>{c.id}</span>)}
          </div>
        </section>

        {/* Discrepancy chart - show all C1-C5 */}
        <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Discrepância de Performance (0-200)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={discrepancyData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: NEUTRAL, fontFamily: "JetBrains Mono" }}
                interval={0}
              />
              <YAxis domain={[0, 200]} tick={{ fontSize: 9, fill: NEUTRAL }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" name="Gap" radius={[4, 4, 0, 0]}>
                {discrepancyData.map((d, i) => (
                  <Cell key={i} fill={d.value > 0 ? RED : GREEN} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2 text-[9px] text-muted-foreground">
            {competencies.map(c => (
              <span key={c.id} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${c.score >= c.max ? "bg-chart-correct" : "bg-destructive"}`} />
                {c.id}: {c.max - c.score}pts
              </span>
            ))}
          </div>
        </section>

        {/* Error Audit */}
        <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">Auditoria de Desvios</span>
            <span className="text-[10px] text-destructive">{essayErrors.length} Ocorrências</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[500px]">
              <thead>
                <tr className="text-muted-foreground border-b border-border text-[10px] uppercase tracking-wider">
                  <th className="text-left py-2">Tipo</th>
                  <th className="text-left py-2">Linha</th>
                  <th className="text-left py-2">Texto</th>
                  <th className="text-left py-2">Correção</th>
                  <th className="text-left py-2">Competência</th>
                </tr>
              </thead>
              <tbody>
                {essayErrors.map((e, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="py-2 text-destructive">{e.type}</td>
                    <td className="py-2 text-muted-foreground">LINHA_{String(e.line).padStart(2, "0")}</td>
                    <td className="py-2 text-foreground">"{e.text}"</td>
                    <td className="py-2 text-chart-correct">{e.correction}</td>
                    <td className="py-2 text-primary">{e.competency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Transcription */}
        <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">Transcrição Digitalizada</span>
            <span className="text-[9px] text-muted-foreground">V.1.0 SCAN</span>
          </div>
          <div className="font-mono text-[10px] sm:text-xs leading-relaxed space-y-0.5 overflow-x-auto">
            {transcription.map((line, i) => {
              const lineNum = i + 1;
              const hasError = errorLines.has(lineNum);
              return (
                <div key={i} className={`flex gap-3 ${hasError ? "bg-destructive/10 border-l-2 border-destructive" : ""} px-2 py-0.5`}>
                  <span className="text-muted-foreground w-6 text-right flex-shrink-0 text-[9px]">{lineNum}</span>
                  <span className={hasError ? "text-foreground" : "text-secondary-foreground"}>{line || "\u00A0"}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Corrector Tips */}
        <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">Dicas do Corretor</span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">Feedback Direto e Específico</p>
          <div className="space-y-3">
            {correctorTips.map((t, i) => (
              <div key={i} className="border-l-2 border-chart-highlight/30 pl-3">
                <p className="text-[10px] text-chart-highlight uppercase tracking-wider mb-1">{t.competency}</p>
                <p className="text-[10px] text-muted-foreground mb-1">{t.competencyName}</p>
                <p className="text-xs text-foreground">Dica do Corretor: {t.tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Guidelines */}
        <section className="bg-card terminal-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 text-[9px] font-bold border border-primary text-primary uppercase tracking-wider">Diretrizes de Correção</span>
          </div>
          <div className="space-y-3">
            {guidelines.map((g) => (
              <div key={g.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/30 pb-2 gap-1">
                <div className="flex items-center gap-3">
                  <span className="text-primary text-xs font-bold">{g.id}</span>
                  <span className="text-xs text-foreground">{g.text}</span>
                </div>
                <span className="px-2 py-0.5 text-[9px] border border-chart-highlight text-chart-highlight uppercase tracking-wider w-fit">{g.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-l-2 border-primary/30 pl-3">
            <p className="text-[10px] text-primary uppercase tracking-wider mb-1">Estrutura de Ouro</p>
            <p className="text-xs text-secondary-foreground">
              Revise o texto com atenção especial à pontuação (vírgulas) e à ortografia de palavras comuns. Cuidado com a separação silábica no final das linhas.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default RedacaoDetail;
