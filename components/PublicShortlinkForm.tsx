//components/PublicShortlinkForm.tsx

"use client";

import { useState } from "react";
import { Loader2, Link2, ArrowRight } from "lucide-react";
import type { ShortlinkResult, PublicLinkResponse } from "@/types";
import ShortlinkResultModal from "./ShortlinkResultModal";
import Link from "next/link";

export default function PublicShortlinkForm() {
    const [publicTarget, setPublicTarget] = useState("");
    const [publicLoading, setPublicLoading] = useState(false);
    const [publicError, setPublicError] = useState<string | null>(null);
    const [publicResult, setPublicResult] = useState<ShortlinkResult | null>(null);

    async function performShorten() {
        setPublicLoading(true); setPublicError(null); setPublicResult(null);

        try {
            const res = await fetch("/api/public-links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    targetUrl: publicTarget
                }),
            });

            const data: PublicLinkResponse = await res.json().catch(() => ({} as PublicLinkResponse));

            if (!res.ok) {
                throw new Error(
                    typeof data.error === "string"
                        ? data.error
                        : "Failed to create link."
                );
            }

            if (typeof data.shortUrl !== "string") {
                throw new Error("Failed to create link.");
            }

            const slug = data.shortUrl.split("/").pop() ?? "";
            setPublicResult({ slug, shortUrl: data.shortUrl });
            setPublicTarget("");
        } catch (err) {
            const msg =
                err instanceof Error ? err.message : "Failed to create link.";
            setPublicError(msg);
        } finally {
            setPublicLoading(false);
        }
    }

    async function handlePublicSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        await performShorten();
    }

    return (
        <>
            <div className="w-full max-w-2xl mx-auto">
                <form className="relative group" onSubmit={handlePublicSubmit}>
                    <div className="flex items-center bg-(--db-surface) border border-(--db-border)/50 rounded-full px-6 py-4 lg:py-5 transition-all focus-within:ring-4 focus-within:ring-(--db-primary)/10 focus-within:border-(--db-primary) shadow-2xl">
                        <Link2 className="h-5 w-5 text-(--db-text-muted) mr-4 shrink-0" />
                        <input
                            className="flex-1 bg-transparent border-none text-sm lg:text-base font-bold text-(--db-text) focus:ring-0 focus:outline-none p-0 placeholder:font-normal placeholder:text-(--db-text-muted)/40 uppercase tracking-widest"
                            placeholder="Paste destination URL..."
                            value={publicTarget}
                            onChange={(e) => setPublicTarget(e.target.value)}
                            required
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            disabled={publicLoading || !publicTarget}
                            className="ml-4 bg-(--db-primary) text-white p-3 rounded-full hover:scale-110 active:scale-95 transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] disabled:opacity-30 disabled:grayscale cursor-pointer shadow-lg shadow-(--db-primary)/20"
                        >
                            {publicLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : <ArrowRight className="h-5 w-5" />}
                        </button>
                    </div>
                    
                    {publicError && (
                        <div className="absolute -bottom-8 left-0 right-0 text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-error-shake">
                            {publicError}
                        </div>
                    )}
                </form>

                <p className="mt-8 text-[9px] text-center font-black uppercase tracking-[0.3em] text-(--db-text-muted) leading-relaxed opacity-40">
                    By using this service, you agree to our <Link href="/terms" className="underline hover:text-(--db-primary) transition-colors">Terms</Link> & <Link href="/privacy" className="underline hover:text-(--db-primary) transition-colors">Privacy Policy</Link>.
                </p>
            </div>

            {publicResult && (
                <ShortlinkResultModal
                    result={publicResult}
                    onClose={() => setPublicResult(null)}
                />
            )}
        </>
    );
}
