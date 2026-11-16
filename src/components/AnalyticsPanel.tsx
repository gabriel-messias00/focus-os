import { memo } from "react";
import { Activity, Clock3, Flame, TimerReset } from "lucide-react";

interface DayData { label: string; minutes: number }
interface AnalyticsPanelProps {
  minutesToday: number; minutesWeek: number; sessionsToday: number; sessionsWeek: number;
  days: DayData[]; totalMinutes: number; totalSessions: number;
}

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h ${rest}min` : `${rest} min`;
}

function AnalyticsPanelView(props: AnalyticsPanelProps) {
  const max = Math.max(60, ...props.days.map(day => day.minutes));
  return (
    <section className="analytics-section" id="analytics-panel">
      <div className="section-heading">
        <div><div className="eyebrow">◆ CONSISTÊNCIA EM DADOS</div><h2>Seu desempenho</h2><p>Seu histórico de sessões concluídas, sincronizado com sua conta.</p></div>
        <span className="analytics-period"><Activity size={14}/> ESTA SEMANA</span>
      </div>
      <div className="analytics-summary">
        <article className="analytics-card"><span><Clock3 size={15}/> FOCO HOJE</span><strong>{formatTime(props.minutesToday)}</strong><small>{props.sessionsToday} sessões concluídas</small></article>
        <article className="analytics-card"><span><Flame size={15}/> FOCO NA SEMANA</span><strong>{formatTime(props.minutesWeek)}</strong><small>{props.sessionsWeek} sessões concluídas</small></article>
        <article className="analytics-card"><span><TimerReset size={15}/> HISTÓRICO RECENTE</span><strong>{formatTime(props.totalMinutes)}</strong><small>{props.totalSessions} sessões nas últimas 500</small></article>
      </div>
      <div className="panel analytics-chart-panel">
        <div className="chart-heading"><div><h3>Ritmo semanal</h3><p>Minutos de foco por dia</p></div><span>{props.sessionsWeek} sessões</span></div>
        <div className="weekly-chart" role="img" aria-label="Gráfico de minutos de foco por dia nesta semana">
          {props.days.map((day, index) => (
            <div className="chart-column" key={`${day.label}-${index}`}>
              <strong>{day.minutes ? day.minutes : "—"}</strong>
              <div className="chart-bar-track"><div className="chart-bar" style={{ height: `${day.minutes ? Math.max(5, day.minutes / max * 100) : 0}%` }} /></div>
              <span>{day.label}</span>
            </div>
          ))}
        </div>
        <p className="analytics-footnote">O painel considera as até 500 sessões mais recentes carregadas da nuvem. Sessões antigas não são inventadas nem estimadas.</p>
      </div>
    </section>
  );
}

export const AnalyticsPanel = memo(AnalyticsPanelView);
