export type MonthlyManagementScopeMetric = {
  budgetAmount: number | null;
  actualAmount: number | null;
  budgetHc: number | null;
  actualHc: number | null;
};

export type MonthlyManagementMetric = {
  month: string;
  dataStatus: "complete" | "partial" | "missing";
  groupManagement: MonthlyManagementScopeMetric;
  departmentManagement: MonthlyManagementScopeMetric;
  total: MonthlyManagementScopeMetric;
};

export type MonthlyManagementTrendScope = MonthlyManagementScopeMetric & {
  perCapitaBudget: number | null;
  perCapitaActual: number | null;
};

export type MonthlyManagementTrendRow = {
  month: string;
  groupManagement: MonthlyManagementTrendScope;
  departmentManagement: MonthlyManagementTrendScope;
};

export function divideNullable(numerator: number | null, denominator: number | null) {
  if (numerator === null || denominator === null || denominator === 0) return null;
  return Number((numerator / denominator).toFixed(2));
}

export function buildMonthlyTrendContract(rows: MonthlyManagementMetric[]) {
  let cumulativeActual = 0;
  return rows.map((row) => {
    if (row.total.actualAmount !== null) cumulativeActual += row.total.actualAmount;
    return {
      month: row.month,
      budget: row.total.budgetAmount,
      cost: row.total.actualAmount,
      hc: row.total.actualHc,
      cumulative: row.total.actualAmount === null ? null : Number(cumulativeActual.toFixed(2)),
    };
  });
}

export function buildDepartmentPerCapitaTrend(rows: MonthlyManagementMetric[]) {
  return rows.map((row) => ({
    month: row.month,
    perCapitaBudget: divideNullable(
      row.departmentManagement.budgetAmount,
      row.departmentManagement.budgetHc,
    ),
    perCapitaActual: divideNullable(
      row.departmentManagement.actualAmount,
      row.departmentManagement.actualHc,
    ),
  }));
}

function buildManagementTrendScope(metric: MonthlyManagementScopeMetric): MonthlyManagementTrendScope {
  return {
    ...metric,
    perCapitaBudget: divideNullable(metric.budgetAmount, metric.budgetHc),
    perCapitaActual: divideNullable(metric.actualAmount, metric.actualHc),
  };
}

export function buildManagementTrendContract(rows: MonthlyManagementMetric[]): MonthlyManagementTrendRow[] {
  return rows.map((row) => ({
    month: row.month,
    groupManagement: buildManagementTrendScope(row.groupManagement),
    departmentManagement: buildManagementTrendScope(row.departmentManagement),
  }));
}
