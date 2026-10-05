# Current handoff

Salary Phase 1 has passed final human acceptance and is frozen for the local baseline commit. No push is authorized. Salary Phase 2 will not be executed in this project.

Evaluation Phase 1C keeps the Phase 1B layout and adds an independently generated synthetic employer_cost in the public evaluation adapter: labor_cost = pretax_pay + employer_cost. The coefficient is stable per synthetic employee across months and explicitly a demo field, not a statutory rate, company rate, or market benchmark. The shared public salary adapter now applies a documented synthetic active-period filter and stable role-family pay differentiation so salary and evaluation share the same varying employee-month universe. No evaluation API, database, auth, permission, mapping, or source asset was added. Do not start frontline migration in this project without a new explicit scope.

Preserved: accepted budget page, global CSS, public AppShell/SideNav, static export and Pages configuration.

Reused and sanitized: salary page composition, SalaryStructurePositions, SalaryPretaxTrendModule, EmployeeIncomeOverview, chart-colors. global-filter copied as-is; existing month-normalization reused.

New boundary: public-salary adapter → local synthetic JSON only. Public calculation contract: ../contracts/public-salary-phase1.md. Source server routes and data infrastructure excluded.

## Verification (2026-10-02)

- npm run test:data passed: existing budget validation plus 1359 salary employee-months, unique keys, dimension links, component sums, filters, adapter aggregates, zero/null, weighted means, January comparison and forbidden dependency checks.
- npm run build passed; GITHUB_ACTIONS=true npm run build also passed with final code. Salary and budget both exported as static routes.
- git diff --check passed. Frozen budget files, global CSS, shell/navigation, month normalization, lockfile and Next configuration have no diff.
- Chromium via ego-browser, 1600 × 1000: month/org/role filters, clearing, month/YTD structure, pie tooltip, trend click-to-select, 12-row Collapse detail and four-panel city-tier comparison checked.
- Static export served under /people-analytics-dashboard: six chart canvases, no runtime console errors, no failed resource requests and no /api/ requests observed.
- Budget return-navigation check: displayed text and key layout rectangles equal the pre-migration baseline; cumulative switch, three detail tables and KPI group/subject detail expansion passed.
- Known baseline note: budget development preview emits an Ant Design trailColor deprecation warning. Frozen budget code was not changed to address it. This is not a runtime exception.
- Original project remains unchanged by Phase 1; its two pre-existing audit documents were preserved. Public stash unchanged. Next-generated AGENTS.md/CLAUDE.md were removed because they were absent at the clean starting baseline.

## Human acceptance and freeze

Preview route: /people-analytics-dashboard/salary-analysis/ on the local static preview service (port 3101). Final acceptance confirmed the complete sidebar, absence of page-level horizontal scrolling, preserved local position-card scrolling, trend/tooltips and role/city-tier comparisons. Captured screenshots contain public synthetic data only and are kept outside the repository.

Next: complete the authorized local baseline commit, then stop. Do not push or start Salary Phase 2. Mobile layout and exhaustive cross-browser testing were not performed; the original module layout is retained with responsive content-width constraints.

## P0 horizontal overflow correction (2026-10-02)

- Cause: salary page had competing fixed minimum widths (1120px / 1280px); the final 1280px minimum exceeded the space beside the sidebar. The single-column trend Row also added negative 6px horizontal gutter margins.
- Changed only salary.css and the trend Row horizontal gutter in the salary page, plus this handoff. Page, flex children, filters and chart hosts now fit the available content width. Fixed 390px position cards and their local overflow-x:auto strip remain intact. No zoom, scaling, font reduction, chart removal or sidebar-width change.
- Salary calculations, synthetic JSON, public adapter, all salary component files, public AppShell/SideNav, global CSS and frozen budget files match their pre-fix hashes.
- npm run test:data, npm run build, Pages-mode build and git diff --check passed.
- Browser checks at 1440px and native browser width 1470px: document scrollWidth equals clientWidth (1425 / 1455px respectively); attempted document horizontal scroll remains zero; sidebar stays at x=0 with width 220px. Position strip still scrolls 507 / 477px respectively, including wheel input verification.
- Trend and income charts fit their containers. Monthly/cumulative mode and expanded 12-row trend detail produce no document overflow. Salary console has no runtime errors.
- Budget text and key geometry exactly match pre-fix snapshots at both widths after client navigation from salary. Existing budget deprecation warning was not addressed.
- Static preview remains available on port 3101 under /people-analytics-dashboard/salary-analysis/. Human final acceptance is complete; this phase is frozen. Only the local baseline commit is authorized; no push or Salary Phase 2.
