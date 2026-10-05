import type { DetailRow, DetailSort, DetailSortKey } from "./types";

export function sortDetailRows(rows: DetailRow[], sort: DetailSort): DetailRow[] {
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const left = a.row[sort.key] as string | number | null;
      const right = b.row[sort.key] as string | number | null;
      const result = typeof left === "number" && typeof right === "number"
        ? (left ?? 0) - (right ?? 0)
        : String(left ?? "").localeCompare(String(right ?? ""), "zh-CN");
      return (result || a.index - b.index) * (sort.direction === "ascend" ? 1 : -1);
    })
    .map(({ row }) => row);
}

export function aggregateDetailRows(rows: DetailRow[]): DetailRow[] {
  const groups = new Map<string, DetailRow>();
  rows.forEach((row) => {
    const existing = groups.get(row.row_key);
    if (!existing) {
      groups.set(row.row_key, { ...row, merged_count: 1 });
      return;
    }
    existing.merged_count = (existing.merged_count ?? 1) + 1;
    (Object.keys(existing) as Array<keyof DetailRow>).forEach((key) => {
      if (["base_pay", "level_pay", "performance_pay", "kpi_bonus", "other_pay", "pretax_pay"].includes(String(key))) {
        const current = existing[key];
        const next = row[key];
        if (typeof current === "number" && typeof next === "number") existing[key] = (current + next) as never;
      }
    });
  });
  return [...groups.values()];
}

export const detailSortLabels: Record<DetailSortKey, string> = {
  employee_id: "员工编号", period: "计薪周期", organization_label: "所属架构", role_label: "岗位组",
  grade_band: "等级", location_label: "地点", base_pay: "基本工资", pretax_pay: "税前合计",
};
