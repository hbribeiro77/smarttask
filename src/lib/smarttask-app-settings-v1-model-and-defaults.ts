import { getFocusDayMaxFromEnvironment } from "@/lib/smarttask-config-focus-day-max-from-environment";

/** Limite superior razoável para o seletor na UI (evita listas enormes em “Foco”). */
export const SMARTTASK_FOCUS_DAY_MAX_USER_SELECTABLE_CAP = 20;

export interface SmarttaskAppSettingsV1 {
  focus_day_max: number;
}

export function defaultSmarttaskAppSettingsV1(): SmarttaskAppSettingsV1 {
  return {
    focus_day_max: getFocusDayMaxFromEnvironment(),
  };
}

export function clampFocusDayMaxToValidRange(n: number): number {
  const x = Math.round(Number(n));
  if (!Number.isFinite(x)) return defaultSmarttaskAppSettingsV1().focus_day_max;
  return Math.min(
    SMARTTASK_FOCUS_DAY_MAX_USER_SELECTABLE_CAP,
    Math.max(1, x)
  );
}

export function normalizeAppSettingsFromStorage(raw: unknown): SmarttaskAppSettingsV1 {
  const defaults = defaultSmarttaskAppSettingsV1();
  if (!raw || typeof raw !== "object") return defaults;
  const o = raw as Record<string, unknown>;
  const focus = o.focus_day_max;
  if (typeof focus !== "number" && typeof focus !== "string") return defaults;
  const parsed = typeof focus === "number" ? focus : Number.parseInt(String(focus), 10);
  return { focus_day_max: clampFocusDayMaxToValidRange(parsed) };
}
