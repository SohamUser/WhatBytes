import type { Task, TaskInput } from "@/types";
import { normalizeDueDate } from "@/utils/date";

export const STICKY_COLORS = ["#FFEB7A", "#FFD6A5", "#CDECCF", "#CFE7FF"] as const;

export function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getStickyAppearance(id: string) {
  const hash = stableHash(id);
  return {
    color: STICKY_COLORS[hash % STICKY_COLORS.length],
    rotation: ((hash % 401) - 200) / 100,
    stagger: ((hash >>> 8) % 13) - 6,
  };
}

export interface StickyDraft {
  title: string;
  description: string;
}

export function buildStickyTaskInput(title: string, description: string): TaskInput | null {
  const normalizedTitle = title.trim().slice(0, 120);
  if (!normalizedTitle) return null;

  return {
    title: normalizedTitle,
    description: description.trim().slice(0, 1000),
    dueDate: normalizeDueDate(new Date()),
    priority: "medium",
  };
}

export function restoreStickyDraft(input: Pick<TaskInput, "title" | "description">): StickyDraft {
  return { title: input.title, description: input.description };
}

export function getStickyCardTitle(task: Pick<Task, "title">) {
  return task.title;
}

export function formatCreatedAt(value: Date | null) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}
