import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import AppShell from "@/components/AppShell";
import "./globals.css";
export const metadata: Metadata = { title: "People Analytics Portfolio", description: "Synthetic people analytics portfolio with a sanitized budget dashboard." };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="zh-CN"><body><AntdRegistry><AppShell>{children}</AppShell></AntdRegistry></body></html>; }
