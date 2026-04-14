"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { TaskPriority } from "@/lib/smarttask-domain-task-model-and-types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSmartTaskStore } from "@/stores/smarttask-zustand-tasks-store-with-indexeddb-persistence";
import { toast } from "sonner";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { PlusIcon, Trash2Icon, ArchiveIcon, Undo2Icon } from "lucide-react";

interface SmarttaskTaskDetailSideSheetMarkdownSubtasksProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 1, label: "1 — Fazer já (Urgente/Importante)" },
  { value: 2, label: "2 — Agendar (Importante)" },
  { value: 3, label: "3 — Delegar (Urgente)" },
  { value: 4, label: "4 — Depois (Nem/Nem)" },
];

export function SmarttaskTaskDetailSideSheetMarkdownSubtasks({
  taskId,
  open,
  onOpenChange,
}: SmarttaskTaskDetailSideSheetMarkdownSubtasksProps) {
  const tasks = useSmartTaskStore((s) => s.tasks);
  const updateTask = useSmartTaskStore((s) => s.updateTask);
  const setFocusOfDay = useSmartTaskStore((s) => s.setFocusOfDay);
  const focusMax = useSmartTaskStore((s) => s.focusDayMax);
  const setTaskPriority = useSmartTaskStore((s) => s.setTaskPriority);
  const addSubtask = useSmartTaskStore((s) => s.addSubtask);
  const toggleSubtask = useSmartTaskStore((s) => s.toggleSubtask);
  const deleteTask = useSmartTaskStore((s) => s.deleteTask);
  const archiveTask = useSmartTaskStore((s) => s.archiveTask);
  const restoreFromCemetery = useSmartTaskStore((s) => s.restoreFromCemetery);

  const task = useMemo(
    () => (taskId ? tasks.find((t) => t.id === taskId) ?? null : null),
    [tasks, taskId]
  );

  const [subInput, setSubInput] = useState("");
  const [subsRef] = useAutoAnimate<HTMLUListElement>({ duration: 200 });

  if (!task) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-xl md:max-w-2xl" />
      </Sheet>
    );
  }

  const doneSubs = task.subtasks.filter((s) => s.completed).length;
  const totalSubs = task.subtasks.length;
  const progress = totalSubs === 0 ? 0 : Math.round((doneSubs / totalSubs) * 100);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl"
      >
        <SheetHeader className="border-b border-border/50 px-6 pb-4 pt-6">
          <SheetTitle className="pr-8 text-left text-xl font-semibold tracking-tight">
            {task.title}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-8 p-6 pb-12">
            <div className="space-y-3">
              <Label htmlFor="task-title" className="text-muted-foreground">Título</Label>
              <Input
                id="task-title"
                value={task.title}
                onChange={(e) => updateTask(task.id, { title: e.target.value })}
                className="text-base font-medium shadow-sm h-11"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-muted-foreground">Matriz Eisenhower</Label>
                <Select
                  value={String(task.priority)}
                  onValueChange={(v) =>
                    setTaskPriority(task.id, Number(v) as TaskPriority)
                  }
                >
                  <SelectTrigger className="w-full shadow-sm h-11">
                    <SelectValue />
                  </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} align="start" sideOffset={4}>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={String(p.value)}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
                </Select>
              </div>

              {task.status === "active" ? (
                <div className="flex flex-col justify-center space-y-3 sm:pt-6">
                  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 shadow-sm">
                    <Checkbox
                      id="focus"
                      className="h-5 w-5"
                      checked={task.focus_of_day}
                      onCheckedChange={(c) => {
                        const on = c === true;
                        const r = setFocusOfDay(task.id, on);
                        if (!r.ok && r.reason === "limit") {
                          toast.error(
                            `No máximo ${focusMax} tarefa(s) no Foco do Dia.`
                          );
                        }
                      }}
                    />
                    <Label htmlFor="focus" className="font-medium cursor-pointer">
                      Foco do Dia (máx. {focusMax})
                    </Label>
                  </div>
                </div>
              ) : null}
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-muted-foreground">Notas (Markdown)</Label>
              </div>
              <Tabs defaultValue="edit">
                <TabsList className="w-full bg-muted/60 p-1">
                  <TabsTrigger value="edit" className="flex-1">
                    Editar
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex-1">
                    Prévia
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="mt-3">
                  <Textarea
                    value={task.description}
                    onChange={(e) =>
                      updateTask(task.id, { description: e.target.value })
                    }
                    rows={8}
                    className="font-mono text-sm shadow-sm resize-y"
                    placeholder="Escreva suas anotações aqui..."
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-3">
                  <div className="prose prose-sm dark:prose-invert max-w-none rounded-xl border border-border/60 bg-muted/20 p-4 shadow-sm min-h-[12rem]">
                    {task.description.trim() ? (
                      <ReactMarkdown>{task.description}</ReactMarkdown>
                    ) : (
                      <p className="text-muted-foreground italic">Sem notas.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-muted-foreground">Subtarefas</Label>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {doneSubs}/{totalSubs}
                </span>
              </div>
              
              <Progress value={progress} className="h-2" />
              
              <ul ref={subsRef} className="space-y-2 pt-2">
                {task.subtasks.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 rounded-lg border border-transparent hover:bg-muted/50 p-2 transition-colors">
                    <Checkbox
                      checked={s.completed}
                      onCheckedChange={() => toggleSubtask(task.id, s.id)}
                      id={`sub-${s.id}`}
                      className="h-5 w-5"
                    />
                    <Label 
                      htmlFor={`sub-${s.id}`} 
                      className={`flex-1 cursor-pointer text-sm font-medium ${s.completed ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {s.title}
                    </Label>
                  </li>
                ))}
              </ul>
              
              <form
                className="flex gap-2 pt-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  addSubtask(task.id, subInput);
                  setSubInput("");
                }}
              >
                <Input
                  value={subInput}
                  onChange={(e) => setSubInput(e.target.value)}
                  placeholder="Nova subtarefa..."
                  className="shadow-sm"
                />
                <Button type="submit" size="icon" className="shrink-0">
                  <PlusIcon className="h-4 w-4" />
                  <span className="sr-only">Add</span>
                </Button>
              </form>
            </div>

            <div className="pt-6 flex flex-wrap gap-3 border-t border-border/50">
              {task.status === "archived" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => restoreFromCemetery(task.id)}
                  className="gap-2"
                >
                  <Undo2Icon className="h-4 w-4" />
                  Restaurar do Cemitério
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => archiveTask(task.id)}
                  className="gap-2"
                >
                  <ArchiveIcon className="h-4 w-4" />
                  Enviar ao Cemitério
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  deleteTask(task.id);
                  onOpenChange(false);
                }}
                className="gap-2 ml-auto"
              >
                <Trash2Icon className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
