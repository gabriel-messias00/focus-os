"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("FOCUS//OS global error:", error); }, [error]);
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#080c16", color: "#f0f4ff", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ maxWidth: 440, textAlign: "center" }}>
          <h1>O FOCUS//OS encontrou um erro.</h1>
          <p>Recarregue esta tela. Seus dados sincronizados permanecem salvos na nuvem.</p>
          <button type="button" onClick={reset} style={{ padding: "12px 18px", border: 0, borderRadius: 10, color: "white", background: "#7568df", cursor: "pointer" }}>Tentar novamente</button>
        </main>
      </body>
    </html>
  );
}
