"use client";

import { useMemo } from "react";
import type { Task } from "@/lib/smarttask-domain-task-model-and-types";
import { Button } from "@/components/ui/button";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function countRecentCemetery(tasks: Task[], now: Date): number {
  const t0 = now.getTime() - WEEK_MS;
  return tasks.filter((t) => {
    if (t.status !== "archived" || !t.archived_at) return false;
    const ts = new Date(t.archived_at).getTime();
    return !Number.isNaN(ts) && ts >= t0;
  }).length;
}

interface SmarttaskCemeteryWeeklyReviewAlertBannerProps {
  tasks: Task[];
  onGoCemetery: () => void;
  onDismiss: () => void;
  dismissed: boolean;
}

export function SmarttaskCemeteryWeeklyReviewAlertBanner({
  tasks,
  onGoCemetery,
  onDismiss,
  dismissed,
}: SmarttaskCemeteryWeeklyReviewAlertBannerProps) {
  const n = useMemo(() => countRecentCemetery(tasks, new Date()), [tasks]);
  if (dismissed || n === 0) return null;

  return (
    <div
      role="region"
      aria-label="Revisão do cemitério"
      className="flex flex-col gap-2 rounded-lg border border-border bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-foreground">
        {n === 1
          ? "1 tarefa foi para o Cemitério nos últimos 7 dias."
          : `${n} tarefas foram para o Cemitério nos últimos 7 dias.`}{" "}
        Vale revisar o que ainda importa.
      </p>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={onGoCemetery}>
          Abrir Cemitério
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDismiss}>
          Dispensa
        </Button>
      </div>
    </div>
  );
}
