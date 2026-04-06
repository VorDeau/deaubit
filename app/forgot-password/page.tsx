//app/forgot-password/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft, KeyRound, CheckCircle2, AlertTriangle } from "lucide-react";
import DeauBitLogo from "@/components/DeauBitLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function performReset() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
          throw new Error(data.error || "Request failed");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await performReset();
  }

  if (success) {
      return (
        <div className="min-h-screen bg-(--db-bg) flex items-center justify-center p-4">
             <div className="db-card w-full max-w-md p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                <div className="inline-flex p-4 bg-green-500/10 text-green-500 rounded-full mb-6 shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-(--db-text) mb-2">CHECK YOUR INBOX</h2>
                <p className="text-sm font-bold text-(--db-text-muted) mb-8">
                    If an account exists for {email}, we have sent password reset instructions.
                </p>
                <Link href="/" className="block w-full bg-(--db-primary) text-white py-4 rounded-full font-black uppercase tracking-widest shadow-lg shadow-(--db-primary)/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    BACK TO LOGIN
                </Link>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-(--db-bg) flex flex-col items-center justify-center p-4">
      <div className="mb-12 hover:scale-110 transition-transform">
           <DeauBitLogo size={60} />
      </div>
      
      <div className="db-card w-full max-w-md p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="flex items-center gap-4 mb-8 border-b border-(--db-border)/30 pb-6">
            <div className="bg-(--db-primary)/10 p-3 rounded-2xl">
                <KeyRound className="h-6 w-6 text-(--db-primary)" />
            </div>
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter text-(--db-text)">RESET PASSWORD</h1>
                <p className="text-[10px] font-bold text-(--db-text-muted) uppercase tracking-widest">Recover Access</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="font-black text-[10px] uppercase tracking-widest mb-2 block text-(--db-text-muted) px-1">Email Address</label>
                <div className="relative group">
                    <input 
                        type="email" 
                        required 
                        className="w-full bg-(--db-bg) border border-(--db-border)/50 rounded-xl px-4 py-3 text-base font-bold text-(--db-text) focus:ring-2 focus:ring-(--db-primary)/50 focus:border-(--db-primary) outline-none transition-all placeholder:font-normal"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Mail className="absolute right-4 top-3.5 text-(--db-text-muted) h-5 w-5" />
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 text-red-500 text-xs font-bold p-4 rounded-xl border border-red-500/20 flex items-center gap-3 animate-error-shake">
                    <AlertTriangle className="h-5 w-5 shrink-0"/> {error}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-(--db-primary) text-white rounded-full py-4 font-black uppercase tracking-widest shadow-lg shadow-(--db-primary)/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="animate-spin mx-auto h-6 w-6"/> : "SEND RESET LINK"}
            </button>
        </form>

        <div className="mt-8 text-center pt-4">
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-(--db-text-muted) hover:text-(--db-primary) transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
}
