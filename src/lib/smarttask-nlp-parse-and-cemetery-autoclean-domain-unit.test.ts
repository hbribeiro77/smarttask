import { describe, expect, it } from "vitest";
import { applyCemeteryRules } from "@/lib/smarttask-autoclean-cemetery-20-days-stale";
import type { Task } from "@/lib/smarttask-domain-task-model-and-types";
import {
  parseTaskInput,
  suggestedPriorityFromTags,
} from "@/lib/smarttask-nlp-parse-task-input-chrono-and-tags";

function baseTask(over: Partial<Task>): Task {
  const t = new Date().toISOString();
  return {
    id: "1",
    title: "x",
    description: "",
    due_date: null,
    priority: 4,
    tags: [],
    subtasks: [],
    status: "active",
    focus_of_day: false,
    created_at: t,
    updated_at: t,
    archived_at: null,
    ...over,
  };
}

describe("parseTaskInput", () => {
  it("extrai tag #urgente e título sem hashtag", () => {
    const ref = new Date("2026-04-13T12:00:00.000Z");
    const r = parseTaskInput("Ligar para o suporte técnico #urgente", ref);
    expect(r.tags).toContain("urgente");
    expect(r.title.toLowerCase()).toContain("ligar");
    expect(r.title.includes("#")).toBe(false);
  });

  it("prioridade sugerida com urgente", () => {
    expect(suggestedPriorityFromTags(["urgente"])).toBe(1);
    expect(suggestedPriorityFromTags([])).toBe(4);
  });
});

describe("applyCemeteryRules", () => {
  it("arquiva tarefa ativa não editada há mais de 20 dias", () => {
    const old = new Date("2026-01-01T00:00:00.000Z").toISOString();
    const task = baseTask({ updated_at: old });
    const now = new Date("2026-04-13T12:00:00.000Z");
    const { tasks, changed } = applyCemeteryRules([task], now);
    expect(changed).toBe(true);
    expect(tasks[0]?.status).toBe("archived");
    expect(tasks[0]?.focus_of_day).toBe(false);
    expect(tasks[0]?.archived_at).toBeTruthy();
  });

  it("não arquiva tarefa editada recentemente", () => {
    const recent = new Date("2026-04-12T12:00:00.000Z").toISOString();
    const task = baseTask({ updated_at: recent });
    const now = new Date("2026-04-13T12:00:00.000Z");
    const { changed } = applyCemeteryRules([task], now);
    expect(changed).toBe(false);
  });
});
