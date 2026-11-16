
"use client";

import { memo, useCallback, useMemo, useState } from "react";
import {
  Bell,
  BellOff,
  Coffee,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Timer
} from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import type { Task } from "@/types";

interface FocusTimerProps {
  onSessionComplete: (minutes: number, taskId: string | null) => void;
  tasks: Task[];
  completedSessionsToday: number;
}

type TimerMode = "focus" | "shortBreak" | "longBreak";

const modeCopy: Record<
  TimerMode,
  { label: string; minutes: number; description: string }
> = {
  focus: {
    label: "FOCO",
    minutes: 25,
    description: "Uma tarefa de cada vez. Proteja sua atenção."
  },
  shortBreak: {
    label: "PAUSA CURTA",
    minutes: 5,
    description: "Levante, respire e descanse um pouco."
  },
  longBreak: {
    label: "PAUSA LONGA",
    minutes: 15,
    description: "Você completou quatro ciclos. Faça uma pausa maior."
  }
};

function FocusTimerView({
  onSessionComplete,
  tasks,
  completedSessionsToday
}: FocusTimerProps) {
  const [inputMinutes, setInputMinutes] = useState("25");
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [message, setMessage] = useState(
    "Escolha a duração e comece quando estiver pronto."
  );
  const [selectedTaskId, setSelectedTaskId] = useState("");

  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | "unsupported">(() =>
      typeof Notification === "undefined"
        ? "unsupported"
        : Notification.permission
    );

  const pendingTasks = useMemo(
    () => tasks.filter(task => !task.done),
    [tasks]
  );

  const linkedTaskId =
    selectedTaskId &&
    pendingTasks.some(task => task.id === selectedTaskId)
      ? selectedTaskId
      : null;

  const isFocusMode = mode === "focus";

  const handleTimerComplete = useCallback((): number => {
    if (mode === "focus") {
      onSessionComplete(focusMinutes, linkedTaskId);

      const nextCount = completedSessionsToday + 1;
      const nextMode: TimerMode =
        nextCount % 4 === 0 ? "longBreak" : "shortBreak";

      setMode(nextMode);

      setMessage(
        nextMode === "longBreak"
          ? "Quatro ciclos concluídos. Hora de uma pausa longa!"
          : "Sessão registrada. Sua pausa curta está pronta."
      );

      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        new Notification("FOCUS//OS — Sessão concluída", {
          body:
            nextMode === "longBreak"
              ? "Você merece uma pausa maior."
              : "Bom trabalho! Faça uma pausa de 5 minutos."
        });
      }

      return modeCopy[nextMode].minutes;
    }

    setMode("focus");
    setMessage(
      "Pausa concluída. Quando estiver pronto, comece o próximo foco."
    );

    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      new Notification("FOCUS//OS — Pausa concluída", {
        body: "Seu próximo ciclo de foco está pronto."
      });
    }

    return focusMinutes;
  }, [
    mode,
    focusMinutes,
    linkedTaskId,
    completedSessionsToday,
    onSessionComplete
  ]);

  const timer = useTimer(handleTimerComplete);

  function applyTime() {
    const parsed = Number(inputMinutes);

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 180) {
      setMessage("Escolha um tempo inteiro entre 1 e 180 minutos.");
      return;
    }

    setFocusMinutes(parsed);
    setMode("focus");
    timer.applyDuration(parsed);

    setMessage(`Sessão de foco configurada para ${parsed} minutos.`);
  }

  function startNextFocus() {
    setMode("focus");
    timer.applyDuration(focusMinutes);
    timer.start();

    setMessage("Novo ciclo iniciado. Foco total!");
  }

  function toggleTimer() {
    if (timer.isRunning) {
      timer.pause();
      setMessage("Sessão pausada. Retome quando quiser.");
      return;
    }

    if (timer.isComplete) {
      timer.reset();
    }

    timer.start();

    setMessage(
      isFocusMode
        ? "Foco total. Uma tarefa de cada vez."
        : "Pausa iniciada. Descanse sem culpa."
    );
  }

  function skipBreak() {
    if (isFocusMode || timer.isRunning) return;

    startNextFocus();
  }

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      setNotificationPermission("unsupported");
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      setNotificationPermission(permission);

      setMessage(
        permission === "granted"
          ? "Avisos ativados para o fim dos ciclos."
          : "O navegador não autorizou as notificações."
      );
    } catch {
      setNotificationPermission("unsupported");
      setMessage("Não foi possível ativar notificações neste navegador.");
    }
  }

  const progress = timer.progress;
  const circumference = 2 * Math.PI * 78;

  const notificationLabel =
    notificationPermission === "granted"
      ? "AVISOS ATIVADOS"
      : notificationPermission === "unsupported"
        ? "AVISOS INDISPONÍVEIS"
        : notificationPermission === "denied"
          ? "AVISOS BLOQUEADOS"
          : "ATIVAR AVISOS";

  return (
    <section
      className="panel focus-panel"
      id="focus"
      aria-labelledby="focus-heading"
    >
      <div className="focus-kicker">
        <span className="live-dot" /> DEEP WORK MODE
      </div>

      <div className="focus-title">
        <Timer size={17} />
        <h2 id="focus-heading">SESSÃO DE FOCO</h2>
      </div>

      <div
        className="pomodoro-mode-tabs"
        role="group"
        aria-label="Modo do cronômetro"
      >
        <button
          type="button"
          className={mode === "focus" ? "active" : ""}
          disabled={timer.isRunning}
          onClick={() => {
            setMode("focus");
            timer.applyDuration(focusMinutes);
            setMessage(modeCopy.focus.description);
          }}
        >
          FOCO
        </button>

        <button
          type="button"
          className={mode === "shortBreak" ? "active" : ""}
          disabled={timer.isRunning}
          onClick={() => {
            setMode("shortBreak");
            timer.applyDuration(5);
            setMessage(modeCopy.shortBreak.description);
          }}
        >
          PAUSA 5M
        </button>

        <button
          type="button"
          className={mode === "longBreak" ? "active" : ""}
          disabled={timer.isRunning}
          onClick={() => {
            setMode("longBreak");
            timer.applyDuration(15);
            setMessage(modeCopy.longBreak.description);
          }}
        >
          PAUSA 15M
        </button>
      </div>

      <div
        className={`timer-ring ${timer.isRunning ? "running" : ""}`}
        role="timer"
        aria-label={`Tempo restante: ${timer.timeLabel}`}
      >
        <svg viewBox="0 0 180 180" aria-hidden="true">
          <circle
            className="timer-ring-track"
            cx="90"
            cy="90"
            r="78"
          />
          <circle
            className="timer-ring-progress"
            cx="90"
            cy="90"
            r="78"
            strokeDasharray={circumference}
            strokeDashoffset={
              circumference * (1 - progress / 100)
            }
          />
        </svg>

        <div className="timer-ring-content">
          <strong>{timer.timeLabel}</strong>
          <span>{modeCopy[mode].label}</span>
        </div>
      </div>

      <p className="timer-message" aria-live="polite">
        {timer.isComplete
          ? "Ciclo finalizado."
          : message || modeCopy[mode].description}
      </p>

      {isFocusMode && (
        <div className="timer-task-control">
          <label htmlFor="focus-task">
            MISSÃO DESTA SESSÃO <span>(OPCIONAL)</span>
          </label>

          <select
            id="focus-task"
            value={selectedTaskId}
            onChange={event => setSelectedTaskId(event.target.value)}
            disabled={timer.isRunning}
          >
            <option value="">
              Foco livre — sem missão vinculada
            </option>

            {pendingTasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {isFocusMode && (
        <div className="duration-control">
          <label htmlFor="duration">
            DURAÇÃO <span>(MINUTOS)</span>
          </label>

          <div className="duration-input-row">
            <input
              id="duration"
              type="number"
              min="1"
              max="180"
              step="1"
              value={inputMinutes}
              onChange={event => setInputMinutes(event.target.value)}
              disabled={timer.isRunning}
            />

            <button
              className="secondary-button"
              type="button"
              onClick={applyTime}
              disabled={timer.isRunning}
            >
              APLICAR
            </button>
          </div>

          <div className="duration-hint">
            Personalize seu foco de 1 a 180 minutos.
          </div>
        </div>
      )}

      <div className="timer-actions">
        <button
          className="primary-button timer-main-button"
          type="button"
          onClick={toggleTimer}
        >
          {timer.isRunning ? (
            <>
              <Pause size={15} /> PAUSAR
            </>
          ) : (
            <>
              <Play size={15} />
              {isFocusMode ? "INICIAR FOCO" : "INICIAR PAUSA"}
            </>
          )}
        </button>

        <button
          className="secondary-button reset-button"
          type="button"
          onClick={() => {
            timer.reset();
            setMessage("Cronômetro reiniciado.");
          }}
          aria-label="Reiniciar cronômetro"
        >
          <RotateCcw size={15} /> REINICIAR
        </button>
      </div>

      {!isFocusMode && (
        <button
          className="skip-break-button"
          type="button"
          onClick={skipBreak}
          disabled={timer.isRunning}
        >
          <SkipForward size={13} /> PULAR PAUSA
        </button>
      )}

      <div className="pomodoro-footer">
        <span>
          <Coffee size={13} /> CICLOS CONCLUÍDOS HOJE:{" "}
          {completedSessionsToday}
        </span>

        <button
          type="button"
          className="notification-button"
          onClick={() => void enableNotifications()}
          disabled={
            notificationPermission === "granted" ||
            notificationPermission === "denied" ||
            notificationPermission === "unsupported"
          }
          title={notificationLabel}
        >
          {notificationPermission === "granted" ||
          notificationPermission === "unsupported" ||
          notificationPermission === "denied" ? (
            <BellOff size={13} />
          ) : (
            <Bell size={13} />
          )}

          {notificationLabel}
        </button>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
}

export const FocusTimer = memo(FocusTimerView);
