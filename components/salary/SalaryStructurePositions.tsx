"use client";

import { Alert, Card, Empty, Select } from "antd";
import ReactECharts from "echarts-for-react";
import type { SalaryStructureAnalysisData, SalaryStructurePie } from "@/lib/public-salary/types";
import { getSalaryMetricColor, SALARY_CHART_PALETTE } from "@/components/salary/chart-colors";

export type { SalaryStructureAnalysisData, SalaryStructurePie } from "@/lib/public-salary/types";

type SalaryStructurePositionsProps = {
  data: SalaryStructureAnalysisData | null;
  viewType: "当月" | "累计";
  selectedPositions: string[];
  onSelectedPositionsChange: (positions: string[]) => void;
  title?: string;
  cumulativeChartTitle?: string;
  hideTitle?: boolean;
  hidePositionSelector?: boolean;
  chartHeight?: number;
  pieScale?: number;
  singleCumulativePie?: boolean;
  singleCumulativeDescription?: string;
  dualCumulativePies?: boolean;
};

function formatMoney(value: number) {
  return Math.round(Number(value || 0)).toLocaleString("zh-CN");
}

function isAllSelected(selectedPositions: string[], allPositions: string[]) {
  return allPositions.length > 0 && selectedPositions.length === allPositions.length;
}

function scalePercent(value: number, scale: number) {
  return `${Number((value * scale).toFixed(2))}%`;
}

function buildPieOption(pie: SalaryStructurePie, titleText?: string, pieScale = 1) {
  const rows = pie.subjects;
  const hasChartTitle = Boolean(titleText);
  const radius = hasChartTitle ? [36, 58] : [34, 56];
  return {
    color: SALARY_CHART_PALETTE,
    title: hasChartTitle ? {
      text: titleText,
      left: "center" as const,
      top: 6,
      textStyle: { color: "#0f172a", fontSize: 14, fontWeight: 700 },
    } : undefined,
    tooltip: {
      trigger: "item" as const,
      formatter: (params: { marker: string; name: string; value: number; percent: number; data?: { amount?: number; share?: number } }) => [
        `<div style="font-weight:600;margin-bottom:6px">${params.name}</div>`,
        `${params.marker}金额：<b>${formatMoney(params.data?.amount ?? params.value)}</b>`,
        `占比：<b>${Number(params.data?.share ?? params.percent ?? 0).toFixed(1)}%</b>`,
      ].join("<br/>"),
    },
    legend: {
      bottom: 0,
      left: "center",
      type: "scroll" as const,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: "#475569", fontSize: 10 },
    },
    series: [{
      name: pie.title,
      type: "pie" as const,
      radius: radius.map((value) => scalePercent(value, pieScale)),
      center: ["50%", hasChartTitle ? "50%" : "42%"],
      stillShowZeroSum: false,
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 },
      label: {
        formatter: (params: { name: string; percent?: number }) => `${params.name.length > 7 ? `${params.name.slice(0, 7)}…` : params.name}\n${Number(params.percent || 0).toFixed(1)}%`,
        color: "#334155",
        fontSize: 10,
        width: 76,
        overflow: "truncate" as const,
      },
      labelLine: { length: 8, length2: 6, maxSurfaceAngle: 80 },
      data: rows.map((row, index) => ({
        name: row.name,
        value: row.amount,
        amount: row.amount,
        share: row.share,
        itemStyle: { color: getSalaryMetricColor(row.name, index) },
      })),
      emphasis: { scale: false },
    }],
  };
}

export default function SalaryStructurePositions({
  data,
  viewType,
  selectedPositions,
  onSelectedPositionsChange,
  title = "岗位薪酬结构占比",
  cumulativeChartTitle = "累计薪酬结构占比",
  hideTitle = false,
  hidePositionSelector = false,
  chartHeight = 500,
  pieScale = 1,
  singleCumulativePie = false,
  singleCumulativeDescription,
  dualCumulativePies = false,
}: SalaryStructurePositionsProps) {
  const positions = data?.positions || [];
  const allSelected = isAllSelected(selectedPositions, positions);
  const selectValue = allSelected ? positions : selectedPositions;
  const positionPies = data?.positionPies || data?.pies || [];
  const isMonthlyView = viewType === "当月";
  const visiblePies = positionPies;
  const cumulativePie = data?.cumulativePie || data?.pies?.[0] || null;

  return (
    <Card title={hideTitle ? undefined : title} size="small" className="salary-compact-card rounded-2xl border-0 shadow-sm">
      {!hidePositionSelector && (
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm font-medium text-slate-700">选择岗位</span>
            <Select
              mode="multiple"
              allowClear
              showSearch
              maxTagCount="responsive"
              className="min-w-[320px] md:min-w-[520px]"
              value={selectValue}
              options={positions.map((position) => ({ label: position, value: position }))}
              placeholder="请选择岗位"
              onChange={onSelectedPositionsChange}
            />
          </div>
          <div className="text-xs text-slate-500">默认全选；清空后需至少选择一个岗位</div>
        </div>
      )}

      {!data || !positions.length ? (
        <Empty description="暂无岗位薪酬结构数据" />
      ) : dualCumulativePies ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {visiblePies.map((pie) => (
            <div key={pie.key} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              {singleCumulativeDescription && (
                <div className="mb-2 text-center text-xs font-medium text-slate-500">{singleCumulativeDescription}</div>
              )}
              <ReactECharts option={buildPieOption(pie, pie.positionName || pie.title, pieScale)} notMerge style={{ height: chartHeight, width: "100%" }} />
              <div className="text-center text-xs text-slate-500">累计税前合计 {formatMoney(pie.total)}</div>
            </div>
          ))}
        </div>
      ) : singleCumulativePie && cumulativePie ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          {singleCumulativeDescription && (
            <div className="mb-2 text-center text-xs font-medium text-slate-500">{singleCumulativeDescription}</div>
          )}
          <ReactECharts option={buildPieOption(cumulativePie, cumulativeChartTitle, pieScale)} notMerge style={{ height: chartHeight, width: "100%" }} />
          <div className="text-center text-xs text-slate-500">累计税前合计 {formatMoney(cumulativePie.total)}</div>
        </div>
      ) : selectedPositions.length === 0 && !allSelected ? (
        <Alert type="warning" showIcon title="请选择至少一个岗位" />
      ) : !visiblePies.length ? (
        <Empty description="请选择至少一个岗位" />
      ) : !isMonthlyView ? (
        <div className="salary-position-pie-scroll">
          {visiblePies.map((pie) => (
            <div key={pie.key} className="salary-position-pie-card bg-slate-50/70 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="truncate text-sm font-semibold text-slate-900" title={pie.title}>{pie.title}</div>
                <div className="shrink-0 text-xs text-slate-500">{isMonthlyView ? "当月人数" : "跨月去重人数"} {pie.hc} · 员工月 {pie.employeeMonths}</div>
              </div>
              <ReactECharts option={buildPieOption(pie, undefined, pieScale)} notMerge style={{ height: chartHeight, width: "100%" }} />
              <div className="text-center text-xs text-slate-500">税前合计 {formatMoney(pie.total)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="salary-position-pie-scroll">
          {visiblePies.map((pie) => (
            <div key={pie.key} className="salary-position-pie-card bg-slate-50/70 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="truncate text-sm font-semibold text-slate-900" title={pie.title}>{pie.title}</div>
                <div className="shrink-0 text-xs text-slate-500">{isMonthlyView ? "当月人数" : "跨月去重人数"} {pie.hc} · 员工月 {pie.employeeMonths}</div>
              </div>
              <ReactECharts option={buildPieOption(pie, undefined, pieScale)} notMerge style={{ height: 380, width: "100%" }} />
              <div className="text-center text-xs text-slate-500">税前合计 {formatMoney(pie.total)}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
