import type { Task } from "@/lib/smarttask-domain-task-model-and-types";

const STALE_MS = 20 * 24 * 60 * 60 * 1000;

export interface CemeteryApplyResult {
  tasks: Task[];
  changed: boolean;
}

/** Tarefas ativas não concluídas e sem edição há 20+ dias → arquivadas (Cemitério). */
export function applyCemeteryRules(tasks: Task[], now: Date): CemeteryApplyResult {
  let changed = false;
  const next = tasks.map((t) => {
    if (t.status !== "active") return t;
    const updated = new Date(t.updated_at).getTime();
    if (Number.isNaN(updated)) return t;
    if (now.getTime() - updated < STALE_MS) return t;
    changed = true;
    const archivedAt = now.toISOString();
    return {
      ...t,
      status: "archived" as const,
      focus_of_day: false,
      updated_at: archivedAt,
      archived_at: archivedAt,
    };
  });
  return { tasks: next, changed };
}
