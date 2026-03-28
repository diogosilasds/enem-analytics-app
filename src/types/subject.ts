export interface BreakdownItem {
  level: number;
  total: number;
  correct: number;
  errors: number;
}

export interface QuestionLogItem {
  numero: number;
  dificuldade: string;
  situacao: string;
}

export interface QualitativeData {
  strongPoint: string;
  criticalZone: string;
  errorPattern: string;
  alert: string;
  triAnalysis: string[];
  actionPlan: string[];
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
  qualitative: QualitativeData;
  questionLog?: QuestionLogItem[];
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
