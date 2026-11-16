"use client";

import { useEffect, useState } from "react";

/** Returns the current local date and refreshes once at the next local midnight. */
export function useLocalDay(): Date {
  const [localDay, setLocalDay] = useState(() => new Date());

  useEffect(() => {
    let timeoutId: number | undefined;
    let active = true;

    const refreshAtMidnight = () => {
      if (!active) return;
      const now = new Date();
      setLocalDay((current) => current.toDateString() === now.toDateString() ? current : now);
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      ).getTime() + 50;
      timeoutId = window.setTimeout(
        refreshAtMidnight,
        Math.max(1_000, nextMidnight - Date.now())
      );
    };

    refreshAtMidnight();
    return () => {
      active = false;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return localDay;
}
