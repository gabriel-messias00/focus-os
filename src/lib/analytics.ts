import type { FocusSession } from "@/types";

export interface FocusDaySummary {
  label: string;
  dateKey: string;
  minutes: number;
  sessions: number;
}

export interface FocusAnalytics {
  minutesToday: number;
  minutesWeek: number;
  sessionsToday: number;
  sessionsWeek: number;
  days: FocusDaySummary[];
  totalMinutes: number;
  totalSessions: number;
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Aggregates the locally cached/recent sessions in one pass, using local calendar days. */
export function buildFocusAnalytics(
  sessions: FocusSession[],
  now: Date = new Date()
): FocusAnalytics {
  const todayKey = localDateKey(now);
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      dateKey: localDateKey(date),
      label: date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
      minutes: 0,
      sessions: 0
    };
  });
  const byDate = new Map(weekDays.map((day) => [day.dateKey, day]));

  let minutesToday = 0;
  let minutesWeek = 0;
  let sessionsToday = 0;
  let sessionsWeek = 0;
  let totalMinutes = 0;
  let totalSessions = 0;

  for (const session of sessions) {
    if (!session.completed || !Number.isFinite(session.completedAt)) continue;
    const duration = Number.isFinite(session.durationMinutes)
      ? Math.max(0, Math.floor(session.durationMinutes))
      : 0;
    if (duration <= 0) continue;

    totalMinutes += duration;
    totalSessions += 1;

    const key = localDateKey(new Date(session.completedAt));
    if (key === todayKey) {
      minutesToday += duration;
      sessionsToday += 1;
    }

    const day = byDate.get(key);
    if (day) {
      day.minutes += duration;
      day.sessions += 1;
      minutesWeek += duration;
      sessionsWeek += 1;
    }
  }

  return {
    minutesToday,
    minutesWeek,
    sessionsToday,
    sessionsWeek,
    days: weekDays,
    totalMinutes,
    totalSessions
  };
}
