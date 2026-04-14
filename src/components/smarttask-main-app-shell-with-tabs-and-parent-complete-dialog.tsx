"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { SmarttaskNlpSyntaxHighlightedTaskInputComposer } from "@/components/smarttask-nlp-syntax-highlighted-task-input-composer";
import { SmarttaskTaskRowWithSwipeCompleteAndArchive } from "@/components/smarttask-task-row-with-swipe-complete-and-archive";
import { SmarttaskEisenhowerMatrixFourQuadrantsView } from "@/components/smarttask-eisenhower-matrix-four-quadrants-view";
import { SmarttaskTaskDetailSideSheetMarkdownSubtasks } from "@/components/smarttask-task-detail-side-sheet-markdown-subtasks";
import { SmarttaskJsonBackupExportImportToolbar } from "@/components/smarttask-json-backup-export-import-toolbar";
import { SmarttaskCemeteryWeeklyReviewAlertBanner } from "@/components/smarttask-cemetery-weekly-review-alert-banner";
import { SmarttaskCemeteryTaskSimpleRowOpenDetail } from "@/components/smarttask-cemetery-task-simple-row-open-detail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/smarttask-domain-task-model-and-types";
import { useSmartTaskStore } from "@/stores/smarttask-zustand-tasks-store-with-indexeddb-persistence";
import { CheckSquare2, Inbox, Target, Ghost, CheckCircle2 } from "lucide-react";

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
        <Icon className="h-8 w-8 text-muted-foreground/70" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function SmarttaskMainAppShellWithTabsAndParentCompleteDialog() {
  const hydrated = useSmartTaskStore((s) => s.hydrated);
  const tasks = useSmartTaskStore((s) => s.tasks);
  const addTaskFromRawInput = useSmartTaskStore((s) => s.addTaskFromRawInput);
  const toggleTaskComplete = useSmartTaskStore((s) => s.toggleTaskComplete);
  const archiveTask = useSmartTaskStore((s) => s.archiveTask);
  const parentCompleteSuggestionTaskId = useSmartTaskStore(
    (s) => s.parentCompleteSuggestionTaskId
  );
  const clearParentCompleteSuggestion = useSmartTaskStore(
    (s) => s.clearParentCompleteSuggestion
  );
  const confirmCompleteParentAfterSubtasks = useSmartTaskStore(
    (s) => s.confirmCompleteParentAfterSubtasks
  );
  const focusDayMax = useSmartTaskStore((s) => s.focusDayMax);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tab, setTab] = useState("lista");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const [listRef] = useAutoAnimate<HTMLDivElement>({ duration: 200 });
  const [focusRef] = useAutoAnimate<HTMLDivElement>({ duration: 200 });
  const [cemeteryRef] = useAutoAnimate<HTMLDivElement>({ duration: 200 });
  const [doneRef] = useAutoAnimate<HTMLDivElement>({ duration: 200 });

  const openDetail = (id: string) => {
    setDetailId(id);
    setSheetOpen(true);
  };

  const activeTasks = tasks.filter((t) => t.status === "active");
  const focusTasks = activeTasks.filter((t) => t.focus_of_day);
  const cemeteryTasks = tasks.filter((t) => t.status === "archived");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const suggestTask: Task | null = parentCompleteSuggestionTaskId
    ? (tasks.find((t) => t.id === parentCompleteSuggestionTaskId) ?? null)
    : null;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-100/50 via-background to-violet-100/45 dark:from-background dark:via-background dark:to-card/30">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-6 md:py-10">
        <header className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md"
            aria-hidden
          >
            <CheckSquare2 className="h-6 w-6" strokeWidth={2} />
          </div>
          <div className="min-w-0 space-y-1 pt-0.5">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              SmartTask
            </h1>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              NLP, Foco do Dia, Eisenhower e Cemitério — tudo no seu navegador, offline.
            </p>
          </div>
        </header>

        <div className="space-y-5 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm backdrop-blur-sm dark:border-border dark:bg-card/90 md:p-6">
          <SmarttaskCemeteryWeeklyReviewAlertBanner
            tasks={tasks}
            dismissed={bannerDismissed}
            onDismiss={() => setBannerDismissed(true)}
            onGoCemetery={() => {
              setTab("cemiterio");
              setBannerDismissed(true);
            }}
          />

          <section
            aria-label="Backup JSON e limite do Foco do Dia"
            className="border-b border-border/60 pb-5"
          >
            <SmarttaskJsonBackupExportImportToolbar />
          </section>

          <section aria-label="Nova tarefa" className="space-y-2">
            <SmarttaskNlpSyntaxHighlightedTaskInputComposer
              disabled={!hydrated}
              onSubmit={(raw) => {
                const r = addTaskFromRawInput(raw);
                if (!r.ok && r.reason === "empty") {
                  toast.message("Digite um título válido após remover datas/tags.");
                }
              }}
            />
          </section>

          {!hydrated ? (
            <p className="text-sm text-muted-foreground" role="status">
              Carregando dados locais…
            </p>
          ) : null}

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid h-auto min-h-0 w-full grid-cols-2 gap-1.5 rounded-xl bg-muted/90 p-1.5 sm:grid-cols-5">
              <TabsTrigger value="lista" className="shrink-0">
                Lista
              </TabsTrigger>
              <TabsTrigger value="foco" className="shrink-0">
                Foco
              </TabsTrigger>
              <TabsTrigger value="matriz" className="shrink-0">
                Matriz
              </TabsTrigger>
              <TabsTrigger value="cemiterio" className="shrink-0">
                Cemitério
              </TabsTrigger>
              <TabsTrigger value="feitas" className="shrink-0">
                Feitas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lista" className="mt-4">
              <p className="sr-only">
                Lista de tarefas ativas. Deslize para a direita para concluir ou para
                a esquerda para arquivar.
              </p>
              <div ref={listRef} className="space-y-2">
                {activeTasks.length === 0 ? (
                  <EmptyState 
                    icon={Inbox} 
                    title="Caixa de entrada vazia" 
                    description="Você não tem tarefas ativas no momento. Crie uma nova tarefa acima." 
                  />
                ) : (
                  activeTasks.map((t) => (
                    <SmarttaskTaskRowWithSwipeCompleteAndArchive
                      key={t.id}
                      task={t}
                      onOpen={() => openDetail(t.id)}
                      onToggleComplete={() => toggleTaskComplete(t.id)}
                      onArchive={() => archiveTask(t.id)}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="foco" className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Até {focusDayMax} tarefa(s) com foco ao mesmo tempo (ajuste ao lado de Exportar/Importar JSON).
                Marque o foco no detalhe da tarefa.
              </p>
              <div ref={focusRef} className="space-y-2">
                {focusTasks.length === 0 ? (
                  <EmptyState 
                    icon={Target} 
                    title="Sem foco definido" 
                    description="Nenhuma tarefa marcada como Foco do Dia. Abra uma tarefa e marque-a para dar prioridade." 
                  />
                ) : (
                  focusTasks.map((t) => (
                    <SmarttaskTaskRowWithSwipeCompleteAndArchive
                      key={t.id}
                      task={t}
                      onOpen={() => openDetail(t.id)}
                      onToggleComplete={() => toggleTaskComplete(t.id)}
                      onArchive={() => archiveTask(t.id)}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="matriz" className="mt-4">
              <SmarttaskEisenhowerMatrixFourQuadrantsView
                tasks={tasks}
                onOpenTask={openDetail}
              />
            </TabsContent>

            <TabsContent value="cemiterio" className="mt-4">
              <div ref={cemeteryRef} className="space-y-2">
                {cemeteryTasks.length === 0 ? (
                  <EmptyState 
                    icon={Ghost} 
                    title="Cemitério vazio" 
                    description="Tarefas não concluídas e inativas há mais de 20 dias virão parar aqui automaticamente." 
                  />
                ) : (
                  cemeteryTasks.map((t) => (
                    <SmarttaskCemeteryTaskSimpleRowOpenDetail
                      key={t.id}
                      task={t}
                      onOpen={() => openDetail(t.id)}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="feitas" className="mt-4">
              <div ref={doneRef} className="space-y-2">
                {completedTasks.length === 0 ? (
                  <EmptyState 
                    icon={CheckCircle2} 
                    title="Nenhuma tarefa concluída" 
                    description="As tarefas que você marcar como feitas aparecerão nesta lista." 
                  />
                ) : (
                  completedTasks.map((t) => (
                    <SmarttaskTaskRowWithSwipeCompleteAndArchive
                      key={t.id}
                      task={t}
                      onOpen={() => openDetail(t.id)}
                      onToggleComplete={() => toggleTaskComplete(t.id)}
                      onArchive={() => archiveTask(t.id)}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <SmarttaskTaskDetailSideSheetMarkdownSubtasks
          taskId={detailId}
          open={sheetOpen}
          onOpenChange={(o) => {
            setSheetOpen(o);
            if (!o) setDetailId(null);
          }}
        />

        <Dialog
          open={suggestTask !== null}
          onOpenChange={(o) => {
            if (!o) clearParentCompleteSuggestion();
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Concluir tarefa principal?</DialogTitle>
              <DialogDescription>
                Todas as subtarefas de &quot;{suggestTask?.title}&quot; estão concluídas.
                Deseja marcar a tarefa principal como feita?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={clearParentCompleteSuggestion}>
                Não
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (parentCompleteSuggestionTaskId) {
                    confirmCompleteParentAfterSubtasks(parentCompleteSuggestionTaskId);
                  }
                }}
              >
                Sim, concluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
