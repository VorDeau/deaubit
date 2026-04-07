//components/ExistingShortlinksCard.tsx

"use client";

import { useState, useMemo } from "react";
import { Copy, Trash2, QrCode, BarChart3, ExternalLink, Check, Search, X, Pencil, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

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
    if (isExpired) return <div className="w-1.5 h-1.5 rounded-full bg-(--db-primary)" title="Expired" />;
    return <div className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Expires Soon" />;
  };

  return (
    <div className={`db-card group relative p-3 px-5 lg:p-4 lg:px-8 flex items-center gap-4 transition-all duration-700 hover:shadow-2xl bg-(--db-surface) ${selected ? "border-(--db-primary)/50 bg-(--db-surface-hover)" : ""} ${isDeleting ? "opacity-0 scale-95 pointer-events-none" : ""}`}>
      
      <div className="flex items-center shrink-0">
          <input 
            type="checkbox" 
            checked={selected} 
            onChange={() => onToggleSelect(link.slug)}
            className="w-5 h-5 rounded-full accent-(--db-primary) cursor-pointer"
          />
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 items-center">
          <div className="md:col-span-4 flex flex-col min-w-0">
              <span className="nothing-label text-[8px] mb-1">Link_Identity</span>
              <a href={shortUrl} target="_blank" className={`font-dot text-lg text-(--db-text) hover:text-(--db-primary) transition-colors truncate flex items-center gap-2 ${isCopied ? "text-green-500" : ""}`}>
                  /{link.slug} <ExternalLink className="h-3 w-3 opacity-20" />
              </a>
          </div>

          <div className="md:col-span-4 flex flex-col min-w-0">
              <span className="nothing-label text-[8px] mb-1">Destination</span>
              <span className="text-xs font-bold text-(--db-text) truncate opacity-60" title={link.targetUrl}>{domainLabel}</span>
          </div>

          <div className="md:col-span-4 flex items-center justify-end gap-8 shrink-0">
              <div className="flex flex-col items-end">
                  <span className="nothing-label text-[8px] mb-1">Hits</span>
                  <span className="text-sm font-black text-(--db-text) tracking-tighter">{clickCount.toLocaleString()}</span>
              </div>
              <div className="flex flex-col items-end min-w-15">
                  <span className="nothing-label text-[8px] mb-1">Status</span>
                  <div className="flex items-center gap-2">
                     {getExpiryStatus() || <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" title="Active" />}
                     <span className="nothing-label tracking-normal text-[9px] opacity-40">{link.expiresAt ? "TEMPORARY" : "PERSISTENT"}</span>
                  </div>
              </div>
          </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 border-l border-(--db-border)/30 pl-4 ml-2">
          <button onClick={() => onViewStats(link.slug)} className="p-2.5 rounded-full hover:bg-(--db-primary)/10 text-(--db-text-muted) hover:text-(--db-primary) transition-all" title="Analytics">
              <BarChart3 className="h-4.5 w-4.5" />
          </button>
          
          <button onClick={() => onEdit(link)} className="p-2.5 rounded-full hover:bg-(--db-primary)/10 text-(--db-text-muted) hover:text-(--db-primary) transition-all" title="Modify">
              <Pencil className="h-4.5 w-4.5" />
          </button>

          <button onClick={() => onViewQr(link.slug)} className="p-2.5 rounded-full hover:bg-(--db-primary)/10 text-(--db-text-muted) hover:text-(--db-primary) transition-all" title="QR Code">
              <QrCode className="h-4.5 w-4.5" />
          </button>
          
          <button onClick={handleCopy} className={`p-2.5 rounded-full transition-all ${isCopied ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "hover:bg-green-500/10 text-(--db-text-muted) hover:text-green-500"}`}>
              {isCopied ? <Check className="h-4.5 w-4.5" /> : <Copy className="h-4.5 w-4.5" />}
          </button>
      </div>
    </div>
  );
}


export function ExistingShortlinksCard({ 
    links, loadingTable, baseUrl, getDomainLabel, 
    onDelete, deletingSlugs = [], onEdit, onViewStats, onViewQr, 
    currentPage, totalPages, onPageChange 
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
    <div className="flex flex-col gap-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-(--db-surface) border border-(--db-border) rounded-3xl p-6 shadow-sm">
        <div className="relative flex-1 max-w-md">
            <input 
                className="w-full bg-(--db-surface-hover) pl-12 pr-10 py-3 text-sm font-bold"
                placeholder="Search link logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-(--db-text-muted)" />
            {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-3.5 hover:text-(--db-primary)">
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-(--db-surface-hover) rounded-full border border-(--db-border)">
                <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded-full accent-(--db-primary) cursor-pointer"
                    checked={filteredLinks.length > 0 && selectedIds.size === filteredLinks.length}
                    onChange={handleSelectAll}
                    disabled={filteredLinks.length === 0}
                />
                <span className="nothing-label opacity-100 text-[9px]">Select_All</span>
            </div>

            {selectedIds.size > 0 && (
                <button 
                    onClick={handleBulkDelete}
                    className="btn-primary py-2.5 px-6 text-[10px] shadow-red-500/10"
                >
                    <Trash2 className="h-3.5 w-3.5 mr-2"/> TERMINATE ({selectedIds.size})
                </button>
            )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {loadingTable ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
                <Loader2 className="h-10 w-10 animate-spin text-(--db-primary)" />
                <span className="nothing-label">Syncing_Records...</span>
            </div>
        ) : filteredLinks.length === 0 ? (
            <div className="db-card border-dashed p-20 text-center bg-transparent">
                <p className="nothing-label text-sm mb-1">NO_RECORDS_FOUND</p>
                <p className="nothing-label normal-case tracking-normal opacity-40">System database returned null for this query.</p>
            </div>
        ) : (
            <div className="flex flex-col gap-4">
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
        <div className="flex items-center justify-center gap-6 py-10">
            <button 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-4 rounded-full border border-(--db-border) bg-(--db-surface) hover:bg-(--db-text) hover:text-(--db-bg) disabled:opacity-20 transition-all shadow-sm"
            >
                <ChevronLeft className="h-6 w-6"/>
            </button>
            
            <div className="flex flex-col items-center">
                <span className="nothing-label opacity-40 mb-1">Page</span>
                <span className="text-sm font-black tracking-widest">
                    {currentPage} <span className="opacity-20">/</span> {totalPages}
                </span>
            </div>

            <button 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-4 rounded-full border border-(--db-border) bg-(--db-surface) hover:bg-(--db-text) hover:text-(--db-bg) disabled:opacity-20 transition-all shadow-sm"
            >
                <ChevronRight className="h-6 w-6"/>
            </button>
        </div>
      )}
    </div>
  );
}
