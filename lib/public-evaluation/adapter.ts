import { salaryRows } from '../public-salary/adapter';
import metadata from '../../data/public-salary/metadata.json';
import roles from '../../data/public-salary/roles.json';
import organizations from '../../data/public-salary/organizations.json';
import type { EvaluationFilters, EvaluationRow, EvaluationViewModel } from './types';
import { filterEvaluationData, rowsForPeriod } from './filter-evaluation-data';
import { averageCost, buildRoleBreakdown, buildTrend, distinctHc, sumKnown } from './calculations';

// Public definition: labor_cost = pretax_pay + employer_cost.
// The coefficient is an invented deterministic employee-level demo bucket,
// stable across periods for the same employee; it is not a statutory rate,
// company rate, market benchmark, or source-system rule.
function syntheticEmployerCost(employeeId: string, period: string, pretaxPay: number | null) {
  if (pretaxPay === null) return null;
  const id = Number(employeeId.replace(/\D/g, '')) || 0;
  const bucket = (id * 7) % 5;
  const coefficient = 0.08 + bucket * 0.01;
  return Math.round(pretaxPay * coefficient);
}
const evaluationRows: EvaluationRow[] = salaryRows.map((row) => {
  const employer_cost = syntheticEmployerCost(row.employee_id, row.period, row.pretax_pay);
  return { ...row, employer_cost, labor_cost: row.pretax_pay === null || employer_cost === null ? null : row.pretax_pay + employer_cost };
});
export { metadata, organizations, roles, evaluationRows };

export function getEvaluationView(filters: EvaluationFilters): EvaluationViewModel {
  const selectedPeriods = metadata.available_periods.filter((period) => period <= filters.period).slice(-12);
  const filtered = filterEvaluationData(evaluationRows, filters);
  const currentRows = rowsForPeriod(filtered, filters.period);
  const previousPeriod = metadata.available_periods[metadata.available_periods.indexOf(filters.period) - 1];
  const previousRows = previousPeriod ? rowsForPeriod(filtered, previousPeriod) : [];
  const currentCost = sumKnown(currentRows, 'labor_cost');
  const previousCost = sumKnown(previousRows, 'labor_cost');
  const labels = new Map(roles.map((role) => [role.id, role.label]));
  const rolesBreakdown = buildRoleBreakdown(currentRows, labels);
  return {
    periods: selectedPeriods,
    current: { hc: distinctHc(currentRows), laborCost: currentCost, avgCost: averageCost(currentRows), costMom: currentCost === null || previousCost === null || previousCost === 0 ? null : currentCost / previousCost - 1 },
    trends: buildTrend(filtered, selectedPeriods),
    roles: rolesBreakdown,
    detailRows: rolesBreakdown.map((row) => ({ ...row, key: `${filters.period}-${row.roleFamilyId}` })),
  };
}
