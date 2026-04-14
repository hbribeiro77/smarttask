import { create } from "zustand";
import type { Subtask, Task, TaskPriority } from "@/lib/smarttask-domain-task-model-and-types";
import { applyCemeteryRules } from "@/lib/smarttask-autoclean-cemetery-20-days-stale";
import {
  clampFocusDayMaxToValidRange,
  defaultSmarttaskAppSettingsV1,
  normalizeAppSettingsFromStorage,
} from "@/lib/smarttask-app-settings-v1-model-and-defaults";
import { getFocusDayMaxFromEnvironment } from "@/lib/smarttask-config-focus-day-max-from-environment";
import {
  parseBackupJsonLoose,
  type BackupFileV1,
  backupFileSchema,
} from "@/lib/smarttask-json-backup-schema-zod-validation";
import {
  parseTaskInput,
  suggestedPriorityFromTags,
} from "@/lib/smarttask-nlp-parse-task-input-chrono-and-tags";
import {
  loadAppSettingsFromIndexedDb,
  loadTasksFromIndexedDb,
  saveAppSettingsToIndexedDb,
  saveTasksToIndexedDb,
} from "@/lib/smarttask-storage-indexeddb-persistence-layer";

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePersist(tasks: Task[]) {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    void saveTasksToIndexedDb(tasks);
  }, 280);
}

export interface SmartTaskStore {
  tasks: Task[];
  hydrated: boolean;
  /** Limite efetivo de tarefas com “Foco do Dia” (preferência do usuário, persistida). */
  focusDayMax: number;
  parentCompleteSuggestionTaskId: string | null;
  hydrate: () => Promise<void>;
  setFocusDayMax: (n: number) => void;
  runCemeteryPass: () => void;
  addTaskFromRawInput: (raw: string) => { ok: true } | { ok: false; reason: "empty" };
  updateTask: (id: string, patch: Partial<Omit<Task, "id">>) => void;
  toggleTaskComplete: (id: string) => void;
  setFocusOfDay: (id: string, focused: boolean) => { ok: true } | { ok: false; reason: "limit" };
  setTaskPriority: (id: string, priority: TaskPriority) => void;
  deleteTask: (id: string) => void;
  archiveTask: (id: string) => void;
  restoreFromCemetery: (id: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  clearParentCompleteSuggestion: () => void;
  confirmCompleteParentAfterSubtasks: (id: string) => void;
  exportBackupObject: () => BackupFileV1;
  importTasksReplace: (json: unknown) => void;
  importTasksMerge: (json: unknown) => void;
}

function emptyTaskFromParsed(
  title: string,
  dueDate: Date | null,
  tags: string[],
  priority: TaskPriority
): Task {
  const t = nowIso();
  return {
    id: newId(),
    title,
    description: "",
    due_date: dueDate ? dueDate.toISOString() : null,
    priority,
    tags,
    subtasks: [],
    status: "active",
    focus_of_day: false,
    created_at: t,
    updated_at: t,
    archived_at: null,
  };
}

export const useSmartTaskStore = create<SmartTaskStore>((set, get) => ({
  tasks: [],
  hydrated: false,
  focusDayMax: getFocusDayMaxFromEnvironment(),
  parentCompleteSuggestionTaskId: null,

  hydrate: async () => {
    const loaded = await loadTasksFromIndexedDb();
    const rawSettings = await loadAppSettingsFromIndexedDb();
    const settings = normalizeAppSettingsFromStorage(rawSettings);
    const initial = loaded ?? [];
    const { tasks: withCemetery, changed } = applyCemeteryRules(initial, new Date());
    set({
      tasks: withCemetery,
      hydrated: true,
      focusDayMax: settings.focus_day_max,
    });
    if (changed) await saveTasksToIndexedDb(withCemetery);
    if (!rawSettings) {
      await saveAppSettingsToIndexedDb(defaultSmarttaskAppSettingsV1());
    }
  },

  setFocusDayMax: (n) => {
    const focus_day_max = clampFocusDayMaxToValidRange(n);
    set({ focusDayMax: focus_day_max });
    void saveAppSettingsToIndexedDb({ focus_day_max });
  },

  runCemeteryPass: () => {
    const { tasks } = get();
    const { tasks: next, changed } = applyCemeteryRules(tasks, new Date());
    if (!changed) return;
    set({ tasks: next });
    schedulePersist(next);
  },

  addTaskFromRawInput: (raw) => {
    const parsed = parseTaskInput(raw);
    if (!parsed.title) return { ok: false, reason: "empty" };
    const priority = suggestedPriorityFromTags(parsed.tags);
    const task = emptyTaskFromParsed(parsed.title, parsed.dueDate, parsed.tags, priority);
    const next = [...get().tasks, task];
    set({ tasks: next });
    schedulePersist(next);
    return { ok: true };
  },

  updateTask: (id, patch) => {
    const next = get().tasks.map((t) =>
      t.id === id ? { ...t, ...patch, updated_at: nowIso() } : t
    );
    set({ tasks: next });
    schedulePersist(next);
  },

  toggleTaskComplete: (id) => {
    const next = get().tasks.map((t) => {
      if (t.id !== id) return t;
      const completed = t.status === "completed";
      const status: Task["status"] = completed ? "active" : "completed";
      return {
        ...t,
        status,
        focus_of_day: completed ? t.focus_of_day : false,
        updated_at: nowIso(),
      };
    });
    set({ tasks: next });
    schedulePersist(next);
  },

  setFocusOfDay: (id, focused) => {
    const max = get().focusDayMax;
    const { tasks } = get();
    const currentFocus = tasks.filter((t) => t.focus_of_day && t.status === "active").length;
    const target = tasks.find((t) => t.id === id);
    if (!target || target.status !== "active") return { ok: true };

    if (focused) {
      const already = target.focus_of_day;
      const count = already ? currentFocus : currentFocus + 1;
      if (count > max) return { ok: false, reason: "limit" };
    }

    const next = tasks.map((t) =>
      t.id === id ? { ...t, focus_of_day: focused, updated_at: nowIso() } : t
    );
    set({ tasks: next });
    schedulePersist(next);
    return { ok: true };
  },

  setTaskPriority: (id, priority) => {
    const next = get().tasks.map((t) =>
      t.id === id ? { ...t, priority, updated_at: nowIso() } : t
    );
    set({ tasks: next });
    schedulePersist(next);
  },

  deleteTask: (id) => {
    const next = get().tasks.filter((t) => t.id !== id);
    set({ tasks: next, parentCompleteSuggestionTaskId: null });
    schedulePersist(next);
  },

  archiveTask: (id) => {
    const ts = nowIso();
    const next = get().tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            status: "archived" as const,
            focus_of_day: false,
            updated_at: ts,
            archived_at: t.archived_at ?? ts,
          }
        : t
    );
    set({ tasks: next });
    schedulePersist(next);
  },

  restoreFromCemetery: (id) => {
    const next = get().tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            status: "active" as const,
            archived_at: null,
            updated_at: nowIso(),
          }
        : t
    );
    set({ tasks: next });
    schedulePersist(next);
  },

  addSubtask: (taskId, title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const sub: Subtask = { id: newId(), title: trimmed, completed: false };
    const next = get().tasks.map((t) =>
      t.id === taskId
        ? { ...t, subtasks: [...t.subtasks, sub], updated_at: nowIso() }
        : t
    );
    set({ tasks: next });
    schedulePersist(next);
  },

  toggleSubtask: (taskId, subtaskId) => {
    let suggestion: string | null = null;
    const next = get().tasks.map((t) => {
      if (t.id !== taskId) return t;
      const subtasks = t.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      );
      const allDone =
        subtasks.length > 0 && subtasks.every((s) => s.completed) && t.status === "active";
      if (allDone) suggestion = taskId;
      return { ...t, subtasks, updated_at: nowIso() };
    });
    set({
      tasks: next,
      parentCompleteSuggestionTaskId: suggestion,
    });
    schedulePersist(next);
  },

  clearParentCompleteSuggestion: () => set({ parentCompleteSuggestionTaskId: null }),

  confirmCompleteParentAfterSubtasks: (id) => {
    const next = get().tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            status: "completed" as const,
            focus_of_day: false,
            updated_at: nowIso(),
          }
        : t
    );
    set({ tasks: next, parentCompleteSuggestionTaskId: null });
    schedulePersist(next);
  },

  exportBackupObject: () => {
    const tasks = get().tasks;
    return backupFileSchema.parse({
      version: 1 as const,
      exported_at: nowIso(),
      tasks,
    });
  },

  importTasksReplace: (json) => {
    const tasks = parseBackupJsonLoose(json);
    set({ tasks, parentCompleteSuggestionTaskId: null });
    schedulePersist(tasks);
  },

  importTasksMerge: (json) => {
    const incoming = parseBackupJsonLoose(json);
    const byId = new Map(get().tasks.map((t) => [t.id, t]));
    for (const t of incoming) {
      byId.set(t.id, t);
    }
    const tasks = [...byId.values()];
    set({ tasks, parentCompleteSuggestionTaskId: null });
    schedulePersist(tasks);
  },
}));
