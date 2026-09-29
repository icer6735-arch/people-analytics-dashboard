import { readFile } from 'node:fs/promises';
const data = JSON.parse(await readFile(new URL('../data/synthetic-data.json', import.meta.url), 'utf8'));
const errors = [];
const keys = new Set();
const payFields = ['base_pay','level_pay','performance_pay','kpi_bonus','other_pay'];
for (const row of data.employee_months) {
  const key = row.synthetic_employee_id + '|' + row.period;
  if (keys.has(key)) errors.push('Duplicate employee-period: ' + key);
  keys.add(key);
  if (payFields.reduce((total, field) => total + row[field], 0) !== row.pretax_pay) errors.push('Pay components mismatch: ' + key);
  if (payFields.map(field => row[field]).concat([row.pretax_pay, row.labor_cost]).some(value => value < 0)) errors.push('Negative value: ' + key);
  if (row.source_kind !== 'synthetic') errors.push('Invalid source kind: ' + key);
}
for (const row of data.budgets) {
  if (row.source_kind !== 'synthetic') errors.push('Invalid budget source: ' + row.period + '|' + row.department_id);
  if (row.budget_labor_cost !== null && row.budget_labor_cost < 0) errors.push('Negative budget: ' + row.period + '|' + row.department_id);
}
const periods = [...new Set(data.employee_months.map(row => row.period))].sort();
if (periods.length < 12) errors.push('Fewer than 12 periods.');
for (let index = 1; index < periods.length; index++) {
  const previous = new Date(periods[index - 1] + '-01T00:00:00Z');
  previous.setUTCMonth(previous.getUTCMonth() + 1);
  if (periods[index] !== previous.toISOString().slice(0, 7)) errors.push('Non-continuous periods.');
}
const monthlyHc = periods.map(period => new Set(data.employee_months.filter(row => row.period === period).map(row => row.synthetic_employee_id)).size);
const summary = { employee_month_rows: data.employee_months.length, unique_employee_periods: keys.size, periods: periods.length, unique_employees: new Set(data.employee_months.map(row => row.synthetic_employee_id)).size, budget_rows: data.budgets.length, null_budget_rows: data.budgets.filter(row => row.budget_labor_cost === null).length, zero_budget_rows: data.budgets.filter(row => row.budget_labor_cost === 0).length, monthly_hc_range: [Math.min(...monthlyHc), Math.max(...monthlyHc)], errors };
console.log(JSON.stringify(summary, null, 2));
if (errors.length) process.exitCode = 1;
