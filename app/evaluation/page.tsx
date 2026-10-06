"use client";

import { useState } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Empty, Select, Table, Typography } from "antd";
import { getEvaluationView, organizations, roles } from "@/lib/public-evaluation/adapter";
import type { RoleBreakdown } from "@/lib/public-evaluation/types";
import "./evaluation.css";

const { Title, Text } = Typography;
const periods = ["2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09","2025-10","2025-11","2025-12","2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10","2026-11","2026-12"];
const money = (value: number | null) => value === null ? "无法计算" : Math.round(value).toLocaleString("zh-CN");
const pct = (value: number | null) => value === null ? "—" : `${(value * 100).toFixed(1)}%`;
const pp = (value: number | null) => { const normalized = value !== null && Math.abs(value) < 0.0005 ? 0 : value; return normalized === null ? "—" : `${normalized >= 0 ? "+" : ""}${(normalized * 100).toFixed(1)}pp`; };

function MetricCard({ label, value, note, tone = "blue" }: { label: string; value: string; note: string; tone?: string }) {
  return <Card className="evaluation-metric-card"><div className="evaluation-card-label">{label}</div><div className={`evaluation-metric-value ${tone}`}>{value}</div><Text type="secondary" className="evaluation-metric-note">{note}</Text></Card>;
}
function TrendSection({ rows }: { rows: ReturnType<typeof getEvaluationView>["trends"] }) {
  const axis = { type: "category" as const, data: rows.map((row) => row.period), axisTick: { show: false }, axisLabel: { color: "#718096", formatter: (value: string) => value.slice(2) } };
  const costOption = { color: ["#4f6faf", "#4d9589"], tooltip: { trigger: "axis" as const, confine: true }, legend: { top: 0 }, grid: { left: 48, right: 54, top: 36, bottom: 36, containLabel: true }, xAxis: axis, yAxis: [{ type: "value" as const, name: "成本", axisLabel: { formatter: (v: number) => `${Math.round(v / 1000)}k` } }, { type: "value" as const, name: "HC", splitLine: { show: false } }], series: [{ name: "人力成本", type: "line" as const, smooth: true, data: rows.map((row) => row.laborCost), yAxisIndex: 0, lineStyle: { width: 3 } }, { name: "HC", type: "line" as const, smooth: true, data: rows.map((row) => row.hc), yAxisIndex: 1, lineStyle: { width: 3 } }] };
  const avgOption = { color: ["#4d9589"], tooltip: { trigger: "axis" as const, confine: true }, grid: { left: 48, right: 20, top: 24, bottom: 36, containLabel: true }, xAxis: axis, yAxis: { type: "value" as const, axisLabel: { formatter: (v: number) => `${Math.round(v / 1000)}k` } }, series: [{ name: "人均成本", type: "line" as const, smooth: true, data: rows.map((row) => row.avgCost), lineStyle: { width: 3 }, areaStyle: { color: "rgba(77,149,137,.14)" } }] };
  const latest = rows.at(-1);
  const prev = rows.at(-2);
  const mom = latest?.avgCost !== null && latest?.avgCost !== undefined && prev?.avgCost ? latest.avgCost / prev.avgCost - 1 : null;
  return <div className="evaluation-trend-layout"><Card title="人力成本与 HC 趋势" className="evaluation-trend-main"><div className="evaluation-chart-host"><ReactECharts option={costOption} style={{ width: "100%", height: 280 }} /></div></Card><Card title="人均成本趋势" className="evaluation-trend-side"><div className="evaluation-trend-callout"><span>当前值</span><strong>{money(latest?.avgCost ?? null)}</strong><em>环比 {pct(mom)}</em></div><div className="evaluation-chart-host"><ReactECharts option={avgOption} style={{ width: "100%", height: 220 }} /></div></Card></div>;
}
function RoleStructure({ rows }: { rows: RoleBreakdown[] }) {
  if (!rows.length) return <Card><Empty description="当前筛选范围暂无岗位组数据" /></Card>;
  const maxShare = Math.max(...rows.flatMap((row) => [row.headcountShare ?? 0, row.costShare ?? 0]), 0);
  const axisMax = Math.max(5, Math.ceil((maxShare * 100 * 1.2) / 5) * 5);
  const option = { color: ["#7fa7f8", "#4d9589"], tooltip: { trigger: "axis" as const, axisPointer: { type: "shadow" as const }, confine: true }, legend: { top: 0 }, grid: { left: 104, right: 24, top: 34, bottom: 22, containLabel: true }, xAxis: { type: "value" as const, min: 0, max: axisMax, interval: axisMax <= 40 ? 5 : 10, axisLabel: { formatter: "{value}%" } }, yAxis: { type: "category" as const, data: rows.map((row) => row.label).reverse(), axisLabel: { width: 100, overflow: "truncate" as const } }, series: [{ name: "HC占比", type: "bar" as const, data: rows.map((row) => row.headcountShare === null ? null : row.headcountShare * 100).reverse(), barGap: "25%" }, { name: "成本占比", type: "bar" as const, data: rows.map((row) => row.costShare === null ? null : row.costShare * 100).reverse(), barGap: "25%" }] };
  return <Card title="岗位结构与成本投入" extra={<Text type="secondary">结构差 = 成本占比 − HC占比</Text>}><div className="evaluation-chart-host"><ReactECharts option={option} style={{ width: "100%", height: Math.max(250, rows.length * 58) }} /></div></Card>;
}
function BenchmarkPanel({ period, orgId, roleFamilyId }: { period: string; orgId: string; roleFamilyId: string }) {
  const view = getEvaluationView({ period, orgId, roleFamilyId });
  const columns = [{ title: "岗位组", dataIndex: "label", key: "label" }, { title: "HC", dataIndex: "hc", key: "hc", align: "right" as const }, { title: "HC占比", dataIndex: "headcountShare", key: "headcountShare", align: "right" as const, render: pct }, { title: "人力成本", dataIndex: "laborCost", key: "laborCost", align: "right" as const, render: money }, { title: "成本占比", dataIndex: "costShare", key: "costShare", align: "right" as const, render: pct }, { title: "人均成本", dataIndex: "avgCost", key: "avgCost", align: "right" as const, render: money }, { title: "结构差(pp)", dataIndex: "structureDiff", key: "structureDiff", align: "right" as const, render: pp }];
  return <div className="evaluation-panel-stack"><div className="evaluation-metric-grid"><MetricCard label="当前 HC" value={String(view.current.hc)} note="当前筛选月份有效去重员工数" /><MetricCard label="本月人力成本" value={money(view.current.laborCost)} note="税前薪酬 + synthetic 雇主侧附加成本" /><MetricCard label="人均成本" value={money(view.current.avgCost)} note="总成本 ÷ 同范围有效 HC" /><MetricCard label="成本环比" value={pct(view.current.costMom)} note="本月成本 ÷ 上月成本 − 1" tone="green" /></div><TrendSection rows={view.trends} /><RoleStructure rows={view.roles} /><Card title="岗位明细" className="evaluation-detail-card"><Text type="secondary">图表用于比较，表格提供精确数值与结构差。</Text><div className="evaluation-table-scroll"><Table<RoleBreakdown & { key: string }> columns={columns} dataSource={view.detailRows} rowKey="key" pagination={false} size="small" /></div></Card><div className="evaluation-data-note">Synthetic data · employer-side cost is independently generated for this demo; not a statutory rate, company rate, or market benchmark.</div></div>;
}
export default function EvaluationPage() {
  const [period, setPeriod] = useState("2026-07"); const [orgId, setOrgId] = useState(""); const [roleFamilyId, setRoleFamilyId] = useState("");
  return <section className="evaluation-page page-shell page-shell--dashboard"><div className="evaluation-page-inner"><header className="evaluation-header"><div><Title level={2}>人力成本评估</Title><Text type="secondary">人力成本、HC 与岗位结构联动分析</Text></div><div className="evaluation-filter-bar"><label>统计月份<Select value={period} options={periods.map((item) => ({ label: item, value: item }))} onChange={setPeriod} /></label><label>组织范围<Select allowClear value={orgId || undefined} placeholder="全部组织" options={organizations.filter((item) => item.parent_id).map((item) => ({ label: item.label, value: item.id }))} onChange={(value) => setOrgId(value ?? "")} /></label><label>岗位组<Select allowClear value={roleFamilyId || undefined} placeholder="全部岗位组" options={roles.map((item) => ({ label: item.label, value: item.id }))} onChange={(value) => setRoleFamilyId(value ?? "")} /></label></div></header><BenchmarkPanel period={period} orgId={orgId} roleFamilyId={roleFamilyId} /></div></section>;
}
