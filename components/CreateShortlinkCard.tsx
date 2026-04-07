//components/CreateShortlinkCard.tsx

"use client";

import { useState } from "react";
import { Calendar, Lock, Link2, ArrowRight, Loader2, ChevronDown, ChevronUp, Settings2, AlertTriangle } from "lucide-react";

interface CreateShortlinkCardProps {
  targetUrl: string;
  slug: string;
  password: string;
  expiresAt: string;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChangeTarget: (value: string) => void;
  onChangeSlug: (value: string) => void;
  onChangePassword: (value: string) => void;
  onChangeExpiresAt: (value: string) => void;
}

export function CreateShortlinkCard({
  targetUrl, slug, password, expiresAt, loading, error, onSubmit,
  onChangeTarget, onChangeSlug, onChangePassword, onChangeExpiresAt,
}: CreateShortlinkCardProps) {
  
  const [isExpanded, setIsExpanded] = useState(false);
  const isTyping = targetUrl.length > 0;

  return (
    <div className={`db-card p-6 lg:p-8 transition-all duration-700 ${isTyping ? 'shadow-2xl border-(--db-primary)/30' : 'shadow-xl'}`}>
      
      <div className="mb-8 flex items-center gap-4 border-b border-(--db-border)/30 pb-6">
        <div className="bg-(--db-primary)/10 p-3 rounded-2xl shrink-0">
            <Link2 className="h-6 w-6 text-(--db-primary)" />
        </div>
        <div>
            <h2 className="text-2xl nothing-title text-(--db-text)">GENERATE_LINK</h2>
            <p className="nothing-label">Infrastructure Creation Node</p>
        </div>
      </div>

      <form className="space-y-8" onSubmit={onSubmit} autoComplete="off">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-2">
              <label className="nothing-label block ml-1">Destination_Target</label>
              <input
                className="w-full text-base font-bold"
                placeholder="https://example.com/long-resource-identifier"
                value={targetUrl}
                onChange={(e) => onChangeTarget(e.target.value)}
                required
                disabled={loading}
                autoComplete="off"
              />
            </div>

            <div className="lg:col-span-4 space-y-2">
              <label className="nothing-label block ml-1">Relational_Slug</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-(--db-text-muted) font-dot text-sm">/</span>
                <input
                  className="w-full pl-8 font-bold text-base"
                  placeholder="custom-slug"
                  value={slug}
                  onChange={(e) => onChangeSlug(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
            </div>
        </div>

        <div className="db-card rounded-2xl! bg-(--db-surface-hover) border-(--db-border) overflow-hidden transition-all">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 px-6 hover:bg-(--db-surface) transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Settings2 className="h-4 w-4 text-(--db-text-muted)" />
                    <span className="nothing-label opacity-100 text-[9px]">
                        Advanced_Options {(password || expiresAt) && <span className="text-(--db-primary) ml-2">•_ENABLED</span>}
                    </span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-(--db-text)" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-(--db-text)" />
                )}
            </button>
            
            {isExpanded && (
                <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6 animate-reveal">
                    <div className="space-y-2">
                        <label className="nothing-label text-[9px] block">Security_Key</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-(--db-text-muted)" />
                            <input
                                type="text"
                                className="pl-12 py-3 text-sm font-bold bg-(--db-surface)"
                                placeholder="Lock link with password"
                                value={password}
                                onChange={(e) => onChangePassword(e.target.value)}
                                disabled={loading}
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="nothing-label text-[9px] block">Self_Destruct_Timer</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-(--db-text-muted)" />
                            <input
                                type="datetime-local"
                                className="pl-12 py-3 text-sm font-bold bg-(--db-surface)"
                                value={expiresAt}
                                onChange={(e) => onChangeExpiresAt(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {error && (
            <div className="bg-red-500/10 text-red-500 font-bold p-4 rounded-2xl border border-red-500/20 text-[10px] animate-error-shake uppercase tracking-widest flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
            </div>
        )}

        <button
          type="submit"
          disabled={loading || !targetUrl}
          className="btn-primary w-full py-5 text-sm tracking-[0.3em]"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin"/> : <><ArrowRight className="h-5 w-5" /> GENERATE_INFRASTRUCTURE</>}
        </button>
      </form>
      
      <div className="mt-8 text-center">
          <p className="nothing-label opacity-20 text-[8px]">
             DeauBit Protocol v9.2 • Encrypted Link Mesh
          </p>
      </div>
    </div>
  );
}
