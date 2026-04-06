//components/LoginForm.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import type { LoginResponse } from "@/types";

interface LoginFormProps {
    nextPath?: string;
}

export default function LoginForm({ nextPath = "/dash" }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [unverified, setUnverified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState<number | null>(null);

    useEffect(() => {
        if (cooldown === null) return;
        if (cooldown <= 0) { setCooldown(null); return; }
        const id = setInterval(() => setCooldown((prev) => (prev === null || prev <= 1 ? null : prev - 1)), 1000);
        return () => clearInterval(id);
    }, [cooldown]);

    async function performLogin() {
        setLoading(true); setError(null); setUnverified(false);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email, 
                    password
                }),
            });
            const data: LoginResponse = await res.json().catch(() => ({}));

            if (res.status === 429) {
                const retry = typeof data.retryAfter === "number" ? data.retryAfter : 60;
                setCooldown(retry);
                setError(`Too many attempts. Wait ${retry}s.`);
                return;
            }

            if (res.status === 403) {
                setUnverified(true);
                return;
            }
            
            if (!res.ok) {
                throw new Error(typeof data.error === "string" ? data.error : "Login failed");
            }
            
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
        <section className="h-full w-full flex items-center justify-center">
            <div className="w-full max-w-md p-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]">
                
                <div className="flex flex-col items-center mb-12">
                    <h2 className="text-4xl font-dot tracking-[0.4em] text-(--db-text) mb-2">SYS.AUTH</h2>
                    <div className="h-0.5 w-12 bg-(--db-primary) rounded-full"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="flex flex-col items-center">
                        <label className="font-black text-[10px] uppercase tracking-[0.3em] mb-4 block text-(--db-text-muted) text-center">
                            Identity (Email)
                        </label>
                        <input
                            type="email"
                            name="email"
                            autoComplete="username email"
                            className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-(--db-border)/50 px-0 py-3 text-lg font-bold text-(--db-text) placeholder:font-normal placeholder:text-(--db-text-muted)/30 focus:ring-0 focus:border-b-2 focus:border-(--db-primary) outline-none transition-all text-center"
                            placeholder="USER@SYSTEM.NET"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="flex flex-col items-center">
                        <label className="font-black text-[10px] uppercase tracking-[0.3em] mb-4 block text-(--db-text-muted) text-center">
                            Access Key
                        </label>
                        <div className="relative w-full">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                autoComplete="current-password"
                                className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-(--db-border)/50 px-0 py-3 text-lg font-bold text-(--db-text) placeholder:font-normal placeholder:text-(--db-text-muted)/30 focus:ring-0 focus:border-b-2 focus:border-(--db-primary) outline-none transition-all text-center"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 top-3.5 text-(--db-text-muted) hover:text-(--db-text) transition-all cursor-pointer"
                                disabled={loading}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <div className="mt-4">
                            <Link href="/forgot-password" text-center className="text-[9px] font-black uppercase tracking-widest text-(--db-primary) hover:underline decoration-1 transition-all">
                                Lost Credentials?
                            </Link>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading || (cooldown !== null && cooldown > 0)}
                            className="w-full bg-(--db-primary) text-white rounded-full py-4.5 font-black text-sm uppercase tracking-[0.3em] shadow-lg shadow-(--db-primary)/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5 mx-auto"/>
                            ) : cooldown ? (
                                `WAIT ${cooldown}S`
                            ) : (
                                "AUTHORIZE ACCESS"
                            )}
                        </button>
                    </div>
                    
                    <div className="min-h-16 flex flex-col justify-center">
                        {error && (
                            <div className="text-red-500 font-bold text-xs flex flex-col items-center gap-2 animate-error-shake">
                                <AlertTriangle className="h-5 w-5" />
                                <span className="uppercase tracking-widest text-center">{error}</span>
                            </div>
                        )}

                        {unverified && (
                            <div className="flex flex-col items-center gap-4 text-center">
                                <p className="text-[10px] font-bold text-(--db-text-muted) uppercase tracking-widest">Account Pending Verification</p>
                                <Link
                                    href={`/verify?email=${encodeURIComponent(email)}`}
                                    className="text-[10px] font-black uppercase tracking-widest bg-(--db-primary) text-white px-6 py-2 rounded-full shadow-md shadow-(--db-primary)/20 hover:scale-[1.05] transition-all"
                                >
                                    Verify Manual →
                                </Link>
                            </div>
                        )}
                    </div>

                </form>

                <div className="mt-12 text-center pt-8 border-t border-(--db-border)/20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-(--db-text-muted)">Unregistered? </span>
                    <Link href="/register" className="inline-block ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-(--db-primary) hover:underline decoration-1 transition-all">
                        CREATE ACCOUNT
                    </Link>
                </div>
            </div>
        </section>
    );
}
