"use client";
import { Layout } from "antd";
import { useState } from "react";
import SideNav from "./SideNav";
export default function AppShell({ children }: { children: React.ReactNode }) { const [collapsed, setCollapsed] = useState(false); return <Layout className="app-shell"><SideNav collapsed={collapsed} onCollapse={setCollapsed} /><Layout className="app-main-layout"><Layout.Content className="app-content">{children}</Layout.Content></Layout></Layout>; }
