import { mkdir, writeFile } from 'node:fs/promises';

const periods = ['2025-10','2025-11','2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08','2026-09'];
const departments = [
  { id: 'BU-A', label: 'Business Unit A', factor: 1.02 },
  { id: 'BU-B', label: 'Business Unit B', factor: 0.96 },
  { id: 'BU-C', label: 'Business Unit C', factor: 1.08 }
];
const roles = [
  { label: 'Operations', base: 6100 },
  { label: 'Business Support', base: 6800 },
  { label: 'Sales', base: 7200 },
  { label: 'Management', base: 10800 }
];
let seed = 6735;
const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const round = value => Math.round(value);
const employees = Array.from({ length: 108 }, (_, index) => {
  const department = departments[index % departments.length];
  const roleIndex = index % 12 === 0 ? 3 : index % 5 === 0 ? 2 : index % 3 === 0 ? 1 : 0;
  return {
    id: 'SYN-' + String(index + 1).padStart(3, '0'),
    department,
    role: roles[roleIndex],
    joinIndex: index >= 100 ? 3 + (index % 5) : 0,
    exitIndex: index < 6 ? 8 + (index % 4) : periods.length,
    individualFactor: 0.88 + random() * 0.24
  };
});

const employeeMonths = [];
for (const employee of employees) {
  periods.forEach((period, periodIndex) => {
    if (periodIndex < employee.joinIndex || periodIndex >= employee.exitIndex) return;
    const seasonal = 1 + Math.sin((periodIndex / 12) * Math.PI * 2) * 0.018;
    const basePay = round(employee.role.base * employee.department.factor * employee.individualFactor * seasonal);
    const levelPay = round(basePay * (0.055 + (Number(employee.id.slice(-2)) % 5) * 0.012));
    const performancePay = round(basePay * (0.035 + random() * 0.045));
    const kpiBonus = employee.role.label === 'Sales' ? round(basePay * (0.05 + random() * 0.08)) : round(basePay * random() * 0.025);
    const otherPay = round(120 + random() * 380);
    const pretaxPay = basePay + levelPay + performancePay + kpiBonus + otherPay;
    const laborCost = round(pretaxPay * (1.23 + random() * 0.06));
    employeeMonths.push({
      period, synthetic_employee_id: employee.id, department_id: employee.department.id,
      department_label: employee.department.label, role_family: employee.role.label,
      base_pay: basePay, level_pay: levelPay, performance_pay: performancePay,
      kpi_bonus: kpiBonus, other_pay: otherPay, pretax_pay: pretaxPay,
      labor_cost: laborCost, budget_labor_cost: null, budget_hc: null, source_kind: 'synthetic'
    });
  });
}

const budgets = [];
for (const period of periods) {
  for (const department of departments) {
    const rows = employeeMonths.filter(row => row.period === period && row.department_id === department.id);
    const actual = rows.reduce((total, row) => total + row.labor_cost, 0);
    let budget = round(actual * (0.96 + random() * 0.13));
    if (period === '2026-02' && department.id === 'BU-C') budget = null;
    if (period === '2026-06' && department.id === 'BU-B') budget = 0;
    budgets.push({
      period, department_id: department.id, department_label: department.label, role_family: null,
      budget_labor_cost: budget, budget_hc: rows.length + Math.round(random() * 4 - 1), source_kind: 'synthetic'
    });
  }
}

const dataset = {
  metadata: { dataset_name: 'Independent Synthetic Compensation Demo', version: '0.2.0', generated_on: '2026-09-29', currency: 'CNY', source_kind: 'synthetic', notice: 'Independently generated synthetic data for a public portfolio demo.' },
  dimensions: { periods, departments: departments.map(({ id, label }) => ({ id, label })), roles: roles.map(role => role.label) },
  employee_months: employeeMonths, budgets
};
await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(new URL('../data/synthetic-data.json', import.meta.url), JSON.stringify(dataset));
console.log('Generated ' + employeeMonths.length + ' employee-month rows and ' + budgets.length + ' budget rows.');
