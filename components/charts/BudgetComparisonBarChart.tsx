"use client";
import ReactECharts from "echarts-for-react";
import { budgetUiColors } from "@/lib/budget-ui-tokens";
import type { UsageRow } from "@/lib/public-budget/types";
import { budgetDisplayLabel } from "@/components/budget/public-budget-labels";
type Metric = "amount" | "hc" | "perCapita";
const number = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 });
export default function BudgetComparisonBarChart({ rows, metric, budgetName, actualName }: { rows: UsageRow[]; metric: Metric; budgetName: string; actualName: string }) {
  const values = (row: UsageRow) => metric === "amount" ? [row.budgetAmount, row.actualAmount, row.amountRate] : metric === "hc" ? [row.budgetHc, row.actualHc, row.hcRate] : [row.perCapitaBudget, row.perCapitaActual, row.perCapitaRate];
  const option = {
    color: [budgetUiColors.budget, budgetUiColors.primary],
    tooltip: { trigger: "axis" as const, backgroundColor: budgetUiColors.tooltip, borderWidth: 0, textStyle: { color: "#fff", fontSize: 12 }, formatter: (params: Array<{ dataIndex: number }>) => { const row = rows[params[0]?.dataIndex ?? 0]; if (!row) return ""; const [budget, actual, rate] = values(row); const rateText = budget === null ? "无预算" : budget === 0 ? "无法计算" : rate === null ? "无法计算" : `${(rate * 100).toFixed(1)}%`; return `${budgetDisplayLabel(row.label)}<br/>${budgetName}：${budget === null ? "无预算" : number.format(budget)}<br/>${actualName}：${actual === null ? "--" : number.format(actual)}<br/>使用率：${rateText}`; } },
    legend: { bottom: 0, data: [budgetName, actualName], itemWidth: 12, itemHeight: 8, textStyle: { color: budgetUiColors.textTertiary, fontSize: 11 } },
    grid: { left: "3%", right: "4%", top: "8%", bottom: "20%", containLabel: true },
    xAxis: { type: "category" as const, data: rows.map((row) => budgetDisplayLabel(row.label)), axisTick: { show: false }, axisLine: { lineStyle: { color: budgetUiColors.border } }, axisLabel: { color: budgetUiColors.textTertiary, fontSize: 10, interval: 0 } },
    yAxis: { type: "value" as const, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: budgetUiColors.textTertiary, formatter: (value: number) => number.format(value) }, splitLine: { lineStyle: { type: "dashed" as const, color: budgetUiColors.borderSubtle } } },
    series: [
      { name: budgetName, type: "bar" as const, barMaxWidth: 44, itemStyle: { color: budgetUiColors.budget, borderRadius: [4,4,0,0] }, data: rows.map((row) => values(row)[0]) },
      { name: actualName, type: "bar" as const, barMaxWidth: 44, itemStyle: { color: budgetUiColors.primary, borderRadius: [4,4,0,0] }, label: { show: true, position: "top" as const, fontSize: 10, color: budgetUiColors.textTertiary, formatter: (item: { dataIndex: number }) => { const [budget,,rate] = values(rows[item.dataIndex]); return budget === null ? "无预算" : rate === null ? "无法计算" : `${(rate*100).toFixed(0)}%`; } }, data: rows.map((row) => values(row)[1]) },
    ],
  };
  return <ReactECharts option={option} notMerge style={{ height: 300 }} />;
}
