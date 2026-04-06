// app/admin/page.tsx

"use client";

import { useEffect, useState } from "react";
import { 
    Users, AlertTriangle, 
    Trash2, ExternalLink, RefreshCw, ShieldAlert, Database, Cpu
} from "lucide-react";

interface AdminData {
    reports: {
        id: string;
        reason: string;
        details: string;
        shortLink: {
            slug: string;
            targetUrl: string;
        } | null;
    }[];
    publicLinks: {
        id: string;
        slug: string;
        targetUrl: string;
    }[];
    stats: {
        totalUsers: number;
        totalLinks: number;
        pendingReports: number;
    };
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reports" | "public">("reports");
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; slug: string | null }>({ show: false, slug: null });
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data");
      const json = await res.json();
      setData(json);
    } catch { } finally { setLoading(false); }
  }

  function confirmDelete(slug: string) { setDeleteModal({ show: true, slug }); }

  async function executeDelete() {
    if (!deleteModal.slug) return;
    setIsDeleting(true);
    try {
        const res = await fetch(`/api/links/${deleteModal.slug}`, { method: "DELETE" });
        if(res.ok) {
            setDeletingSlug(deleteModal.slug);
            setDeleteModal({ show: false, slug: null });
            await new Promise(r => setTimeout(r, 400));
            setDeletingSlug(null);
            fetchData();
        }
    } catch { } finally { setIsDeleting(false); }
  }

  return (
    <div className="flex flex-col gap-10 animate-reveal">
      
      {/* Admin Header Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
              <div className="flex items-center gap-2 text-var(--db-primary)">
                  <ShieldAlert className="h-4 w-4" />
                  <span className="font-dot text-[10px] tracking-nothing uppercase">Privileged Access Level 0</span>
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-(--db-text)">COMMAND CENTER</h2>
          </div>
          <button onClick={fetchData} className="btn-secondary px-6 py-2.5 text-[10px] font-dot tracking-widest">
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> REFRESH_SYS
          </button>
      </section>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="db-card p-6 flex flex-col justify-between h-40">
              <div className="flex justify-between items-start">
                  <span className="text-[10px] font-dot tracking-nothing text-var(--db-text-muted) uppercase">Users.Active</span>
                  <Users className="h-4 w-4 opacity-20" />
              </div>
              <div className="space-y-1">
                  <p className="text-4xl font-black tracking-tighter">{data?.stats.totalUsers || 0}</p>
                  <p className="text-[9px] font-bold text-green-500 uppercase">Verified Records</p>
              </div>
          </div>
          <div className="db-card p-6 flex flex-col justify-between h-40">
              <div className="flex justify-between items-start">
                  <span className="text-[10px] font-dot tracking-nothing text-var(--db-text-muted) uppercase">Links.Stored</span>
                  <Database className="h-4 w-4 opacity-20" />
              </div>
              <div className="space-y-1">
                  <p className="text-4xl font-black tracking-tighter">{data?.stats.totalLinks || 0}</p>
                  <p className="text-[9px] font-bold text-blue-500 uppercase">Relational Slugs</p>
              </div>
          </div>
          <div className="db-card p-6 flex flex-col justify-between h-40 border-var(--db-primary)/30">
              <div className="flex justify-between items-start">
                  <span className="text-[10px] font-dot tracking-nothing text-var(--db-primary) uppercase">Security.Alerts</span>
                  <AlertTriangle className="h-4 w-4 text-var(--db-primary)" />
              </div>
              <div className="space-y-1">
                  <p className="text-4xl font-black tracking-tighter text-var(--db-primary)">{data?.stats.pendingReports || 0}</p>
                  <p className="text-[9px] font-bold text-var(--db-primary) uppercase animate-pulse">Needs attention</p>
              </div>
          </div>
      </div>

      {/* Database Explorer */}
      <div className="db-card flex flex-col min-h-150 overflow-hidden">
          <div className="flex bg-var(--db-bg)/50 backdrop-blur-sm border-b border-var(--db-border)">
              <button 
                  onClick={() => setActiveTab("reports")}
                  className={`px-8 py-5 font-dot text-[10px] tracking-widest transition-all ${activeTab === "reports" ? "bg-var(--db-primary) text-white" : "hover:bg-var(--db-surface-hover) text-var(--db-text-muted)"}`}
              >
                  REPORTS_DB ({data?.reports.length || 0})
              </button>
              <button 
                  onClick={() => setActiveTab("public")}
                  className={`px-8 py-5 font-dot text-[10px] tracking-widest transition-all ${activeTab === "public" ? "bg-var(--db-text) text-var(--db-bg)" : "hover:bg-var(--db-surface-hover) text-var(--db-text-muted)"}`}
              >
                  PUBLIC_RECORDS ({data?.publicLinks.length || 0})
              </button>
          </div>

          <div className="flex-1 overflow-x-auto p-6 bg-var(--db-surface)">
              {loading && !data ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
                      <Cpu className="h-10 w-10 animate-spin mb-4" />
                      <span className="font-dot text-xs tracking-nothing">Querying System...</span>
                  </div>
              ) : (
                  <table className="w-full text-left min-w-[800px]">
                      <thead>
                          <tr className="text-[10px] font-dot tracking-widest text-var(--db-text-muted) uppercase border-b border-var(--db-border)">
                              <th className="pb-4 px-2">Identifier</th>
                              <th className="pb-4 px-2">Route</th>
                              {activeTab === "reports" && <th className="pb-4 px-2">Diagnostic</th>}
                              <th className="pb-4 px-2 text-right">Operations</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-var(--db-border)/50">
                          {activeTab === "reports" ? (
                              data?.reports.map((report) => (
                                  <tr key={report.id} className={`group transition-colors hover:bg-var(--db-surface-hover) ${report.shortLink?.slug === deletingSlug ? "animate-shrink-out" : ""}`}>
                                      <td className="py-4 px-2 font-black text-xs uppercase tracking-tighter">
                                          {report.shortLink ? `/${report.shortLink.slug}` : <span className="text-var(--db-primary)">[NULLED]</span>}
                                      </td>
                                      <td className="py-4 px-2">
                                          <div className="text-[10px] font-bold truncate max-w-xs font-mono opacity-40 group-hover:opacity-100 transition-opacity">
                                              {report.shortLink?.targetUrl || "Unknown"}
                                          </div>
                                      </td>
                                      <td className="py-4 px-2">
                                          <div className="flex flex-col">
                                              <span className="text-[9px] font-black text-var(--db-primary) uppercase">{report.reason}</span>
                                              <span className="text-[10px] font-medium italic opacity-60 truncate max-w-xs">{report.details}</span>
                                          </div>
                                      </td>
                                      <td className="py-4 px-2 text-right">
                                          {report.shortLink && (
                                              <button onClick={() => confirmDelete(report.shortLink!.slug)} className="ml-auto p-2 rounded-xl bg-var(--db-primary)/10 text-var(--db-primary) hover:bg-var(--db-primary) hover:text-white transition-all active:scale-90">
                                                  <Trash2 className="h-4 w-4"/>
                                              </button>
                                          )}
                                      </td>
                                  </tr>
                              ))
                          ) : (
                              data?.publicLinks.map((link) => (
                                  <tr key={link.id} className={`group transition-colors hover:bg-var(--db-surface-hover) ${link.slug === deletingSlug ? "animate-shrink-out" : ""}`}>
                                      <td className="py-4 px-2 font-black text-xs uppercase tracking-tighter text-blue-500">/{link.slug}</td>
                                      <td className="py-4 px-2">
                                          <a href={link.targetUrl} target="_blank" className="text-[10px] font-bold hover:underline flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                              {link.targetUrl} <ExternalLink className="h-2.5 w-2.5"/>
                                          </a>
                                      </td>
                                      <td className="py-4 px-2 text-right">
                                          <button onClick={() => confirmDelete(link.slug)} className="ml-auto p-2 rounded-xl border border-var(--db-border) hover:bg-var(--db-primary) hover:text-white transition-all active:scale-90">
                                              <Trash2 className="h-4 w-4"/>
                                          </button>
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              )}
          </div>
      </div>

      {deleteModal.show && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-var(--db-bg)/95 backdrop-blur-2xl animate-in fade-in">
           <div className="db-card w-full max-w-sm p-8 space-y-8 text-center border-var(--db-primary)">
                <div className="flex flex-col items-center gap-4">
                    <div className="p-5 rounded-full bg-var(--db-primary)/10 text-var(--db-primary) animate-soft-pulse">
                        <Trash2 className="h-10 w-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Terminate Data</h2>
                        <p className="text-[10px] font-dot tracking-widest text-var(--db-primary) uppercase mt-1">Authorization: REQUIRED</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <button onClick={executeDelete} disabled={isDeleting} className="btn-primary w-full py-4 text-sm tracking-widest">
                        {isDeleting ? "EXECUTING..." : "CONFIRM PURGE"}
                    </button>
                    <button onClick={() => setDeleteModal({ show: false, slug: null })} className="btn-secondary w-full py-3 text-[10px] font-dot tracking-widest">CANCEL_OPS</button>
                </div>
           </div>
        </div>
      )}
    </div>
  );
}
