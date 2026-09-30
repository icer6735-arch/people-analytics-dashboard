"use client";
import ReactECharts from "echarts-for-react";
import { budgetUiColors } from "@/lib/budget-ui-tokens";
import type { MonthlyManagementTrendRow } from "@/lib/budget-monthly-trend-contract";
type TrendMetric = "amount" | "perCapita";
type Props = { data: MonthlyManagementTrendRow[]; metric: TrendMetric; height?: number };
const yuan = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 });
const planningColor = budgetUiColors.primary;
const operationsColor = budgetUiColors.success;
function format(value: number | null) { return value === null || !Number.isFinite(value) ? "--" : yuan.format(Math.round(value)); }
function definitions(metric: TrendMetric) {
  return [
    { name: "职能管理岗 预算", color: planningColor, lineType: "dashed" as const, value: (row: MonthlyManagementTrendRow) => metric === "amount" ? row.groupManagement.budgetAmount : row.groupManagement.perCapitaBudget },
    { name: "职能管理岗 实际", color: planningColor, lineType: "solid" as const, value: (row: MonthlyManagementTrendRow) => metric === "amount" ? row.groupManagement.actualAmount : row.groupManagement.perCapitaActual },
    { name: "业务管理岗 预算", color: operationsColor, lineType: "dashed" as const, value: (row: MonthlyManagementTrendRow) => metric === "amount" ? row.departmentManagement.budgetAmount : row.departmentManagement.perCapitaBudget },
    { name: "业务管理岗 实际", color: operationsColor, lineType: "solid" as const, value: (row: MonthlyManagementTrendRow) => metric === "amount" ? row.departmentManagement.actualAmount : row.departmentManagement.perCapitaActual },
  ];
}
export default function BudgetManagementTrendChart({ data, metric, height = 340 }: Props) {
  const rows = data ?? []; const seriesDefinitions = definitions(metric);
  const option = {
    color: [planningColor, planningColor, operationsColor, operationsColor], title: { show: false },
    tooltip: { trigger: "axis" as const, axisPointer: { type: "line" as const }, backgroundColor: budgetUiColors.tooltip, borderWidth: 0, textStyle: { color: budgetUiColors.cardBackground, fontSize: 12 }, formatter: (params: Array<{ dataIndex: number }>) => { const row = rows[params[0]?.dataIndex ?? 0]; if (!row) return ""; return `${row.month}<br/>${seriesDefinitions.map((item) => `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${item.color};margin-right:6px"></span>${item.name}：${format(item.value(row))}`).join("<br/>")}`; } },
    legend: { bottom: 0, data: seriesDefinitions.map((item) => item.name), itemWidth: 18, itemHeight: 8, textStyle: { color: budgetUiColors.textTertiary, fontSize: 11 } },
    grid: { left: "3%", right: "4%", top: "8%", bottom: "20%", containLabel: true },
    xAxis: { type: "category" as const, boundaryGap: false, data: rows.map((row) => `${Number(row.month.slice(5, 7))}月`), axisTick: { show: false }, axisLine: { lineStyle: { color: budgetUiColors.border } }, axisLabel: { color: budgetUiColors.textTertiary, fontSize: 11 } },
    yAxis: { type: "value" as const, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: budgetUiColors.textTertiary, formatter: (value: number) => yuan.format(value) }, splitLine: { show: true, lineStyle: { type: "dashed" as const, color: budgetUiColors.borderSubtle } } },
    series: seriesDefinitions.map((item) => ({ name: item.name, type: "line" as const, smooth: true, connectNulls: false, symbol: item.lineType === "dashed" ? "emptyCircle" : "circle", symbolSize: 7, lineStyle: { width: item.lineType === "dashed" ? 2 : 2.5, type: item.lineType, color: item.color }, itemStyle: { color: item.color }, data: rows.map((row) => item.value(row)) })),
  };
  return <ReactECharts option={option} notMerge style={{ height }} />;
}
