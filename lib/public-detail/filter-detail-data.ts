import organizations from "../../data/public-salary/organizations.json";
import type { DetailFilters, DetailRow } from "./types";

function organizationIds(path: string[]) {
  const ids = new Set(path.length ? [path.at(-1)!] : organizations.map((item) => item.id));
  for (let pass = 0; pass < organizations.length; pass += 1) {
    organizations.forEach((item) => {
      if (item.parent_id && ids.has(item.parent_id)) ids.add(item.id);
    });
  }
  return ids;
}

export function filterDetailRows(rows: DetailRow[], filters: DetailFilters) {
  const orgIds = organizationIds(filters.orgPath);
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((row) => {
    const searchable = [row.employee_id, row.organization_path, row.role_label, row.location_label, row.grade_band].join(" ").toLowerCase();
    return orgIds.has(row.org_id)
      && (!filters.period || row.period === filters.period)
      && (!filters.roleFamilyId || row.role_family_id === filters.roleFamilyId)
      && (!filters.gradeBand || row.grade_band === filters.gradeBand)
      && (!filters.locationId || row.location_id === filters.locationId)
      && (!keyword || searchable.includes(keyword));
  });
}
