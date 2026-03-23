import humanas from "./humanas.json";
import linguagens from "./linguagens.json";
import matematica from "./matematica.json";
import natureza from "./natureza.json";
import redacao from "./redacao.json";

export interface BreakdownItem {
  level: number;
  total: number;
  correct: number;
  errors: number;
}

export interface Registry {
  id: string;
  subjectId: string;
  examRef: string;
  date: string;
  timeSpent: string;
  score: number;
  profile: { age: number; status: string };
  breakdown: BreakdownItem[];
  qualitative: {
    strongPoint: string;
    criticalZone: string;
    errorPattern: string;
    alert: string;
    triAnalysis: string[];
    actionPlan: string[];
  };
  questionLog?: { numero: number; dificuldade: string; situacao: string }[];
}

export interface SubjectConfig {
  id: string;
  title: string;
  shortName: string;
  area: string;
  goal: number;
  weight: number;
  competencies: string[];
}

export interface SubjectData {
  config: SubjectConfig;
  registries: Registry[];
}

export const subjects: SubjectData[] = [
  linguagens as SubjectData,
  humanas as SubjectData,
  natureza as SubjectData,
  matematica as SubjectData,
  redacao as SubjectData,
];

export function getSubject(id: string): SubjectData | undefined {
  return subjects.find((s) => s.config.id === id);
}

export function getLatestRegistry(subject: SubjectData): Registry | null {
  if (subject.registries.length === 0) return null;
  return subject.registries[subject.registries.length - 1];
}

export function getOverallAverage(): number {
  const scored = subjects.filter((s) => s.registries.length > 0);
  if (scored.length === 0) return 0;
  const sum = scored.reduce((acc, s) => acc + getLatestRegistry(s)!.score, 0);
  return Math.round(sum / scored.length);
}

export function getTotalCorrectErrors(): { correct: number; errors: number } {
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
