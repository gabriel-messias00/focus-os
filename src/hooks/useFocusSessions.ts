"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { claimLegacyMigration, completeLegacyMigration, loadSessions, saveSessions } from "@/lib/storage";
import type { FocusSession } from "@/types";
import { buildFocusAnalytics } from "@/lib/analytics";
import { useLocalDay } from "@/hooks/useLocalDay";
const MIGRATION_KEY = "focus-os.cloud-migration.sessions.v1";
type SessionRow = { id: string; user_id: string; completed_at: string; duration_minutes: number; completed: boolean; task_id: string | null };

function fromRow(row: SessionRow): FocusSession {
  return { id: row.id, completedAt: new Date(row.completed_at).getTime(), durationMinutes: row.duration_minutes, completed: row.completed, taskId: row.task_id };
}

export function useFocusSessions(userId: string, supabase: SupabaseClient<Database>) {
  const db = supabase;
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"syncing" | "synced" | "error">("syncing");
  const [syncError, setSyncError] = useState("");
  const localDay = useLocalDay();

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof db.channel> | null = null;

    async function loadCloudSessions() {
      setReady(false);
      setSyncStatus("syncing");
      try {
        if (claimLegacyMigration(MIGRATION_KEY, userId)) {
          const legacy = loadSessions().map(session => ({
            ...session,
            id: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(session.id) ? session.id : crypto.randomUUID()
          }));
          if (legacy.length) {
            const { error: migrationError } = await db.from("focus_sessions").upsert(
              legacy.map(session => ({
                id: session.id,
                user_id: userId,
                completed_at: new Date(session.completedAt).toISOString(),
                duration_minutes: session.durationMinutes,
                completed: session.completed,
                task_id: null
              })), { onConflict: "id", ignoreDuplicates: true }
            );
            if (migrationError) throw migrationError;
          }
          completeLegacyMigration(MIGRATION_KEY, userId, "focus-os.sessions.v1");
        }
        const { data, error } = await db.from("focus_sessions").select("*").order("completed_at", { ascending: false }).limit(500);
        if (error) throw error;
        if (!active) return;
        const cloudSessions = ((data ?? []) as SessionRow[]).map(fromRow);
        setSessions(cloudSessions);
        saveSessions(cloudSessions, userId);
        setSyncStatus("synced");
        setReady(true);
        channel = db.channel(`focus-os-sessions-${userId}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "focus_sessions", filter: `user_id=eq.${userId}` }, (payload) => {
            if (!payload.new) return;
            const added = fromRow(payload.new as SessionRow);
            setSessions(current => current.some(session => session.id === added.id) ? current : [added, ...current].slice(0, 500));
          })
          .subscribe();
      } catch (caught) {
        if (!active) return;
        setSyncStatus("error");
        setSyncError(caught instanceof Error ? caught.message : "Não foi possível carregar o histórico.");
        setSessions(loadSessions(userId));
        setReady(true);
      }
    }

    void loadCloudSessions();
    return () => {
      active = false;
      if (channel) void db.removeChannel(channel);
    };
  }, [db, userId]);

  useEffect(() => { if (ready) saveSessions(sessions, userId); }, [sessions, ready, userId]);

  const addCompletedSession = useCallback((durationMinutes: number, taskId: string | null = null) => {
    const session: FocusSession = { id: crypto.randomUUID(), completedAt: Date.now(), durationMinutes, completed: true, taskId };
    setSessions(current => [session, ...current].slice(0, 500));
    setSyncStatus("syncing");
    void (async () => {
      try {
        const { error } = await db.from("focus_sessions").insert({
          id: session.id,
          user_id: userId,
          completed_at: new Date(session.completedAt).toISOString(),
          duration_minutes: session.durationMinutes,
          completed: true,
          task_id: taskId
        });
        if (error) throw error;
        setSyncStatus("synced");
        setSyncError("");
      } catch (caught) {
        setSessions(current => current.filter(item => item.id !== session.id));
        setSyncStatus("error");
        setSyncError(caught instanceof Error ? caught.message : "A sessão não pôde ser sincronizada.");
      }
    })();
  }, [db, userId]);

  const analytics = useMemo(() => buildFocusAnalytics(sessions, localDay), [sessions, localDay]);

  return { sessions, analytics, addCompletedSession, ready, syncStatus, syncError };
}
