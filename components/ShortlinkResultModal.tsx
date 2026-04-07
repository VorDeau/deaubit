//components/ShortlinkResultModal.tsx

"use client";

import { useState } from "react";
import { Copy, X, Check, ExternalLink, Link2, Sparkles, ShieldCheck } from "lucide-react";
import type { ShortlinkResult } from "@/types";

interface ShortlinkResultModalProps { result: ShortlinkResult; onClose: () => void; }

export default function ShortlinkResultModal({ result, onClose }: ShortlinkResultModalProps) {
  const [copied, setCopied] = useState(false);

  async function copyShortUrl() {
    if (!result?.shortUrl) return;
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const el = document.querySelector("[data-shorturl]") as HTMLElement | null;
      if (el) {
        const range = document.createRange();
        range.selectNode(el);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-6 bg-(--db-bg)/95 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="w-full max-w-sm db-card p-10 space-y-10 animate-reveal relative border-(--db-primary)/20 shadow-[0_0_50px_rgba(234,21,6,0.05)]">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-(--db-surface-hover) transition-colors opacity-40 hover:opacity-100"
        >
          <X className="h-5 w-5 text-(--db-text)" />
        </button>

        {/* Header Section */}
        <div className="text-center flex flex-col items-center gap-6">
            <div className="relative">
                <div className="p-6 bg-(--db-primary)/10 text-(--db-primary) rounded-4xl">
                    <Link2 className="h-10 w-10 animate-soft-pulse" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-(--db-bg) p-1.5 rounded-full border border-(--db-primary)/20 text-green-500">
                    <ShieldCheck className="h-5 w-5" />
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="text-3xl nothing-title text-(--db-text)">LINK_READY</h3>
                <div className="flex items-center justify-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-(--db-primary) animate-pulse"></span>
                    <p className="nothing-label text-[10px] tracking-[0.2em] opacity-100">SYSTEM_DEPLOYMENT_COMPLETE</p>
                </div>
            </div>
        </div>

        {/* URL Display Node */}
        <div className="relative group">
            <div className="bg-(--db-surface-hover) border-2 border-(--db-border) p-8 rounded-3xl transition-all group-hover:border-(--db-primary)/30">
                <div className="nothing-label text-[8px] absolute -top-2.5 left-8 bg-(--db-bg) px-2 text-(--db-primary) font-bold">NODE_ADDRESS</div>
                <p 
                  data-shorturl 
                  className="font-dot text-xl break-all text-(--db-text) text-center tracking-tight leading-tight"
                >
                  {result.shortUrl.replace(/^https?:\/\//, '')}
                </p>
            </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-4">
            <button
              onClick={copyShortUrl}
              className={`w-full py-5 btn-primary text-xs tracking-[0.3em] transition-all ${copied ? 'bg-green-600 scale-[0.98]' : 'hover:scale-[1.02]'}`}
            >
              <div className="flex items-center justify-center gap-3">
                {copied ? (
                  <><Check className="h-5 w-5 animate-in zoom-in" /> COPIED_TO_CLIPBOARD</>
                ) : (
                  <><Copy className="h-5 w-5" /> COPY_ADDRESS</>
                )}
              </div>
            </button>
            
            <a 
              href={result.shortUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="w-full py-5 btn-secondary text-xs tracking-[0.3em] border-2 border-(--db-border) hover:border-(--db-text) transition-all"
            >
                <div className="flex items-center justify-center gap-3">
                  <ExternalLink className="h-5 w-5" /> OPEN_RESOURCE
                </div>
            </a>
        </div>

        {/* Technical Metadata */}
        <div className="flex flex-col items-center gap-3 pt-4 border-t border-(--db-border)/30">
            <div className="flex items-center gap-2 opacity-30">
                <Sparkles className="h-3 w-3" />
                <span className="nothing-label text-[8px]">RELATIONAL_ID: {result.slug.toUpperCase()}</span>
            </div>
            <p className="nothing-label text-[7px] opacity-20">VORDEAU_ENCRYPTED_PAYLOAD_V9.2</p>
        </div>
      </div>
    </div>
  );
}
