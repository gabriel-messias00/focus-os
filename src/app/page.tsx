"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { StatsGrid } from "@/components/StatsGrid";
import { TaskManager } from "@/components/TaskManager";
import { FocusTimer } from "@/components/FocusTimer";
import { DailyQuote } from "@/components/DailyQuote";
import { LocalDateChip } from "@/components/LocalDateChip";
import { useTasks } from "@/hooks/useTasks";
import { useFocusSessions } from "@/hooks/useFocusSessions";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useAuth } from "@/components/auth/AuthProvider";
import { Cloud, CloudOff, LoaderCircle } from "lucide-react";
import { DeferredSection } from "@/components/DeferredSection";

const CalendarPanel = dynamic(
  () => import("@/components/CalendarPanel").then((module) => module.CalendarPanel),
  {
    ssr: false,
    loading: () => <div className="deferred-loading-surface calendar" aria-label="Carregando calendário" />
  }
);
const AnalyticsPanel = dynamic(
  () => import("@/components/AnalyticsPanel").then((module) => module.AnalyticsPanel),
  {
    ssr: false,
    loading: () => <div className="deferred-loading-surface analytics" aria-label="Carregando desempenho" />
  }
);

export default function HomePage() {
  const { user, supabase } = useAuth();
  const taskManager = useTasks(user.id, supabase);
  const focus = useFocusSessions(user.id, supabase);
  const preferences = useUserPreferences(user.id, supabase);
  const [activeSection, setActiveSection] = useState("overview");
  const dataReady = taskManager.ready && focus.ready && preferences.ready;

  useEffect(() => {
    if (!dataReady) return;
    const sectionIds = ["overview", "missions", "focus", "calendar", "analytics"];
    const targets = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (!targets.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveSection(visible[0].target.id);
    }, { rootMargin: "-18% 0px -62% 0px", threshold: 0.01 });

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [dataReady]);

  if (!dataReady) {
    return <main className="auth-shell"><div className="auth-loading"><div className="brand-mark">FOCUS</div><LoaderCircle size={18} className="auth-pulse"/><span>CARREGANDO SEU ESPAÇO DE TRABALHO</span></div></main>;
  }

  const hasSyncError = taskManager.syncStatus === "error" || focus.syncStatus === "error" || Boolean(preferences.syncError);
  const isSyncing = taskManager.syncStatus === "syncing" || focus.syncStatus === "syncing";

  return (
    <>
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <main className="app-shell" id="main-content" tabIndex={-1}>
      <Header syncStatus={hasSyncError ? "error" : isSyncing ? "syncing" : "synced"} />

      <div className={`cloud-status ${hasSyncError ? "error" : isSyncing ? "syncing" : "synced"}`} role="status">
        {hasSyncError ? <CloudOff size={14}/> : <Cloud size={14}/>}
        <span>{hasSyncError ? "SINCRONIZAÇÃO COM PROBLEMA" : isSyncing ? "SINCRONIZANDO COM A NUVEM" : "DADOS SINCRONIZADOS COM A NUVEM"}</span>
        {hasSyncError && <small>{taskManager.syncError || focus.syncError || preferences.syncError}</small>}
      </div>

      <nav className="quick-nav" aria-label="Navegação principal">
        {[
          ["overview", "Visão geral"],
          ["missions", "Missões"],
          ["focus", "Sessão de foco"],
          ["calendar", "Agenda"],
          ["analytics", "Desempenho"]
        ].map(([id, label]) => (
          <a
            key={id}
            className={`quick-nav-link${activeSection === id ? " active" : ""}`}
            href={`#${id}`}
            aria-current={activeSection === id ? "location" : undefined}
          >
            {label}
          </a>
        ))}
      </nav>

      <section className="hero" id="overview">
        <div>
          <div className="eyebrow">◆ SYSTEM ONLINE</div>
          <h1>Menos abas.<br /><span>Mais execução.</span></h1>
          <p>Organize o caos. Faça o próximo movimento.</p>
        </div>
        <LocalDateChip />
      </section>

      <StatsGrid {...taskManager.stats} />

      <section className="main-grid">
        <TaskManager
          tasks={taskManager.tasks}
          filter={taskManager.filter}
          onFilterChange={taskManager.setFilter}
          onAdd={taskManager.addTask}
          onToggle={taskManager.toggleTask}
          onDelete={taskManager.deleteTask}
          onUpdate={taskManager.updateTask}
          getVisibleTasks={taskManager.getVisibleTasks}
        />
        <aside className="side-column">
          <FocusTimer onSessionComplete={focus.addCompletedSession} tasks={taskManager.tasks} completedSessionsToday={focus.analytics.sessionsToday} />
          <DailyQuote />
        </aside>
      </section>

      <DeferredSection id="calendar" label="Calendário e agenda" minHeight={490}>
        <CalendarPanel tasks={taskManager.tasks} dailyGoal={preferences.dailyGoal} onDailyGoalChange={preferences.setDailyGoal} />
      </DeferredSection>

      <DeferredSection id="analytics" label="Seu desempenho" minHeight={430}>
        <AnalyticsPanel {...focus.analytics} />
      </DeferredSection>

      <footer className="footer">FOCUS//OS · BUILT FOR MOMENTUM · 2.6.0 — FINAL RELEASE · <Link href="/privacy">PRIVACIDADE</Link></footer>
      </main>
    </>
  );
}
