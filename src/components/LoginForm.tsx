import { useState, useEffect, useCallback } from "react";
import { CircleNotch, Eye, EyeSlash, Warning, Key, Envelope } from "@phosphor-icons/react";
import type { LoginResponse } from "@/types";

interface LoginFormProps {
  nextPath?: string;
}

export default function LoginForm({ nextPath = "/dash" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [cooldown, setCooldown] = useState<number | null>(null);

  const authUrl = import.meta.env.VITE_AUTH_URL;

  useEffect(() => {
    if (cooldown === null) return;
    if (cooldown <= 0) { setCooldown(null); return; }
    const id = setInterval(() => setCooldown((prev) => (prev === null || prev <= 1 ? null : prev - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const completeOAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/oauth-complete", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error || "OAuth failed");
      }
      window.location.href = nextPath;
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth failed");
    } finally {
      setOauthLoading(null);
    }
  }, [nextPath]);

  const openOAuth = (provider: "google" | "github") => {
    if (!authUrl) { setError("Auth service not configured"); return; }
    setOauthLoading(provider); setError(null);

    const origin = encodeURIComponent(window.location.origin);
    const popup = window.open(
      `${authUrl}/oauth/${provider}?origin=${origin}`,
      "oauth",
      "width=500,height=600,left=200,top=100",
    );

    const handler = (e: MessageEvent) => {
      if (e.data?.type === "deauone:oauth:done") {
        window.removeEventListener("message", handler);
        completeOAuth();
      }
      if (e.data?.type === "deauone:oauth:error") {
        window.removeEventListener("message", handler);
        setError(e.data.error || "OAuth failed");
        setOauthLoading(null);
      }
    };
    window.addEventListener("message", handler);

    const pollClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(pollClosed);
        window.removeEventListener("message", handler);
        setOauthLoading(null);
      }
    }, 500);
  };

  async function performLogin() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data: LoginResponse = await res.json().catch(() => ({}));

      if (res.status === 429) {
        const retry = typeof data.retryAfter === "number" ? data.retryAfter : 60;
        setCooldown(retry);
        setError(`Too many attempts. Wait ${retry}s.`);
        return;
      }
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Login failed");
      window.location.href = nextPath;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (cooldown !== null && cooldown > 0) return;
    await performLogin();
  }

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center gap-4 mb-8 border-b border-(--db-border) pb-6">
        <div className="bg-(--db-primary)/15 p-3 rounded-2xl shrink-0">
          <Key size={22} className="text-(--db-primary)" />
        </div>
        <div>
          <h2 className="text-xl nothing-title text-(--db-text)">AUTHORIZE</h2>
          <p className="nothing-label text-[10px] text-(--db-text) opacity-50">SECURE_NODE_ACCESS</p>
        </div>
      </div>

      {authUrl && (
        <div className="flex flex-col gap-3 mb-6">
          <button
            type="button"
            onClick={() => openOAuth("google")}
            disabled={!!oauthLoading || loading}
            className="btn-secondary w-full py-3 text-[10px] nothing-label opacity-100 disabled:opacity-40"
          >
            {oauthLoading === "google"
              ? <CircleNotch size={15} className="animate-spin" />
              : <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            }
            CONTINUE_WITH_GOOGLE
          </button>

          <button
            type="button"
            onClick={() => openOAuth("github")}
            disabled={!!oauthLoading || loading}
            className="btn-secondary w-full py-3 text-[10px] nothing-label opacity-100 disabled:opacity-40"
          >
            {oauthLoading === "github"
              ? <CircleNotch size={15} className="animate-spin" />
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            }
            CONTINUE_WITH_GITHUB
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-(--db-border)" />
            <span className="nothing-label text-[8px] opacity-30">OR</span>
            <div className="flex-1 h-px bg-(--db-border)" />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="nothing-label block ml-1 text-[10px] text-(--db-text) font-bold">IDENTITY_EMAIL</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--db-text-muted) z-10 pointer-events-none">
              <Envelope size={18} />
            </div>
            <input
              type="email"
              className="db-input pl-10!"
              placeholder="USER@SYSTEM.NET"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || !!oauthLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="px-1">
            <label className="nothing-label block text-[10px] text-(--db-text) font-bold">ACCESS_KEY</label>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--db-text-muted) z-10 pointer-events-none">
              <Key size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              className="db-input pl-10! pr-12!"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || !!oauthLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-(--db-text) opacity-40 hover:opacity-100 transition-all"
              disabled={loading}
            >
              {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !!oauthLoading || (cooldown !== null && cooldown > 0)}
          className="btn-primary w-full py-4 text-xs tracking-[0.2em] mt-2 shadow-lg shadow-(--db-primary)/20 disabled:opacity-40"
        >
          {loading
            ? <CircleNotch size={20} className="animate-spin" />
            : cooldown
            ? `WAIT_${cooldown}S`
            : "AUTHORIZE_SYSTEM"
          }
        </button>

        {error && (
          <div className="bg-red-500/10 text-red-500 font-bold p-3 rounded-2xl border border-red-500/20 text-[10px] animate-error-shake flex items-center gap-3 uppercase tracking-widest">
            <Warning size={16} weight="fill" className="shrink-0" /> {error}
          </div>
        )}
      </form>
    </div>
  );
}
