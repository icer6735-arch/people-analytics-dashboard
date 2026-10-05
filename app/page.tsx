"use client";

import Link from "next/link";
import { ArrowRightOutlined, CheckOutlined, DatabaseOutlined, ExportOutlined, LineChartOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import "./overview.css";

const problemThemes = [
  { title: "统一查看", text: "以月份和组织范围为入口，依次查看预算使用、薪资结构、人力成本和员工月度明细，减少在多个孤立表格之间切换。" },
  { title: "解释结构", text: "通过薪资组成、岗位结构、HC 占比与成本占比、趋势和下钻明细，理解数字的组成，而不是只看一个汇总值。" },
  { title: "复核口径", text: "明确 HC、employee-month、总额/人数、人力成本组成以及 0 与缺失的区别，避免把不可计算的结果伪装成 0。" },
];

const modules = [
  { number: "01", title: "预算进度", question: "预算与实际使用之间如何随月份和组织范围变化？", description: "查看人力成本、HC 和人均成本的预算/实际对比，支持当月与年初至今视图，并展开明细表复核组成。", tags: ["月份", "组织范围", "当月/累计", "趋势"], href: "/budget/", cta: "查看预算进度", tone: "blue" },
  { number: "02", title: "薪资分析", question: "薪资总额、薪资组成和岗位/区域结构如何随时间变化？", description: "从薪资组成、岗位结构和人均税前薪资趋势出发，比较不同岗位组、等级与区域层级的公开 synthetic 事实。", tags: ["全局筛选", "选月", "岗位比较", "区域比较"], href: "/salary-analysis/", cta: "查看薪资分析", tone: "teal" },
  { number: "03", title: "人力成本评估", question: "HC、总人力成本、人均成本和岗位结构之间有什么可解释的关系？", description: "联动查看当前 HC、人力成本、人均成本、成本环比、HC/成本趋势，以及岗位组的 HC 占比、成本占比和结构差。", tags: ["月份", "岗位组", "双趋势", "结构比较"], href: "/evaluation/", cta: "查看人力成本评估", tone: "violet" },
  { number: "04", title: "明细查询", question: "如何从分析结果下钻到可复核的 employee-month 薪资事实？", description: "在公开 synthetic salary facts 上进行关键词、月份、组织、岗位组、等级和地点筛选，支持排序、分页、聚合和 CSV 导出。", tags: ["多维筛选", "搜索", "分页", "CSV"], href: "/detail/", cta: "查看明细查询", tone: "amber" },
];

const scopeItems = [
  ["4", "核心分析模块"], ["employee-month", "统一事实粒度"], ["月度", "趋势分析"], ["多维", "筛选与下钻"], ["Synthetic", "公开数据"], ["Static", "静态导出"],
];

const duties = [
  "将 HR / People Analytics 问题拆解为预算、薪资、成本评估和明细查询四个分析场景。",
  "定义 HC、employee-month、人均值、成本组成、趋势和岗位结构等公开指标的计算边界。",
  "设计共享的 synthetic employee-month universe，确保 Salary、Evaluation 与 Detail 使用一致事实。",
  "移除真实数据、企业 API、数据库、身份、权限和内部 KPI 规则，并对每个未迁移能力做出明确取舍。",
  "通过数据校验、静态构建、浏览器交互检查和视觉验收确认交付质量。",
];

export default function ProjectOverviewPage() {
  return <main className="overview-page">
    <section className="overview-hero" aria-labelledby="overview-title">
      <div className="overview-hero-copy">
        <span className="overview-eyebrow">PUBLIC PEOPLE ANALYTICS CASE STUDY</span>
        <h1 id="overview-title">People Analytics<br /><em>Dashboard</em></h1>
        <p className="overview-hero-subtitle">面向 HR 与 People Analytics 的公开分析产品案例：从预算使用、薪资结构、人力成本到明细查询，建立一条可筛选、可解释、可复核的分析旅程。</p>
        <div className="overview-hero-actions"><Link className="overview-button overview-button--primary" href="#modules">查看四个分析模块 <ArrowRightOutlined /></Link><Link className="overview-button overview-button--quiet" href="/architecture/">了解系统架构 <ExportOutlined /></Link></div>
        <p className="overview-hero-note"><SafetyCertificateOutlined /> 使用完全虚构的 synthetic data；不连接原企业 API、数据库、身份系统或权限系统。</p>
      </div>
      <div className="overview-hero-aside" aria-label="项目摘要">
        <span className="overview-aside-index">01 / PORTFOLIO</span>
        <div className="overview-hero-line" />
        <p>把复杂的人力数据组织成可解释、可比较、可复核的分析产品。</p>
        <span className="overview-aside-caption">HR · PEOPLE ANALYTICS · AI-HR</span>
      </div>
    </section>

    <section className="overview-section overview-problem" aria-labelledby="problem-title">
      <div className="overview-section-heading"><span className="overview-section-kicker">01 / THE PROBLEM</span><h2 id="problem-title">这个项目解决什么问题？</h2><p>People Analytics 的难点不只是展示数字，而是让不同粒度的数据在同一筛选范围下保持可解释、可比较、可复核。</p></div>
      <div className="overview-problem-grid">{problemThemes.map((item, index) => <article className="overview-problem-item" key={item.title}><span className="overview-item-number">0{index + 1}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
    </section>

    <section className="overview-section overview-duties" aria-labelledby="duties-title">
      <div className="overview-duty-intro"><span className="overview-section-kicker">02 / MY CONTRIBUTION</span><h2 id="duties-title">我的职责</h2><p>我负责把一个复杂的人力分析产品拆成可公开验证的用户旅程，并对指标、数据边界和最终体验负责。</p></div>
      <div className="overview-duty-list">{duties.map((duty) => <div className="overview-duty-row" key={duty}><CheckOutlined /><span>{duty}</span></div>)}</div>
    </section>

    <section className="overview-section overview-modules" id="modules" aria-labelledby="modules-title">
      <div className="overview-section-heading overview-modules-heading"><div><span className="overview-section-kicker">03 / ANALYSIS MODULES</span><h2 id="modules-title">四个核心分析模块</h2></div><p>从计划与实际，到结构与明细；每个页面都可以直接打开验证。</p></div>
      <div className="overview-module-grid">{modules.map((item) => <article className={`overview-module-card overview-module-card--${item.tone}`} key={item.title}><div className="overview-module-top"><span>{item.number}</span><LineChartOutlined /></div><h3>{item.title}</h3><p className="overview-module-question">{item.question}</p><p className="overview-module-description">{item.description}</p><div className="overview-module-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><Link className="overview-module-link" href={item.href}>{item.cta} <ArrowRightOutlined /></Link></article>)}</div>
    </section>

    <section className="overview-section overview-scope" aria-labelledby="scope-title">
      <div className="overview-scope-heading"><span className="overview-section-kicker">04 / PROJECT SCOPE</span><h2 id="scope-title">Project Scope</h2><p>公开项目聚焦一条完整但可控的 People Analytics 分析旅程。</p></div>
      <div className="overview-scope-list">{scopeItems.map(([value, label]) => <div className="overview-scope-item" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
    </section>

    <section className="overview-section overview-trust" aria-labelledby="trust-title">
      <div className="overview-trust-copy"><span className="overview-section-kicker">05 / TRUST & BOUNDARY</span><h2 id="trust-title">数据可信与公开边界</h2><p>公开版保留可解释的分析结构和交互方式，但不公开原系统的企业数据链。所有展示数据均来自仓库内的 synthetic JSON，并通过 Public Adapter 和纯函数计算生成页面结果。</p><div className="overview-trust-checks"><span><CheckOutlined /> 无真实员工数据</span><span><CheckOutlined /> 无原企业 API / DB</span><span><CheckOutlined /> 无 auth / permission</span><span><CheckOutlined /> 无企业 KPI</span></div></div>
      <div className="overview-data-flow"><span>Synthetic JSON</span><ArrowRightOutlined /><span>Public Adapter</span><ArrowRightOutlined /><span>Calculation Layer</span><ArrowRightOutlined /><span>Static UI</span></div>
    </section>

    <section className="overview-section overview-ai" aria-labelledby="ai-title">
      <div className="overview-ai-label"><span className="overview-section-kicker">06 / WORKFLOW</span><span className="overview-ai-mark">AI</span></div><div><h2 id="ai-title">AI-assisted Development</h2><p>Generative AI 用于代码探索、实现辅助与测试；业务需求拆解、指标定义、数据边界、产品取舍与最终验收由人工负责。</p><small>AI 加速探索与验证，但不会替代对 HR 业务口径、隐私风险或公开可信度的判断。</small></div>
    </section>

    <section className="overview-section overview-architecture" aria-labelledby="architecture-title"><div><span className="overview-section-kicker">07 / ARCHITECTURE CASE STUDY</span><h2 id="architecture-title">系统架构说明</h2><p>查看 Internal System 与 Public Portfolio 的边界，以及 synthetic data 如何经过 adapter 和计算层进入静态页面。</p></div><Link className="overview-architecture-link" href="/architecture/"><span>Architecture case study<br /><b>Coming next</b></span><ExportOutlined /></Link></section>

    <section className="overview-scope-boundary" aria-label="公开范围说明"><DatabaseOutlined /><p><strong>Scope boundary</strong>　公开版不迁移原系统的数据导入、映射配置、权限管理或数据库管理后台；这些能力将在架构案例中作为设计取舍说明。</p></section>
  </main>;
}
