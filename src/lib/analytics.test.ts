import { describe, expect, it } from "vitest";
import { buildFocusAnalytics, localDateKey } from "@/lib/analytics";
import type { FocusSession } from "@/types";

function session(id: string, date: string, durationMinutes: number, completed = true): FocusSession {
  return {
    id,
    completedAt: new Date(`${date}T12:00:00`).getTime(),
    durationMinutes,
    completed,
    taskId: null
  };
}

describe("focus analytics", () => {
  it("uses local calendar dates and groups the week from Monday", () => {
    const now = new Date(2026, 10, 18, 15, 0); // Wednesday, local time.
    const sessions = [
      session("mon", "2026-11-16", 25),
      session("wed-a", "2026-11-18", 40),
      session("wed-b", "2026-11-18", 15),
      session("sun", "2026-11-22", 10),
      session("previous", "2026-11-09", 50)
    ];

    const result = buildFocusAnalytics(sessions, now);

    expect(result.minutesToday).toBe(55);
    expect(result.sessionsToday).toBe(2);
    expect(result.minutesWeek).toBe(90);
    expect(result.sessionsWeek).toBe(4);
    expect(result.days.map((day) => day.minutes)).toEqual([25, 0, 55, 0, 0, 0, 10]);
    expect(result.totalMinutes).toBe(140);
  });

  it("ignores incomplete and invalid-duration sessions", () => {
    const now = new Date(2026, 10, 18, 15, 0);
    const sessions = [
      session("valid", "2026-11-18", 25),
      session("unfinished", "2026-11-18", 60, false),
      session("zero", "2026-11-18", 0),
      session("negative", "2026-11-18", -10)
    ];

    const result = buildFocusAnalytics(sessions, now);
    expect(result.totalSessions).toBe(1);
    expect(result.totalMinutes).toBe(25);
  });

  it("formats date keys using local year, month and day", () => {
    expect(localDateKey(new Date(2026, 0, 4, 23, 30))).toBe("2026-01-04");
  });
});
