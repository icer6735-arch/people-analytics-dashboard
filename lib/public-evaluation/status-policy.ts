export type MetricStatus = 'ok' | 'missing' | 'not-computable';
export function metricStatus(value: number | null, denominator?: number) : MetricStatus {
  if (value === null) return 'missing';
  if (denominator !== undefined && denominator === 0) return 'not-computable';
  return 'ok';
}
