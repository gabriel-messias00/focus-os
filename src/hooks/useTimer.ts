
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_MINUTES = 25;

type TimerCompletion = () => number | void;

export function useTimer(onComplete?: TimerCompletion) {
  const [duration, setDuration] = useState(DEFAULT_MINUTES);
  const [remaining, setRemaining] = useState(DEFAULT_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);

  const remainingRef = useRef(DEFAULT_MINUTES * 60);
  const endAt = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const completeTimer = useCallback(() => {
    endAt.current = null;
    setIsRunning(false);

    const nextMinutes = onCompleteRef.current?.();

    if (typeof nextMinutes === "number" && Number.isFinite(nextMinutes)) {
      const safeMinutes = Math.min(180, Math.max(1, Math.floor(nextMinutes)));
      const nextRemaining = safeMinutes * 60;

      remainingRef.current = nextRemaining;
      setDuration(safeMinutes);
      setRemaining(nextRemaining);
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    // O prazo é definido ao iniciar/retomar, não a cada renderização.
    if (endAt.current === null) {
      endAt.current = Date.now() + remainingRef.current * 1000;
    }

    let timeoutId: number | undefined;

    const tick = () => {
      const deadline = endAt.current;
      if (deadline === null) return;

      const remainingMs = deadline - Date.now();
      const next = Math.max(0, Math.ceil(remainingMs / 1000));

      // Atualiza a interface somente quando o segundo visível muda.
      if (next !== remainingRef.current) {
        remainingRef.current = next;
        setRemaining(next);
      }

      if (next === 0) {
        completeTimer();
        return;
      }

      // Agenda o próximo tick próximo da virada do segundo.
      const untilNextSecond = remainingMs - (next - 1) * 1000;
      timeoutId = window.setTimeout(
        tick,
        Math.max(40, untilNextSecond + 8)
      );
    };

    tick();

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isRunning, completeTimer]);

  const applyDuration = useCallback((minutes: number) => {
    const safeMinutes = Math.min(180, Math.max(1, Math.floor(minutes)));
    const nextRemaining = safeMinutes * 60;

    endAt.current = null;
    remainingRef.current = nextRemaining;

    setIsRunning(false);
    setDuration(safeMinutes);
    setRemaining(nextRemaining);
  }, []);

  function start() {
    if (remainingRef.current <= 0 || isRunning) return;

    endAt.current = Date.now() + remainingRef.current * 1000;
    setIsRunning(true);
  }

  function pause() {
    if (endAt.current !== null) {
      const next = Math.max(
        0,
        Math.ceil((endAt.current - Date.now()) / 1000)
      );

      if (next === 0) {
        completeTimer();
        return;
      }

      remainingRef.current = next;
      setRemaining(next);
    }

    endAt.current = null;
    setIsRunning(false);
  }

  function reset() {
    const nextRemaining = duration * 60;

    endAt.current = null;
    remainingRef.current = nextRemaining;

    setIsRunning(false);
    setRemaining(nextRemaining);
  }

  const minutes = Math.floor(remaining / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (remaining % 60)
    .toString()
    .padStart(2, "0");

  return {
    duration,
    remaining,
    isRunning,
    timeLabel: `${minutes}:${seconds}`,
    progress: duration
      ? ((duration * 60 - remaining) / (duration * 60)) * 100
      : 0,
    isComplete: remaining === 0,
    applyDuration,
    start,
    pause,
    reset
  };
}
