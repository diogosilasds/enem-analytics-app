import type { SubjectData } from "@/types/subject";
import humanas from "@/data/db/humanas.json";
import linguagens from "@/data/db/linguagens.json";
import matematica from "@/data/db/matematica.json";
import natureza from "@/data/db/natureza.json";
import redacao from "@/data/db/redacao.json";
import {
  getLatestRegistry,
  getOverallAverage,
  getTotalCorrectErrors,
  getSubjectEfficiency,
  getBreakdownStats,
  getBreakdownChartData,
  getRadarChartData,
} from "@/data/logic/subjectProcessor";

const subjects: SubjectData[] = [
  linguagens as SubjectData,
  humanas as SubjectData,
  natureza as SubjectData,
  matematica as SubjectData,
  redacao as SubjectData,
];

export const dashboardService = {
  getAllSubjects: () => subjects,

  getSubject: (id: string) => subjects.find((s) => s.config.id === id),

  getLatestRegistry,
  getOverallAverage: () => getOverallAverage(subjects),
  getTotalCorrectErrors: () => getTotalCorrectErrors(subjects),
  getSubjectEfficiency,
  getBreakdownStats,
  getBreakdownChartData,
  getRadarChartData,
};
