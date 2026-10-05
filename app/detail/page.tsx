"use client";

import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Cascader, Empty, Input, Select, Segmented, Space, Switch, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { aggregateDetailRows, sortDetailRows } from "../../lib/public-detail/calculations";
import { detailGrades, detailLocations, detailPeriods, detailRoles, organizationTree, publicDetailRows } from "../../lib/public-detail/adapter";
import { filterDetailRows } from "../../lib/public-detail/filter-detail-data";
import type { DetailFilters, DetailRow, DetailSort } from "../../lib/public-detail/types";
import "./detail.css";

const { Text } = Typography;
const money = new Intl.NumberFormat("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 });
const emptyFilters: DetailFilters = { period: "", orgPath: [], roleFamilyId: "", gradeBand: "", locationId: "", keyword: "" };
const exportFields = [
  ["employee_id", "员工编号"], ["period", "计薪周期"], ["organization_path", "所属架构"], ["role_label", "岗位组"],
  ["grade_band", "等级"], ["location_label", "地点"], ["base_pay", "基本工资"], ["level_pay", "职级薪资"],
  ["performance_pay", "绩效薪资"], ["kpi_bonus", "通用奖金"], ["other_pay", "其他薪资"], ["pretax_pay", "税前合计"],
] as const;

function moneyValue(value: number | null) { return value == null ? "—" : money.format(value); }
function csvCell(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function exportCsv(rows: DetailRow[]) {
  const lines = [exportFields.map(([, label]) => csvCell(label)).join(",")];
  rows.forEach((row) => lines.push(exportFields.map(([key]) => csvCell(row[key as keyof DetailRow])).join(",")));
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob); const link = document.createElement("a");
  link.href = url; link.download = `salary-detail-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
}

export default function DetailPage() {
  const [draft, setDraft] = useState<DetailFilters>(emptyFilters);
  const [filters, setFilters] = useState<DetailFilters>(emptyFilters);
  const [aggregateEnabled, setAggregateEnabled] = useState(false);
  const [sort, setSort] = useState<DetailSort>({ key: "period", direction: "descend" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filteredRows = useMemo(() => filterDetailRows(publicDetailRows, filters), [filters]);
  const displayedRows = useMemo(() => sortDetailRows(aggregateEnabled ? aggregateDetailRows(filteredRows) : filteredRows, sort), [aggregateEnabled, filteredRows, sort]);
  const apply = () => {
    setLoading(true); setError(null);
    window.setTimeout(() => { setFilters({ ...draft, keyword: draft.keyword.trim() }); setLoading(false); }, 0);
  };
  const reset = () => { setDraft(emptyFilters); setLoading(true); setError(null); window.setTimeout(() => { setFilters(emptyFilters); setLoading(false); }, 0); };
  const columns: ColumnsType<DetailRow> = [
    { title: "员工编号", dataIndex: "employee_id", key: "employee_id", width: 120, fixed: "left", sorter: true },
    { title: "计薪周期", dataIndex: "period", key: "period", width: 110, fixed: "left", sorter: true },
    { title: "所属架构", dataIndex: "organization_path", key: "organization_label", width: 230, ellipsis: true, sorter: true },
    { title: "岗位组", dataIndex: "role_label", key: "role_label", width: 135, sorter: true },
    { title: "等级", dataIndex: "grade_band", key: "grade_band", width: 90, sorter: true },
    { title: "地点", dataIndex: "location_label", key: "location_label", width: 120, sorter: true },
    { title: "基本工资", dataIndex: "base_pay", key: "base_pay", width: 130, align: "right", sorter: true, render: moneyValue },
    { title: "职级薪资", dataIndex: "level_pay", key: "level_pay", width: 120, align: "right", render: moneyValue },
    { title: "绩效薪资", dataIndex: "performance_pay", key: "performance_pay", width: 120, align: "right", render: moneyValue },
    { title: "通用奖金", dataIndex: "kpi_bonus", key: "kpi_bonus", width: 120, align: "right", render: moneyValue },
    { title: "其他薪资", dataIndex: "other_pay", key: "other_pay", width: 110, align: "right", render: moneyValue },
    { title: "税前合计", dataIndex: "pretax_pay", key: "pretax_pay", width: 135, align: "right", sorter: true, render: (value) => <strong>{moneyValue(value)}</strong> },
    { title: "数据来源", dataIndex: "merged_count", key: "merged_count", width: 145, render: (value) => value && value > 1 ? <Tag color="blue">合并 {value} 条</Tag> : <Text type="secondary">单条事实</Text> },
  ];
  const handleTableChange = (_pagination: unknown, _filters: unknown, sorter: unknown) => {
    const item = Array.isArray(sorter) ? sorter[0] : sorter as { field?: string; order?: "ascend" | "descend" | null };
    if (!item?.field || !item.order) return setSort({ key: "period", direction: "descend" });
    const keyMap: Record<string, DetailSort["key"]> = { employee_id: "employee_id", period: "period", organization_path: "organization_label", role_label: "role_label", grade_band: "grade_band", location_label: "location_label", base_pay: "base_pay", pretax_pay: "pretax_pay" };
    if (keyMap[item.field]) setSort({ key: keyMap[item.field], direction: item.order });
  };
  return <div className="detail-page">
    <div className="detail-header"><div><h1>明细查询</h1><Text type="secondary">薪资底层明细查询与筛选</Text></div><Button type="primary" icon={<DownloadOutlined />} disabled={!displayedRows.length} onClick={() => { exportCsv(displayedRows); message.success("已导出当前筛选的全部合成明细"); }}>导出当前筛选 (CSV)</Button></div>
    <Card className="detail-control-card">
      <div className="detail-type-row"><Text type="secondary">数据类型：</Text><Segmented value="salary" options={[{ label: "Salary 明细", value: "salary" }, { label: "KPI 明细（未迁移）", value: "kpi", disabled: true }, { label: "薪资调整（未迁移）", value: "adjustment", disabled: true }]} /></div>
      <div className="detail-filter-grid">
        <label><span>关键词</span><Input allowClear value={draft.keyword} onChange={(event) => setDraft({ ...draft, keyword: event.target.value })} onPressEnter={apply} placeholder="员工编号 / 组织 / 岗位组" prefix={<SearchOutlined />} /></label>
        <label><span>统计月份</span><Select allowClear value={draft.period || undefined} options={detailPeriods.map((value) => ({ label: value, value }))} onChange={(value) => setDraft({ ...draft, period: value ?? "" })} placeholder="全部月份" /></label>
        <label className="detail-org-field"><span>组织范围</span><Cascader allowClear options={organizationTree()} value={draft.orgPath} onChange={(value) => setDraft({ ...draft, orgPath: value.map(String) })} placeholder="全部组织" /></label>
        <label><span>岗位组</span><Select allowClear value={draft.roleFamilyId || undefined} options={detailRoles} onChange={(value) => setDraft({ ...draft, roleFamilyId: value ?? "" })} placeholder="全部岗位组" /></label>
        <label><span>等级</span><Select allowClear value={draft.gradeBand || undefined} options={detailGrades} onChange={(value) => setDraft({ ...draft, gradeBand: value ?? "" })} placeholder="全部等级" /></label>
        <label><span>地点</span><Select allowClear value={draft.locationId || undefined} options={detailLocations} onChange={(value) => setDraft({ ...draft, locationId: value ?? "" })} placeholder="全部地点" /></label>
        <Space className="detail-actions"><Button type="primary" icon={<SearchOutlined />} onClick={apply}>查询</Button><Button onClick={reset}>重置</Button></Space>
      </div>
      <div className="detail-secondary-row"><Switch checked={aggregateEnabled} onChange={setAggregateEnabled} /><span>按员工编号 + 计薪周期聚合</span><Text type="secondary">保留原交互；当前公开事实通常为一人一月一条</Text></div>
    </Card>
    <Card className="detail-table-card">
      <div className="detail-summary"><div><strong>{aggregateEnabled ? `聚合后 ${displayedRows.length} 组` : `当前展示 ${displayedRows.length} 条`}</strong><Text type="secondary">　/　筛选结果 {filteredRows.length} 条</Text></div><Text type="secondary">仅含 synthetic salary facts</Text></div>
      {error ? <Alert type="error" showIcon message="明细数据加载失败" description={error} /> : <Table<DetailRow> loading={loading} rowKey="row_key" columns={columns} dataSource={displayedRows} onChange={handleTableChange} scroll={{ x: 1680, y: 600 }} sticky pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ["10", "20", "50"], showTotal: (total) => `共 ${integer.format(total)} 条` }} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有匹配的明细" /> }} />}
    </Card>
    <div className="detail-notice">Data Notice：本页仅展示公开 Demo synthetic 数据；编号、组织、岗位与薪资均为虚构，不包含真实员工标识或企业业务数据。</div>
  </div>;
}
