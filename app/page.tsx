"use client";

import Link from "next/link";
import { ArrowRightOutlined, CheckOutlined, DatabaseOutlined, ExportOutlined, LineChartOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import "./overview.css";

const problemThemes = [
  { title: "减少来回切表", text: "预算、薪资、人力成本和员工明细使用统一的月份和组织筛选，减少在多张表之间反复查找。" },
  { title: "看清数字怎么组成", text: "汇总数字可以继续拆到薪资组成、岗位结构、HC 占比和成本变化，不只停留在总额。" },
  { title: "能够回到明细核对", text: "对 HC、员工月度记录（每名员工每月对应一条记录）、总额和人均值分别定义计算口径，并保留员工月度记录作为核对入口。" },
];

const modules = [
  { number: "01", title: "预算进度", question: "预算与实际使用之间如何随月份和组织范围变化？", description: "查看人力成本、HC 和人均成本的预算/实际对比，支持当月与年初至今视图，并展开明细表复核组成。", tags: ["月份", "组织范围", "当月/累计", "趋势"], href: "/budget/", cta: "查看预算进度", tone: "blue" },
  { number: "02", title: "薪资分析", question: "薪资总额、薪资组成和岗位/区域结构如何随时间变化？", description: "从薪资组成、岗位结构和人均税前薪资趋势出发，比较不同岗位组、等级与区域层级的虚构演示数据。", tags: ["全局筛选", "选月", "岗位比较", "区域比较"], href: "/salary-analysis/", cta: "查看薪资分析", tone: "teal" },
  { number: "03", title: "人力成本评估", question: "HC、总人力成本、人均成本和岗位结构之间如何对应？", description: "联动查看当前 HC、人力成本、人均成本、成本环比、HC/成本趋势，以及岗位组的 HC 占比、成本占比和结构差。", tags: ["月份", "岗位组", "双趋势", "结构比较"], href: "/evaluation/", cta: "查看人力成本评估", tone: "violet" },
  { number: "04", title: "明细查询", question: "需要核对某个员工或月份时，如何查到对应的员工月度薪资记录？", description: "可按关键词、月份、组织、岗位组、等级和地点筛选虚构薪资明细，并支持排序、分页、汇总和 CSV 导出。", tags: ["多维筛选", "搜索", "分页", "CSV"], href: "/detail/", cta: "查看明细查询", tone: "amber" },
];

const scopeItems = [
  ["4", "核心分析模块"], ["员工月度记录", "统一数据口径"], ["月度", "趋势分析"], ["多维", "筛选与下钻"], ["虚构演示数据", "公开数据"], ["静态页面", "静态导出"],
];

const duties = [
  "把需求拆成预算、薪资、成本评估和明细查询四个页面。",
  "定义 HC、员工月度记录、人均值、成本组成、趋势和岗位结构的计算口径。",
  "统一员工月度数据口径，确保薪资分析、人力成本评估和明细查询的数据能够相互对应。",
  "移除真实数据、企业 API、数据库、身份、权限和内部 KPI 规则，记录未迁移的能力。",
  "做数据校验、静态构建、浏览器交互检查和视觉验收。",
];

export default function ProjectOverviewPage() {
  return <main className="overview-page page-shell page-shell--portfolio">
    <section className="overview-hero" aria-labelledby="overview-title">
      <div className="overview-hero-copy">
        <span className="overview-eyebrow">HR 数据分析作品集</span>
        <h1 id="overview-title">人力数据<br /><em>分析看板</em></h1>
        <p className="overview-hero-subtitle">面向 HR 的人力数据分析看板。围绕预算进度、薪资结构、人力成本和员工月度明细，整理出一套可以直接查询和核对的分析页面。</p>
        <div className="overview-hero-actions"><Link className="overview-button overview-button--primary" href="#modules">查看四个分析模块 <ArrowRightOutlined /></Link><Link className="overview-button overview-button--quiet" href="/architecture/">了解系统架构 <ExportOutlined /></Link></div>
        <p className="overview-hero-note"><SafetyCertificateOutlined /> 公开版使用虚构演示数据，不连接原企业 API、数据库、身份或权限系统。</p>
      </div>
      <div className="overview-hero-aside" aria-label="项目摘要">
        <span className="overview-aside-index">01 / 项目作品</span>
        <div className="overview-hero-line" />
        <p>从预算和薪资结果出发，可以继续查看成本结构和员工月度明细。</p>
        <span className="overview-aside-caption">HR · 人力数据分析 · AI辅助开发</span>
      </div>
    </section>

    <section className="overview-section overview-problem" aria-labelledby="problem-title">
      <div className="overview-section-heading"><span className="overview-section-kicker">01 / 项目问题</span><h2 id="problem-title">这个项目解决什么问题？</h2><p>原始业务数据分散在预算、薪资、人力成本和员工明细中。如果各页面的月份、组织范围和计算口径不一致，同一个指标很容易出现不同结果。</p></div>
      <div className="overview-problem-grid">{problemThemes.map((item, index) => <article className="overview-problem-item" key={item.title}><span className="overview-item-number">0{index + 1}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
    </section>

    <section className="overview-section overview-duties" aria-labelledby="duties-title">
      <div className="overview-duty-intro"><span className="overview-section-kicker">02 / 我的职责</span><h2 id="duties-title">我的职责</h2><p>我主要负责需求拆解、指标口径、页面流程和最终验收。开发过程中，我也持续核对数据结果、测试交互，并决定哪些原系统能力适合迁移到公开版。</p></div>
      <div className="overview-duty-list">{duties.map((duty) => <div className="overview-duty-row" key={duty}><CheckOutlined /><span>{duty}</span></div>)}</div>
    </section>

    <section className="overview-section overview-modules" id="modules" aria-labelledby="modules-title">
      <div className="overview-section-heading overview-modules-heading"><div><span className="overview-section-kicker">03 / 核心分析模块</span><h2 id="modules-title">四个核心分析模块</h2></div><p>四个页面分别对应预算、薪资、成本评估和明细查询，打开后可以直接查看对应数据。</p></div>
      <div className="overview-module-grid">{modules.map((item) => <article className={`overview-module-card overview-module-card--${item.tone}`} key={item.title}><div className="overview-module-top"><span>{item.number}</span><LineChartOutlined /></div><h3>{item.title}</h3><p className="overview-module-question">{item.question}</p><p className="overview-module-description">{item.description}</p><div className="overview-module-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><Link className="overview-module-link" href={item.href}>{item.cta} <ArrowRightOutlined /></Link></article>)}</div>
    </section>

    <section className="overview-section overview-scope" aria-labelledby="scope-title">
      <div className="overview-scope-heading"><span className="overview-section-kicker">04 / 项目范围</span><h2 id="scope-title">项目范围</h2><p>公开版保留四个页面：预算进度、薪资分析、人力成本评估和明细查询。</p></div>
      <div className="overview-scope-list">{scopeItems.map(([value, label]) => <div className="overview-scope-item" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
    </section>

    <section className="overview-section overview-trust" aria-labelledby="trust-title">
      <div className="overview-trust-copy"><span className="overview-section-kicker">05 / 数据可信与公开边界</span><h2 id="trust-title">数据可信与公开边界</h2><p>公开版保留预算、薪资、成本评估和明细查询的页面结构，但不连接原系统的企业数据链。页面结果来自仓库内的虚构演示数据，经公开数据适配层和计算逻辑生成。</p><div className="overview-trust-checks"><span><CheckOutlined /> 无真实员工数据</span><span><CheckOutlined /> 无原企业 API / 数据库</span><span><CheckOutlined /> 无身份系统 / 权限系统</span><span><CheckOutlined /> 无企业 KPI</span></div></div>
      <div className="overview-data-flow"><span>虚构演示数据</span><ArrowRightOutlined /><span>公开数据适配层</span><ArrowRightOutlined /><span>计算层</span><ArrowRightOutlined /><span>静态页面</span></div>
    </section>

    <section className="overview-section overview-ai" aria-labelledby="ai-title">
      <div className="overview-ai-label"><span className="overview-section-kicker">06 / 开发方式</span><span className="overview-ai-mark">AI</span></div><div><h2 id="ai-title">AI 辅助开发</h2><p>生成式 AI 用于代码探索、实现辅助与测试；业务需求拆解、指标定义、数据边界、产品取舍与最终验收由人工负责。</p><small>指标口径、数据边界和最终验收由人工负责。</small></div>
    </section>

    <section className="overview-section overview-architecture" aria-labelledby="architecture-title"><div><span className="overview-section-kicker">07 / 系统架构案例</span><h2 id="architecture-title">系统架构说明</h2><p>说明原系统与公开作品集的边界，以及虚构演示数据如何经过适配层和计算层进入静态页面。</p></div><Link className="overview-architecture-link" href="/architecture/"><span>系统架构案例<br /><b>待完善</b></span><ExportOutlined /></Link></section>

    <section className="overview-scope-boundary" aria-label="公开范围说明"><DatabaseOutlined /><p><strong>公开边界</strong>　公开版不迁移原系统的数据导入、映射配置、权限管理或数据库管理后台；这些能力将在架构案例中作为设计取舍说明。</p></section>
  </main>;
}
