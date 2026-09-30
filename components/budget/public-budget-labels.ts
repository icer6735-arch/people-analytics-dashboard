// Display-only translations; source records and calculation inputs stay unchanged.
const labels: Record<string, string> = {
  "Workforce Planning": "职能管理岗",
  "Business Operations": "业务管理岗",
  "Team Performance": "团队绩效",
  "Shared Success": "共享激励",
  "Performance Rewards": "绩效奖励",
  "Employee Incentive": "个人激励",
  "Quality Incentive": "质量激励",
  "Achievement payout": "业绩奖励",
  "Standard achievement": "基础业绩",
  "Stretch achievement": "进阶业绩",
  "Quality milestone": "质量目标",
  "Quality milestone A": "质量目标 A",
  "Quality milestone B": "质量目标 B",
  "Team Rewards": "团队奖励",
  "Performance Bonus": "绩效奖金",
  "Team result": "团队业绩",
  "Team result A": "团队业绩 A",
  "Team result B": "团队业绩 B",
  "Team Reward": "协作奖励",
  "Collaboration outcome": "协作成果",
  "Delivery outcome": "交付成果",
  "Business Unit A": "业务单元 A",
  "Business Unit B": "业务单元 B",
  "Business Unit C": "业务单元 C",
  "Operations": "运营团队",
  "Sales": "销售团队",
  "Business Support": "业务支持团队",
};

export function budgetDisplayLabel(label: string): string {
  return labels[label] ?? label;
}
