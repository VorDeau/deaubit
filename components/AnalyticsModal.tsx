//components/AnalyticsModal.tsx

"use client";

import { useEffect, useState } from "react";
import { X, Loader2, BarChart3, Globe, Link2, TrendingUp, Monitor, Smartphone, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsModalProps {
  slug: string;
  onClose: () => void;
}

interface StatsData {
  total: number;
  chartData: { date: string; count: number }[];
  topBrowsers: { name: string; value: number }[];
  topOS: { name: string; value: number }[];
  topCountries: { name: string; value: number }[];
  topReferrers: { name: string; value: number }[];
}

function StatBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="nothing-label text-[9px] truncate max-w-[70%] opacity-80">{label || "Unknown"}</span>
        <span className="font-dot text-xs font-bold text-(--db-primary)">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-(--db-surface-hover) overflow-hidden">
        <div
          className="h-full bg-(--db-primary) rounded-full animate-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsModal({ slug, onClose }: AnalyticsModalProps) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/links/${slug}/stats`)
      .then((res) => res.json())
      .then((res) => { setData(res); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 db-overlay animate-reveal">
      <div className="db-card animate-modal-in relative w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border-(--db-border)">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 border-b border-(--db-border) bg-(--db-surface)/90 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-(--db-primary)/10 text-(--db-primary) rounded-2xl">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="nothing-title text-xl text-(--db-text)">ANALYTICS</h2>
              <p className="nothing-label text-[9px] tracking-widest opacity-60">
                NODE_{slug.toUpperCase()} • LAST_7_DAYS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-(--db-surface-hover) text-(--db-text) opacity-40 hover:opacity-100 transition-all group"
          >
            <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="p-6 lg:p-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6 opacity-40">
              <Loader2 className="h-10 w-10 animate-spin text-(--db-primary)" />
              <span className="nothing-label animate-pulse">Syncing_Analytics_Node...</span>
            </div>
          ) : !data ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <div className="p-6 bg-(--db-primary)/10 rounded-3xl text-(--db-primary)">
                <AlertTriangle className="h-10 w-10" />
              </div>
              <p className="nothing-label text-(--db-primary) opacity-100">DATA_UNAVAILABLE</p>
            </div>
          ) : (
            <div className="space-y-10">

              {/* Stat tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Total_Clicks", value: data.total, icon: <TrendingUp className="h-5 w-5" />, numeric: true },
                  { label: "Top_Country", value: data.topCountries[0]?.name || "—", icon: <Globe className="h-5 w-5" />, numeric: false },
                  { label: "Top_Source", value: data.topReferrers[0]?.name || "—", icon: <Link2 className="h-5 w-5" />, numeric: false },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="db-card p-6 bg-(--db-surface) flex items-start gap-4 animate-item-enter"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="p-2.5 bg-(--db-primary)/10 text-(--db-primary) rounded-xl shrink-0">
                      {stat.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="nothing-label text-[8px] mb-1 opacity-60">{stat.label}</p>
                      <p className={`font-black truncate ${stat.numeric ? "text-3xl tracking-tighter animate-count-up" : "text-lg uppercase tracking-tight"}`}>
                        {stat.numeric ? stat.value.toLocaleString() : stat.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="db-card p-6 bg-(--db-surface) space-y-4">
                <p className="nothing-label text-[9px] opacity-60">Clicks_Over_Time</p>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--db-primary)" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="var(--db-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--db-border)" opacity={0.5} />
                      <XAxis
                        dataKey="date"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(s) => s.slice(5)}
                        stroke="var(--db-text-muted)"
                        fontFamily="var(--font-dot)"
                        textDecoration="uppercase"
                      />
                      <YAxis
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        stroke="var(--db-text-muted)"
                        fontFamily="var(--font-dot)"
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid var(--db-border)",
                          background: "var(--db-surface)",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
                          fontSize: "10px",
                          fontFamily: "var(--font-dot)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                        labelStyle={{ color: "var(--db-text)", fontWeight: 900 }}
                        itemStyle={{ color: "var(--db-primary)", fontWeight: 700 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="var(--db-primary)"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#areaGrad)"
                        dot={false}
                        activeDot={{ r: 4, fill: "var(--db-primary)", stroke: "var(--db-surface)", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Data sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Browsers", list: data.topBrowsers, icon: <Monitor className="h-4 w-4" /> },
                  { title: "Operating_Systems", list: data.topOS, icon: <Smartphone className="h-4 w-4" /> },
                  { title: "Locations", list: data.topCountries, icon: <Globe className="h-4 w-4" /> },
                  { title: "Referrers", list: data.topReferrers, icon: <Link2 className="h-4 w-4" /> },
                ].map((section, idx) => {
                  const max = section.list[0]?.value ?? 1;
                  return (
                    <div key={idx} className="db-card p-6 bg-(--db-surface) space-y-5">
                      <div className="flex items-center gap-2 border-b border-(--db-border)/40 pb-4">
                        <span className="text-(--db-primary) opacity-60">{section.icon}</span>
                        <h3 className="nothing-label opacity-100 font-bold">{section.title}</h3>
                      </div>
                      <div className="space-y-4">
                        {section.list.length === 0 ? (
                          <p className="nothing-label text-[9px] opacity-30">No_Data_Recorded</p>
                        ) : (
                          section.list.map((item, i) => (
                            <StatBar key={i} label={item.name} value={item.value} max={max} />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
