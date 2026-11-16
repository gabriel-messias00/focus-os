import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Database, LockKeyhole, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Informações sobre os dados usados pelo FOCUS//OS.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <main className="auth-shell">
      <article className="auth-card privacy-card">
        <div className="auth-brand"><div className="brand-mark"><ShieldCheck size={22} /></div><span>FOCUS<span>{"//"}</span>OS</span></div>
        <div className="auth-eyebrow"><LockKeyhole size={14} /> TRANSPARÊNCIA DE DADOS</div>
        <h1>Privacidade e dados.</h1>
        <p>Esta página descreve, em linguagem simples, como a versão atual do FOCUS//OS foi projetada para tratar os dados da conta.</p>
        <section><h2><Database size={16} /> O que é armazenado</h2><p>O e-mail da conta é usado pelo Supabase Authentication. Missões, prazos, categorias, prioridades, sessões de foco e meta diária são armazenados no banco de dados do projeto Supabase. Uma cópia local pode ser mantida no navegador para carregar a interface mais rapidamente.</p></section>
        <section><h2><ShieldCheck size={16} /> Como os dados são protegidos</h2><p>O banco usa políticas Row Level Security para limitar as linhas de cada tabela ao usuário autenticado. A aplicação no navegador usa apenas a chave pública Publishable; chaves administrativas não devem ser colocadas no frontend.</p></section>
        <section><h2><LockKeyhole size={16} /> Limites desta página</h2><p>Esta é uma descrição técnica do projeto, não uma política jurídica completa nem uma promessa de segurança absoluta. Antes de abrir o serviço ao público, o responsável pelo projeto deve definir contato de privacidade, retenção e exclusão de dados, backups, provedores e termos adequados ao público e à legislação aplicável.</p></section>
        <Link className="auth-doc-link" href="/"><ArrowLeft size={14} /> Voltar ao aplicativo</Link>
      </article>
    </main>
  );
}
