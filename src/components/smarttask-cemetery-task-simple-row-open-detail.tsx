"use client";

import type { Task } from "@/lib/smarttask-domain-task-model-and-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArchiveIcon, TagIcon } from "lucide-react";

interface SmarttaskCemeteryTaskSimpleRowOpenDetailProps {
  task: Task;
  onOpen: () => void;
}

export function SmarttaskCemeteryTaskSimpleRowOpenDetail({
  task,
  onOpen,
}: SmarttaskCemeteryTaskSimpleRowOpenDetailProps) {
  const archived =
    task.archived_at &&
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
      new Date(task.archived_at)
    );

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4 shadow-sm transition-all hover:border-border hover:bg-card hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            "min-w-0 flex-1 rounded text-left font-medium text-muted-foreground",
            "outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring sm:text-base"
          )}
        >
          {task.title}
        </button>
        <Button type="button" size="sm" variant="secondary" onClick={onOpen} className="shrink-0 h-8 px-3 text-xs">
          Revisar
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {task.tags.map((t) => (
          <Badge key={t} variant="outline" className="gap-1 px-1.5 text-[10px] font-normal text-muted-foreground/80">
            <TagIcon className="h-3 w-3" />
            {t}
          </Badge>
        ))}
        {archived ? (
          <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/70">
            <ArchiveIcon className="h-3 w-3" />
            Arquivada em {archived}
          </span>
        ) : null}
      </div>
    </div>
  );
}
