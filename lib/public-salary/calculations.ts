import type {SalaryRow, AmountKey, IncomeBucket, AvgBreakdown} from './types';
export const amountKeys: AmountKey[]=['base_pay','level_pay','performance_pay','kpi_bonus','other_pay'];
export const amountLabels: Record<AmountKey,string>={base_pay:'基本工资',level_pay:'职级工资',performance_pay:'绩效薪资',kpi_bonus:'通用奖金',other_pay:'其他薪资'};
// Unknown is not zero: an incomplete amount stays unknown throughout its aggregate.
export function sumAmount(rows: SalaryRow[], key: AmountKey|'pretax_pay'): number|null {
  if(rows.some(r=>r[key]===null))return null;
  return rows.reduce((sum,r)=>sum+(r[key] as number),0);
}
export function counts(rows: SalaryRow[]) {return {distinctPeople:new Set(rows.map(r=>r.employee_id)).size,employeeMonths:rows.length};}
export function meanPretax(rows: SalaryRow[]): number|null {const sum=sumAmount(rows,'pretax_pay');return rows.length&&sum!==null?sum/rows.length:null;}
export function percentChange(current:number|null,previous:number|null):number|null {return current===null||previous===null||previous===0?null:(current-previous)/previous*100;}
export function previousPeriod(period:string) {const [y,m]=period.split('-').map(Number);return m===1?(y-1)+'-12':y+'-'+String(m-1).padStart(2,'0');}
export function incomeBucket(key:string,rows:SalaryRow[]):IncomeBucket {
  return {key,headcount:counts(rows).distinctPeople,employeeMonths:rows.length,preTaxTotal:sumAmount(rows,'pretax_pay'),baseSalary:sumAmount(rows,'base_pay'),levelSalary:sumAmount(rows,'level_pay'),performanceSalary:sumAmount(rows,'performance_pay'),bonusSalary:sumAmount(rows,'kpi_bonus'),other:sumAmount(rows,'other_pay')};
}
export function toAverageBreakdown(bucket:IncomeBucket|undefined):AvgBreakdown {
  const divide=(amount:number|null|undefined)=>!bucket?.employeeMonths||amount==null?null:amount/bucket.employeeMonths;
  return {headcount:bucket?.headcount??0,avgPretax:divide(bucket?.preTaxTotal),baseSalary:divide(bucket?.baseSalary),levelSalary:divide(bucket?.levelSalary),performanceSalary:divide(bucket?.performanceSalary),bonusSalary:divide(bucket?.bonusSalary),other:divide(bucket?.other)};
}
export function overviewMetrics(overall:AvgBreakdown,previous:AvgBreakdown,second:AvgBreakdown,third:AvgBreakdown,first:AvgBreakdown){
  const fixed=overall.baseSalary===null||overall.levelSalary===null?null:overall.baseSalary+overall.levelSalary;
  const fixedShare=fixed===null||!overall.avgPretax?null:fixed/overall.avgPretax*100;
  const ratio=(a:number|null,b:number|null)=>a===null||b===null||b===0?null:a/b;
  return {monthOverMonth:percentChange(overall.avgPretax,previous.avgPretax),fixedShare,floatingShare:fixedShare===null?null:100-fixedShare,tier2Coefficient:ratio(second.avgPretax,first.avgPretax),tier3Coefficient:ratio(third.avgPretax,first.avgPretax)};
}
