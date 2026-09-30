"use client";
import { ApartmentOutlined, BarChartOutlined, DashboardOutlined, DollarOutlined, FundOutlined, MenuFoldOutlined, MenuUnfoldOutlined, TableOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
const items = [
  { key: "/", icon: <DashboardOutlined />, label: "项目概览" }, { key: "/budget/", icon: <FundOutlined />, label: "预算进度" },
  { key: "/evaluation/", icon: <DollarOutlined />, label: "人力成本评估" }, { key: "/salary-analysis/", icon: <BarChartOutlined />, label: "薪资分析" },
  { key: "/detail/", icon: <TableOutlined />, label: "明细查询" }, { key: "/architecture/", icon: <ApartmentOutlined />, label: "系统架构" },
];
export default function SideNav({ collapsed, onCollapse }: { collapsed: boolean; onCollapse: (value: boolean) => void }) { const pathname = usePathname(); const menuItems = items.map((item) => ({ ...item, label: <Link href={item.key}>{item.label}</Link>, title: collapsed ? item.label : undefined })); return <Layout.Sider width={220} collapsedWidth={80} collapsed={collapsed} theme="light" className={`app-side-nav ${collapsed ? "is-collapsed" : ""}`} trigger={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onCollapse={onCollapse} collapsible><div className="app-side-nav__brand"><DashboardOutlined /><span>{collapsed ? "" : "People Analytics"}</span></div><Menu mode="inline" selectedKeys={[pathname === "/budget" ? "/budget/" : pathname]} items={menuItems} className="app-side-nav__menu" /></Layout.Sider>; }
