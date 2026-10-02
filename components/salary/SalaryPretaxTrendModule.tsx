"use client";

import { Card, Collapse, Empty, Table } from "antd";
import ReactECharts from "echarts-for-react";
import { useMemo, useState } from "react";
import { getSalaryMetricColor, SALARY_CHART_COLORS, SALARY_CHART_PALETTE } from "@/components/salary/chart-colors";
import { type SalaryGlobalFilters } from "@/components/salary/global-filter";

import {getPretaxTrend, roleLabel} from "@/lib/public-salary/adapter";
import type {MonthlyPretaxTrendRow} from "@/lib/public-salary/types";

type SalaryPretaxTrendModuleProps = {
  filters?: SalaryGlobalFilters;
  globalDepartmentPath?: string[];
  globalPositions?: string[];
  compact?: boolean;
  chartHeight?: number;
  highlightedPayrollPeriod?: string;
};

type ChartClickParam = {
  name?: string;
};

type TrendSeriesKey = "currentYearAdvanced" | "currentYearFoundation" | "lastYearAdvanced" | "lastYearFoundation";

type TrendSeriesMeta = {
  key: TrendSeriesKey;
  name: string;
  type: "bar" | "line";
  color: string;
  yAxisIndex: 0 | 1;
  dashed?: boolean;
};

const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const moneyFormatter = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat("zh-CN", { minimumFractionDigits: 1, maximumFractionDigits: 2 });

function formatMoney(value: number | null | undefined) {
  return value !== null && value !== undefined && Number.isFinite(value) ? moneyFormatter.format(value) : "--";
}

function formatMoneyAxis(value: number) {
  return moneyFormatter.format(value);
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "--";
  return `${value > 0 ? "+" : ""}${percentFormatter.format(value)}%`;
}

function trendTone(value: number | null | undefined) {
  if (value === null || value === undefined) return "text-slate-500";
  if (value > 0) return "text-orange-600";
  if (value < 0) return "text-emerald-600";
  return "text-slate-500";
}

function trendArrow(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  if (value > 0) return "↗";
  if (value < 0) return "↘";
  return "-";
}

function normalizeTrendRows(rows: MonthlyPretaxTrendRow[]) {
  return months.map((monthLabel) => rows.find((item) => item.month === monthLabel) || {
    month: monthLabel,
    currentYear: null,
    lastYear: null,
    currentYearFoundation: null,
    lastYearFoundation: null,
    currentYearAdvanced: null,
    lastYearAdvanced: null,
    mom: null,
    yoy: null,
  });
}

function getSyncedYAxisBounds(rows: MonthlyPretaxTrendRow[]) {
  const values = rows.flatMap((row) => [row.currentYearAdvanced, row.currentYearFoundation, row.lastYearAdvanced, row.lastYearFoundation])
    .filter((value): value is number => value !== null && value !== undefined && Number.isFinite(value));
  if (!values.length) return { min: 0, max: 10000 };
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = Math.max((maxValue - minValue) * 0.12, maxValue * 0.08, 500);
  const min = Math.max(0, Math.floor((minValue - padding) / 1000) * 1000);
  const max = Math.ceil((maxValue + padding) / 1000) * 1000;
  return { min, max: max > min ? max : min + 1000 };
}

function createDualTrackOption(rows: MonthlyPretaxTrendRow[], currentYear: string, lastYear: string, highlightedMonth?: string) {
  const normalizedRows = normalizeTrendRows(rows);
  const yAxisBounds = getSyncedYAxisBounds(normalizedRows);
  const advancedCurrentColor = getSalaryMetricColor("基本工资");
  const foundationCurrentColor = SALARY_CHART_COLORS.accentCyan;
  const advancedLastYearColor = SALARY_CHART_COLORS.accentYellow;
  const foundationLastYearColor = getSalaryMetricColor("通用奖金");
  const highlightedMonthLabel = highlightedMonth ? `${Number(highlightedMonth.slice(5, 7))}月` : undefined;
  const seriesMeta: TrendSeriesMeta[] = [
    { key: "currentYearAdvanced", name: `${currentYear}年 进阶组人均薪资`, type: "bar", color: advancedCurrentColor, yAxisIndex: 0 },
    { key: "currentYearFoundation", name: `${currentYear}年 基础组人均薪资`, type: "bar", color: foundationCurrentColor, yAxisIndex: 0 },
    { key: "lastYearAdvanced", name: `${lastYear}年 进阶组人均薪资`, type: "line", color: advancedLastYearColor, yAxisIndex: 1 },
    { key: "lastYearFoundation", name: `${lastYear}年 基础组人均薪资`, type: "line", color: foundationLastYearColor, yAxisIndex: 1, dashed: true },
  ];

  return {
    color: SALARY_CHART_PALETTE,
    axisPointer: { link: [{ xAxisIndex: "all" }] },
    tooltip: {
      trigger: "axis" as const,
      axisPointer: { type: "shadow" as const, snap: true, shadowStyle: { color: "rgba(15, 23, 42, 0.06)" } },
      formatter: (params: Array<{ marker: string; seriesName: string; value: number | null; axisValue: string }>) => {
        const lines = params.map((item) => {
          const valueText = item.value === null || item.value === undefined ? "--" : formatMoney(Number(item.value));
          return `<div style="display:flex;align-items:center;justify-content:space-between;gap:20px;min-width:260px"><span>${item.marker}${item.seriesName}</span><b>${valueText}</b></div>`;
        });
        return [`<div style="font-weight:600;margin-bottom:6px">${params[0]?.axisValue || ""}</div>`, ...lines].join("");
      },
    },
    legend: { top: 0, left: "center", itemWidth: 16, itemHeight: 8, textStyle: { color: "#475569" } },
    grid: { left: 58, right: 58, top: 54, bottom: 34, containLabel: true },
    xAxis: {
      type: "category" as const,
      boundaryGap: true,
      data: normalizedRows.map((row) => row.month),
      axisTick: { show: false },
      axisLabel: { color: "#64748b" },
      axisLine: { lineStyle: { color: "#cbd5e1" } },
    },
    yAxis: [
      {
        type: "value" as const,
        name: "人均税前薪资",
        min: yAxisBounds.min,
        max: yAxisBounds.max,
        axisLabel: { color: "#64748b", formatter: (value: number) => formatMoneyAxis(value) },
        splitLine: { show: true, lineStyle: { color: "#eef2f7" } },
      },
      {
        type: "value" as const,
        name: "人均税前薪资",
        min: yAxisBounds.min,
        max: yAxisBounds.max,
        axisLabel: { color: "#64748b", formatter: (value: number) => formatMoneyAxis(value) },
        splitLine: { show: false },
      },
    ],
    series: seriesMeta.map((item, index) => {
      const data = normalizedRows.map((row) => row[item.key]);
      const baseSeries = {
        name: item.name,
        yAxisIndex: item.yAxisIndex,
        data,
        emphasis: { focus: "series" as const },
        markLine: index === 0 && highlightedMonthLabel ? {
          symbol: "none",
          label: { formatter: `当前：${highlightedMonthLabel}`, color: SALARY_CHART_COLORS.primaryBlue, fontWeight: 700 },
          lineStyle: { color: SALARY_CHART_COLORS.primaryBlue, type: "dashed" as const, width: 2 },
          data: [{ xAxis: highlightedMonthLabel }],
        } : undefined,
      };
      if (item.type === "bar") {
        return {
          ...baseSeries,
          type: "bar" as const,
          barWidth: 18,
          barGap: "18%",
          itemStyle: { color: item.color, borderRadius: [6, 6, 0, 0] },
        };
      }
      return {
        ...baseSeries,
        type: "line" as const,
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        connectNulls: false,
        lineStyle: { width: 2.5, color: item.color, type: item.dashed ? "dashed" as const : "solid" as const },
        itemStyle: { color: item.color, borderColor: "#fff", borderWidth: 2 },
      };
    }),
  };
}

export default function SalaryPretaxTrendModule({ filters, globalDepartmentPath = [], globalPositions = [], compact = false, chartHeight = 360, highlightedPayrollPeriod }: SalaryPretaxTrendModuleProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const effectiveFilters = useMemo<SalaryGlobalFilters>(() => filters ?? {
    payrollPeriod: highlightedPayrollPeriod || "",
    company: "",
    orgPath: globalDepartmentPath,
    jobClass: "",
    positions: globalPositions,
    jobLevel: "",
    workLocation: "",
  }, [filters, globalDepartmentPath, globalPositions, highlightedPayrollPeriod]);
  const payload = useMemo(() => getPretaxTrend(effectiveFilters), [effectiveFilters]);
  const trendScopeLabel = effectiveFilters.positions.length ? effectiveFilters.positions.map(roleLabel).join("、") : "全部岗位";

  const rows = useMemo(() => payload?.monthlyData || [], [payload]);
  const currentYear = payload.currentYear;
  const lastYear = payload.lastYear;
  const monthlyData = useMemo(() => rows.length ? normalizeTrendRows(rows) : [], [rows]);
  const latestRow = useMemo(() => [...monthlyData].reverse().find((row) => row.currentYear !== null && row.currentYear !== undefined), [monthlyData]);
  const activeRow = useMemo(() => monthlyData.find((row) => row.month === (selectedMonth ?? `${Number(effectiveFilters.payrollPeriod.slice(5,7))}月`)) || latestRow, [latestRow, monthlyData, selectedMonth, effectiveFilters.payrollPeriod]);
  const trendOption = useMemo(() => {
    return monthlyData.length ? createDualTrackOption(monthlyData, currentYear, lastYear, `${currentYear}-${String(months.indexOf(activeRow?.month ?? "")+1).padStart(2,"0")}`) : null;
  }, [currentYear, lastYear, monthlyData, activeRow]);
  const chartEvents = useMemo(() => ({
    click: (params: ChartClickParam) => {
      if (params.name) setSelectedMonth(params.name);
    },
  }), []);

  return (
    <Card title="人均税前薪资趋势" size="small" className="rounded-2xl border-0 shadow-sm">
      {payload && trendOption ? (
        <div className="flex flex-col gap-4">
          {activeRow ? (
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">当前月份：{currentYear}年 {activeRow.month}</span>
              <span className="mx-2 text-slate-300">|</span>
              <span>人均税前薪资：<b>{formatMoney(activeRow.currentYear)}</b></span>
              <span className="mx-2 text-slate-300">|</span>
              <span className={`font-bold ${trendTone(activeRow.mom)}`}>环比：{formatPercent(activeRow.mom)} {trendArrow(activeRow.mom)}</span>
              <span className="mx-2 text-slate-300">|</span>
              <span className={`font-bold ${trendTone(activeRow.yoy)}`}>同比：{formatPercent(activeRow.yoy)} {trendArrow(activeRow.yoy)}</span>
            </div>
          ) : null}

          <section className="rounded-2xl bg-slate-50/70 px-3 py-2">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <div className="font-semibold text-slate-700">全年 基础组 / 进阶组 跨年对比趋势</div>
              <div className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">
                当前展示岗位：<span className="font-semibold text-slate-900">{trendScopeLabel}</span>
              </div>
            </div>
            <ReactECharts option={trendOption} onEvents={chartEvents} style={{ height: chartHeight, width: "100%" }} />
          </section>

          {!compact && (
            <Collapse
              size="small"
              bordered={false}
              defaultActiveKey={[]}
              className="rounded-xl bg-slate-50"
              items={[
                {
                  key: "detail",
                  label: <span className="text-sm font-semibold text-slate-700">趋势明细</span>,
                  children: (
                    <Table<MonthlyPretaxTrendRow>
                      rowKey="month"
                      scroll={{ x: 750 }}
                      size="small"
                      pagination={false}
                      dataSource={monthlyData}
                      columns={[
                        { title: "月份", dataIndex: "month", width: 90 },
                        { title: "本期人均税前薪资", dataIndex: "currentYear", align: "right", render: (value: number | null) => formatMoney(value) },
                        { title: "上期同期人均税前薪资", dataIndex: "lastYear", align: "right", render: (value: number | null) => formatMoney(value) },
                        { title: "环比增长率(%)", dataIndex: "mom", align: "right", render: (value: number | null) => <span className={`font-semibold ${trendTone(value)}`}>{formatPercent(value)}</span> },
                        { title: "同比增长率(%)", dataIndex: "yoy", align: "right", render: (value: number | null) => <span className={`font-semibold ${trendTone(value)}`}>{formatPercent(value)}</span> },
                      ]}
                    />
                  ),
                },
              ]}
            />
          )}
        </div>
      ) : (
        <Empty description="暂无人均税前薪资趋势数据" />
      )}
    </Card>
  );
}
