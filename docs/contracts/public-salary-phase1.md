# Public Salary Phase 1

Status: active (public synthetic demonstration only).

Scope: salary structure, pretax trend, income overview; existing public shell and frozen budget unchanged. No source server routes, identity, database or source datasets.

## Data and metrics

- One salary-monthly row per synthetic employee_id + period. Dimension IDs are explicit. No names or real employee identifiers.
- Five non-overlapping money fields sum exactly to pretax_pay. kpi_bonus means generic cash bonus, never a score. Other pay is stored explicitly, not a clipped residual.
- Monthly headcount = distinct employees in the month. Cumulative headcount = distinct employees across January through selected month. Employee-month = one employee in one month. These counts are separately labelled.
- Monthly average = monthly total / monthly headcount. Multi-month mean, if used, = total / employee-month count, never the average of group averages.
- Empty or missing amount is null, not zero. An incomplete structure aggregate raises an error rather than inventing a pie. Fixture amounts are complete nonnegative integers; negative corrections are outside this demo contract.
- Salary views use the public adapter's deterministic synthetic active-period filter for the shared employee-month universe; this is a demo display policy, not an employee turnover model.
- Fixed pay = base + level; variable pay = performance + cash bonus + other. Shares use overall sums. Role-family pay differentiation is a deterministic synthetic display transformation in the public adapter only; it is not a market benchmark or source payroll rule. City coefficients = group monthly mean / category A monthly mean; zero or absent denominators yield null.
- Trend uses all available months of selected year and previous year, retaining all non-period filters. January compares previous December. Missing previous values and zero comparison denominators produce null. Chart click changes local summary/highlight, not global filters.
- Structure month/YTD toggle affects only structure. Clearing role selection means all roles. Organization changes reset role selection. Only explicit dimension IDs filter data; no name inference.

## Synthetic provenance

Independent demonstration grid: four invented role families × three invented cities × five grade bands. 60 synthetic employees, 24 periods. The shared adapter applies a small deterministic join/leave active-period policy and retains 1359 employee-month rows. Numeric fixtures use deterministic modular arithmetic selected solely for display/testing, unrelated to source pay ranges or distributions. Employee dimensions repeat in monthly rows as explicit period attributes, not precomputed aggregate results.

## Exclusions and verification

City KPI calculations, frontline anomalies/rankings, feedback persistence and enterprise formulas excluded. No Phase 2 work. npm run test:data validates both frozen budget data and actual salary adapter; npm run build verifies static export. Scoped salary CSS reproduces source utility styles without adding global Tailwind preflight.
