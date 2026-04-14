"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SmarttaskAuthSignOutToolbarButtonClient } from "@/components/smarttask-auth-sign-out-toolbar-button-client";
import { SmarttaskBaseUiTooltipProviderRootTriggerPopupComposition } from "@/components/ui/smarttask-base-ui-tooltip-provider-root-trigger-popup-composition";
import { SMARTTASK_FOCUS_DAY_MAX_USER_SELECTABLE_CAP } from "@/lib/smarttask-app-settings-v1-model-and-defaults";
import { cn } from "@/lib/utils";
import { useSmartTaskStore } from "@/stores/smarttask-zustand-tasks-store-with-indexeddb-persistence";

const FOCUS_MAX_HELP =
  "Máximo de tarefas ativas que podem estar no Foco do Dia ao mesmo tempo (entre 1 e " +
  String(SMARTTASK_FOCUS_DAY_MAX_USER_SELECTABLE_CAP) +
  "). Você marca o foco no detalhe de cada tarefa. Na primeira visita, o número inicial segue o padrão do ambiente (variável NEXT_PUBLIC_FOCUS_DAY_MAX), se existir.";

export function SmarttaskJsonBackupExportImportToolbar() {
  const hydrated = useSmartTaskStore((s) => s.hydrated);
  const focusDayMax = useSmartTaskStore((s) => s.focusDayMax);
  const setFocusDayMax = useSmartTaskStore((s) => s.setFocusDayMax);
  const exportBackupObject = useSmartTaskStore((s) => s.exportBackupObject);
  const importReplace = useSmartTaskStore((s) => s.importTasksReplace);
  const importMerge = useSmartTaskStore((s) => s.importTasksMerge);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<unknown | null>(null);
  const [open, setOpen] = useState(false);

  const downloadJson = () => {
    const data = exportBackupObject();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smarttask-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exportado.");
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text) as unknown;
      setPending(json);
      setOpen(true);
    } catch {
      toast.error("Arquivo JSON inválido.");
    }
  };

  const applyImport = (mode: "replace" | "merge") => {
    if (!pending) return;
    try {
      if (mode === "replace") importReplace(pending);
      else importMerge(pending);
      setOpen(false);
      setPending(null);
      toast.success(mode === "replace" ? "Dados substituídos." : "Dados mesclados.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Importação falhou.");
    }
  };

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={downloadJson}>
          Exportar JSON
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
        >
          Importar JSON
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
        <SmarttaskAuthSignOutToolbarButtonClient />
        <SmarttaskBaseUiTooltipProviderRootTriggerPopupComposition
          aria-label={FOCUS_MAX_HELP}
          side="top"
          align="end"
          content={FOCUS_MAX_HELP}
          triggerClassName={cn(
            buttonVariants({ variant: "outline", size: "icon-sm" }),
            "text-muted-foreground"
          )}
        >
          <Info className="size-3.5" aria-hidden />
        </SmarttaskBaseUiTooltipProviderRootTriggerPopupComposition>
        <Label
          htmlFor="toolbar-focus-day-max"
          className="text-[0.8rem] font-medium text-muted-foreground"
        >
          Foco
        </Label>
        <Input
          id="toolbar-focus-day-max"
          type="number"
          inputMode="numeric"
          min={1}
          max={SMARTTASK_FOCUS_DAY_MAX_USER_SELECTABLE_CAP}
          value={focusDayMax}
          disabled={!hydrated}
          onChange={(e) => {
            const v = e.target.valueAsNumber;
            if (Number.isNaN(v)) return;
            setFocusDayMax(v);
          }}
          className="h-7 w-10 border-border px-1 text-center text-[0.8rem] tabular-nums shadow-none md:w-11"
        />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onFile}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar backup</DialogTitle>
            <DialogDescription>
              Substituir apaga todas as tarefas atuais e carrega só o arquivo. Mesclar
              une por id (tarefas com mesmo id são sobrescritas).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="destructive" onClick={() => applyImport("replace")}>
              Substituir tudo
            </Button>
            <Button type="button" variant="default" onClick={() => applyImport("merge")}>
              Mesclar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
