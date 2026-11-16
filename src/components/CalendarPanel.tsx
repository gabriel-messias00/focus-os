"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, CircleCheck, Target } from "lucide-react";
import type { Task } from "@/types";
import { useLocalDay } from "@/hooks/useLocalDay";

interface CalendarPanelProps { tasks: Task[]; dailyGoal: number; onDailyGoalChange: (value: number) => void }
const pad = (value: number) => String(value).padStart(2, "0");
const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const monthLabel = (date: Date) => date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

function CalendarPanelView({ tasks, dailyGoal, onDailyGoalChange }: CalendarPanelProps) {
  const today = useLocalDay();
  const todayKey = dateKey(today);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => todayKey);
  const [goalInput, setGoalInput] = useState(String(dailyGoal));
  const previousTodayKey = useRef(todayKey);

  useEffect(() => {
    if (selectedDate === previousTodayKey.current) setSelectedDate(todayKey);
    previousTodayKey.current = todayKey;
  }, [selectedDate, todayKey]);

  const commitDailyGoal = () => {
    const parsed = Number.parseInt(goalInput, 10);
    const safeGoal = Number.isFinite(parsed) ? Math.min(30, Math.max(1, parsed)) : dailyGoal;
    setGoalInput(String(safeGoal));
    if (safeGoal !== dailyGoal) onDailyGoalChange(safeGoal);
  };

  const calendarDays = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - mondayOffset);
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [visibleMonth]);

  const taskCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const task of tasks) {
      if (task.dueDate) counts.set(task.dueDate, (counts.get(task.dueDate) ?? 0) + 1);
    }
    return counts;
  }, [tasks]);
  const dayTasks = useMemo(() => tasks.filter(task => task.dueDate === selectedDate), [tasks, selectedDate]);
  const completed = useMemo(() => dayTasks.reduce((count, task) => count + Number(task.done), 0), [dayTasks]);
  const goal = Math.max(1, dailyGoal);
  const goalProgress = Math.min(100, Math.round((completed / goal) * 100));
  const selectedLabel = useMemo(
    () => new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }),
    [selectedDate]
  );
  return (
    <section className="calendar-section" id="calendar-panel">
      <div className="section-heading">
        <div><div className="eyebrow">◆ PLANEJAMENTO INTELIGENTE</div><h2>Calendário & agenda</h2><p>Visualize prazos e organize o que precisa acontecer.</p></div>
        <span className="analytics-period"><CalendarDays size={14}/> PLANEJAMENTO</span>
      </div>
      <div className="calendar-layout">
        <div className="panel calendar-panel">
          <div className="calendar-toolbar">
            <div><strong>{monthLabel(visibleMonth)}</strong><small>Selecione um dia para ver suas missões</small></div>
            <div className="calendar-controls">
              <button type="button" className="calendar-icon-button" aria-label="Mês anterior" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}><ChevronLeft size={17}/></button>
              <button type="button" className="calendar-today-button" onClick={() => { setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(dateKey(today)); }}>HOJE</button>
              <button type="button" className="calendar-icon-button" aria-label="Próximo mês" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}><ChevronRight size={17}/></button>
            </div>
          </div>
          <div className="calendar-grid calendar-weekdays">{["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"].map(day => <span key={day}>{day}</span>)}</div>
          <div className="calendar-grid calendar-days">
            {calendarDays.map(day => {
              const key = dateKey(day);
              const count = taskCounts.get(key) ?? 0;
              const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
              const accessibleDate = day.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
              return <button type="button" key={key} aria-label={`${accessibleDate}${count ? `, ${count} tarefas` : ""}`} className={`calendar-day${isCurrentMonth ? "" : " outside"}${key === selectedDate ? " selected" : ""}${key === todayKey ? " is-today" : ""}`} onClick={() => setSelectedDate(key)} aria-pressed={key === selectedDate}>
                <span>{day.getDate()}</span>{count > 0 && <i aria-label={`${count} tarefas`} />}
              </button>;
            })}
          </div>
          <div className="calendar-legend"><span><i className="legend-dot"/> Dia com tarefas</span><span><i className="legend-ring"/> Hoje</span></div>
        </div>

        <aside className="panel agenda-panel">
          <div className="agenda-heading"><div><div className="eyebrow">◆ SUA AGENDA</div><h3>{selectedLabel}</h3></div><span className="agenda-count">{dayTasks.length.toString().padStart(2, "0")}</span></div>
          {dayTasks.length ? <div className="agenda-list">{dayTasks.map(task => <article className={`agenda-task${task.done ? " completed" : ""}`} key={task.id}><span className={`agenda-priority ${task.priority}`}/><div><strong>{task.title}</strong><small>{task.category === "work" ? "Trabalho" : task.category === "study" ? "Estudo" : task.category === "personal" ? "Pessoal" : "Outra"}</small></div>{task.done && <CircleCheck size={15}/>}</article>)}</div> : <div className="agenda-empty"><CalendarDays size={23}/><strong>Nenhuma missão com prazo</strong><span>Adicione uma data de vencimento a uma tarefa para vê-la aqui.</span></div>}
          <div className="daily-goal">
            <div className="goal-heading"><span><Target size={14}/> META DIÁRIA</span><strong>{completed}/{goal} concluídas</strong></div>
            <label htmlFor="daily-goal-input">Missões para concluir no dia</label>
            <input
              id="daily-goal-input"
              type="number"
              min="1"
              max="30"
              step="1"
              inputMode="numeric"
              value={goalInput}
              onChange={event => setGoalInput(event.target.value)}
              onBlur={commitDailyGoal}
              onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }}
              aria-describedby="daily-goal-help"
            />
            <div className="goal-track"><div style={{ width: `${goalProgress}%` }}/></div>
            <small id="daily-goal-help">{goalProgress}% da meta atingida com tarefas que têm prazo neste dia. A meta é salva ao sair do campo.</small>
          </div>
        </aside>
      </div>
    </section>
  );
}

export const CalendarPanel = memo(CalendarPanelView);
