//components/ShortlinkResultModal.tsx

"use client";

import { useState } from "react";
import { Copy, X, Check, ExternalLink, Link2, Sparkles } from "lucide-react";
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
    <div className="fixed inset-0 z-100 flex items-center justify-center px-6 bg-(--db-bg)/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-sm db-card p-10 space-y-8 animate-reveal relative">
        
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-(--db-surface-hover) transition-colors opacity-40 hover:opacity-100"
        >
          <X className="h-5 w-5 text-(--db-text)" />
        </button>

        <div className="text-center flex flex-col items-center gap-6">
            <div className="p-6 bg-(--db-primary)/10 text-(--db-primary) rounded-4xl">
                <Link2 className="h-10 w-10 animate-soft-pulse" />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl nothing-title text-(--db-text)">LINK_READY</h3>
                <p className="nothing-label text-[10px]">Relational_ID: /{result.slug}</p>
            </div>
        </div>

        <div className="bg-(--db-surface-hover) border border-(--db-border) p-6 rounded-3xl group relative transition-all">
            <div className="nothing-label text-[8px] absolute -top-2.5 left-6 bg-(--db-bg) px-2 opacity-100">Short_Resource_Locator</div>
            <p 
              data-shorturl 
              className="font-dot text-lg break-all text-(--db-text) text-center tracking-tighter"
            >
              {result.shortUrl.replace(/^https?:\/\//, '')}
            </p>
        </div>

        <div className="flex flex-col gap-3">
            <button
              onClick={copyShortUrl}
              className={`w-full py-4 btn-primary text-xs tracking-[0.2em] relative overflow-hidden ${copied ? 'bg-green-600' : ''}`}
            >
              <div className="flex items-center justify-center gap-2">
                {copied ? (
                  <><Check className="h-4 w-4 animate-in zoom-in" /> COPIED_TO_CLIPBOARD</>
                ) : (
                  <><Copy className="h-4 w-4" /> COPY_ADDRESS</>
                )}
              </div>
            </button>
            
            <a 
              href={result.shortUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="w-full py-4 btn-secondary text-xs tracking-[0.2em] opacity-100 border-(--db-border) hover:bg-(--db-text) hover:text-(--db-bg) transition-all"
            >
                <div className="flex items-center justify-center gap-2">
                  <ExternalLink className="h-4 w-4" /> OPEN_RESOURCE
                </div>
            </a>
        </div>

        <div className="flex items-center justify-center gap-2 opacity-20">
            <Sparkles className="h-3 w-3" />
            <span className="nothing-label text-[8px]">Link_Infrastructure_Validated</span>
        </div>
      </div>
    </div>
  );
}
