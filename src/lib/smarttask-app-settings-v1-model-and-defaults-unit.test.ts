import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  clampFocusDayMaxToValidRange,
  normalizeAppSettingsFromStorage,
  SMARTTASK_FOCUS_DAY_MAX_USER_SELECTABLE_CAP,
} from "@/lib/smarttask-app-settings-v1-model-and-defaults";

describe("clampFocusDayMaxToValidRange", () => {
  const original = process.env.NEXT_PUBLIC_FOCUS_DAY_MAX;

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_FOCUS_DAY_MAX;
    else process.env.NEXT_PUBLIC_FOCUS_DAY_MAX = original;
  });

  it("clampa entre 1 e o teto da UI", () => {
    delete process.env.NEXT_PUBLIC_FOCUS_DAY_MAX;
    expect(clampFocusDayMaxToValidRange(0)).toBe(1);
    expect(clampFocusDayMaxToValidRange(1)).toBe(1);
    expect(clampFocusDayMaxToValidRange(SMARTTASK_FOCUS_DAY_MAX_USER_SELECTABLE_CAP)).toBe(
      SMARTTASK_FOCUS_DAY_MAX_USER_SELECTABLE_CAP
    );
    expect(clampFocusDayMaxToValidRange(999)).toBe(SMARTTASK_FOCUS_DAY_MAX_USER_SELECTABLE_CAP);
  });
});

describe("normalizeAppSettingsFromStorage", () => {
  const original = process.env.NEXT_PUBLIC_FOCUS_DAY_MAX;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_FOCUS_DAY_MAX = "5";
  });

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_FOCUS_DAY_MAX;
    else process.env.NEXT_PUBLIC_FOCUS_DAY_MAX = original;
  });

  it("usa padrão do ambiente quando inválido", () => {
    expect(normalizeAppSettingsFromStorage(null).focus_day_max).toBe(5);
    expect(normalizeAppSettingsFromStorage({}).focus_day_max).toBe(5);
  });

  it("respeita valor salvo válido", () => {
    expect(normalizeAppSettingsFromStorage({ focus_day_max: 7 }).focus_day_max).toBe(7);
    expect(normalizeAppSettingsFromStorage({ focus_day_max: "4" }).focus_day_max).toBe(4);
  });
});
