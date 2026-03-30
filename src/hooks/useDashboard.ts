import { useMemo, useState } from "react";
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
  const [registryIndex, setRegistryIndex] = useState(0);

  const registries = subject?.registries || [];
  // Default to latest (last) registry
  const activeIndex = registries.length > 0
    ? Math.min(registryIndex, registries.length - 1)
    : 0;
  const reg = registries.length > 0 ? registries[registries.length - 1 - activeIndex] || registries[registries.length - 1] : null;

  const stats = useMemo(() => {
    if (!reg) return null;
    return {
      ...dashboardService.getBreakdownStats(reg),
      efficiency: dashboardService.getSubjectEfficiency(reg),
      breakdownData: dashboardService.getBreakdownChartData(reg),
      radarData: dashboardService.getRadarChartData(reg),
    };
  }, [reg]);

  return { subject, reg, stats, registries, registryIndex: activeIndex, setRegistryIndex };
}
