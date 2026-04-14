import { z } from "zod";
import type { Task } from "@/lib/smarttask-domain-task-model-and-types";

const subtaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
});

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  due_date: z.string().nullable(),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  tags: z.array(z.string()),
  subtasks: z.array(subtaskSchema),
  status: z.enum(["active", "completed", "archived"]),
  focus_of_day: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  archived_at: z.string().nullable(),
}) satisfies z.ZodType<Task>;

export const backupFileSchema = z.object({
  version: z.literal(1),
  exported_at: z.string(),
  tasks: z.array(taskSchema),
});

export type BackupFileV1 = z.infer<typeof backupFileSchema>;

export function parseBackupJson(json: unknown): BackupFileV1 {
  return backupFileSchema.parse(json);
}

/** Aceita array solto (legado) ou envelope { version, tasks }. */
export function parseBackupJsonLoose(json: unknown): Task[] {
  const asArray = z.array(taskSchema).safeParse(json);
  if (asArray.success) return asArray.data;
  const asFile = backupFileSchema.safeParse(json);
  if (asFile.success) return asFile.data.tasks;
  throw new Error("JSON inválido: esperado backup SmartTask v1 ou lista de tarefas.");
}
