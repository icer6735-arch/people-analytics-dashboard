const money = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 });
const pct = new Intl.NumberFormat('zh-CN', { style: 'percent', maximumFractionDigits: 1 });
const get = selector => document.querySelector(selector);
const sum = (rows, field) => rows.reduce((total, row) => total + (Number(row[field]) || 0), 0);
const distinct = (rows, field) => new Set(rows.map(row => row[field])).size;
const tooltip = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'tooltip' }));
let data;
const state = { period: '', mode: 'current', department: 'all', role: 'all' };

function periodsInScope() {
  const index = data.dimensions.periods.indexOf(state.period);
  return state.mode === 'cumulative' ? data.dimensions.periods.slice(0, index + 1) : [state.period];
}
function actualRows(periods = periodsInScope()) {
  return data.employee_months.filter(row => periods.includes(row.period) && (state.department === 'all' || row.department_id === state.department) && (state.role === 'all' || row.role_family === state.role));
}
function budgetRows(periods = periodsInScope()) {
  return data.budgets.filter(row => periods.includes(row.period) && (state.department === 'all' || row.department_id === state.department));
}
function trendPeriods() {
  return data.dimensions.periods.slice(0, data.dimensions.periods.indexOf(state.period) + 1);
}
function utilizationStatus(actual, rows) {
  if (!rows.length || rows.some(row => row.budget_labor_cost === null)) return { value: '无预算', style: 'state-empty', detail: '所选范围存在缺失预算，不使用部分预算计算' };
  const validRows = rows.filter(row => row.budget_labor_cost !== null);
  const budget = sum(validRows, 'budget_labor_cost');
  if (budget === 0) return { value: '分母为 0', style: 'state-warning', detail: '实际 ' + money.format(actual) + ' · 预算为正式零值' };
  if (actual === 0) return { value: '无实际', style: 'state-empty', detail: '预算 ' + money.format(budget) + ' · 没有实际记录' };
  return { value: pct.format(actual / budget), style: '', detail: '实际 ' + money.format(actual) + ' / 预算 ' + money.format(budget) };
}
function setKpi(id, value, detail, style = '') {
  const node = get(id);
  node.textContent = value;
  node.className = ('kpi-value ' + style).trim();
  get(id + '-detail').textContent = detail;
}
function renderKpis() {
  const rows = actualRows();
  const actual = sum(rows, 'labor_cost');
  const status = utilizationStatus(actual, budgetRows());
  setKpi('#kpi-utilization', status.value, status.detail, status.style);
  const employeeMonths = new Set(rows.map(row => row.synthetic_employee_id + '|' + row.period)).size;
  const currentEmployees = distinct(actualRows([state.period]), 'synthetic_employee_id');
  get('#kpi-cost-label').textContent = state.mode === 'current' ? '当月人均成本' : '累计月均人均成本';
  setKpi('#kpi-cost', employeeMonths ? money.format(actual / employeeMonths) : '无实际', currentEmployees ? currentEmployees + ' 名当月有效模拟员工' : '所选月份没有有效模拟员工', employeeMonths ? '' : 'state-empty');
  const employees = distinct(rows, 'synthetic_employee_id');
  setKpi('#kpi-pay', employees ? money.format(sum(rows, 'pretax_pay') / employees) : '无实际', currentEmployees ? currentEmployees + ' 名当月有效模拟员工' : '所选月份没有有效模拟员工', employees ? '' : 'state-empty');
}
function tip(event, text) { tooltip.textContent = text; tooltip.style.left = event.clientX + 'px'; tooltip.style.top = event.clientY + 'px'; tooltip.style.opacity = 1; }
function attachTips(container) {
  container.querySelectorAll('[data-tip]').forEach(node => {
    node.addEventListener('mousemove', event => tip(event, node.dataset.tip));
    node.addEventListener('mouseleave', () => { tooltip.style.opacity = 0; });
  });
}
function frame(compactLayout = false) { return compactLayout ? { width: 900, height: 260, left: 34, right: 10, top: 8, bottom: 32 } : { width: 900, height: 260, left: 58, right: 18, top: 15, bottom: 38 }; }
function renderCostChart() {
  const rows = trendPeriods().map(period => {
    const budgets = budgetRows([period]);
    return { period, actual: sum(actualRows([period]), 'labor_cost'), budget: budgets.length && budgets.every(row => row.budget_labor_cost !== null) ? sum(budgets, 'budget_labor_cost') : null };
  });
  const f = frame(); const plotWidth = f.width - f.left - f.right; const plotHeight = f.height - f.top - f.bottom;
  const max = Math.max(...rows.flatMap(row => [row.actual, row.budget || 0]), 1) * 1.15; const group = plotWidth / rows.length;
  let svg = '<svg viewBox="0 0 900 260">';
  for (let index = 0; index <= 4; index++) {
    const y = f.top + plotHeight * index / 4; const value = max * (1 - index / 4);
    svg += '<line class="grid-line" x1="' + f.left + '" y1="' + y + '" x2="' + (f.width-f.right) + '" y2="' + y + '"/><text class="axis-text" x="50" y="' + (y+3) + '" text-anchor="end">' + compact.format(value) + '</text>';
  }
  rows.forEach((row, index) => {
    const x = f.left + group * index; const barWidth = Math.min(24, group * .3); const actualHeight = row.actual / max * plotHeight;
    if (row.budget !== null) { const height = row.budget / max * plotHeight; svg += '<rect data-tip="' + row.period + ' Budget: ' + money.format(row.budget) + '" x="' + (x+group*.17) + '" y="' + (f.top+plotHeight-height) + '" width="' + barWidth + '" height="' + height + '" rx="3" fill="#4d6480"/>'; }
    else svg += '<text class="value-text" data-tip="' + row.period + '：该期间未配置预算，不按 0 计算。" x="' + (x+group*.28) + '" y="' + (f.top+plotHeight-5) + '" text-anchor="middle">无预算</text>';
    svg += '<rect data-tip="' + row.period + ' Actual: ' + money.format(row.actual) + '" x="' + (x+group*.52) + '" y="' + (f.top+plotHeight-actualHeight) + '" width="' + barWidth + '" height="' + actualHeight + '" rx="3" fill="#4cc9f0"/><text class="axis-text" x="' + (x+group*.5) + '" y="247" text-anchor="middle">' + row.period.slice(2) + '</text>';
  });
  const container = get('#cost-chart'); container.innerHTML = svg + '</svg>'; attachTips(container);
}
function monthlyPay() {
  const periods = trendPeriods();
  return periods.map((period, index) => {
    const rows = actualRows([period]); const hc = distinct(rows, 'synthetic_employee_id'); const value = hc ? sum(rows, 'pretax_pay') / hc : null;
    const previousRows = index ? actualRows([periods[index - 1]]) : []; const previousHc = distinct(previousRows, 'synthetic_employee_id'); const previous = previousHc ? sum(previousRows, 'pretax_pay') / previousHc : null;
    return { period, value, mom: value !== null && previous ? (value - previous) / previous : null };
  });
}
function renderPayChart() {
  const rows = monthlyPay(); const values = rows.map(row => row.value).filter(value => value !== null); const container = get('#pay-chart');
  if (!values.length) { container.innerHTML = '<div class="empty-chart">无实际数据</div>'; return; }
  const f = frame(true); const plotWidth=f.width-f.left-f.right, plotHeight=f.height-f.top-f.bottom; const min=Math.min(...values)*.94, max=Math.max(...values)*1.06;
  const points = rows.map((row,index) => row.value === null ? null : { row, x:f.left+plotWidth*index/(rows.length-1), y:f.top+plotHeight-(row.value-min)/(max-min||1)*plotHeight }).filter(Boolean);
  let svg='<svg viewBox="0 0 900 260">'; for(let index=0;index<=4;index++){const y=f.top+plotHeight*index/4;svg+='<line class="grid-line" x1="58" y1="'+y+'" x2="882" y2="'+y+'"/>';}
  svg += '<polyline fill="none" stroke="#4cc9f0" stroke-width="4" stroke-linejoin="round" points="' + points.map(point => point.x + ',' + point.y).join(' ') + '"/>';
  points.forEach(point => { const mom=point.row.mom===null?'N/A':pct.format(point.row.mom); svg += '<circle data-tip="'+point.row.period+': '+money.format(point.row.value)+' · MoM '+mom+'" cx="'+point.x+'" cy="'+point.y+'" r="6" fill="#101821" stroke="#4cc9f0" stroke-width="4"/><text class="axis-text" x="'+point.x+'" y="247" text-anchor="middle">'+point.row.period.slice(2)+'</text>'; });
  container.innerHTML=svg+'</svg>'; attachTips(container);
}
function renderMixChart() {
  const fields=[['base_pay','#4cc9f0'],['level_pay','#8c75e8'],['performance_pay','#2fbf8f'],['kpi_bonus','#f2b84b'],['other_pay','#ef746f']]; const source=actualRows();
  const roles=data.dimensions.roles.filter(role=>state.role==='all'||state.role===role).map(role=>{const rows=source.filter(row=>row.role_family===role);return{role,count:rows.length,values:fields.map(item=>({field:item[0],color:item[1],value:rows.length?sum(rows,item[0])/rows.length:0}))};}).filter(row=>row.count);
  const container=get('#mix-chart'); if(!roles.length){container.innerHTML='<div class="empty-chart">无实际数据</div>';return;}
  const f=frame(true),plotWidth=f.width-f.left-f.right,plotHeight=f.height-f.top-f.bottom;const max=Math.max(...roles.map(row=>row.values.reduce((total,item)=>total+item.value,0)),1)*1.1;const group=plotWidth/roles.length;let svg='<svg viewBox="0 0 900 260">';
  roles.forEach((row,index)=>{let y=f.top+plotHeight;const x=f.left+group*index+group*.22,width=group*.56;row.values.forEach(item=>{const height=item.value/max*plotHeight;y-=height;svg+='<rect data-tip="'+row.role+' · '+item.field+': '+money.format(item.value)+'" x="'+x+'" y="'+y+'" width="'+width+'" height="'+height+'" fill="'+item.color+'"/>';});svg+='<text class="axis-text" x="'+(x+width/2)+'" y="248" text-anchor="middle">'+row.role+'</text>';});
  container.innerHTML=svg+'</svg>'; attachTips(container);
}
function render() {
  renderKpis(); renderCostChart(); renderPayChart(); renderMixChart();
  get('#filter-note').textContent = state.role === 'all' ? '预算数据仅包含月份与部门粒度；岗位筛选不会改变预算值。' : '已筛选岗位 ' + state.role + '：实际与 HC 已更新，预算仍保持月份 × 部门粒度。';
}
function fillFilters() {
  data.dimensions.periods.slice().reverse().forEach(value => get('#period-filter').add(new Option(value,value)));
  data.dimensions.departments.forEach(item => get('#department-filter').add(new Option(item.label,item.id)));
  data.dimensions.roles.forEach(value => get('#role-filter').add(new Option(value,value)));
  state.period=data.dimensions.periods.at(-1); get('#period-filter').value=state.period;
  [['#period-filter','period'],['#mode-filter','mode'],['#department-filter','department'],['#role-filter','role']].forEach(item => get(item[0]).addEventListener('change',event=>{state[item[1]]=event.target.value;render();}));
}
async function init() {
  try { const response=await fetch('data/synthetic-data.json'); if(!response.ok) throw new Error('HTTP '+response.status); data=await response.json(); fillFilters(); render(); }
  catch(error) { console.error('Dashboard data load failed:',error); get('.dashboard-section .wrap').insertAdjacentHTML('beforeend','<p class="empty-chart">Dashboard 数据加载失败，请通过静态服务器访问页面。</p>'); }
}
init();
