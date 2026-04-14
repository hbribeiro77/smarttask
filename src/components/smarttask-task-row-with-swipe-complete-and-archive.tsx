"use client";

import { useDrag } from "@use-gesture/react";
import { useRef, useState } from "react";
import type { Task } from "@/lib/smarttask-domain-task-model-and-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, TagIcon, Target } from "lucide-react";

interface SmarttaskTaskRowWithSwipeCompleteAndArchiveProps {
  task: Task;
  onOpen: () => void;
  onToggleComplete: () => void;
  onArchive: () => void;
}

const priorityColors = {
  1: "bg-red-500 dark:bg-red-500/80",
  2: "bg-blue-500 dark:bg-blue-500/80",
  3: "bg-amber-500 dark:bg-amber-500/80",
  4: "bg-slate-400 dark:bg-slate-500/80",
};

export function SmarttaskTaskRowWithSwipeCompleteAndArchive({
  task,
  onOpen,
  onToggleComplete,
  onArchive,
}: SmarttaskTaskRowWithSwipeCompleteAndArchiveProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);

  const bind = useDrag(
    ({ movement: [mx], last, velocity: [vx], cancel }) => {
      if (!last) {
        setX(mx);
        return;
      }
      const threshold = 72;
      const flick = Math.abs(vx) > 0.4;
      if (mx > threshold || (flick && mx > 30)) {
        onToggleComplete();
        cancel();
      } else if (mx < -threshold || (flick && mx < -30)) {
        onArchive();
        cancel();
      }
      setX(0);
    },
    { axis: "x", filterTaps: true }
  );

  const due =
    task.due_date &&
    new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(task.due_date));

  return (
    <div
      ref={ref}
      {...bind()}
      style={{ touchAction: "pan-y" }}
      className="relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all hover:border-border hover:shadow-md"
    >
      {/* Indicador de Prioridade (Borda esquerda) */}
      <div
        className={cn(
          "absolute bottom-0 left-0 top-0 z-10 w-1.5 transition-colors",
          task.status === "completed" ? "bg-muted" : priorityColors[task.priority]
        )}
        aria-hidden
      />

      {/* Backgrounds para o Swipe */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 flex w-20 items-center justify-center bg-emerald-600/90 text-xs font-medium text-white transition-opacity",
          x > 0 ? "opacity-100" : "opacity-0"
        )}
        aria-hidden
      >
        OK
      </div>
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-amber-700/90 text-xs font-medium text-white transition-opacity",
          x < 0 ? "opacity-100" : "opacity-0"
        )}
        aria-hidden
      >
        Arq
      </div>

      <div
        style={{ transform: `translateX(${x}px)` }}
        className={cn(
          "relative flex flex-col gap-2 p-3 pl-4 transition-[transform] duration-75 sm:p-4 sm:pl-5",
          task.status === "completed" ? "bg-muted" : "bg-card"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onOpen}
            className="min-w-0 flex-1 rounded text-left font-medium outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring sm:text-base"
          >
            <span className={cn(task.status === "completed" && "line-through text-muted-foreground")}>
              {task.title}
            </span>
          </button>
          <div className="flex shrink-0 gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
              aria-label={
                task.status === "completed" ? "Reabrir tarefa" : "Concluir tarefa"
              }
            >
              {task.status === "completed" ? "Reabrir" : "Feito"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onArchive();
              }}
              aria-label="Arquivar no cemitério"
            >
              Cemit.
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {task.focus_of_day ? (
            <Badge variant="default" className="gap-1 px-1.5 text-[10px] font-medium">
              <Target className="h-3 w-3" />
              Foco
            </Badge>
          ) : null}
          
          {task.tags.map((t) => (
            <Badge key={t} variant="secondary" className="gap-1 px-1.5 text-[10px] font-normal text-muted-foreground">
              <TagIcon className="h-3 w-3" />
              {t}
            </Badge>
          ))}
          
          {due ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              {due}
            </span>
          ) : null}
          
          <span className="sr-only">
            Deslize para a direita para concluir ou para a esquerda para arquivar.
          </span>
        </div>
      </div>
    </div>
  );
}
