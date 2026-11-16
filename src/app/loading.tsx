import { Activity, Zap } from "lucide-react";

export default function Loading() {
  return (
    <main className="auth-shell" aria-live="polite" aria-busy="true">
      <div className="auth-loading">
        <div className="brand-mark"><Zap size={22} fill="currentColor" /></div>
        <Activity size={17} className="auth-pulse" />
        <span>PREPARANDO SEU ESPAÇO DE TRABALHO</span>
      </div>
    </main>
  );
}
