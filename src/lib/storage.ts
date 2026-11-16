import type { Category, Priority, Task, FocusSession } from "@/types";

const TASKS_KEY = "focus-os.tasks.v1";
const SESSIONS_KEY = "focus-os.sessions.v1";
const priorities: Priority[] = ["high", "medium", "low"];
const categories: Category[] = ["work", "study", "personal", "other"];

function scopedKey(base: string, userId?: string): string {
  return userId ? `${base}.user.${encodeURIComponent(userId)}` : base;
}

function readArray(key: string): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadTasks(userId?: string): Task[] {
  return readArray(scopedKey(TASKS_KEY, userId)).flatMap((item): Task[] => {
    if (!item || typeof item !== "object") return [];
    const value = item as Partial<Task>;
    if (typeof value.id !== "string" || typeof value.title !== "string" ||
        typeof value.done !== "boolean" || typeof value.createdAt !== "number" ||
        !priorities.includes(value.priority as Priority)) return [];
    return [{
      id: value.id,
      title: value.title.slice(0, 90),
      done: value.done,
      createdAt: value.createdAt,
      priority: value.priority as Priority,
      category: categories.includes(value.category as Category) ? value.category as Category : "other",
      dueDate: typeof value.dueDate === "string" && value.dueDate ? value.dueDate : null,
      updatedAt: typeof value.updatedAt === "number" ? value.updatedAt : undefined
    }];
  });
}

export function saveTasks(tasks: Task[], userId?: string): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(scopedKey(TASKS_KEY, userId), JSON.stringify(tasks)); }
  catch (error) { console.error("Não foi possível salvar o cache local das tarefas:", error); }
}

export function loadSessions(userId?: string): FocusSession[] {
  return readArray(scopedKey(SESSIONS_KEY, userId)).flatMap((item): FocusSession[] => {
    if (!item || typeof item !== "object") return [];
    const value = item as Partial<FocusSession> & { startedAt?: number };
    const completedAt = typeof value.completedAt === "number" ? value.completedAt :
      typeof value.startedAt === "number" ? value.startedAt : null;
    if (typeof value.id !== "string" || completedAt === null ||
        typeof value.durationMinutes !== "number" || value.durationMinutes < 1 ||
        value.durationMinutes > 180 || typeof value.completed !== "boolean") return [];
    return [{
      id: value.id,
      completedAt,
      durationMinutes: Math.floor(value.durationMinutes),
      completed: value.completed,
      taskId: typeof value.taskId === "string" ? value.taskId : null
    }];
  });
}

export function saveSessions(sessions: FocusSession[], userId?: string): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(scopedKey(SESSIONS_KEY, userId), JSON.stringify(sessions)); }
  catch (error) { console.error("Não foi possível salvar o cache local do histórico:", error); }
}

export function loadDailyGoal(userId?: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(scopedKey("focus-os.preferences.v1", userId));
    if (raw === null) return null;
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed >= 1 && parsed <= 30 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveDailyGoal(goal: number, userId?: string): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(scopedKey("focus-os.preferences.v1", userId), String(goal)); }
  catch (error) { console.error("Não foi possível salvar o cache local das preferências:", error); }
}

/**
 * Claims the one-time legacy browser-data import for one account.
 * If the browser is shared or the first upload fails, a second account cannot
 * accidentally import the first account's old, unscoped local data.
 */
export function claimLegacyMigration(key: string, userId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const owner = window.localStorage.getItem(key);
    if (owner === "done") {
      const migratedLegacyKeys: Record<string, string> = {
        "focus-os.cloud-migration.tasks.v1": TASKS_KEY,
        "focus-os.cloud-migration.sessions.v1": SESSIONS_KEY,
        "focus-os.cloud-migration.preferences.v1": "focus-os.preferences.v1"
      };
      const legacyKey = migratedLegacyKeys[key];
      if (legacyKey) window.localStorage.removeItem(legacyKey);
      return false;
    }
    if (!owner) {
      window.localStorage.setItem(key, userId);
      return true;
    }
    return owner === userId;
  } catch {
    return false;
  }
}

export function completeLegacyMigration(key: string, userId: string, legacyDataKey?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(key) === userId) {
      window.localStorage.setItem(key, "done");
      if (legacyDataKey) window.localStorage.removeItem(legacyDataKey);
    }
  } catch (error) {
    console.error("Não foi possível finalizar a migração dos dados antigos:", error);
  }
}

/** Remove apenas o cache local da conta que acabou de sair. */
export function clearUserCache(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(scopedKey(TASKS_KEY, userId));
    window.localStorage.removeItem(scopedKey(SESSIONS_KEY, userId));
    window.localStorage.removeItem(scopedKey("focus-os.preferences.v1", userId));
  } catch (error) {
    console.error("Não foi possível limpar o cache local desta conta:", error);
  }
}
