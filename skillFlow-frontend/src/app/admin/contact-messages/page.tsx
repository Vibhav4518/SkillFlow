"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { contactApi } from "@/services/contact.api";
import { useToast } from "@/context/ToastContext";
import { MessageSquare, ArrowLeft, Trash2, Search, Mail, User, CheckCircle2, Clock, Filter } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  READ: "Read",
  RESOLVED: "Resolved",
};

const STATUS_BADGE: Record<string, string> = {
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  READ: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  NEW: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
};

function AdminContactContent() {
  const toast = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await contactApi.getMessages({ limit: 100 });
      if (res.success && res.data) {
        setMessages(Array.isArray(res.data) ? res.data : res.data.items || []);
        setSelectedIds([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (statusFilter !== "ALL" && m.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (m.name || "").toLowerCase();
        const email = (m.email || "").toLowerCase();
        const subject = (m.subject || "").toLowerCase();
        const msg = (m.message || "").toLowerCase();
        return name.includes(q) || email.includes(q) || subject.includes(q) || msg.includes(q);
      }
      return true;
    });
  }, [messages, statusFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: messages.length, NEW: 0, READ: 0, RESOLVED: 0 };
    messages.forEach((m) => {
      if (m.status) counts[m.status] = (counts[m.status] || 0) + 1;
    });
    return counts;
  }, [messages]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredMessages.length && filteredMessages.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMessages.map((m) => m.id));
    }
  };

  const handleStatus = async (id: string, status: 'NEW' | 'READ' | 'RESOLVED', senderName: string) => {
    const res = await contactApi.updateStatus(id, status);
    if (res?.success !== false) {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      toast.success(`Inquiry from ${senderName} marked as ${status}.`);
    } else {
      toast.error("Failed to update inquiry status.");
    }
  };

  const handleBulkStatusChange = async (status: 'NEW' | 'READ' | 'RESOLVED') => {
    if (selectedIds.length === 0) return;
    if (confirm(`Update status of ${selectedIds.length} inquiries to ${status}?`)) {
      try {
        await Promise.all(selectedIds.map((id) => contactApi.updateStatus(id, status)));
        toast.success(`Updated ${selectedIds.length} inquiries to ${status}.`);
        setMessages((prev) =>
          prev.map((m) => (selectedIds.includes(m.id) ? { ...m, status } : m))
        );
        setSelectedIds([]);
      } catch {
        toast.error("Failed to update inquiry statuses.");
      }
    }
  };

  const handleDelete = async (id: string, senderName: string) => {
    if (confirm(`Delete inquiry from "${senderName}"?`)) {
      const res = await contactApi.deleteMessage(id);
      if (res?.success !== false) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        toast.success(`Deleted inquiry from ${senderName}.`);
      } else {
        toast.error("Failed to delete inquiry.");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected inquiries?`)) {
      try {
        await Promise.all(selectedIds.map((id) => contactApi.deleteMessage(id)));
        toast.success(`Deleted ${selectedIds.length} inquiries.`);
        setMessages((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
        setSelectedIds([]);
      } catch {
        toast.error("Failed to delete selected inquiries.");
      }
    }
  };

  const inputStyle = {
    backgroundColor: "var(--color-bg-input)",
    borderColor: "var(--color-border)",
    color: "var(--color-text)",
  };

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/admin/dashboard"
            className="text-xs font-semibold inline-flex items-center gap-1 mb-2 hover:opacity-80 transition"
            style={{ color: "var(--color-text-muted)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
            <MessageSquare className="h-7 w-7 text-indigo-600 dark:text-indigo-400" /> Support &amp; Inquiries Management
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            Review, process, and resolve user inquiries submitted via the SkillFlow contact portal
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b pb-4 overflow-x-auto" style={{ borderColor: "var(--color-border)" }}>
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              statusFilter === "ALL" ? "bg-indigo-600 text-white shadow-sm" : "border hover:opacity-80"
            }`}
            style={statusFilter !== "ALL" ? { borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)", color: "var(--color-text-muted)" } : {}}
          >
            <span>All Inquiries</span>
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-extrabold">{statusCounts.ALL || 0}</span>
          </button>

          {Object.entries(STATUS_LABELS).map(([key, label]) => {
            const isActive = statusFilter === key;
            const count = statusCounts[key] || 0;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  isActive ? "bg-indigo-600 text-white shadow-sm" : "border hover:opacity-80"
                }`}
                style={!isActive ? { borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)", color: "var(--color-text-muted)" } : {}}
              >
                <span>{label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${isActive ? "bg-black/20 text-white" : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Multi-Select Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by sender name, email, subject, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none shadow-sm"
              style={inputStyle}
            />
          </div>

          {filteredMessages.length > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-2 shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: "var(--color-text)" }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredMessages.length && filteredMessages.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Select All ({selectedIds.length} / {filteredMessages.length})</span>
              </label>

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => e.target.value && handleBulkStatusChange(e.target.value as any)}
                    defaultValue=""
                    className="rounded-xl border px-3 py-1.5 text-xs font-semibold focus:outline-none"
                    style={inputStyle}
                  >
                    <option value="" disabled>Bulk Status...</option>
                    {Object.entries(STATUS_LABELS).map(([val, lbl]) => (
                      <option key={val} value={val}>{lbl}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" /> Delete ({selectedIds.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Cards List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl border p-6 animate-pulse" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                <div className="h-5 w-48 rounded" style={{ backgroundColor: "var(--color-bg-muted)" }} />
                <div className="h-3 w-72 rounded mt-3" style={{ backgroundColor: "var(--color-bg-muted)" }} />
              </div>
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="rounded-3xl border p-12 text-center shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <MessageSquare className="h-10 w-10 mx-auto mb-3 text-slate-400" />
            <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>
              {searchQuery || statusFilter !== "ALL" ? "No support inquiries match your filter criteria" : "No contact inquiries received yet"}
            </h3>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
              User messages submitted from the contact portal will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((m) => {
              const isSelected = selectedIds.includes(m.id);
              const senderName = m.name || "User";

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    if (m.status === "NEW") {
                      handleStatus(m.id, "READ", senderName);
                    }
                  }}
                  className={`rounded-3xl border p-6 sm:p-7 shadow-sm flex flex-col lg:flex-row lg:items-start justify-between gap-6 transition cursor-pointer ${
                    isSelected ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20" : ""
                  }`}
                  style={{ backgroundColor: isSelected ? undefined : "var(--color-bg-card)", borderColor: isSelected ? undefined : "var(--color-border)" }}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(m.id)}
                      className="mt-1.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-0.5 text-xs font-bold border ${STATUS_BADGE[m.status] || STATUS_BADGE.NEW}`}>
                          {STATUS_LABELS[m.status] || m.status}
                        </span>
                        <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
                          Received {new Date(m.createdAt || Date.now()).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold" style={{ color: "var(--color-text)" }}>{m.subject}</h3>
                        <p className="text-xs font-semibold mt-0.5 flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
                          <User className="h-3.5 w-3.5 text-indigo-500" /> {senderName}
                          <span className="text-slate-400">•</span>
                          <Mail className="h-3.5 w-3.5 text-blue-500" /> {m.email}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl border text-xs leading-relaxed whitespace-pre-line" style={{ backgroundColor: "var(--color-bg-muted)", borderColor: "var(--color-border)", color: "var(--color-text)" }}>
                        {m.message}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div>
                      <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>Status</label>
                      <select
                        value={m.status}
                        onChange={(e) => handleStatus(m.id, e.target.value as any, senderName)}
                        className="rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none min-w-[130px]"
                        style={inputStyle}
                      >
                        <option value="NEW">New</option>
                        <option value="READ">Read</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleDelete(m.id, senderName)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition mt-5"
                      title="Delete inquiry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminContactPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminContactContent />
    </ProtectedRoute>
  );
}
