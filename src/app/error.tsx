"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("FOCUS//OS route error:", error); }, [error]);
  return (
    <main className="auth-shell">
      <section className="auth-card error-card" role="alert">
        <div className="auth-eyebrow"><AlertTriangle size={14}/> FALHA INESPERADA</div>
        <h1>Algo não saiu como esperado.</h1>
        <p>Seu trabalho salvo na nuvem não foi apagado. Tente carregar esta tela novamente.</p>
        {error.digest && <small className="error-digest">Código de referência: {error.digest}</small>}
        <button className="primary-button auth-submit" type="button" onClick={reset}><RefreshCw size={15}/> TENTAR NOVAMENTE</button>
        <Link className="auth-doc-link" href="/">Voltar ao início</Link>
      </section>
    </main>
  );
}
