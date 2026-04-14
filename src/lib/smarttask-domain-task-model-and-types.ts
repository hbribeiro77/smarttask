export type TaskStatus = "active" | "completed" | "archived";

/** 1 = urgente+importante … 4 = nem urgente nem importante (matriz Eisenhower) */
export type TaskPriority = 1 | 2 | 3 | 4;

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: TaskPriority;
  tags: string[];
  subtasks: Subtask[];
  status: TaskStatus;
  focus_of_day: boolean;
  created_at: string;
  updated_at: string;
  /** Preenchido ao arquivar (manual ou Cemitério), para revisão in-app */
  archived_at: string | null;
}

export type TaskHighlightKind = "tag" | "date";

export interface TaskInputHighlight {
  start: number;
  end: number;
  kind: TaskHighlightKind;
}

export interface ParsedTaskInput {
  title: string;
  dueDate: Date | null;
  tags: string[];
  highlights: TaskInputHighlight[];
}
