import { parse as parsePortuguese } from "chrono-node/pt";
import type {
  ParsedTaskInput,
  TaskInputHighlight,
} from "@/lib/smarttask-domain-task-model-and-types";

const TAG_RE = /#([\p{L}\p{N}_-]+)/gu;

function collectTagRanges(raw: string): TaskInputHighlight[] {
  const ranges: TaskInputHighlight[] = [];
  TAG_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TAG_RE.exec(raw)) !== null) {
    ranges.push({ start: m.index, end: m.index + m[0].length, kind: "tag" });
  }
  return ranges;
}

function maskTagsPreserveIndices(raw: string): string {
  return raw.replace(TAG_RE, (full) => " ".repeat(full.length));
}

function mergeHighlightRanges(ranges: TaskInputHighlight[]): TaskInputHighlight[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const out: TaskInputHighlight[] = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r.start < last.end) {
      last.end = Math.max(last.end, r.end);
      continue;
    }
    out.push({ ...r });
  }
  return out;
}

function stripRanges(raw: string, ranges: TaskInputHighlight[]): string {
  if (ranges.length === 0) return raw.trim();
  const sorted = [...ranges].sort((a, b) => b.start - a.start);
  let s = raw;
  for (const { start, end } of sorted) {
    s = `${s.slice(0, start)} ${s.slice(end)}`;
  }
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Extrai data/hora (locale PT via chrono-node), tags #tag e título limpo.
 * Destaques usam índices no texto original (para syntax highlight no input).
 */
export function parseTaskInput(raw: string, referenceDate = new Date()): ParsedTaskInput {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { title: "", dueDate: null, tags: [], highlights: [] };
  }

  const tagHighlights = collectTagRanges(trimmed);
  const tags = [...trimmed.matchAll(TAG_RE)].map((m) => m[1]!.toLowerCase());

  const forChrono = maskTagsPreserveIndices(trimmed);
  const results = parsePortuguese(forChrono, referenceDate, { forwardDate: true });

  const dateHighlights: TaskInputHighlight[] = [];
  let dueDate: Date | null = null;

  if (results.length > 0) {
    const best = results[0]!;
    dueDate = best.date();
    dateHighlights.push({
      start: best.index,
      end: best.index + best.text.length,
      kind: "date",
    });
  }

  const highlights = mergeHighlightRanges([...tagHighlights, ...dateHighlights]);
  const title = stripRanges(trimmed, highlights);

  return {
    title: title || trimmed.replace(TAG_RE, "").replace(/\s+/g, " ").trim(),
    dueDate,
    tags: [...new Set(tags)],
    highlights,
  };
}

/** Prioridade sugerida: tag #urgente → quadrante 1. */
export function suggestedPriorityFromTags(tags: string[]): 1 | 2 | 3 | 4 {
  const lower = tags.map((t) => t.toLowerCase());
  if (lower.some((t) => t === "urgente" || t === "urgent")) return 1;
  return 4;
}
