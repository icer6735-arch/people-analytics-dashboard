import type { EvaluationRow, EvaluationTrend, RoleBreakdown } from './types';

export function distinctHc(rows: EvaluationRow[]) { return new Set(rows.map((row) => row.employee_id)).size; }
export function sumKnown(rows: EvaluationRow[], key: 'employer_cost' | 'labor_cost' | 'pretax_pay'): number | null {
  if (rows.some((row) => row[key] === null || !Number.isFinite(row[key] as number))) return null;
  return rows.reduce((sum, row) => sum + (row[key] as number), 0);
}
export function averageCost(rows: EvaluationRow[]) {
  const total = sumKnown(rows, 'labor_cost');
  const hc = distinctHc(rows);
  return total === null || hc === 0 ? null : total / hc;
}
export function buildTrend(rows: EvaluationRow[], periods: string[]): EvaluationTrend[] {
  return periods.map((period) => {
    const current = rows.filter((row) => row.period === period);
    const hc = distinctHc(current);
    const laborCost = sumKnown(current, 'labor_cost');
    return { period, hc: current.length ? hc : null, laborCost, avgCost: laborCost === null || hc === 0 ? null : laborCost / hc };
  });
}
export function buildRoleBreakdown(rows: EvaluationRow[], labels: Map<string, string>): RoleBreakdown[] {
  const totalHc = distinctHc(rows);
  const totalCost = sumKnown(rows, 'labor_cost');
  const ids = [...new Set(rows.map((row) => row.role_family_id))];
  return ids.map((roleFamilyId) => {
    const group = rows.filter((row) => row.role_family_id === roleFamilyId);
    const hc = distinctHc(group);
    const laborCost = sumKnown(group, 'labor_cost');
    const headcountShare = totalHc ? hc / totalHc : null;
    const costShare = totalCost === null || laborCost === null || totalCost === 0 ? null : laborCost / totalCost;
    return { roleFamilyId, label: labels.get(roleFamilyId) ?? '未分类岗位组', hc, laborCost, headcountShare, costShare, avgCost: laborCost === null || hc === 0 ? null : laborCost / hc, structureDiff: costShare === null || headcountShare === null ? null : costShare - headcountShare };
  }).sort((a, b) => (b.laborCost ?? -1) - (a.laborCost ?? -1));
}
