import { useMemo } from "react";
import { dashboardService } from "@/services/dashboardService";

export function useDashboardOverview() {
  const subjects = dashboardService.getAllSubjects();
  const average = dashboardService.getOverallAverage();
  const { correct, errors } = dashboardService.getTotalCorrectErrors();
  const totalQuestions = correct + errors;

  return { subjects, average, correct, errors, totalQuestions };
}

export function useSubjectDetail(id: string) {
  const subject = dashboardService.getSubject(id);
  const reg = subject ? dashboardService.getLatestRegistry(subject) : null;

  const stats = useMemo(() => {
    if (!reg) return null;
    return {
      ...dashboardService.getBreakdownStats(reg),
      efficiency: dashboardService.getSubjectEfficiency(reg),
      breakdownData: dashboardService.getBreakdownChartData(reg),
      radarData: dashboardService.getRadarChartData(reg),
    };
  }, [reg]);

  return { subject, reg, stats };
}
