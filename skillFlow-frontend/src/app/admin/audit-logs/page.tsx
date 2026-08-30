"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { adminApi } from "@/services/admin.api";
import { ArrowLeft, ShieldCheck, RefreshCw } from "lucide-react";

function AdminAuditLogsContent() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await adminApi.getAuditLogs({ page, limit: 15, search, entity: entityFilter });
        if (isMounted && res?.success && res?.data) {
          const list = Array.isArray(res.data) ? res.data : res.data.items || res.data.logs || [];
          setLogs(list);
          if (res.data.total || res.meta?.total) setTotal(res.data.total || res.meta.total);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [page, search, entityFilter]);

  return (
    <div className="min-h-screen py-10 bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/dashboard"
              className="text-xs font-semibold inline-flex items-center gap-1 mb-2 text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Platform Audit Logs
            </h1>
            <p className="text-xs mt-0.5 text-slate-400">
              Immutable record of security events, administrative decisions, and access logs
            </p>
          </div>

          <button
            onClick={() => fetchLogs(page)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Logs
          </button>
        </div>

        {/* Filter Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search logs by action, entity ID or actor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchLogs(1)}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Entities</option>
            <option value="User">User</option>
            <option value="Company">Company</option>
            <option value="Job">Job</option>
            <option value="JobApplication">Job Application</option>
          </select>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-purple-500 border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center">
            <ShieldCheck className="h-10 w-10 text-purple-400 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-white">No audit records found</h3>
            <p className="text-xs mt-1 text-slate-400">Administrative actions will be automatically recorded here.</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/80 text-slate-400">
                    <th className="px-6 py-3.5 font-bold uppercase">Timestamp</th>
                    <th className="px-6 py-3.5 font-bold uppercase">Action</th>
                    <th className="px-6 py-3.5 font-bold uppercase">Entity</th>
                    <th className="px-6 py-3.5 font-bold uppercase">Entity ID</th>
                    <th className="px-6 py-3.5 font-bold uppercase">Actor ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 font-mono text-slate-400">
                        {new Date(log.createdAt || log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-purple-300 bg-purple-950/80 border border-purple-800/50 px-2.5 py-1 rounded-md">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        {log.entity || log.targetType || "System"}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400">
                        {log.entityId || log.targetId || "N/A"}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400">
                        {log.actorId || log.userId || "System Daemon"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
