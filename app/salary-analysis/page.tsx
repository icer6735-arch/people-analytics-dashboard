"use client";
import {useMemo,useState} from 'react';
import {Cascader,Col,Row,Segmented,Select} from 'antd';
import SalaryStructurePositions from '@/components/salary/SalaryStructurePositions';
import SalaryPretaxTrendModule from '@/components/salary/SalaryPretaxTrendModule';
import EmployeeIncomeOverview from '@/components/salary/EmployeeIncomeOverview';
import type {SalaryGlobalFilters} from '@/components/salary/global-filter';
import {salaryGlobalFiltersKey} from '@/components/salary/global-filter';
import {getSalaryFilterOptions,getSalaryStructure,metadata} from '@/lib/public-salary/adapter';
import {normalizePayrollPeriod} from '@/lib/month-normalization';
import './salary.css';
export default function SalaryAnalysisPage(){
  const [filters,setFilters]=useState<SalaryGlobalFilters>({payrollPeriod:metadata.default_period,company:'',orgPath:[],jobClass:'',positions:[],jobLevel:'',workLocation:''});
  const [viewType,setViewType]=useState<'当月'|'累计'>('当月');
  const options=useMemo(()=>getSalaryFilterOptions(),[]);
  const structure=useMemo(()=>getSalaryStructure(filters,viewType),[filters,viewType]);
  return <div className="salary-analysis-page page-shell page-shell--wide">
    <div className="salary-filter-header">
      <div><h1>薪资分析</h1><p>顶部筛选器联动薪资分析各模块 · 完全虚构数据</p></div>
      <div className="salary-filter-controls">
        <label><span>统计月份</span><Select aria-label="统计月份" style={{width:180}} value={filters.payrollPeriod} options={options.periods.map(value=>({value,label:value}))} onChange={value=>setFilters(f=>({...f,payrollPeriod:normalizePayrollPeriod(value)}))}/></label>
        <label className="salary-org-filter"><span>组织架构</span><Cascader aria-label="组织架构" style={{width:'100%'}} allowClear showSearch changeOnSelect value={filters.orgPath} options={options.organizationTree} placeholder="全部虚构组织" onChange={value=>setFilters(f=>({...f,orgPath:(value??[]).map(String),positions:[]}))}/></label>
        <label><span>岗位</span><Select aria-label="岗位" style={{width:300}} allowClear showSearch mode="multiple" maxTagCount="responsive" value={filters.positions} options={options.roles.map(r=>({...r,disabled:filters.positions.length>=6&&!filters.positions.includes(r.value)}))} placeholder="全部岗位" optionFilterProp="label" onChange={positions=>setFilters(f=>({...f,positions:positions.slice(0,6)}))}/></label>
      </div>
    </div>
    <div className="salary-structure-heading"><strong>薪资结构占比</strong><Segmented value={viewType} onChange={v=>setViewType(v as '当月'|'累计')} options={['当月','累计']}/></div>
    <div className="salary-definition">{viewType==='当月'?'当月人数：所选月去重员工数':'累计：当年 1 月至所选月；人数为跨月去重人数'} · 员工月：一位员工在一个月的一条记录 · 切换仅影响结构区 · 金额单位：元</div>
    <div className="salary-analysis-structure"><SalaryStructurePositions data={structure} viewType={viewType} selectedPositions={structure.positions} onSelectedPositionsChange={()=>undefined} hideTitle hidePositionSelector pieScale={0.9}/></div>
    <Row gutter={[0,12]}><Col xs={24}><SalaryPretaxTrendModule key={salaryGlobalFiltersKey(filters)} filters={filters} highlightedPayrollPeriod={filters.payrollPeriod}/></Col></Row>
    <EmployeeIncomeOverview filters={filters}/>
    <p className="salary-definition">{metadata.notice}。趋势展示所选年度及上年全部可用月份；月人均 = 当月税前总额 / 当月人数。基础组与进阶组为显式演示分组，非企业职级规则。</p>
  </div>;
}
