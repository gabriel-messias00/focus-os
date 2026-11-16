"use client";

import { memo, useEffect, useState } from "react";
import { LogOut, Zap } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

interface HeaderProps { syncStatus: "syncing" | "synced" | "error" }

function HeaderView({ syncStatus }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timeoutId: number | undefined;
    const updateClock = () => {
      setNow(new Date());
      // Atualiza na virada do minuto, sem manter um intervalo por segundo.
      const delay = 60_000 - (Date.now() % 60_000) + 30;
      timeoutId = window.setTimeout(updateClock, delay);
    };
    updateClock();
    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark"><Zap size={22} fill="currentColor" /></div>
        <div>
          <div className="brand-name">FOCUS<span>{"//"}</span>OS</div>
          <div className="brand-sub">PERSONAL EXECUTION SYSTEM</div>
        </div>
      </div>
      <div className="header-account">
        <div className="account-copy"><strong>{user.email}</strong><small>{syncStatus === "synced" ? "CONTA CONECTADA" : syncStatus === "syncing" ? "SINCRONIZANDO" : "VERIFICAR CONEXÃO"}</small></div>
        <button className="signout-button" type="button" disabled={signingOut} onClick={async () => { setSigningOut(true); setSignOutError(""); try { await signOut(); } catch (error) { setSignOutError(error instanceof Error ? error.message : "Falha ao sair da conta."); } finally { setSigningOut(false); } }} aria-label="Sair da conta"><LogOut size={15}/><span>{signingOut ? "SAINDO" : "SAIR"}</span></button>
      </div>
      {signOutError && <span className="signout-error" role="alert">{signOutError}</span>}
      <div className="clock">
        {now ? now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
        <small>LOCAL SYSTEM TIME</small>
      </div>
    </header>
  );
}

export const Header = memo(HeaderView);
