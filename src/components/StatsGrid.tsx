import { memo } from "react";
import { CheckCheck, CircleDot, ListTodo, TrendingUp } from "lucide-react";

interface StatsGridProps {
  total: number;
  completed: number;
  pending: number;
  progress: number;
}

function StatsGridView({ total, completed, pending, progress }: StatsGridProps) {
  const stats = [
    { label: "TAREFAS TOTAIS", value: total, note: "No seu radar", icon: ListTodo, tone: "" },
    { label: "CONCLUÍDAS", value: completed, note: "Feitas por você", icon: CheckCheck, tone: "green" },
    { label: "PENDENTES", value: pending, note: "Próximos movimentos", icon: CircleDot, tone: "yellow" },
    { label: "PROGRESSO", value: `${progress}%`, note: "Consistência > intensidade", icon: TrendingUp, tone: "purple" }
  ];

  return (
    <section className="stats-grid" aria-label="Estatísticas">
      {stats.map(({ label, value, note, icon: Icon, tone }) => (
        <article className="stat-card" key={label}>
          <div className="stat-top"><span>{label}</span><Icon size={16} /></div>
          <strong className={tone}>{value}</strong>
          <small>{note}</small>
        </article>
      ))}
    </section>
  );
}

export const StatsGrid = memo(StatsGridView);
