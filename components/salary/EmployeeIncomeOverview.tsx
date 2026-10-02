"use client";

import { useMemo } from "react";
import { Card, Empty, Tag, Typography } from "antd";
import ReactECharts from "echarts-for-react";
import { getSalaryMetricColor } from "@/components/salary/chart-colors";
import { type SalaryGlobalFilters } from "@/components/salary/global-filter";

import {getIncomeOverview, roleLabel, metadata} from "@/lib/public-salary/adapter";
import {toAverageBreakdown, overviewMetrics} from "@/lib/public-salary/calculations";
import type {IncomeBucket as Bucket, AvgBreakdown} from "@/lib/public-salary/types";

type EmployeeIncomeOverviewProps = {
  filters: SalaryGlobalFilters;
};

type RoleScope = "selectedPositions";
type CityTier = "甲类城市" | "乙类城市" | "丙类城市";
type CityScope = "overall" | CityTier;
type MetricKey = "baseSalary" | "levelSalary" | "performanceSalary" | "bonusSalary" | "other";

const jobLevels = metadata.grade_bands;

const cityScopes: Array<{ key: CityScope; title: string; color: string }> = [
  { key: "overall", title: "整体", color: "#111827" },
  { key: "甲类城市", title: "甲类城市", color: "#7FA7F8" },
  { key: "乙类城市", title: "乙类城市", color: "#0F8F8E" },
  { key: "丙类城市", title: "丙类城市", color: "#E8C94D" },
];

const metricLabels: Array<{ key: MetricKey; label: string }> = [
  { key: "baseSalary", label: "基本工资" },
  { key: "levelSalary", label: "职级工资" },
  { key: "performanceSalary", label: "绩效薪资" },
  { key: "bonusSalary", label: "通用奖金" },
  { key: "other", label: "其他薪资" },
];

const numberFormatter = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 });
const cityMetricGradientPalettes: Record<CityScope, Array<[string, string]>> = {
  overall: [
    ["#f4f4f5", "#e4e4e7"],
    ["#e5e7eb", "#d4d4d8"],
    ["#d1d5db", "#a1a1aa"],
    ["#cbd5e1", "#94a3b8"],
    ["#a3a3a3", "#737373"],
    ["#71717a", "#52525b"],
  ],
  甲类城市: [
    ["#eef4ff", "#d8e6ff"],
    ["#e2ecff", "#cbdcff"],
    ["#d4e2ff", "#b9d0ff"],
    ["#c5d8ff", "#a8c4fb"],
    ["#b8cefb", "#98b8f8"],
    ["#afc4f5", "#7fa7f8"],
  ],
  乙类城市: [
    ["#e8f6f5", "#cce9e8"],
    ["#d8f0ef", "#b7dfde"],
    ["#c7e9e8", "#9fd3d2"],
    ["#b2dfde", "#83c3c2"],
    ["#9bd3d2", "#5fb1b0"],
    ["#81c4c3", "#0f8f8e"],
  ],
  丙类城市: [
    ["#fbf5d8", "#f3e49b"],
    ["#f8efbd", "#eedb7b"],
    ["#f6e9aa", "#ead263"],
    ["#f2df88", "#e8c94d"],
    ["#ead263", "#d7b83f"],
    ["#e8c94d", "#caa82d"],
  ],
};

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "-";
  return numberFormatter.format(Math.round(value));
}

function formatCurrency(value: number | null | undefined) {
  return `¥${formatMoney(value)}`;
}

function formatPercent(value: number | null | undefined, digits = 1) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "-";
  return `${Number(value).toFixed(digits)}%`;
}

function formatCoefficient(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "-";
  return Number(value).toFixed(digits);
}

function getCityMetricGradient(scope: CityScope, metricIndex: number) {
  const palette = cityMetricGradientPalettes[scope] || cityMetricGradientPalettes.overall;
  const [startColor, endColor] = palette[metricIndex % palette.length];
  return {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 1,
    y2: 0,
    colorStops: [
      { offset: 0, color: startColor },
      { offset: 1, color: endColor },
    ],
  };
}

function buildChartOption(buckets: Map<string, Bucket>, roleScope: RoleScope) {
  const gridWidth = 21;
  const gridGap = 2.6;
  const gridLefts = cityScopes.map((_, index) => `${6 + index * (gridWidth + gridGap)}%`);
  const stackMetricLabels = [...metricLabels].reverse();
  const maxValue = Math.max(
    1000,
    ...cityScopes.flatMap((scope) => jobLevels.map((level) => (toAverageBreakdown(buckets.get(`${roleScope}|${scope.key}|${level}`)).avgPretax ?? 0))),
  );
  const axisMax = Math.ceil(maxValue / 3000) * 3000;

  return {
    color: metricLabels.map(({ label }, index) => getSalaryMetricColor(label, index)),
    tooltip: {
      trigger: "item" as const,
      confine: true,
      formatter: (params: { seriesName: string; value: number; axisValue?: string; data?: { scopeTitle?: string; breakdown?: AvgBreakdown } }) => {
        const breakdown = params.data?.breakdown;
        if (!breakdown) return "";
        const lines = [
          `<b>${params.data?.scopeTitle || ""} ${params.axisValue || ""} 级明细</b>`,
          `总计：<b>¥${formatMoney(breakdown.avgPretax)}</b>`,
          `人数：${breakdown.headcount}`,
          ...metricLabels.map(({ key, label }) => `${label}：¥${formatMoney(breakdown[key])}`),
        ];
        return lines.join("<br/>");
      },
    },
    legend: {
      top: 12,
      right: 16,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: "#334155", fontSize: 11 },
      data: metricLabels.map(({ label }) => label),
    },
    title: cityScopes.map((scope, index) => ({
      text: scope.title,
      left: `${6 + index * (gridWidth + gridGap) + gridWidth / 2}%`,
      top: 58,
      textAlign: "center" as const,
      textStyle: { color: scope.color, fontSize: 13, fontWeight: 700 },
    })),
    grid: cityScopes.map((_, index) => ({
      left: gridLefts[index],
      top: 104,
      width: `${gridWidth}%`,
      bottom: 34,
      containLabel: index === 0,
    })),
    xAxis: cityScopes.map((scope, index) => ({
      type: "value" as const,
      gridIndex: index,
      min: 0,
      max: axisMax,
      splitNumber: 4,
      axisLabel: { color: "#7c8aa5", fontSize: 10, hideOverlap: true, formatter: (value: number) => formatMoney(value) },
      axisLine: { lineStyle: { color: "#94a3b8" } },
      axisTick: { show: false },
      splitLine: { show: false },
    })),
    yAxis: cityScopes.map((_, index) => ({
      type: "category" as const,
      gridIndex: index,
      data: jobLevels,
      inverse: true,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { show: index === 0, color: "#334155", fontWeight: 700 },
    })),
    series: cityScopes.flatMap((scope, gridIndex) => stackMetricLabels.map(({ key, label }, stackIndex) => {
      const metricIndex = metricLabels.findIndex((metric) => metric.key === key);
      return {
      name: label,
      type: "bar" as const,
      stack: `${scope.key}-income`,
      xAxisIndex: gridIndex,
      yAxisIndex: gridIndex,
      barWidth: 30,
      emphasis: { focus: "series" as const },
      itemStyle: {
        color: getCityMetricGradient(scope.key, metricIndex),
        borderRadius: stackIndex === stackMetricLabels.length - 1 ? [0, 4, 4, 0] : 0,
      },
      data: jobLevels.map((level) => {
        const breakdown = toAverageBreakdown(buckets.get(`${roleScope}|${scope.key}|${level}`));
        return {
          value: breakdown[key] === null ? null : Math.round(breakdown[key]),
          breakdown,
          scopeTitle: scope.title,
        };
      }),
    };
    })),
  };
}

function MetricCard({ title, value, helper, tone }: { title: string; value: string; helper: string; tone: "blue" | "amber" | "violet" | "teal" }) {
  const toneClass = {
    blue: "bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]",
    amber: "bg-[var(--color-champagne-soft)] text-[#8A6F00]",
    violet: "bg-[var(--color-rose-soft)] text-[var(--color-rose)]",
    teal: "bg-[var(--color-teal-soft)] text-[var(--color-teal)]",
  }[tone];
  const icon = { blue: "$", amber: "%", violet: "◎", teal: "◎" }[tone];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-slate-600">{title}</div>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-bold ${toneClass}`}>{icon}</div>
      </div>
      <div className="text-3xl font-extrabold tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-xs text-slate-500">{helper}</div>
    </div>
  );
}

export default function EmployeeIncomeOverview({ filters }: EmployeeIncomeOverviewProps) {
  const payload = useMemo(() => getIncomeOverview(filters), [filters]);
  const buckets = useMemo(() => new Map(payload.current.map(b => [b.key,b])), [payload]);
  const previousBuckets = useMemo(() => new Map(payload.previous.map(b => [b.key,b])), [payload]);
  const scopedFilters = filters;
  const activeRoleScope: RoleScope = "selectedPositions";
  const chartOption = useMemo(() => buildChartOption(buckets, activeRoleScope), [activeRoleScope, buckets]);
  const hasData = useMemo(() => jobLevels.some((level) => toAverageBreakdown(buckets.get(`${activeRoleScope}|overall|${level}`)).headcount > 0), [activeRoleScope, buckets]);
  const activeTitle = filters.positions.length ? filters.positions.map(roleLabel).join("、") : "全部岗位";
  const overallBreakdown = toAverageBreakdown(buckets.get(`${activeRoleScope}|overall|all`));
  const previousOverallBreakdown = toAverageBreakdown(previousBuckets.get(`${activeRoleScope}|overall|all`));
  const tier1Breakdown = toAverageBreakdown(buckets.get(`${activeRoleScope}|甲类城市|all`));
  const tier2Breakdown = toAverageBreakdown(buckets.get(`${activeRoleScope}|乙类城市|all`));
  const tier3Breakdown = toAverageBreakdown(buckets.get(`${activeRoleScope}|丙类城市|all`));
  const {monthOverMonth,fixedShare,floatingShare,tier2Coefficient,tier3Coefficient} = overviewMetrics(overallBreakdown,previousOverallBreakdown,tier2Breakdown,tier3Breakdown,tier1Breakdown);
  const salaryShareText = `${formatPercent(floatingShare)} / ${formatPercent(fixedShare)}`;
  const momText = monthOverMonth === null ? "暂无上月对比" : `环比 ${monthOverMonth >= 0 ? "+" : ""}${formatPercent(monthOverMonth)}`;

  return (
    <Card
      title="城市等级薪资概况"
      size="small"
      className="rounded-xl border-0 shadow-sm"
      extra={(
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Tag color="#6B8EBF" className="m-0">岗位 × 虚构城市层级 × G1-G5</Tag>
        </div>
      )}
    >
      <>
        {buckets.size && hasData ? (
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard title={`【${activeTitle}】月人均整体收入`} value={formatCurrency(overallBreakdown.avgPretax)} helper={momText} tone="blue" />
            <MetricCard title={`【${activeTitle}】浮动/固定薪资占比`} value={salaryShareText} helper="浮动部分 / 固定部分；固定=基本工资+职级工资" tone="amber" />
            <MetricCard title={`【${activeTitle}】乙类城市薪资系数`} value={formatCoefficient(tier2Coefficient)} helper="以甲类城市为基准" tone="violet" />
            <MetricCard title={`【${activeTitle}】丙类城市薪资系数`} value={formatCoefficient(tier3Coefficient)} helper="以甲类城市为基准" tone="teal" />
          </div>
        ) : null}
        <div className="mb-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">各等级（G1-G5）月人均税前收入对比及构成 - 按虚构城市层级分布</div>
            <Typography.Text type="secondary" className="text-xs">堆叠条为收入构成，条形总长度为月人均税前收入；整体按各类城市总金额 / 当月人数计算，不平均各组均值。</Typography.Text>
          </div>
        </div>
        {buckets.size && hasData ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-sm font-bold text-slate-800">【{activeTitle}】月人均税前收入及构成</div>
              <div className="text-xs text-slate-500">数据周期：{scopedFilters.payrollPeriod || "-"}</div>
            </div>
            <ReactECharts option={chartOption} notMerge style={{ height: 430, width: "100%" }} />
          </div>
        ) : (
          <Empty description="暂无员工薪资概况数据" />
        )}
      </>
      <Typography.Text type="secondary" className="mt-3 block text-xs">
        说明：城市及等级均为虚构维表；其他薪资为显式金额，通用奖金不含评分。空组显示缺失而非零；全部金额单位为元。
      </Typography.Text>
    </Card>
  );
}
