"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { claimLegacyMigration, completeLegacyMigration, loadTasks, saveTasks } from "@/lib/storage";
import type { Category, Priority, Task, TaskFilter, TaskSort } from "@/types";
import { isValidDateOnly, isValidTaskCategory, isValidTaskPriority, normalizeTaskTitle } from "@/lib/validation";

type SyncStatus = "syncing" | "synced" | "error";
type TaskRow = {
  id: string; user_id: string; title: string; priority: Priority; category: Category;
  due_date: string | null; done: boolean; created_at: string; updated_at: string;
};

const MIGRATION_KEY = "focus-os.cloud-migration.tasks.v1";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function fromRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    priority: row.priority,
    category: row.category,
    dueDate: row.due_date,
    done: row.done,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime()
  };
}

function toRow(task: Task, userId: string) {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    priority: task.priority,
    category: task.category,
    due_date: task.dueDate,
    done: task.done,
    created_at: new Date(task.createdAt).toISOString(),
    updated_at: new Date(task.updatedAt ?? task.createdAt).toISOString()
  };
}

function prepareLegacyTasks(tasks: Task[]): Task[] {
  return tasks.map(task => ({
    ...task,
    id: UUID_PATTERN.test(task.id) ? task.id : crypto.randomUUID(),
    dueDate: task.dueDate && isValidDateOnly(task.dueDate) ? task.dueDate : null
  }));
}

export function useTasks(userId: string, supabase: SupabaseClient<Database>) {
  const db = supabase;
  const [tasks, setTasks] = useState<Task[]>([]);
  const tasksRef = useRef<Task[]>(tasks);
  // Mantém a referência sincronizada após cada commit, sem mutá-la durante o render.
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("syncing");
  const [syncError, setSyncError] = useState("");

  const markError = useCallback((error: { message?: string } | null) => {
    if (!error) return;
    setSyncStatus("error");
    setSyncError(error.message || "Não foi possível sincronizar as missões.");
  }, []);

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof db.channel> | null = null;

    async function loadCloudTasks() {
      setReady(false);
      setSyncStatus("syncing");
      setSyncError("");
      try {
        // Migra uma única vez as tarefas antigas do localStorage para a primeira conta conectada.
        if (claimLegacyMigration(MIGRATION_KEY, userId)) {
          const legacyTasks = prepareLegacyTasks(loadTasks());
          if (legacyTasks.length) {
            const { error: migrationError } = await db.from("tasks").upsert(
              legacyTasks.map(task => toRow(task, userId)),
              { onConflict: "id", ignoreDuplicates: true }
            );
            if (migrationError) throw migrationError;
          }
          completeLegacyMigration(MIGRATION_KEY, userId, "focus-os.tasks.v1");
        }

        const { data, error } = await db.from("tasks").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        if (!active) return;
        const cloudTasks = ((data ?? []) as TaskRow[]).map(fromRow);
        setTasks(cloudTasks);
        saveTasks(cloudTasks, userId);
        setSyncStatus("synced");
        setReady(true);

        channel = db.channel(`focus-os-tasks-${userId}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${userId}` }, (payload) => {
            if (payload.eventType === "DELETE") {
              const deletedId = String(payload.old?.id ?? "");
              setTasks(current => current.filter(task => task.id !== deletedId));
              return;
            }
            if (payload.new) {
              const nextTask = fromRow(payload.new as TaskRow);
              setTasks(current => {
                const exists = current.some(task => task.id === nextTask.id);
                return exists ? current.map(task => task.id === nextTask.id ? nextTask : task) : [nextTask, ...current];
              });
            }
          })
          .subscribe();
      } catch (caught) {
        if (!active) return;
        const message = caught instanceof Error ? caught.message : "Falha ao carregar as missões da nuvem.";
        setSyncError(message);
        setSyncStatus("error");
        // Cache local continua visível para que uma falha de rede não esconda o trabalho existente.
        setTasks(loadTasks(userId));
        setReady(true);
      }
    }

    void loadCloudTasks();
    return () => {
      active = false;
      if (channel) void db.removeChannel(channel);
    };
  }, [db, userId]);

  useEffect(() => {
    if (ready) saveTasks(tasks, userId);
  }, [tasks, ready, userId]);

  const finishMutation = useCallback(async (
    result: PromiseLike<{ error: { message: string } | null }>,
    rollback: () => void
  ) => {
    setSyncStatus("syncing");
    try {
      const { error } = await result;
      if (error) throw error;
      setSyncStatus("synced");
      setSyncError("");
    } catch (caught) {
      rollback();
      markError({ message: caught instanceof Error ? caught.message : "A alteração não pôde ser sincronizada." });
    }
  }, [markError]);

  const addTask = useCallback((title: string, priority: Priority, category: Category, dueDate: string) => {
    const cleanTitle = normalizeTaskTitle(title);
    if (!cleanTitle) return;
    const safePriority = isValidTaskPriority(priority) ? priority : "medium";
    const safeCategory = isValidTaskCategory(category) ? category : "other";
    const safeDueDate = dueDate && isValidDateOnly(dueDate) ? dueDate : null;
    const task: Task = {
      id: crypto.randomUUID(), title: cleanTitle, priority: safePriority, category: safeCategory,
      dueDate: safeDueDate, done: false, createdAt: Date.now()
    };
    setTasks(current => [task, ...current]);
    void finishMutation(db.from("tasks").insert(toRow(task, userId)), () => {
      setTasks(current => current.filter(item => item.id !== task.id));
    });
  }, [db, finishMutation, userId]);

  const updateTask = useCallback((id: string, changes: Pick<Task, "title" | "priority" | "category" | "dueDate">) => {
    const cleanTitle = normalizeTaskTitle(changes.title);
    if (!cleanTitle) return;
    const existing = tasksRef.current.find(task => task.id === id);
    if (!existing) return;
    const safePriority = isValidTaskPriority(changes.priority) ? changes.priority : existing.priority;
    const safeCategory = isValidTaskCategory(changes.category) ? changes.category : existing.category;
    const safeDueDate = changes.dueDate && isValidDateOnly(changes.dueDate) ? changes.dueDate : null;
    const updated: Task = { ...existing, ...changes, title: cleanTitle, priority: safePriority, category: safeCategory, dueDate: safeDueDate, updatedAt: Date.now() };
    setTasks(current => current.map(task => task.id === id ? updated : task));
    void finishMutation(
      db.from("tasks").update({ title: updated.title, priority: updated.priority, category: updated.category, due_date: updated.dueDate, updated_at: new Date(updated.updatedAt!).toISOString() }).eq("id", id).eq("user_id", userId),
      () => setTasks(current => current.map(task => task.id === id ? existing : task))
    );
  }, [db, finishMutation, userId]);

  const toggleTask = useCallback((id: string) => {
    const existing = tasksRef.current.find(task => task.id === id);
    if (!existing) return;
    const updated = { ...existing, done: !existing.done, updatedAt: Date.now() };
    setTasks(current => current.map(task => task.id === id ? updated : task));
    void finishMutation(
      db.from("tasks").update({ done: updated.done, updated_at: new Date(updated.updatedAt!).toISOString() }).eq("id", id).eq("user_id", userId),
      () => setTasks(current => current.map(task => task.id === id ? existing : task))
    );
  }, [db, finishMutation, userId]);

  const deleteTask = useCallback((id: string) => {
    const existing = tasksRef.current.find(task => task.id === id);
    if (!existing) return;
    setTasks(current => current.filter(task => task.id !== id));
    void finishMutation(
      db.from("tasks").delete().eq("id", id).eq("user_id", userId),
      () => setTasks(current => current.some(task => task.id === id) ? current : [existing, ...current])
    );
  }, [db, finishMutation, userId]);

  const stats = useMemo(() => {
    const completed = tasks.filter(task => task.done).length;
    const total = tasks.length;
    return { total, completed, pending: total - completed, progress: total ? Math.round((completed / total) * 100) : 0 };
  }, [tasks]);

  const getVisibleTasks = useCallback((search: string, category: Category | "all", sort: TaskSort) => {
    const normalized = search.trim().toLocaleLowerCase("pt-BR");
    return tasks
      .filter(task => filter === "all" || (filter === "pending" ? !task.done : task.done))
      .filter(task => category === "all" || task.category === category)
      .filter(task => !normalized || task.title.toLocaleLowerCase("pt-BR").includes(normalized))
      .sort((a, b) => {
        if (sort === "oldest") return a.createdAt - b.createdAt;
        if (sort === "priority") return priorityOrder[a.priority] - priorityOrder[b.priority];
        if (sort === "dueDate") return (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31");
        return b.createdAt - a.createdAt;
      });
  }, [tasks, filter]);

  return { tasks, filter, setFilter, stats, addTask, updateTask, toggleTask, deleteTask, getVisibleTasks, ready, syncStatus, syncError };
}
