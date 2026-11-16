import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="not-found-title">
        <div className="auth-eyebrow"><Compass size={14} /> ROTA NÃO ENCONTRADA</div>
        <h1 id="not-found-title">Esse caminho não existe.</h1>
        <p>A página pode ter mudado de lugar ou o endereço foi digitado incorretamente.</p>
        <Link className="primary-button auth-submit" href="/">
          <ArrowLeft size={15} /> Voltar ao FOCUS//OS
        </Link>
      </section>
    </main>
  );
}
