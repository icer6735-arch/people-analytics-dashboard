export type BudgetViewMode = "monthly" | "ytd";

export type BudgetPeriodContract = {
  reportMonth: string;
  viewMode: BudgetViewMode;
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  effectiveMonths: string[];
  effectiveDateMonths: string[];
  source: "contract" | "legacy";
  deprecated: boolean;
};

export class BudgetPeriodContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BudgetPeriodContractError";
  }
}

function isValidReportMonth(value: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function toDateMonth(value: string) {
  return `${value}-01`;
}

function monthRangeBetween(startMonth: string, endMonth: string) {
  const start = new Date(`${startMonth}-01T00:00:00Z`);
  const end = new Date(`${endMonth}-01T00:00:00Z`);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end) return [];
  const months: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    months.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months;
}

function monthRange(reportMonth: string) {
  return monthRangeBetween(`${reportMonth.slice(0, 4)}-01`, reportMonth);
}

function periodLabel(reportMonth: string, viewMode: BudgetViewMode) {
  const monthNumber = Number(reportMonth.slice(5, 7));
  return viewMode === "monthly"
    ? `${reportMonth.slice(0, 4)}年${monthNumber}月`
    : `${reportMonth.slice(0, 4)}年1-${monthNumber}月累计`;
}

export function createBudgetPeriod(reportMonth: string, viewMode: BudgetViewMode): BudgetPeriodContract {
  if (!isValidReportMonth(reportMonth)) {
    throw new BudgetPeriodContractError("reportMonth must use YYYY-MM with a month from 01 to 12");
  }
  if (viewMode !== "monthly" && viewMode !== "ytd") {
    throw new BudgetPeriodContractError("viewMode must be monthly or ytd");
  }

  const effectiveMonths = viewMode === "monthly" ? [reportMonth] : monthRange(reportMonth);
  return {
    reportMonth,
    viewMode,
    periodStart: effectiveMonths[0],
    periodEnd: reportMonth,
    periodLabel: periodLabel(reportMonth, viewMode),
    effectiveMonths,
    effectiveDateMonths: effectiveMonths.map(toDateMonth),
    source: "contract",
    deprecated: false,
  };
}

function normalizeLegacyMonth(value: string) {
  const month = value.trim().slice(0, 7);
  return isValidReportMonth(month) ? month : "";
}

function legacyMonths(searchParams: URLSearchParams) {
  const explicitMonths = searchParams
    .getAll("months")
    .flatMap((value) => value.split(","))
    .map(normalizeLegacyMonth)
    .filter(Boolean);
  if (explicitMonths.length) return [...new Set(explicitMonths)].sort();

  const month = normalizeLegacyMonth(searchParams.get("month") || "");
  const trendStart = normalizeLegacyMonth(searchParams.get("trendStartMonth") || "");
  const trendEnd = normalizeLegacyMonth(searchParams.get("trendEndMonth") || "");
  if (trendStart && trendEnd) {
    return monthRangeBetween(trendStart, trendEnd);
  }
  return month ? monthRange(month) : [];
}

export function resolveBudgetPeriod(searchParams: URLSearchParams, fallbackReportMonth: string): BudgetPeriodContract {
  const hasReportMonth = searchParams.has("reportMonth");
  const hasViewMode = searchParams.has("viewMode");
  if (hasReportMonth || hasViewMode) {
    if (!hasReportMonth || !hasViewMode) {
      throw new BudgetPeriodContractError("reportMonth and viewMode must be provided together");
    }
    return createBudgetPeriod(
      searchParams.get("reportMonth") || "",
      searchParams.get("viewMode") as BudgetViewMode,
    );
  }

  const months = legacyMonths(searchParams);
  const fallback = normalizeLegacyMonth(fallbackReportMonth);
  const effectiveMonths = months.length ? months : fallback ? monthRange(fallback) : [];
  if (!effectiveMonths.length) {
    throw new BudgetPeriodContractError("no valid budget month is available");
  }
  const reportMonth = effectiveMonths.at(-1)!;
  const viewMode: BudgetViewMode = effectiveMonths.length === 1 ? "monthly" : "ytd";
  return {
    reportMonth,
    viewMode,
    periodStart: effectiveMonths[0],
    periodEnd: reportMonth,
    periodLabel: periodLabel(reportMonth, viewMode),
    effectiveMonths,
    effectiveDateMonths: effectiveMonths.map(toDateMonth),
    source: "legacy",
    deprecated: true,
  };
}
