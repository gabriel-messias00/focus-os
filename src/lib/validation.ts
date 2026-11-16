import type { Category, Priority } from "@/types";

export const MAX_TASK_TITLE_LENGTH = 90;
export const MIN_FOCUS_MINUTES = 1;
export const MAX_FOCUS_MINUTES = 180;

export function normalizeTaskTitle(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_TASK_TITLE_LENGTH);
}

export function isValidTaskPriority(value: string): value is Priority {
  return value === "high" || value === "medium" || value === "low";
}

export function isValidTaskCategory(value: string): value is Category {
  return value === "work" || value === "study" || value === "personal" || value === "other";
}

export function isValidDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function clampDailyGoal(value: number, fallback = 3): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(30, Math.max(1, Math.floor(value)));
}

export function parseFocusDuration(value: number): number | null {
  if (!Number.isFinite(value) || !Number.isInteger(value)) return null;
  if (value < MIN_FOCUS_MINUTES || value > MAX_FOCUS_MINUTES) return null;
  return value;
}
