export type SalaryGlobalFilters = {
  payrollPeriod: string;
  company: string;
  orgPath: string[];
  jobClass: string;
  positions: string[];
  jobLevel: string;
  workLocation: string;
};

export function appendSalaryGlobalFilters(params: URLSearchParams, filters: SalaryGlobalFilters, options: { includePayrollPeriod?: boolean } = {}) {
  if (options.includePayrollPeriod !== false && filters.payrollPeriod) params.set("payrollPeriod", filters.payrollPeriod);
  if (filters.company) params.set("company", filters.company);
  if (filters.orgPath.length) params.set("orgPath", filters.orgPath.join("|"));
  if (filters.jobClass) params.set("jobClass", filters.jobClass);
  if (filters.positions.length) params.set("positions", filters.positions.join(","));
  if (filters.jobLevel) params.set("jobLevel", filters.jobLevel);
  if (filters.workLocation) params.set("workLocation", filters.workLocation);
  return params;
}

export function salaryGlobalFiltersKey(filters: SalaryGlobalFilters) {
  return [
    filters.payrollPeriod,
    filters.company,
    filters.orgPath.join("\u0001"),
    filters.jobClass,
    filters.positions.join("\u0001"),
    filters.jobLevel,
    filters.workLocation,
  ].join("\u0002");
}
