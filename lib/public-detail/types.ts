import type { SalaryRow } from "../public-salary/types";

export type DetailFilters = {
  period: string;
  orgPath: string[];
  roleFamilyId: string;
  gradeBand: string;
  locationId: string;
  keyword: string;
};

export type DetailRow = SalaryRow & {
  role_label: string;
  organization_label: string;
  organization_path: string;
  location_label: string;
  merged_count?: number;
  row_key: string;
};

export type DetailSortKey =
  | "employee_id"
  | "period"
  | "organization_label"
  | "role_label"
  | "grade_band"
  | "location_label"
  | "base_pay"
  | "pretax_pay";

export type DetailSort = { key: DetailSortKey; direction: "ascend" | "descend" };
