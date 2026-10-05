export type EvaluationFilters = { period: string; orgId: string; roleFamilyId: string };
export type EvaluationRow = {
  period: string;
  employee_id: string;
  org_id: string;
  role_family_id: string;
  employer_cost: number | null;
  labor_cost: number | null;
  pretax_pay: number | null;
};
export type EvaluationTrend = { period: string; hc: number | null; laborCost: number | null; avgCost: number | null };
export type RoleBreakdown = { roleFamilyId: string; label: string; hc: number; laborCost: number | null; headcountShare: number | null; costShare: number | null; avgCost: number | null; structureDiff: number | null };
export type EvaluationViewModel = {
  periods: string[];
  current: { hc: number; laborCost: number | null; avgCost: number | null; costMom: number | null };
  trends: EvaluationTrend[];
  roles: RoleBreakdown[];
  detailRows: Array<RoleBreakdown & { key: string }>;
};
