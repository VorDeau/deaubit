//components/LoginForm.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff, AlertTriangle, KeyRound, Mail } from "lucide-react";
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
                body: JSON.stringify({ email, password }),
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
        <div className="w-full flex flex-col">
            <div className="flex items-center gap-4 mb-10 border-b border-(--db-border)/30 pb-6">
                <div className="bg-(--db-primary)/10 p-3 rounded-2xl shrink-0">
                    <KeyRound className="h-6 w-6 text-(--db-primary)"/>
                </div>
                <div>
                    <h2 className="text-2xl nothing-title text-(--db-text)">AUTHORIZE</h2>
                    <p className="nothing-label">Access Restricted Area</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="nothing-label block ml-1">Identity (Email)</label>
                    <div className="relative">
                        <input
                            type="email"
                            name="email"
                            autoComplete="username email"
                            className="pl-12"
                            placeholder="USER@SYSTEM.NET"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <Mail className="absolute left-4 top-3.5 text-(--db-text-muted) h-5 w-5" />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-end px-1">
                        <label className="nothing-label block">Access Key</label>
                        <Link href="/forgot-password" className="text-[9px] font-black uppercase text-(--db-primary) hover:underline">
                            LOST?
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            autoComplete="current-password"
                            className="pr-12"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-(--db-text-muted) hover:text-(--db-text) transition-all"
                            disabled={loading}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || (cooldown !== null && cooldown > 0)}
                    className="btn-primary w-full py-4 text-sm tracking-widest mt-4"
                >
                    {loading ? (
                        <Loader2 className="animate-spin h-5 w-5"/>
                    ) : cooldown ? (
                        `WAIT ${cooldown}S`
                    ) : (
                        "AUTHORIZE"
                    )}
                </button>
                
                {error && (
                    <div className="bg-red-500/10 text-red-500 font-bold p-4 rounded-2xl border border-red-500/20 text-[10px] animate-error-shake flex items-center gap-3 uppercase tracking-widest">
                        <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
                    </div>
                )}

                {unverified && (
                    <div className="flex flex-col items-center gap-4 bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20">
                        <p className="nothing-label text-yellow-600">Verification Required</p>
                        <Link
                            href={`/verify?email=${encodeURIComponent(email)}`}
                            className="btn-secondary w-full py-2 text-[10px]"
                        >
                            VERIFY NOW
                        </Link>
                    </div>
                )}
            </form>

            <div className="mt-10 text-center pt-8 border-t border-(--db-border)/30">
                <span className="nothing-label mr-2">New User?</span>
                <Link href="/register" className="nothing-label text-(--db-primary) font-black border-b-2 border-transparent hover:border-(--db-primary) transition-all">
                    CREATE_ACCOUNT
                </Link>
            </div>
        </div>
    );
}
