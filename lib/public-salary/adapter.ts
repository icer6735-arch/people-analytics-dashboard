import metadata from '../../data/public-salary/metadata.json';
import sourceRows from '../../data/public-salary/salary-monthly.json';
import roles from '../../data/public-salary/roles.json';
import locations from '../../data/public-salary/locations.json';
import organizations from '../../data/public-salary/organizations.json';
import type {SalaryGlobalFilters} from '../../components/salary/global-filter';
import type {SalaryRow,SalaryStructureAnalysisData,SalaryStructurePie,TreeOption,PretaxTrendResponse} from './types';
import {filterSalaryData} from './filter-salary-data';
import {amountKeys,amountLabels,counts,sumAmount,meanPretax,percentChange,previousPeriod,incomeBucket} from './calculations';
export {metadata, roles, locations};
export const salaryRows:SalaryRow[]=sourceRows;
export function roleLabel(id:string){return roles.find(r=>r.id===id)?.label??'未知岗位';}
export function getSalaryFilterOptions(){
  const tree=(parent:string|null):TreeOption[]=>organizations.filter(o=>o.parent_id===parent).map(o=>({label:o.label,value:o.id,...(organizations.some(child=>child.parent_id===o.id)?{children:tree(o.id)}:{})}));
  return {periods:[...metadata.available_periods].reverse(),organizationTree:tree(null),roles:roles.map(r=>({label:r.label,value:r.id}))};
}
export function getSalaryStructure(filters:SalaryGlobalFilters,mode:'当月'|'累计'):SalaryStructureAnalysisData {
  const rows=filterSalaryData(salaryRows,filters,mode==='当月'?'month':'year-to-date');
  const makePie=(key:string,title:string,items:SalaryRow[]):SalaryStructurePie=>{
    const total=sumAmount(items,'pretax_pay');
    if(total===null||amountKeys.some(k=>sumAmount(items,k)===null))throw new Error('薪资结构包含缺失金额，不能绘制占比');
    return {key,title,positionName:title,hc:counts(items).distinctPeople,employeeMonths:items.length,total,subjects:amountKeys.map(k=>({key:k,name:amountLabels[k],amount:sumAmount(items,k) as number,share:total===0?0:(sumAmount(items,k) as number)/total*100}))};
  };
  const positionPies=roles.map(role=>({role,items:rows.filter(r=>r.role_family_id===role.id)})).filter(x=>x.items.length).map(x=>makePie(x.role.id,x.role.label,x.items));
  return {positions:positionPies.map(p=>p.title),positionPies,pies:positionPies,cumulativePie:rows.length?makePie('all','全部所选岗位',rows):null};
}
export function getPretaxTrend(filters:SalaryGlobalFilters):PretaxTrendResponse{
  const year=Number(filters.payrollPeriod.slice(0,4));
  const rows=filterSalaryData(salaryRows,filters,'all');
  const periodRows=(period:string)=>rows.filter(r=>r.period===period);
  const monthlyData=Array.from({length:12},(_,i)=>{
    const month=String(i+1).padStart(2,'0'),period=year+'-'+month,prior=(year-1)+'-'+month;
    const current=periodRows(period),last=periodRows(prior);
    const currentYear=meanPretax(current),lastYear=meanPretax(last);
    return {month:(i+1)+'月',currentYear,lastYear,currentYearFoundation:meanPretax(current.filter(r=>r.population_group==='foundation')),lastYearFoundation:meanPretax(last.filter(r=>r.population_group==='foundation')),currentYearAdvanced:meanPretax(current.filter(r=>r.population_group==='advanced')),lastYearAdvanced:meanPretax(last.filter(r=>r.population_group==='advanced')),mom:percentChange(currentYear,meanPretax(periodRows(previousPeriod(period)))),yoy:percentChange(currentYear,lastYear)};
  });
  return {currentYear:String(year),lastYear:String(year-1),monthlyData:rows.length?monthlyData:[]};
}
export function getIncomeOverview(filters:SalaryGlobalFilters){
  const buckets=(period:string)=>{
    const rows=filterSalaryData(salaryRows,{...filters,payrollPeriod:period});
    return ['overall',...locations.map(l=>l.city_tier)].flatMap(tier=>['all',...metadata.grade_bands].map(grade=>incomeBucket('selectedPositions|'+tier+'|'+grade,rows.filter(r=>(tier==='overall'||locations.find(l=>l.id===r.location_id)?.city_tier===tier)&&(grade==='all'||r.grade_band===grade)))));
  };
  return {current:buckets(filters.payrollPeriod),previous:buckets(previousPeriod(filters.payrollPeriod))};
}
