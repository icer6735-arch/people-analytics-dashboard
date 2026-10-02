export const SALARY_CHART_PALETTE = [
  "#7FA7F8",
  "#E8C94D",
  "#0F8F8E",
  "#AFC4F5",
  "#E97BB7",
  "#9CA3AF",
] as const;

export const SALARY_CHART_COLORS = {
  primaryBlue: SALARY_CHART_PALETTE[0],
  accentYellow: SALARY_CHART_PALETTE[1],
  accentGreen: SALARY_CHART_PALETTE[2],
  accentCyan: SALARY_CHART_PALETTE[3],
  accentRed: SALARY_CHART_PALETTE[4],
  neutralGray: SALARY_CHART_PALETTE[5],
} as const;

export const SALARY_METRIC_COLOR_MAP:Record<string,string>={基本工资:SALARY_CHART_COLORS.primaryBlue,职级工资:SALARY_CHART_COLORS.accentCyan,绩效薪资:SALARY_CHART_COLORS.accentYellow,通用奖金:SALARY_CHART_COLORS.accentGreen,其他薪资:SALARY_CHART_COLORS.neutralGray};
export function getSalaryMetricColor(name:string,index=0){return SALARY_METRIC_COLOR_MAP[name]??SALARY_CHART_PALETTE[index%SALARY_CHART_PALETTE.length];}
