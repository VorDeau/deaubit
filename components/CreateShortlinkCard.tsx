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
  const isTyping = targetUrl.length > 0 || slug.length > 0 || password.length > 0;

  return (
    <div className={`db-card p-4 lg:p-6 ${isTyping ? 'ring-2 ring-(--db-primary)/50' : ''}`}>
      
      <div className="mb-6 flex items-center gap-3 border-b border-(--db-border)/30 pb-4">
        <div className="bg-(--db-primary)/10 p-2 rounded-xl">
            <Link2 className="h-5 w-5 text-(--db-primary)" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tighter text-(--db-text)">Create Link</h2>
      </div>

      <form className="space-y-6" onSubmit={onSubmit} autoComplete="off">
        
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-(--db-text-muted) px-1">Target URL</label>
              <input
                className="w-full bg-(--db-bg) border border-(--db-border)/50 rounded-2xl px-4 py-3.5 text-sm font-bold text-(--db-text) focus:ring-2 focus:ring-(--db-primary)/50 focus:border-(--db-primary) outline-none transition-all placeholder:font-normal"
                placeholder="https://example.com/very/long/url"
                value={targetUrl}
                onChange={(e) => onChangeTarget(e.target.value)}
                required
                disabled={loading}
                autoComplete="off"
                name="target_url_unique"
              />
            </div>

            <div className="lg:w-1/3 space-y-1">
              <label className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-(--db-text-muted) px-1">Slug (Optional)</label>
              <div className="flex">
                <span className="bg-(--db-bg) text-(--db-text-muted) px-4 py-3.5 text-sm font-mono font-bold flex items-center border border-(--db-border)/50 border-r-0 rounded-l-2xl">/</span>
                <input
                  className="w-full bg-(--db-bg) border border-(--db-border)/50 rounded-r-2xl px-4 py-3.5 text-sm font-bold text-(--db-text) focus:ring-2 focus:ring-(--db-primary)/50 focus:border-(--db-primary) outline-none transition-all placeholder:font-normal"
                  placeholder="link"
                  value={slug}
                  onChange={(e) => onChangeSlug(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                  name="slug_unique"
                />
              </div>
            </div>
        </div>

        <div className="border border-(--db-border)/50 bg-(--db-bg) rounded-2xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-(--db-primary)/50">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 focus:outline-none hover:bg-(--db-surface) transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-(--db-text-muted)" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-(--db-text-muted)">
                        Advanced Settings {(password || expiresAt) && <span className="text-(--db-primary)">• Active</span>}
                    </span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-(--db-text)" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-(--db-text)" />
                )}
            </button>
            
            {isExpanded && (
                <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-1 fade-in duration-300">
                    <div className="h-px bg-(--db-border)/20 mb-1 w-full md:col-span-2"></div>
                    
                    <div className="flex items-center gap-3 bg-(--db-surface) border border-(--db-border)/50 rounded-xl px-3 py-3 focus-within:border-(--db-primary) transition-all">
                        <Lock className="h-4 w-4 text-(--db-text-muted) shrink-0" />
                        <input
                            type="text"
                            className="w-full bg-transparent border-none text-xs font-bold text-(--db-text) focus:ring-0 focus:outline-none p-0 placeholder:text-(--db-text-muted)"
                            placeholder="Password Protection"
                            value={password}
                            onChange={(e) => onChangePassword(e.target.value)}
                            disabled={loading}
                            autoComplete="new-password" 
                            name="link_lock_password_unique" 
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 bg-(--db-surface) border border-(--db-border)/50 rounded-xl px-3 py-3 focus-within:border-(--db-primary) transition-all">
                        <Calendar className="h-4 w-4 text-(--db-text-muted) shrink-0" />
                        <input
                            type="datetime-local"
                            className="w-full bg-transparent border-none text-xs font-bold text-(--db-text) focus:ring-0 focus:outline-none p-0"
                            value={expiresAt}
                            onChange={(e) => onChangeExpiresAt(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </div>
            )}
        </div>

        <div className="min-h-[20px]">
            {error && (
                <div className="bg-red-500/10 text-red-500 text-[10px] lg:text-xs font-bold p-3 rounded-xl border border-red-500/20 animate-error-shake w-full flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
                </div>
            )}
        </div>

        <button
          type="submit"
          disabled={loading || !targetUrl}
          className="w-full bg-(--db-primary) text-white rounded-full py-4.5 font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-(--db-primary)/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin"/> : <><ArrowRight className="h-5 w-5" /> SHORTEN IT</>}
        </button>
      </form>
      
      <div className="mt-6 text-center">
          <p className="text-[8px] font-dot tracking-[0.3em] opacity-20 uppercase">
             Powered by VorDeau
          </p>
      </div>
    </div>
  );
}
