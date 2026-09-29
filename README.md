# People Analytics Dashboard

Public recruiting portfolio demo for a Compensation & Labor Cost Analytics Dashboard.

## Project status

V0.2 — Interactive synthetic-data demo

The original internal project completed development validation and entered the demonstration stage. This public version was rebuilt independently from that experience. It does not copy the original repository, Git history, company data, database connections, authentication, permissions, imports, mappings, or enterprise-specific rules.

## Features

- Month and current/cumulative filters
- Fictional department and generic role-family filters
- Labor-cost budget utilization with explicit missing and zero states
- Per-employee-month labor cost and average pretax pay KPIs
- Budget versus actual, average pay trend, and pay-component charts
- Responsive, dependency-free static frontend for GitHub Pages

## Synthetic data

All public records are independently generated synthetic data. The dataset contains 12 continuous months, fictional business units, generic role families, employee-month facts, and department-month budgets. pretax_pay always equals its five displayed components.

Generate and validate with node scripts/generate-synthetic-data.mjs and node scripts/validate-data.mjs.

Run locally with python3 -m http.server 8000, then open http://localhost:8000.

## Contribution statement

After the initial business request was raised, I handled requirement clarification and adjustment, and led metric definition, page design, testing, validation, and iteration. Code implementation was primarily assisted by generative AI tools such as Codex; I was responsible for task decomposition, implementation constraints, result verification, and modification decisions.

## Privacy

No confidential company data, real employee information, original organizational structure, original budget scale, original pay range, internal screenshots, or private APIs are included.
