import type { BudgetViewMode } from "@/lib/budget-period-contract";

export type BudgetUsageRowScope = "group_management" | "department_management";

export function hasBudgetUsageValues(values: Array<number | null>) {
  return values.some((value) => value !== null);
}

export function getBudgetUsageDisplayCopy(reportMonth: string, viewMode: BudgetViewMode) {
  const [yearText, monthText] = reportMonth.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const monthLabel = Number.isFinite(year) && Number.isFinite(month)
    ? `${year}年${month}月`
    : reportMonth;
  const amountPeriodLabel = viewMode === "monthly" ? `${month}月` : `1—${month}月累计`;
  const headcountPeriodLabel = viewMode === "monthly" ? `${month}月` : `截至${month}月`;

  return {
    monthLabel,
    viewModeLabel: viewMode === "monthly" ? "当月" : "累计（年初至当月）",
    amountPeriodLabel,
    headcountPeriodLabel,
    laborCostTitle: `${amountPeriodLabel}人力成本预算与实际`,
    headcountTitle: `${headcountPeriodLabel}HC预算与实际`,
    averageCostTitle: `${amountPeriodLabel}人均人力成本预算与实际`,
  };
}
