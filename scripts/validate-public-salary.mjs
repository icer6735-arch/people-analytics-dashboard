import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
// Compile the actual adapter in memory; no duplicated test-only calculations.
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,filename);
const {salaryRows,metadata,getSalaryStructure,getPretaxTrend,getIncomeOverview}=require('../lib/public-salary/adapter.ts');
const {filterSalaryData}=require('../lib/public-salary/filter-salary-data.ts');
const {amountKeys,sumAmount,meanPretax,counts,percentChange,toAverageBreakdown}=require('../lib/public-salary/calculations.ts');
const load=name=>JSON.parse(fs.readFileSync(new URL('../data/public-salary/'+name+'.json',import.meta.url),'utf8'));
const employees=load('employees'),orgs=load('organizations'),roles=load('roles'),places=load('locations');
const ids=new Set();
assert.equal(metadata.is_synthetic,true);
for(const row of salaryRows){
 const key=row.employee_id+'|'+row.period;assert(!ids.has(key));ids.add(key);
 assert(/^SYN-\d{3}$/.test(row.employee_id));assert(metadata.available_periods.includes(row.period));
 assert(orgs.some(o=>o.id===row.org_id));assert(roles.some(o=>o.id===row.role_family_id));assert(places.some(o=>o.id===row.location_id));
 assert(metadata.grade_bands.includes(row.grade_band));assert(metadata.population_groups.some(g=>g.id===row.population_group));
 const employee=employees.find(e=>e.employee_id===row.employee_id);assert(employee);
 for(const field of ['org_id','role_family_id','grade_band','population_group','location_id'])assert.equal(row[field],employee[field]);
 for(const key of [...amountKeys,'pretax_pay'])assert(Number.isSafeInteger(row[key])&&row[key]>=0);
 assert.equal(amountKeys.reduce((s,k)=>s+row[k],0),row.pretax_pay);
}
const f={payrollPeriod:metadata.default_period,company:'',orgPath:[],jobClass:'',positions:[],jobLevel:'',workLocation:''};
const monthly=filterSalaryData(salaryRows,f),ytd=filterSalaryData(salaryRows,f,'year-to-date');
assert.equal(counts(monthly).distinctPeople,monthly.length);assert(counts(ytd).employeeMonths>counts(ytd).distinctPeople);
for(const mode of ['当月','累计']){
 const source=mode==='当月'?monthly:ytd;const result=getSalaryStructure(f,mode);
 assert.equal(result.positionPies.reduce((s,p)=>s+p.total,0),sumAmount(source,'pretax_pay'));
 assert.equal(result.positionPies.reduce((s,p)=>s+p.employeeMonths,0),source.length);
 for(const pie of result.positionPies){assert.equal(pie.subjects.reduce((s,p)=>s+p.amount,0),pie.total);assert(Math.abs(pie.subjects.reduce((s,p)=>s+p.share,0)-100)<1e-8);}
}
for(const role of roles)for(const org of orgs.slice(1)){
 const filters={...f,positions:[role.id],orgPath:['demo-root',org.id]};const selected=filterSalaryData(salaryRows,filters);
 assert(selected.every(r=>r.role_family_id===role.id&&r.org_id===org.id));
 const data=getIncomeOverview(filters);const total=data.current.find(b=>b.key==='selectedPositions|overall|all');
 assert.equal(toAverageBreakdown(total).avgPretax,meanPretax(selected));
 const row=getPretaxTrend(filters).monthlyData[6];assert.equal(row.currentYear,meanPretax(selected));
}
const impossible={...f,orgPath:['missing']};assert.equal(filterSalaryData(salaryRows,impossible).length,0);assert.equal(getSalaryStructure(impossible,'当月').positionPies.length,0);
assert.equal(toAverageBreakdown(getIncomeOverview(impossible).current[0]).avgPretax,null);
assert.equal(percentChange(0,100),-100);assert.equal(percentChange(100,0),null);assert.equal(meanPretax([]),null);
const zero={...monthly[0],kpi_bonus:0};assert.equal(sumAmount([zero],'kpi_bonus'),0);
assert.equal(sumAmount([{...zero,kpi_bonus:null}],'kpi_bonus'),null);
assert.equal(meanPretax([{...zero,pretax_pay:null}]),null);
const weighted=[{...zero,pretax_pay:100},{...zero,pretax_pay:400},{...zero,pretax_pay:400}];assert.equal(meanPretax(weighted),300);
const jan=getPretaxTrend({...f,payrollPeriod:'2026-01'}).monthlyData[0];
assert.equal(jan.mom,percentChange(meanPretax(filterSalaryData(salaryRows,{...f,payrollPeriod:'2026-01'})),meanPretax(filterSalaryData(salaryRows,{...f,payrollPeriod:'2025-12'}))));
assert.equal(getPretaxTrend({...f,payrollPeriod:'2025-01'}).monthlyData[0].lastYear,null);
const ranges=['components/salary','lib/public-salary','app/salary-analysis'];
for(const dir of ranges)for(const name of fs.readdirSync(dir)){const text=fs.readFileSync(dir+'/'+name,'utf8');assert(!/fetch\s*\(|\/api\/|next-auth|postgres|process\.env|salary-fact|salary-detail-service|C[1-7]\b|P[0-4]\b/.test(text),'Forbidden data dependency: '+dir+'/'+name);}
console.log('Validated '+salaryRows.length+' synthetic employee-months; integrity, filters, adapter aggregates, zero/null, weighted means, cross-year trend and data boundary checks passed.');
