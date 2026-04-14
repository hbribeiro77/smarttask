"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Task, TaskPriority } from "@/lib/smarttask-domain-task-model-and-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSmartTaskStore } from "@/stores/smarttask-zustand-tasks-store-with-indexeddb-persistence";
import { CalendarIcon, GripVertical, TagIcon, Target } from "lucide-react";

function formatTaskDueLabel(dueIso: string | null): string | null {
  if (!dueIso) return null;
  const d = new Date(dueIso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

const QUADRANTS: {
  priority: TaskPriority;
  title: string;
  subtitle: string;
  colorClass: string;
}[] = [
  {
    priority: 1,
    title: "Fazer já",
    subtitle: "Urgente e importante",
    colorClass:
      "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20",
  },
  {
    priority: 2,
    title: "Agendar",
    subtitle: "Importante, não urgente",
    colorClass:
      "border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20",
  },
  {
    priority: 3,
    title: "Delegar / rápido",
    subtitle: "Urgente, não importante",
    colorClass:
      "border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20",
  },
  {
    priority: 4,
    title: "Eliminar / depois",
    subtitle: "Nem urgente nem importante",
    colorClass:
      "border-slate-200 bg-slate-50/50 dark:border-slate-800/40 dark:bg-slate-900/20",
  },
];

function droppableIdForMatrixQuadrant(priority: TaskPriority): string {
  return `matrix-q-${priority}`;
}

function DraggableMatrixTaskRow({
  task,
  onOpenTask,
}: {
  task: Task;
  onOpenTask: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { type: "matrix-task" as const, task },
  });

  const dragStyle: React.CSSProperties | undefined =
    transform != null
      ? {
          transform: CSS.Translate.toString(transform),
        }
      : undefined;

  const dueLabel = formatTaskDueLabel(task.due_date);
  const hasMeta =
    Boolean(dueLabel) || task.tags.length > 0 || task.focus_of_day;

  return (
    <li
      className={cn(
        "list-none",
        isDragging && "relative z-[9999] opacity-[0.98]"
      )}
    >
      <div
        ref={setNodeRef}
        style={dragStyle}
        {...listeners}
        {...attributes}
        className={cn(
          "flex cursor-grab touch-none items-start gap-1 rounded-md border border-background/50 bg-background/60 shadow-sm backdrop-blur-sm transition-[box-shadow,opacity] duration-150",
          "hover:border-border hover:bg-background hover:shadow active:cursor-grabbing",
          "outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
          isDragging && "scale-[1.02] shadow-xl ring-2 ring-primary/40"
        )}
        aria-label={`Arrastar para outro quadrante: ${task.title}`}
      >
        <span
          className="mt-1.5 shrink-0 rounded-md p-1 text-muted-foreground"
          aria-hidden
        >
          <GripVertical className="h-4 w-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-1 pr-1">
          <button
            type="button"
            onClick={() => onOpenTask(task.id)}
            className={cn(
              "min-w-0 w-full text-left text-sm font-medium break-words",
              "cursor-pointer outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            {task.title}
          </button>
          {hasMeta ? (
            <div className="flex flex-wrap items-center gap-1">
              {task.focus_of_day ? (
                <Badge variant="default" className="gap-0.5 px-1.5 text-[10px] font-medium">
                  <Target className="h-3 w-3" aria-hidden />
                  Foco
                </Badge>
              ) : null}
              {task.tags.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="gap-0.5 px-1.5 text-[10px] font-normal text-muted-foreground"
                >
                  <TagIcon className="h-3 w-3 shrink-0" aria-hidden />
                  {t}
                </Badge>
              ))}
              {dueLabel ? (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                  <CalendarIcon className="h-3 w-3 shrink-0" aria-hidden />
                  <time dateTime={task.due_date ?? undefined}>{dueLabel}</time>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function QuadrantDropZone({
  priority,
  q,
  list,
  onOpenTask,
}: {
  priority: TaskPriority;
  q: (typeof QUADRANTS)[0];
  list: Task[];
  onOpenTask: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: droppableIdForMatrixQuadrant(priority),
    data: { type: "matrix-quadrant" as const, priority },
  });

  return (
    <Card
      className={cn(
        "relative z-0 flex flex-col overflow-visible shadow-sm transition-shadow hover:shadow-md",
        q.colorClass
      )}
    >
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-base font-semibold">{q.title}</CardTitle>
        <p className="text-xs font-medium text-muted-foreground/80">
          {q.subtitle}
        </p>
      </CardHeader>
      <CardContent className="overflow-visible">
        <div
          ref={setNodeRef}
          className={cn(
            "min-h-[5rem] rounded-lg transition-[box-shadow,background-color] duration-150",
            list.length === 0 && "border border-dashed border-muted-foreground/25",
            isOver &&
              "bg-primary/10 ring-2 ring-primary/50 ring-offset-2 ring-offset-background dark:ring-offset-card"
          )}
        >
          {list.length === 0 ? (
            <div className="flex h-full min-h-[4.5rem] items-center justify-center px-2 py-4 text-center text-xs text-muted-foreground/70">
              {isOver ? (
                <span className="font-medium text-primary">Solte aqui</span>
              ) : (
                <span>Vazio — arraste um card de outro quadrante para cá</span>
              )}
            </div>
          ) : (
            <ul className="space-y-1.5 p-0.5">
              {list.map((t) => (
                <DraggableMatrixTaskRow
                  key={t.id}
                  task={t}
                  onOpenTask={onOpenTask}
                />
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface SmarttaskEisenhowerMatrixFourQuadrantsViewProps {
  tasks: Task[];
  onOpenTask: (id: string) => void;
}

export function SmarttaskEisenhowerMatrixFourQuadrantsView({
  tasks,
  onOpenTask,
}: SmarttaskEisenhowerMatrixFourQuadrantsViewProps) {
  const setTaskPriority = useSmartTaskStore((s) => s.setTaskPriority);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    })
  );

  const active = useMemo(
    () => tasks.filter((t) => t.status === "active"),
    [tasks]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active: activeItem, over } = event;
    setDraggingId(null);

    if (!over) return;

    const taskId = String(activeItem.id);
    const overId = String(over.id);
    if (!overId.startsWith("matrix-q-")) return;

    const raw = overId.replace("matrix-q-", "");
    const p = Number.parseInt(raw, 10);
    if (p < 1 || p > 4) return;

    const nextPriority = p as TaskPriority;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status !== "active") return;
    if (task.priority === nextPriority) return;

    setTaskPriority(taskId, nextPriority);
  };

  const handleDragCancel = () => {
    setDraggingId(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground md:text-sm">
        Arraste o card pelo título ou pelo ícone{" "}
        <GripVertical
          className="inline-block h-3.5 w-3.5 align-text-bottom"
          aria-hidden
        />{" "}
        — o card acompanha o mouse. Clique rápido no texto abre o detalhe.
      </p>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          className={cn(
            "relative grid gap-4 sm:grid-cols-2",
            draggingId != null && "min-h-[12rem]"
          )}
        >
          {QUADRANTS.map((q) => (
            <QuadrantDropZone
              key={q.priority}
              priority={q.priority}
              q={q}
              list={active.filter((t) => t.priority === q.priority)}
              onOpenTask={onOpenTask}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
