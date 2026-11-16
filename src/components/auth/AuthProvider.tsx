"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode
} from "react";
import { Activity, ArrowRight, LockKeyhole, Mail, ShieldCheck, Zap } from "lucide-react";
import { usePathname } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { clearUserCache } from "@/lib/storage";

interface AuthContextValue {
  user: User;
  supabase: SupabaseClient<Database>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === "/privacy";
  const configured = isSupabaseConfigured();
  const [supabase] = useState<SupabaseClient<Database> | null>(() =>
    typeof window === "undefined" ? null : createClient()
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => isSupabaseConfigured());

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let active = true;
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setUser(event === "SIGNED_OUT" ? null : session?.user ?? null);
      setLoading(false);
    });

    void client.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      setUser(error ? null : data.user);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    if (user?.id) clearUserCache(user.id);
  }, [supabase, user]);

  const value = useMemo(() => {
    if (!user || !supabase) return null;
    return { user, supabase, signOut };
  }, [user, supabase, signOut]);

  if (!configured && !isPublicPage) return <SetupScreen />;
  if (loading && !isPublicPage) return <BootScreen />;
  if (!value && !isPublicPage) return <AuthScreen supabase={supabase} />;
  if (!value) return <>{children}</>;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function BootScreen() {
  return (
    <main className="auth-shell">
      <div className="auth-loading"><div className="brand-mark"><Zap size={22} fill="currentColor" /></div><Activity size={17} className="auth-pulse" /><span>INICIALIZANDO AMBIENTE SEGURO</span></div>
    </main>
  );
}

function SetupScreen() {
  return (
    <main className="auth-shell">
      <section className="auth-card setup-card">
        <div className="auth-brand"><div className="brand-mark"><Zap size={22} fill="currentColor" /></div><span>FOCUS<span>{"//"}</span>OS</span></div>
        <div className="auth-eyebrow"><ShieldCheck size={14} /> CONFIGURAÇÃO NECESSÁRIA</div>
        <h1>Conecte seu espaço de trabalho.</h1>
        <p>O projeto está pronto para usar Supabase, mas ainda faltam as credenciais do seu projeto.</p>
        <ol className="setup-steps">
          <li>Crie um projeto no Supabase.</li>
          <li>Copie a URL do projeto e a chave <strong>Publishable</strong>.</li>
          <li>Crie o arquivo <code>.env.local</code> na pasta do projeto.</li>
          <li>Preencha as duas variáveis mostradas no arquivo <code>.env.example</code>.</li>
          <li>Execute o SQL de <code>supabase/setup.sql</code> no SQL Editor do Supabase.</li>
          <li>Reinicie o servidor com <code>npm.cmd run dev</code>.</li>
        </ol>
        <div className="auth-security-note"><LockKeyhole size={16} /><span>Use somente a chave Publishable no navegador. Nunca coloque a chave secret ou service_role em arquivos NEXT_PUBLIC ou no frontend.</span></div>
        <a className="auth-doc-link" href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Abrir Supabase <ArrowRight size={14} /></a>
      </section>
    </main>
  );
}


function AuthScreen({ supabase }: { supabase: SupabaseClient<Database> | null }) {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(() =>
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("auth") === "callback-error"
      ? "O link expirou ou não pôde ser validado. Solicite um novo e-mail e tente novamente."
      : ""
  );

useEffect(() => {
  if (mode !== "reset" || !email.trim()) {
    return;
  }

  const storageKey = `focusos:reset-cooldown:${email.trim().toLowerCase()}`;

const updateCooldown = () => {
  const expiration = Number(localStorage.getItem(storageKey) || 0);
  const remaining = Math.max(0, Math.ceil((expiration - Date.now()) / 1000));

  setResetCooldown(remaining);

  if (remaining === 0) {
    localStorage.removeItem(storageKey);
  }
};

const timeout = window.setTimeout(updateCooldown, 0);

const interval = window.setInterval(updateCooldown, 1000);

return () => {
  window.clearTimeout(timeout);
  window.clearInterval(interval);
};
}, [mode, email]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!supabase || busy) return;

    if (mode === "reset" && resetCooldown > 0) {
      return;
    }

    if (mode !== "reset" && password.length < 8) {
      setError("Use uma senha com pelo menos 8 caracteres.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setBusy(true);

    try {
      if (mode === "reset") {
        const { error: resetError } =
          await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`
          });

        if (resetError) throw resetError;

        const key = `focusos:reset-cooldown:${email.trim().toLowerCase()}`;
        window.localStorage.setItem(
          key,
          String(Date.now() + 60_000)
        );

        setResetCooldown(60);
        setMessage(
          "Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha."
        );
      } else if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/`
          }
        });

        if (authError) throw authError;

        if (!data.session) {
          setMessage(
            "Conta criada. Confira sua caixa de entrada para confirmar o e-mail e depois entre."
          );
        } else {
          setMessage(
            "Conta criada com sucesso. Seu espaço está sendo preparado."
          );
        }
      } else {
        const { error: authError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });

        if (authError) throw authError;
      }
    } catch (caught) {
      const raw =
        caught instanceof Error
          ? caught.message
          : "Não foi possível concluir a autenticação.";

      setError(raw);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark">
            <Zap size={22} fill="currentColor" />
          </div>
          <span>FOCUS<span>{"//"}</span>OS</span>
        </div>

        <div className="auth-eyebrow">
          <span className="live-dot" /> PERSONAL EXECUTION SYSTEM
        </div>

        <h1>
          {mode === "signin"
            ? "Bom ter você de volta."
            : mode === "signup"
              ? "Crie seu espaço."
              : "Recupere seu acesso."}
        </h1>

        <p>
          {mode === "signin"
            ? "Entre para acessar suas missões, sessões e planejamento sincronizados."
            : mode === "signup"
              ? "Uma conta para manter sua produtividade sincronizada entre dispositivos."
              : "Informe o e-mail da sua conta. Enviaremos um link de redefinição, caso ele esteja cadastrado."}
        </p>

        {mode !== "reset" && (
          <div className="auth-tabs" role="group" aria-label="Tipo de acesso">
            <button
              type="button"
              className={mode === "signin" ? "active" : ""}
              aria-pressed={mode === "signin"}
              onClick={() => {
                setMode("signin");
                setMessage("");
                setError("");
              }}
            >
              ENTRAR
            </button>

            <button
              type="button"
              className={mode === "signup" ? "active" : ""}
              aria-pressed={mode === "signup"}
              onClick={() => {
                setMode("signup");
                setMessage("");
                setError("");
              }}
            >
              CRIAR CONTA
            </button>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="auth-email">E-MAIL</label>

          <div className="auth-input-wrap">
            <Mail size={16} />
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              autoComplete="email"
              required
            />
          </div>

          {mode !== "reset" && (
            <>
              <label htmlFor="auth-password">SENHA</label>

              <div className="auth-input-wrap">
                <LockKeyhole size={16} />
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo de 8 caracteres"
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  minLength={8}
                  required
                />
              </div>

              {mode === "signup" && (
                <>
                  <label htmlFor="auth-confirm">CONFIRMAR SENHA</label>

                  <div className="auth-input-wrap">
                    <LockKeyhole size={16} />
                    <input
                      id="auth-confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Digite a senha novamente"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </div>
                </>
              )}
            </>
          )}

          {error && (
            <div className="auth-feedback error" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-feedback success" role="status">
              {message}
            </div>
          )}

          {mode === "reset" && resetCooldown > 0 && (
            <p role="status">
              Você poderá solicitar outro link em {resetCooldown} segundos.
            </p>
          )}

          <button
            className="primary-button auth-submit"
            type="submit"
            disabled={busy || (mode === "reset" && resetCooldown > 0)}
          >
            {busy
              ? "AGUARDE..."
              : mode === "signin"
                ? "ENTRAR NO FOCUS//OS"
                : mode === "signup"
                  ? "CRIAR MINHA CONTA"
                  : resetCooldown > 0
                    ? `AGUARDE ${resetCooldown}s`
                    : "ENVIAR LINK DE RECUPERAÇÃO"}

            <ArrowRight size={15} />
          </button>
        </form>

        <div className="auth-secondary-links">
          {mode === "signin" && (
            <button
              type="button"
              onClick={() => {
                setMode("reset");
                setMessage("");
                setError("");
              }}
            >
              Esqueci minha senha
            </button>
          )}

          {mode === "reset" && (
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setMessage("");
                setError("");
              }}
            >
              Voltar para entrar
            </button>
          )}
        </div>

        <div className="auth-bottom-note">
          <ShieldCheck size={14} />
          Seus dados ficam associados à sua conta e protegidos por políticas no banco de dados.
        </div>
      </section>
    </main>
  );
}
