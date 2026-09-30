export function normalizePayrollPeriod(value: unknown) {
  const text = String(value ?? "").trim().replace(/^\uFEFF/, "").replace(/\s+/g, "");
  const compactShortMatch = text.match(/^(\d{2})(\d{2})$/);
  const compactFullMatch = text.match(/^(\d{4})(\d{2})$/);
  const separatedMatch = text.match(/^(\d{4})[/-](\d{1,2})(?:[/-]\d{1,2})?$/);
  const year = separatedMatch ? separatedMatch[1] : compactFullMatch ? compactFullMatch[1] : compactShortMatch ? `20${compactShortMatch[1]}` : "";
  const month = Number(separatedMatch ? separatedMatch[2] : compactFullMatch ? compactFullMatch[2] : compactShortMatch ? compactShortMatch[2] : NaN);
  if (!year || !Number.isInteger(month) || month < 1 || month > 12) return "";
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function normalizeMonthHeader(value: unknown) {
  return normalizePayrollPeriod(value);
}

export function looksLikeMonthToken(value: unknown) {
  const text = String(value ?? "").trim().replace(/^\uFEFF/, "").replace(/\s+/g, "");
  return /^(\d{2}|\d{4})(\d{2})$/.test(text) || /^\d{4}[/-]\d{1,2}(?:[/-]\d{1,2})?$/.test(text);
}

export function comparePayrollPeriodDesc(left: string, right: string) {
  return right.localeCompare(left, "zh-CN", { numeric: true });
}

export function normalizePayrollPeriodList(values: unknown[]) {
  return Array.from(new Set(values.map(normalizePayrollPeriod).filter(Boolean))).sort(comparePayrollPeriodDesc);
}
