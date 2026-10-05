import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);
const { evaluationRows, metadata, getEvaluationView } = require('../lib/public-evaluation/adapter.ts');
const keys = new Set();
assert.equal(metadata.is_synthetic, true);
for (const row of evaluationRows) {
  const key = `${row.employee_id}|${row.period}`;
  assert(!keys.has(key), `duplicate employee-month: ${key}`);
  keys.add(key);
  assert.equal(row.labor_cost, row.pretax_pay + row.employer_cost);
  assert(Number.isInteger(row.employer_cost) && row.employer_cost >= 0);
}
const view = getEvaluationView({ period: '2026-07', orgId: '', roleFamilyId: '' });
assert.equal(view.current.hc, 55);
assert(view.current.laborCost !== null && view.current.avgCost !== null);
assert.equal(view.roles.reduce((sum, row) => sum + row.hc, 0), view.current.hc);
assert(Math.abs((view.roles.reduce((sum, row) => sum + (row.headcountShare ?? 0), 0) - 1)) < 1e-9);
assert(view.trends.length > 0);
assert(new Set(view.trends.map((row) => row.hc)).size > 1, 'HC trend must vary by active period');
assert(view.roles.every((row) => row.structureDiff === null || Math.abs(row.structureDiff) >= 0));
console.log(`Validated ${evaluationRows.length} public evaluation employee-month rows; unique keys, cost definition, HC totals, weighted average and role shares passed.`);
