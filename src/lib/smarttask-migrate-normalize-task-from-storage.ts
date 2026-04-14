import type { Task, TaskPriority, TaskStatus } from "@/lib/smarttask-domain-task-model-and-types";

/** Garante campos novos em tarefas antigas do IndexedDB. */
export function normalizeTaskFromStorage(raw: unknown): Task | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Record<string, unknown>;
  if (typeof t.id !== "string" || typeof t.title !== "string") return null;
  const priority = Number(t.priority);
  const p: TaskPriority =
    priority >= 1 && priority <= 4 ? (priority as TaskPriority) : 4;
  const status = (t.status as TaskStatus) || "active";
  return {
    id: t.id,
    title: t.title,
    description: typeof t.description === "string" ? t.description : "",
    due_date: typeof t.due_date === "string" || t.due_date === null ? (t.due_date as string | null) : null,
    priority: p,
    tags: Array.isArray(t.tags) ? (t.tags as string[]) : [],
    subtasks: Array.isArray(t.subtasks) ? (t.subtasks as Task["subtasks"]) : [],
    status: status === "completed" || status === "archived" || status === "active" ? status : "active",
    focus_of_day: Boolean(t.focus_of_day),
    created_at: typeof t.created_at === "string" ? t.created_at : new Date().toISOString(),
    updated_at: typeof t.updated_at === "string" ? t.updated_at : new Date().toISOString(),
    archived_at:
      typeof t.archived_at === "string" || t.archived_at === null
        ? (t.archived_at as string | null)
        : null,
  };
}

export function normalizeTasksFromStorage(rows: unknown[]): Task[] {
  return rows.map(normalizeTaskFromStorage).filter((x): x is Task => x !== null);
}
