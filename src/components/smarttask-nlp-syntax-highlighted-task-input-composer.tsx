"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import { parseTaskInput } from "@/lib/smarttask-nlp-parse-task-input-chrono-and-tags";
import type { TaskInputHighlight } from "@/lib/smarttask-domain-task-model-and-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

function buildHighlightedParts(text: string, highlights: TaskInputHighlight[]) {
  if (!text) return [{ type: "plain" as const, value: "" }];
  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  const parts: { type: "plain" | "tag" | "date"; value: string }[] = [];
  let cursor = 0;
  for (const h of sorted) {
    if (h.start > cursor) {
      parts.push({ type: "plain", value: text.slice(cursor, h.start) });
    }
    if (h.end > h.start) {
      parts.push({ type: h.kind, value: text.slice(h.start, h.end) });
    }
    cursor = Math.max(cursor, h.end);
  }
  if (cursor < text.length) {
    parts.push({ type: "plain", value: text.slice(cursor) });
  }
  return parts.length ? parts : [{ type: "plain" as const, value: text }];
}

interface SmarttaskNlpSyntaxHighlightedTaskInputComposerProps {
  onSubmit: (raw: string) => void;
  disabled?: boolean;
}

export function SmarttaskNlpSyntaxHighlightedTaskInputComposer({
  onSubmit,
  disabled,
}: SmarttaskNlpSyntaxHighlightedTaskInputComposerProps) {
  const labelId = useId();
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => parseTaskInput(value), [value]);
  const parts = useMemo(
    () => buildHighlightedParts(value, parsed.highlights),
    [value, parsed.highlights]
  );

  const syncScroll = useCallback(() => {
    const ta = taRef.current;
    const m = mirrorRef.current;
    if (ta && m) m.scrollTop = ta.scrollTop;
  }, []);

  const submitIfNonEmpty = useCallback(() => {
    const raw = value.trim();
    if (!raw) return;
    onSubmit(raw);
    setValue("");
  }, [onSubmit, value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitIfNonEmpty();
    }
  };

  const canSubmit = Boolean(value.trim());

  return (
    <div className="relative w-full space-y-2">
      <Label htmlFor={labelId} className="sr-only">
        Nova tarefa — digite texto, data e hashtags; Enter ou botão Criar tarefa para adicionar
      </Label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
      <div className="relative min-h-[3.25rem] flex-1 rounded-xl border border-border/80 bg-background/80 shadow-sm transition-[box-shadow,border-color] focus-within:border-primary/45 focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring/25 dark:bg-background/50">
        <div
          ref={mirrorRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden whitespace-pre-wrap break-words px-3 py-2 font-sans text-base leading-normal md:text-sm"
        >
          {parts.map((p, i) => {
            if (p.type === "tag") {
              return (
                <span key={i} className="rounded bg-primary/15 text-primary">
                  {p.value}
                </span>
              );
            }
            if (p.type === "date") {
              return (
                <span key={i} className="rounded bg-chart-2/25 text-chart-2">
                  {p.value}
                </span>
              );
            }
            return <span key={i}>{p.value}</span>;
          })}
          {value.endsWith("\n") ? <br /> : null}
        </div>
        <textarea
          id={labelId}
          ref={taRef}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          rows={2}
          className="relative z-10 min-h-[3.25rem] w-full resize-none bg-transparent px-3 py-2 font-sans text-base leading-normal text-transparent caret-primary outline-none placeholder:text-muted-foreground/55 md:text-sm"
          placeholder="Ex.: Ligar para o suporte segunda às 10h #urgente"
          autoComplete="off"
        />
      </div>
      <Button
        type="button"
        variant="default"
        disabled={disabled || !canSubmit}
        onClick={submitIfNonEmpty}
        className="h-auto min-h-[3.25rem] shrink-0 gap-2 px-4 sm:self-stretch sm:min-w-[9.5rem]"
      >
        <PlusCircle className="h-4 w-4 shrink-0" aria-hidden />
        Criar tarefa
      </Button>
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Enter ou o botão criam a tarefa; Shift+Enter quebra linha. Datas e #tags são detectadas
        automaticamente.
      </p>
    </div>
  );
}
