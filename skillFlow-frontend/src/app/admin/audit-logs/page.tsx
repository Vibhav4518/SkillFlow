"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { adminApi } from "@/services/admin.api";
import { ArrowLeft, ShieldCheck, RefreshCw, Search, ChevronLeft, ChevronRight, Info } from "lucide-react";

function getActionBadgeStyle(action: string) {
  const act = (action || "").toUpperCase();
  if (act.includes("DELETE") || act.includes("REJECT") || act.includes("SUSPEND")) {
    return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800";
  }
  if (act.includes("CREATE") || act.includes("REGISTER") || act.includes("POST")) {
    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800";
  }
  if (act.includes("VERIFY") || act.includes("APPROVE") || act.includes("SELECT")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
  }
  if (act.includes("UPDATE") || act.includes("EDIT")) {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
  }
  return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800";
}

function AdminAuditLogsContent() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [selectedMeta, setSelectedMeta] = useState<any | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchLogs = (p?: number) => {
    if (p) setPage(p);
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await adminApi.getAuditLogs({ page, limit: 15, search, entity: entityFilter });
        if (isMounted && res?.success && res?.data) {
          const list = Array.isArray(res.data) ? res.data : res.data.items || res.data.logs || [];
          setLogs(list);
          const totalCount = res.data.total || res.meta?.total || list.length;
          setTotal(totalCount);
          setTotalPages(Math.max(1, Math.ceil(totalCount / 15)));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [page, search, entityFilter, refreshTrigger]);

  const inputStyle = {
    backgroundColor: "var(--color-bg-input)",
    borderColor: "var(--color-border)",
    color: "var(--color-text)",
  };

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/dashboard"
              className="text-xs font-semibold inline-flex items-center gap-1 mb-2 hover:opacity-80 transition"
              style={{ color: "var(--color-text-muted)" }}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
              <ShieldCheck className="h-7 w-7 text-indigo-600 dark:text-indigo-400" /> Platform Audit Logs
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Immutable record of security events, administrative decisions, and data mutations ({total} total logs)
            </p>
          </div>

          <button
            onClick={() => fetchLogs(page)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition hover:opacity-80 shadow-sm shrink-0"
            style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Logs
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail by action, entity ID, or actor..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none shadow-sm"
              style={inputStyle}
            />
          </div>

          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
            className="rounded-xl border px-4 py-2.5 text-xs font-semibold focus:outline-none shadow-sm shrink-0"
            style={inputStyle}
          >
            <option value="">All Entities</option>
            <option value="User">User</option>
            <option value="Company">Company</option>
            <option value="Job">Job</option>
            <option value="JobApplication">Job Application</option>
            <option value="Skill">Skill</option>
          </select>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-3xl border p-12 text-center shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <ShieldCheck className="h-10 w-10 text-indigo-400 mx-auto mb-3" />
            <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>No audit records found</h3>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Administrative and security events will automatically appear here.</p>
          </div>
        ) : (
          <div className="rounded-3xl border overflow-hidden shadow-sm space-y-0" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b font-semibold uppercase" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)", color: "var(--color-text-muted)" }}>
                    <th className="px-6 py-3.5">Timestamp</th>
                    <th className="px-6 py-3.5">Action Event</th>
                    <th className="px-6 py-3.5">Entity</th>
                    <th className="px-6 py-3.5">Entity ID</th>
                    <th className="px-6 py-3.5">Actor ID</th>
                    <th className="px-6 py-3.5 text-right">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                  {logs.map((log) => {
                    const badgeClass = getActionBadgeStyle(log.action);
                    return (
                      <tr key={log.id} className="hover:opacity-90 transition">
                        <td className="px-6 py-4 font-mono" style={{ color: "var(--color-text-muted)" }}>
                          {new Date(log.createdAt || log.timestamp || Date.now()).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase border ${badgeClass}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold" style={{ color: "var(--color-text)" }}>
                          {log.entity || log.targetType || "System"}
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                          {log.entityId || log.targetId || "N/A"}
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                          {log.actorId || log.userId || "System Admin"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {log.metadata && Object.keys(log.metadata).length > 0 ? (
                            <button
                              onClick={() => setSelectedMeta(log.metadata)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold hover:opacity-80 transition"
                              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)", color: "var(--color-primary)" }}
                            >
                              <Info className="h-3 w-3" /> View Data
                            </button>
                          ) : (
                            <span className="text-[11px]" style={{ color: "var(--color-text-subtle)" }}>None</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)" }}>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Page {page} of {totalPages} ({total} logs)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-xl border text-xs font-semibold disabled:opacity-40 transition"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 rounded-xl border text-xs font-semibold disabled:opacity-40 transition"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metadata Modal */}
        {selectedMeta && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-4" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--color-border)" }}>
                <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>Audit Log Payload Metadata</h3>
                <button onClick={() => setSelectedMeta(null)} className="text-xs font-bold px-2 py-1 rounded-lg" style={{ color: "var(--color-text-muted)" }}>
                  ✕
                </button>
              </div>

              <pre className="p-4 rounded-2xl border text-xs font-mono overflow-x-auto max-h-80" style={{ backgroundColor: "var(--color-bg-muted)", borderColor: "var(--color-border)", color: "var(--color-text)" }}>
                {JSON.stringify(selectedMeta, null, 2)}
              </pre>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedMeta(null)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminAuditLogsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminAuditLogsContent />
    </ProtectedRoute>
  );
}
