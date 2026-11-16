"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function ResetPasswordPage() {
  const { supabase } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 8) { setError("Use uma senha com pelo menos 8 caracteres."); return; }
    if (password !== confirmation) { setError("As senhas não coincidem."); return; }
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      window.setTimeout(() => router.replace("/"), 1200);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível atualizar a senha. Solicite outro link.");
    } finally { setBusy(false); }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand"><div className="brand-mark"><Zap size={22} fill="currentColor" /></div><span>FOCUS<span>{"//"}</span>OS</span></div>
        <div className="auth-eyebrow"><ShieldCheck size={14}/> RECUPERAÇÃO SEGURA</div>
        <h1>Defina uma nova senha.</h1>
        <p>Escolha uma senha nova com pelo menos 8 caracteres.</p>
        {success ? <div className="auth-feedback success" role="status">Senha atualizada. Redirecionando para seu espaço...</div> : (
          <form className="auth-form reset-form" onSubmit={handleSubmit}>
            <label htmlFor="new-password">NOVA SENHA</label>
            <div className="auth-input-wrap"><LockKeyhole size={16}/><input id="new-password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required /></div>
            <label htmlFor="confirm-new-password">CONFIRMAR NOVA SENHA</label>
            <div className="auth-input-wrap"><LockKeyhole size={16}/><input id="confirm-new-password" type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="new-password" minLength={8} required /></div>
            {error && <div className="auth-feedback error" role="alert">{error}</div>}
            <button className="primary-button auth-submit" type="submit" disabled={busy}>{busy ? "SALVANDO..." : "ATUALIZAR SENHA"}<ArrowRight size={15}/></button>
          </form>
        )}
      </section>
    </main>
  );
}
