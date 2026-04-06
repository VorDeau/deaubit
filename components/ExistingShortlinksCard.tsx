//components/ExistingShortlinksCard.tsx

"use client";

import { useState, useMemo } from "react";
import { Copy, Trash2, QrCode, BarChart3, ExternalLink, Check, Search, X, Pencil, ChevronLeft, ChevronRight } from "lucide-react";

export interface ShortLink {
  id: string;
  slug: string;
  targetUrl: string;
  createdAt: string;
  expiresAt?: string | null;
  _count?: { clicks: number };
}

interface ExistingShortlinksCardProps {
  links: ShortLink[];
  loadingTable: boolean;
  baseUrl: string;
  getDomainLabel: (url: string) => string;
  onDelete: (slugs: string[]) => void;
  deletingSlugs?: string[];
  onEdit: (link: ShortLink) => void;
  onViewStats: (slug: string) => void;
  onViewQr: (slug: string) => void;

  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

interface ShortlinkRowProps {
  link: ShortLink;
  baseUrl: string;
  getDomainLabel: (url: string) => string;
  onViewStats: (slug: string) => void;
  onViewQr: (slug: string) => void;
  onEdit: (link: ShortLink) => void;
  selected: boolean;
  onToggleSelect: (slug: string) => void;
  isDeleting?: boolean;
  isCopied: boolean;
  onCopy: (slug: string) => void;
}

function ShortlinkRow({ 
  link, 
  baseUrl, 
  getDomainLabel, 
  onViewStats, 
  onViewQr, 
  onEdit, 
  selected, 
  onToggleSelect,
  isDeleting,
  isCopied,
  onCopy
}: ShortlinkRowProps) {
  const shortUrl = `${baseUrl}/${link.slug}`;
  const domainLabel = getDomainLabel(link.targetUrl);
  const clickCount = link._count?.clicks || 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl).then(() => {
      onCopy(link.slug);
    }).catch(() => {});
  };

  const getExpiryStatus = () => {
    if (!link.expiresAt) return null;
    const now = new Date();
    const expiry = new Date(link.expiresAt);
    const isExpired = now > expiry;
    if (isExpired) return <div className="w-1.5 h-1.5 rounded-full bg-red-500" title="Expired" />;
    return <div className="w-1.5 h-1.5 rounded-full bg-orange-400" title="Expires Soon" />;
  };

  return (
    <div className={`db-card group relative p-2 px-4 lg:p-3 lg:px-6 flex items-center gap-4 transition-all duration-500 hover:shadow-lg rounded-2xl ${selected ? "ring-2 ring-(--db-primary) z-10" : ""} ${isDeleting ? "animate-shrink-out pointer-events-none" : ""}`}>
      
      <input 
        type="checkbox" 
        checked={selected} 
        onChange={() => onToggleSelect(link.slug)}
        className="w-4 h-4 rounded-full accent-(--db-primary) cursor-pointer shrink-0"
      />

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
          <div className="flex flex-col min-w-[120px]">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-(--db-text-muted) leading-none mb-1">Slug</span>
              <a href={shortUrl} target="_blank" className={`font-dot text-sm lg:text-base text-(--db-text) hover:text-(--db-primary) transition-colors truncate flex items-center gap-1 ${isCopied ? "animate-copy-flash text-green-500" : ""}`}>
                  /{link.slug} <ExternalLink className="h-2 w-2 opacity-30" />
              </a>
          </div>

          <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-(--db-text-muted) leading-none mb-1">Destination</span>
              <span className="text-[10px] font-bold text-(--db-text) truncate opacity-60" title={link.targetUrl}>{domainLabel}</span>
          </div>

          <div className="flex items-center gap-6 shrink-0">
              <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-(--db-text-muted) leading-none mb-1">Clicks</span>
                  <span className="text-[10px] font-black text-(--db-text)">{clickCount.toLocaleString()}</span>
              </div>
              <div className="flex flex-col items-end min-w-[60px]">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-(--db-text-muted) leading-none mb-1">Status</span>
                  <div className="flex items-center gap-1.5">
                     {getExpiryStatus() || <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="Active" />}
                     <span className="text-[8px] font-bold text-(--db-text) opacity-40 uppercase">{link.expiresAt ? "Exp" : "Static"}</span>
                  </div>
              </div>
          </div>
      </div>

      <div className="flex items-center gap-1 lg:gap-2 shrink-0 border-l border-(--db-border)/30 pl-4 ml-2">
          <button onClick={() => onViewStats(link.slug)} className="p-2 rounded-full hover:bg-(--db-primary)/10 text-(--db-text-muted) hover:text-(--db-primary) transition-all" title="Stats">
              <BarChart3 className="h-4 w-4" />
          </button>
          
          <button onClick={() => onEdit(link)} className="p-2 rounded-full hover:bg-(--db-primary)/10 text-(--db-text-muted) hover:text-(--db-primary) transition-all" title="Edit">
              <Pencil className="h-4 w-4" />
          </button>

          <button onClick={() => onViewQr(link.slug)} className="p-2 rounded-full hover:bg-(--db-primary)/10 text-(--db-text-muted) hover:text-(--db-primary) transition-all" title="QR">
              <QrCode className="h-4 w-4" />
          </button>
          
          <button onClick={handleCopy} className={`p-2 rounded-full transition-all ${isCopied ? "bg-green-500 text-white" : "hover:bg-green-500/10 text-(--db-text-muted) hover:text-green-500"}`}>
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
      </div>
    </div>
  );
}


export function ExistingShortlinksCard({ 
    links, loadingTable, baseUrl, getDomainLabel, 
    onDelete, deletingSlugs = [], onEdit, onViewStats, onViewQr, 
    currentPage, totalPages, totalItems, onPageChange 
}: ExistingShortlinksCardProps) {
  
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopy = (slug: string) => {
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 600);
  };

  const filteredLinks = useMemo(() => {
    if (!search) return links;
    return links.filter(l => 
        l.slug.toLowerCase().includes(search.toLowerCase()) || 
        l.targetUrl.toLowerCase().includes(search.toLowerCase())
    );
  }, [links, search]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredLinks.length && filteredLinks.length > 0) {
        setSelectedIds(new Set());
    } else {
        setSelectedIds(new Set(filteredLinks.map(l => l.slug)));
    }
  };

  const toggleSelection = (slug: string) => {
    const next = new Set(selectedIds);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    onDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  return (
    <div className="h-full flex flex-col relative">
      
      <div className="mb-6 flex flex-col gap-4 border-b border-(--db-border)/30 pb-4">
        <div className="flex items-center justify-between">
            <h2 className="text-lg lg:text-xl font-black uppercase tracking-tighter text-(--db-text)">
                Links <span className="text-(--db-text-muted) text-sm lg:text-lg">({totalItems})</span>
            </h2>
        </div>

        <div className="flex gap-2">
            <div className="relative flex-1">
                <input 
                    className="w-full bg-(--db-bg) border border-(--db-border)/50 rounded-full pl-10 pr-4 py-2 text-xs lg:text-sm font-bold text-(--db-text) focus:ring-2 focus:ring-(--db-primary)/50 focus:border-(--db-primary) outline-none transition-all placeholder:font-normal"
                    placeholder="Search links..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-(--db-text-muted)" />
                {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3.5 top-2.5 hover:text-red-500">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            
            {selectedIds.size > 0 && (
                <button 
                    onClick={handleBulkDelete}
                    className="bg-red-500 text-white rounded-full px-4 font-black uppercase text-[10px] flex items-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                    <Trash2 className="h-3.5 w-3.5"/> DELETE ({selectedIds.size})
                </button>
            )}
        </div>

        <div className="flex items-center gap-2 text-[10px] font-black text-(--db-text) tracking-widest">
            <input 
                type="checkbox" 
                className="w-4 h-4 rounded-full accent-(--db-primary) cursor-pointer"
                checked={filteredLinks.length > 0 && selectedIds.size === filteredLinks.length}
                onChange={handleSelectAll}
                disabled={filteredLinks.length === 0}
            />
            <span>SELECT ALL</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 md:pr-2 pb-4">
        {loadingTable ? (
            <div className="text-center p-10 font-black animate-pulse text-(--db-text-muted) text-xs tracking-widest">SYNCING DATA...</div>
        ) : filteredLinks.length === 0 ? (
            <div className="border border-dashed border-(--db-border)/50 rounded-2xl p-12 text-center bg-(--db-surface)/50">
                <p className="font-black text-sm lg:text-lg mb-1 text-(--db-text-muted) uppercase tracking-tighter">No links found.</p>
            </div>
        ) : (
            <div className="flex flex-col gap-3">
                {filteredLinks.map((link) => (
                  <ShortlinkRow 
                    key={link.id} 
                    link={link} 
                    baseUrl={baseUrl} 
                    getDomainLabel={getDomainLabel} 
                    onEdit={onEdit}
                    onViewStats={onViewStats} 
                    onViewQr={onViewQr} 
                    selected={selectedIds.has(link.slug)}
                    onToggleSelect={toggleSelection}
                    isDeleting={deletingSlugs.includes(link.slug)}
                    isCopied={copiedSlug === link.slug}
                    onCopy={handleCopy}
                  />
                ))}
            </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pt-4 border-t border-(--db-border)/30 flex items-center justify-between gap-2 mt-auto">
            <button 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-(--db-border)/50 bg-(--db-surface) hover:bg-(--db-bg) disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft className="h-5 w-5 text-(--db-text)"/>
            </button>
            
            <span className="text-[10px] font-black text-(--db-text-muted) tracking-[0.2em]">
                {currentPage} / {totalPages}
            </span>

            <button 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full border border-(--db-border)/50 bg-(--db-surface) hover:bg-(--db-bg) disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <ChevronRight className="h-5 w-5 text-(--db-text)"/>
            </button>
        </div>
      )}
    </div>
  );
}
