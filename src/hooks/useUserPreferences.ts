"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { clampDailyGoal } from "@/lib/validation";
import { claimLegacyMigration, completeLegacyMigration, loadDailyGoal, saveDailyGoal } from "@/lib/storage";

const LEGACY_KEY = "focus-os.preferences.v1";
const MIGRATION_KEY = "focus-os.cloud-migration.preferences.v1";

export function useUserPreferences(userId: string, supabase: SupabaseClient<Database>) {
  const [dailyGoal, setDailyGoalState] = useState(3);
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    let active = true;
    const channel = supabase.channel(`focus-os-preferences-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_preferences", filter: `user_id=eq.${userId}` }, (payload) => {
        const incoming = Number((payload.new as { daily_goal?: unknown } | null)?.daily_goal);
        if (Number.isFinite(incoming) && incoming >= 1 && incoming <= 30) {
          const safe = clampDailyGoal(incoming);
          setDailyGoalState(safe);
          saveDailyGoal(safe, userId);
        }
      })
      .subscribe();

    async function loadPreferences() {
      setReady(false);
      try {
        const mayImportLegacy = claimLegacyMigration(MIGRATION_KEY, userId);
        const { data, error } = await supabase.from("user_preferences").select("daily_goal").eq("user_id", userId).maybeSingle();
        if (error) throw error;
        if (!active) return;
        if (data) {
          const goal = clampDailyGoal(Number(data.daily_goal));
          setDailyGoalState(goal);
          saveDailyGoal(goal, userId);
          if (mayImportLegacy) completeLegacyMigration(MIGRATION_KEY, userId, LEGACY_KEY);
        } else {
          // A preferência antiga só pode ser importada pela conta que reivindicou a migração.
          let initial = loadDailyGoal(userId) ?? 3;
          if (mayImportLegacy) {
            try {
              const legacyRaw = localStorage.getItem(LEGACY_KEY);
              const legacy = legacyRaw === null ? Number.NaN : Number(legacyRaw);
              if (Number.isInteger(legacy) && legacy >= 1 && legacy <= 30) initial = legacy;
            } catch {
              // Armazenamento do navegador pode estar indisponível; mantém o padrão.
            }
          }
          setDailyGoalState(initial);
          saveDailyGoal(initial, userId);
          const { error: insertError } = await supabase.from("user_preferences").upsert(
            { user_id: userId, daily_goal: initial }, { onConflict: "user_id" }
          );
          if (insertError) throw insertError;
          if (mayImportLegacy) completeLegacyMigration(MIGRATION_KEY, userId, LEGACY_KEY);
        }
        setSyncError("");
      } catch (caught) {
        if (!active) return;
        setSyncError(caught instanceof Error ? caught.message : "Não foi possível carregar as preferências.");
        const cached = loadDailyGoal(userId);
        if (cached !== null) setDailyGoalState(cached);
      } finally {
        if (active) setReady(true);
      }
    }

    void loadPreferences();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [supabase, userId]);

  const setDailyGoal = useCallback((value: number) => {
    const safeValue = clampDailyGoal(value);
    const previousValue = dailyGoal;
    setDailyGoalState(safeValue);
    saveDailyGoal(safeValue, userId);
    void (async () => {
      try {
        const { error } = await supabase.from("user_preferences").upsert(
          { user_id: userId, daily_goal: safeValue }, { onConflict: "user_id" }
        );
        if (error) throw error;
        setSyncError("");
      } catch (caught) {
        setDailyGoalState(previousValue);
        saveDailyGoal(previousValue, userId);
        setSyncError(caught instanceof Error ? caught.message : "A preferência não pôde ser salva.");
      }
    })();
  }, [dailyGoal, supabase, userId]);

  return { dailyGoal, setDailyGoal, ready, syncError };
}
