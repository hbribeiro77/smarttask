const DEFAULT_MAX = 3;

export function getFocusDayMaxFromEnvironment(): number {
  if (typeof process === "undefined" || !process.env.NEXT_PUBLIC_FOCUS_DAY_MAX) {
    return DEFAULT_MAX;
  }
  const n = Number.parseInt(process.env.NEXT_PUBLIC_FOCUS_DAY_MAX, 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_MAX;
  return n;
}
