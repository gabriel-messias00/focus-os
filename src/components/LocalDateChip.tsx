"use client";

import { useEffect, useState } from "react";

function formatLocalDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).toUpperCase();
}

export function LocalDateChip() {
  const [label, setLabel] = useState("DATA LOCAL");

  useEffect(() => {
    let timeoutId: number | undefined;
    const update = () => {
      const now = new Date();
      setLabel(formatLocalDate(now));
      const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() + 50;
      timeoutId = window.setTimeout(update, Math.max(1_000, nextDay - Date.now()));
    };
    update();
    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return <div className="date-chip">{label}</div>;
}
