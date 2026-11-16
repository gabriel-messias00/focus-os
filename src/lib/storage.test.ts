import { afterEach, describe, expect, it, vi } from "vitest";
import { claimLegacyMigration, clearUserCache, completeLegacyMigration, loadDailyGoal, loadSessions, loadTasks, saveDailyGoal, saveSessions, saveTasks } from "@/lib/storage";

describe("migração legada do navegador", () => {
  const values = new Map<string, string>();
  const localStorageMock = {
    getItem: (key: string) => values.has(key) ? values.get(key)! : null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
    clear: () => values.clear(),
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() { return values.size; },
  };

  afterEach(() => {
    values.clear();
    vi.unstubAllGlobals();
  });

  it("reserva os dados antigos para a primeira conta", () => {
    vi.stubGlobal("window", { localStorage: localStorageMock });
    expect(claimLegacyMigration("legacy.tasks", "user-a")).toBe(true);
    expect(claimLegacyMigration("legacy.tasks", "user-a")).toBe(true);
    expect(claimLegacyMigration("legacy.tasks", "user-b")).toBe(false);
  });

  it("marca a migração como concluída e impede uma segunda importação", () => {
    vi.stubGlobal("window", { localStorage: localStorageMock });
    expect(claimLegacyMigration("legacy.sessions", "user-a")).toBe(true);
    completeLegacyMigration("legacy.sessions", "user-a");
    expect(claimLegacyMigration("legacy.sessions", "user-a")).toBe(false);
    expect(claimLegacyMigration("legacy.sessions", "user-b")).toBe(false);
  });

  it("não libera a migração quando o armazenamento está indisponível", () => {
    vi.stubGlobal("window", { localStorage: { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } } });
    expect(claimLegacyMigration("legacy.preferences", "user-a")).toBe(false);
  });

  it("limpa somente o cache local da conta que saiu", () => {
    vi.stubGlobal("window", { localStorage: localStorageMock });
    saveTasks([{ id: "task-a", title: "Minha tarefa", priority: "high", category: "study", dueDate: null, done: false, createdAt: 1 }], "user-a");
    saveSessions([{ id: "session-a", completedAt: 1, durationMinutes: 25, completed: true }], "user-a");
    saveDailyGoal(5, "user-a");
    saveTasks([{ id: "task-b", title: "Outra tarefa", priority: "low", category: "other", dueDate: null, done: false, createdAt: 2 }], "user-b");

    clearUserCache("user-a");

    expect(loadTasks("user-a")).toEqual([]);
    expect(loadSessions("user-a")).toEqual([]);
    expect(loadDailyGoal("user-a")).toBeNull();
    expect(loadTasks("user-b")).toHaveLength(1);
  });
});
