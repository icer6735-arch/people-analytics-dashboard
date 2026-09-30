# People Analytics Dashboard

Public portfolio project built as a static-exported Next.js application.

## V0.3 Budget Faithful Sanitized Migration

The completed page in this version is **预算进度**. Its layout and interaction model are migrated from an authorized internal UI reference, while every enterprise data dependency has been replaced with a public adapter backed by independently generated synthetic JSON.

- No authentication or permission chain
- No API routes or server database
- No employee, organization, payroll, budget, or KPI records from the source system
- No workbook, CSV, screenshot, environment file, or source Git history
- Static export suitable for GitHub Pages

Other navigation entries are explicitly marked as pending sanitized migration. The Project Overview page is intentionally not a copy of the source system overview.

## Commands

```bash
npm install
npm run test:data
npm run build
```

The exported site is generated in `out/`.
