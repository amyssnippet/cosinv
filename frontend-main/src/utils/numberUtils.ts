// Number utility functions

export function formatNumber(num: number, locale = 'en-US'): string {
  return num.toLocaleString(locale);
}

export function roundTo(num: number, decimals: number): number {
  return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
}

export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}