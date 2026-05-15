// app/reset-password/page.tsx

"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, Eye, EyeOff, Check, KeyRound, AlertTriangle, ArrowLeft } from "lucide-react";

function ResetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    if (password !== confirmPassword) {
      setStatus("error");
      setMsg("KEY_MISMATCH");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("success");
      setTimeout(() => router.push("/"), 2500);
    } catch (err) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "RESET_FAILED");
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="p-6 bg-(--db-primary)/10 text-(--db-primary) rounded-3xl">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="nothing-title text-2xl text-(--db-text)">INVALID_LINK</h2>
          <p className="nothing-label text-(--db-primary) opacity-100">TOKEN_MISSING_OR_EXPIRED</p>
        </div>
        <Link href="/forgot-password" className="btn-primary px-10 py-4 text-xs tracking-[0.2em]">
          REQUEST_NEW_LINK
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-6 text-center animate-reveal">
        <div className="p-6 bg-green-500/10 text-green-500 rounded-3xl">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="nothing-title text-2xl text-(--db-text)">KEY_ROTATED</h2>
          <p className="nothing-label text-green-500 opacity-100">ACCESS_CREDENTIALS_UPDATED</p>
          <p className="nothing-label normal-case tracking-normal opacity-40 text-[10px]">
            Redirecting to login system...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="nothing-label block ml-1 text-[9px]">New_Access_Key</label>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center text-(--db-text) opacity-40 z-10 pointer-events-none">
            <KeyRound className="h-5 w-5" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            className="db-input"
            style={{ paddingLeft: "4rem", paddingRight: "3.5rem" }}
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-(--db-text) opacity-40 hover:opacity-100 transition-all"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="nothing-label block ml-1 text-[9px]">Verify_New_Key</label>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center text-(--db-text) opacity-40 z-10 pointer-events-none">
            <KeyRound className="h-5 w-5 opacity-50" />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            className={`db-input ${confirmPassword && password !== confirmPassword ? "border-red-500/50" : ""}`}
            style={{ paddingLeft: "4rem", paddingRight: "3.5rem" }}
            placeholder="Confirm key"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center gap-1">
            {confirmPassword && password === confirmPassword && (
              <Check className="h-4 w-4 text-green-500" />
            )}
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-(--db-text) opacity-40 hover:opacity-100 transition-all"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {status === "error" && (
        <div className="bg-red-500/10 text-red-500 font-bold p-3 rounded-2xl border border-red-500/20 text-[10px] animate-error-shake flex items-center gap-3 uppercase tracking-widest">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {msg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-4 text-xs tracking-[0.2em] shadow-lg shadow-(--db-primary)/20 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "COMMIT_NEW_KEY"}
      </button>

      <div className="text-center pt-2 border-t border-(--db-border)/30">
        <Link
          href="/"
          className="nothing-label text-[10px] hover:text-(--db-primary) flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> BACK_TO_SYSTEM
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="db-card w-full max-w-md p-8 sm:p-10 shadow-2xl animate-reveal border-(--db-border)">
      <div className="flex items-center gap-4 mb-8 border-b border-(--db-border)/30 pb-6">
        <div className="bg-(--db-primary)/10 p-3 rounded-2xl shrink-0">
          <KeyRound className="h-6 w-6 text-(--db-primary)" />
        </div>
        <div>
          <h1 className="nothing-title text-xl text-(--db-text)">RESET_KEY</h1>
          <p className="nothing-label text-[9px] opacity-60">Access_Credential_Rotation</p>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="text-center py-10 nothing-label animate-pulse text-[9px]">
            BOOTING_RESET_NODE...
          </div>
        }
      >
        <ResetContent />
      </Suspense>
    </div>
  );
}
