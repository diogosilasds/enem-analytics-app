import type { SubjectData, Registry } from "@/types/subject";

export function getLatestRegistry(subject: SubjectData): Registry | null {
  if (subject.registries.length === 0) return null;
  return subject.registries[subject.registries.length - 1];
}

export function getOverallAverage(subjects: SubjectData[]): number {
  const scored = subjects.filter((s) => s.registries.length > 0);
  if (scored.length === 0) return 0;
  const sum = scored.reduce((acc, s) => acc + getLatestRegistry(s)!.score, 0);
  return Math.round(sum / scored.length);
}

export function getTotalCorrectErrors(subjects: SubjectData[]): { correct: number; errors: number } {
  let correct = 0;
  let errors = 0;
  for (const s of subjects) {
    const reg = getLatestRegistry(s);
    if (!reg) continue;
    for (const b of reg.breakdown) {
      correct += b.correct;
      errors += b.errors;
    }
  }
  return { correct, errors };
}

export function getSubjectEfficiency(reg: Registry): number {
  const totalC = reg.breakdown.reduce((a, b) => a + b.correct, 0);
  const totalQ = reg.breakdown.reduce((a, b) => a + b.correct + b.errors, 0);
  return totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;
}

export function getBreakdownStats(reg: Registry) {
  const totalCorrect = reg.breakdown.reduce((a, b) => a + b.correct, 0);
  const totalErrors = reg.breakdown.reduce((a, b) => a + b.errors, 0);
  const totalQuestions = totalCorrect + totalErrors;
  const hitRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  return { totalCorrect, totalErrors, totalQuestions, hitRate };
}

export function getBreakdownChartData(reg: Registry) {
  return reg.breakdown.map((b) => ({
    level: `N${b.level}`,
    acertos: b.correct,
    erros: b.errors,
    taxa: b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0,
  }));
}

export function getRadarChartData(reg: Registry) {
  return reg.breakdown.map((b) => ({
    level: `N${b.level}`,
    taxa: b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0,
    fullMark: 100,
  }));
}
