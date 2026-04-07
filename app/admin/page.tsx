// app/admin/page.tsx

"use client";

import { useEffect, useState } from "react";
import { 
    Users, AlertTriangle, 
    Trash2, ExternalLink, RefreshCw, ShieldAlert, Database, Cpu} from "lucide-react";

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
    <div className="flex flex-col gap-10 md:gap-16 pb-20">
      
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div className="space-y-2">
              <div className="flex items-center gap-2 text-(--db-primary)">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span className="nothing-label tracking-widest text-(--db-primary)">Access_Level_0</span>
              </div>
              <h2 className="text-4xl md:text-6xl nothing-title text-(--db-text)">COMMAND_CENTER</h2>
              <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="nothing-label normal-case tracking-normal opacity-40">Privileged system administrative interface</span>
              </div>
          </div>
          <button onClick={fetchData} className="btn-secondary px-8 py-3 text-[10px] nothing-label opacity-100">
              <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? "animate-spin" : ""}`} /> REFRESH_SYS
          </button>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="db-card p-8 flex flex-col justify-between h-44 hover:border-(--db-text)/20">
              <div className="flex justify-between items-start">
                  <span className="nothing-label text-[9px]">Identity_Vault</span>
                  <Users className="h-4 w-4 opacity-20" />
              </div>
              <div className="space-y-1">
                  <p className="text-5xl font-black tracking-tighter">{data?.stats.totalUsers || 0}</p>
                  <p className="nothing-label text-green-500 text-[8px] opacity-100">Verified_Subjects</p>
              </div>
          </div>
          <div className="db-card p-8 flex flex-col justify-between h-44 hover:border-(--db-text)/20">
              <div className="flex justify-between items-start">
                  <span className="nothing-label text-[9px]">Link_Infrastructure</span>
                  <Database className="h-4 w-4 opacity-20" />
              </div>
              <div className="space-y-1">
                  <p className="text-5xl font-black tracking-tighter">{data?.stats.totalLinks || 0}</p>
                  <p className="nothing-label text-blue-500 text-[8px] opacity-100">Active_Endpoints</p>
              </div>
          </div>
          <div className="db-card p-8 flex flex-col justify-between h-44 border-(--db-primary)/30 bg-(--db-primary)/5 hover:border-(--db-primary)">
              <div className="flex justify-between items-start">
                  <span className="nothing-label text-(--db-primary) text-[9px]">Security_Alerts</span>
                  <AlertTriangle className="h-4 w-4 text-(--db-primary) animate-soft-pulse" />
              </div>
              <div className="space-y-1">
                  <p className="text-5xl font-black tracking-tighter text-(--db-primary)">{data?.stats.pendingReports || 0}</p>
                  <p className="nothing-label text-(--db-primary) text-[8px] opacity-100 animate-pulse">Action_Required</p>
              </div>
          </div>
      </div>

      <div className="flex flex-col gap-6">
          <div className="flex bg-(--db-surface) border border-(--db-border) rounded-full p-1 w-fit shadow-sm">
              <button 
                  onClick={() => setActiveTab("reports")}
                  className={`px-8 py-3 rounded-full nothing-label text-[9px] transition-all opacity-100 ${activeTab === "reports" ? "bg-(--db-primary) text-white shadow-lg shadow-(--db-primary)/20" : "hover:bg-(--db-surface-hover) text-(--db-text-muted)"}`}
              >
                  REPORTS_DB ({data?.reports.length || 0})
              </button>
              <button 
                  onClick={() => setActiveTab("public")}
                  className={`px-8 py-3 rounded-full nothing-label text-[9px] transition-all opacity-100 ${activeTab === "public" ? "bg-(--db-text) text-(--db-bg) shadow-lg" : "hover:bg-(--db-surface-hover) text-(--db-text-muted)"}`}
              >
                  PUBLIC_RECORDS ({data?.publicLinks.length || 0})
              </button>
          </div>

          <div className="db-card overflow-hidden bg-(--db-surface)">
              {loading && !data ? (
                  <div className="flex flex-col items-center justify-center py-32 gap-4 opacity-20">
                      <Cpu className="h-12 w-12 animate-spin text-(--db-primary)" />
                      <span className="nothing-label">QUERYING_SYSTEM_CORES...</span>
                  </div>
              ) : (
                  <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-200">
                          <thead>
                              <tr className="nothing-label text-[9px] border-b border-(--db-border)/30">
                                  <th className="py-6 px-8">RESOURCE_ID</th>
                                  <th className="py-6 px-8">REDIRECT_VECTOR</th>
                                  {activeTab === "reports" && <th className="py-6 px-8">DIAGNOSTIC_DATA</th>}
                                  <th className="py-6 px-8 text-right">OPERATIONS</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-(--db-border)/20">
                              {activeTab === "reports" ? (
                                  data?.reports.length === 0 ? (
                                      <tr><td colSpan={4} className="py-20 text-center nothing-label opacity-20">NO_PENDING_REPORTS</td></tr>
                                  ) : (
                                      data?.reports.map((report) => (
                                          <tr key={report.id} className={`group transition-all hover:bg-(--db-surface-hover)/50 ${report.shortLink?.slug === deletingSlug ? "opacity-0 scale-95" : ""}`}>
                                              <td className="py-6 px-8">
                                                  <div className="flex flex-col">
                                                      <span className="text-sm font-black text-(--db-text)">
                                                          {report.shortLink ? `/${report.shortLink.slug}` : <span className="text-(--db-primary)">[NULLED]</span>}
                                                      </span>
                                                      <span className="nothing-label text-[8px] opacity-40">SLUG_ID</span>
                                                  </div>
                                              </td>
                                              <td className="py-6 px-8">
                                                  <div className="text-[10px] font-bold truncate max-w-xs opacity-40 group-hover:opacity-100 transition-opacity">
                                                      {report.shortLink?.targetUrl || "Unknown"}
                                                  </div>
                                              </td>
                                              <td className="py-6 px-8">
                                                  <div className="flex flex-col">
                                                      <span className="text-[10px] font-black text-(--db-primary) uppercase mb-1">{report.reason}</span>
                                                      <span className="text-[10px] font-medium opacity-60 truncate max-w-xs italic">{report.details}</span>
                                                  </div>
                                              </td>
                                              <td className="py-6 px-8 text-right">
                                                  {report.shortLink && (
                                                      <button onClick={() => confirmDelete(report.shortLink!.slug)} className="p-3 rounded-2xl bg-(--db-primary)/10 text-(--db-primary) hover:bg-(--db-primary) hover:text-white transition-all shadow-sm">
                                                          <Trash2 className="h-4.5 w-4.5"/>
                                                      </button>
                                                  )}
                                              </td>
                                          </tr>
                                      ))
                                  )
                              ) : (
                                  data?.publicLinks.length === 0 ? (
                                      <tr><td colSpan={3} className="py-20 text-center nothing-label opacity-20">NO_PUBLIC_RECORDS</td></tr>
                                  ) : (
                                      data?.publicLinks.map((link) => (
                                          <tr key={link.id} className={`group transition-all hover:bg-(--db-surface-hover)/50 ${link.slug === deletingSlug ? "opacity-0 scale-95" : ""}`}>
                                              <td className="py-6 px-8">
                                                  <div className="flex flex-col">
                                                      <span className="text-sm font-black text-blue-500">/{link.slug}</span>
                                                      <span className="nothing-label text-[8px] opacity-40">PUBLIC_SLUG</span>
                                                  </div>
                                              </td>
                                              <td className="py-6 px-8">
                                                  <a href={link.targetUrl} target="_blank" className="text-[10px] font-bold hover:underline flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                                      {link.targetUrl} <ExternalLink className="h-3 w-3 opacity-30"/>
                                                  </a>
                                              </td>
                                              <td className="py-6 px-8 text-right">
                                                  <button onClick={() => confirmDelete(link.slug)} className="p-3 rounded-2xl border border-(--db-border) hover:bg-(--db-primary) hover:text-white transition-all shadow-sm">
                                                      <Trash2 className="h-4.5 w-4.5"/>
                                                  </button>
                                              </td>
                                          </tr>
                                      ))
                                  )
                              )}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>
      </div>

      {deleteModal.show && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-(--db-bg)/95 backdrop-blur-2xl animate-reveal">
           <div className="db-card w-full max-w-sm p-10 space-y-10 text-center border-(--db-primary)/50">
                <div className="flex flex-col items-center gap-6">
                    <div className="p-6 rounded-3xl bg-(--db-primary)/10 text-(--db-primary) animate-soft-pulse">
                        <Trash2 className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl nothing-title">TERMINATE</h2>
                        <p className="nothing-label text-(--db-primary)">Authorization_Required</p>
                    </div>
                    <p className="text-[10px] font-bold text-(--db-text-muted) uppercase tracking-widest leading-relaxed">
                        You are about to purge this record from the public registry. This operation cannot be undone.
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <button onClick={executeDelete} disabled={isDeleting} className="btn-primary w-full py-4 text-sm tracking-widest">
                        {isDeleting ? "EXECUTING..." : "CONFIRM PURGE"}
                    </button>
                    <button onClick={() => setDeleteModal({ show: false, slug: null })} className="btn-secondary w-full py-3 text-[10px] nothing-label opacity-100">ABORT_MISSION</button>
                </div>
           </div>
        </div>
      )}
    </div>
  );
}
