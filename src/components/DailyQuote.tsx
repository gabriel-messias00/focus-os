import { memo, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const quotes = [
  "Grandes resultados são construídos por pequenas ações repetidas.",
  "Feito com consistência vence perfeito que nunca sai do papel.",
  "Não precisa resolver tudo hoje. Só avance no próximo passo.",
  "Disciplina é continuar mesmo quando a empolgação passa."
];

function DailyQuoteView() {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    let timeoutId: number | undefined;
    let active = true;

    const updateQuote = () => {
      if (!active) return;
      const now = new Date();
      const dayKey = now.getFullYear() * 10_000 + (now.getMonth() + 1) * 100 + now.getDate();
      setQuote(quotes[dayKey % quotes.length]);

      // Agenda a próxima virada do dia local. O agendamento é renovado após
      // cada atualização, inclusive quando a aba volta do modo suspenso.
      const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() + 50;
      timeoutId = window.setTimeout(updateQuote, Math.max(1_000, nextDay - Date.now()));
    };

    updateQuote();
    return () => {
      active = false;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section className="panel quote-panel">
      <div className="panel-heading">
        <div className="heading-title"><Sparkles size={16} /><h2>PROTOCOLO DO DIA</h2></div>
        <span className="micro-label">01 / 01</span>
      </div>
      <p>“{quote}”</p>
      <span className="quote-caption">LEMBRETE DO SISTEMA</span>
    </section>
  );
}

export const DailyQuote = memo(DailyQuoteView);
