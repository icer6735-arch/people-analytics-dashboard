import type {SalaryGlobalFilters} from '../../components/salary/global-filter';
import type {SalaryRow} from './types';
import organizations from '../../data/public-salary/organizations.json';
export function organizationIds(path: string[]) {
  const last=path.at(-1);
  if(!last)return new Set(organizations.map(o=>o.id));
  const ids=new Set([last]);
  for(let pass=0;pass<organizations.length;pass++) for(const o of organizations) if(o.parent_id && ids.has(o.parent_id))ids.add(o.id);
  return ids;
}
export function filterSalaryData(rows: SalaryRow[], filters: SalaryGlobalFilters, mode: 'month'|'year-to-date'|'all'='month') {
  const orgs=organizationIds(filters.orgPath);
  // Legacy helper fields have no hidden business interpretation in the public schema.
  if(filters.company || filters.jobClass)return [];
  return rows.filter(r=>orgs.has(r.org_id)
    && (!filters.positions.length || filters.positions.includes(r.role_family_id))
    && (!filters.jobLevel || filters.jobLevel===r.grade_band)
    && (!filters.workLocation || filters.workLocation===r.location_id)
    && (mode==='all' || (mode==='month' ? r.period===filters.payrollPeriod : r.period.slice(0,4)===filters.payrollPeriod.slice(0,4)&&r.period<=filters.payrollPeriod)));
}
