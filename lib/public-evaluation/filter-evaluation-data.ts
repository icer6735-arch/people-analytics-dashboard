import type { EvaluationFilters, EvaluationRow } from './types';

export function filterEvaluationData(rows: EvaluationRow[], filters: EvaluationFilters) {
  return rows.filter((row) =>
    row.period <= filters.period &&
    (!filters.orgId || row.org_id === filters.orgId) &&
    (!filters.roleFamilyId || row.role_family_id === filters.roleFamilyId),
  );
}

export function rowsForPeriod(rows: EvaluationRow[], period: string) {
  return rows.filter((row) => row.period === period);
}
