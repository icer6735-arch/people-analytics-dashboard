import locations from "../../data/public-salary/locations.json";
import organizations from "../../data/public-salary/organizations.json";
import roles from "../../data/public-salary/roles.json";
import { salaryRows } from "../public-salary/adapter";
import type { SalaryRow } from "../public-salary/types";
import type { DetailRow } from "./types";

const roleMap = new Map(roles.map((item) => [item.id, item]));
const locationMap = new Map(locations.map((item) => [item.id, item]));
const organizationMap = new Map(organizations.map((item) => [item.id, item]));

function organizationPath(orgId: string) {
  const labels: string[] = [];
  let current = organizationMap.get(orgId);
  while (current) {
    labels.unshift(current.label);
    current = current.parent_id ? organizationMap.get(current.parent_id) : undefined;
  }
  return labels;
}

function toDetailRow(row: SalaryRow): DetailRow {
  const role = roleMap.get(row.role_family_id);
  const location = locationMap.get(row.location_id);
  const path = organizationPath(row.org_id);
  return {
    ...row,
    role_label: role?.label ?? "未分类岗位组",
    organization_label: path.at(-1) ?? "未分类组织",
    organization_path: path.join(" / "),
    location_label: location?.label ?? "未分类地点",
    row_key: `${row.employee_id}-${row.period}`,
  };
}

/** The detail explorer deliberately reads the frozen public salary facts only. */
export const publicDetailRows: DetailRow[] = salaryRows.map(toDetailRow);

type OrganizationOption = { label: string; value: string; children?: OrganizationOption[] };

export function organizationTree(): OrganizationOption[] {
  const build = (parentId: string | null): OrganizationOption[] =>
    organizations
      .filter((item) => item.parent_id === parentId)
      .map((item) => {
        const children = build(item.id);
        return { label: item.label, value: item.id, ...(children.length ? { children } : {}) };
      });
  return build(null);
}

export const detailPeriods = [...new Set(publicDetailRows.map((row) => row.period))].sort().reverse();
export const detailRoles = roles.map((role) => ({ label: role.label, value: role.id }));
export const detailLocations = locations.map((location) => ({ label: location.label, value: location.id }));
export const detailGrades = [...new Set(publicDetailRows.map((row) => row.grade_band))].sort().map((value) => ({ label: value, value }));
