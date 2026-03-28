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

export interface CompetencyScore {
  id: string;
  name: string;
  description: string;
  score: number;
  max: number;
}

export interface EssayError {
  type: string;
  line: number;
  text: string;
  correction: string;
  competency: string;
}

export interface CorrectorTip {
  competency: string;
  competencyName: string;
  tip: string;
}

export interface Guideline {
  id: string;
  text: string;
  status: string;
}

export interface RescuePlan {
  tier: string;
  range: string;
  current: string;
  target: string;
  comment: string;
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
  // Redação-specific
  theme?: string;
  competencies?: CompetencyScore[];
  essayErrors?: EssayError[];
  transcription?: string[];
  correctorTips?: CorrectorTip[];
  guidelines?: Guideline[];
  rescuePlan?: RescuePlan[];
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
