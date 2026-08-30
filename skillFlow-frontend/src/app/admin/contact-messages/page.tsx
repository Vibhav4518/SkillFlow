"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { contactApi } from "@/services/contact.api";
import { MessageSquare, ArrowLeft, Trash2, CheckCircle2 } from "lucide-react";

function AdminContactContent() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await contactApi.getMessages();
      if (res.success && res.data) {
        setMessages(res.data.items || res.data || []);
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

  const handleStatus = async (id: string, status: 'NEW' | 'READ' | 'RESOLVED') => {
    await contactApi.updateStatus(id, status);
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this contact inquiry?")) {
      await contactApi.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen py-10 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-xs font-semibold text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 mb-2 transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Support & Inquiries</h1>
          <p className="text-xs text-slate-400 mt-0.5">Contact messages submitted from the public SkillFlow contact page</p>
        </div>

        {messages.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center text-sm text-slate-400">
            No contact messages received yet.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                      m.status === "RESOLVED" ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/60" :
                      m.status === "READ" ? "bg-blue-950/80 text-blue-300 border-blue-800/60" :
                      "bg-amber-950/80 text-amber-300 border-amber-800/60"
                    }`}>
                      {m.status}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-base text-white">{m.subject}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">From: <span className="font-semibold text-slate-200">{m.name}</span> ({m.email})</p>
                  <p className="text-xs text-slate-300 mt-3 whitespace-pre-line leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                    {m.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={m.status}
                    onChange={(e) => handleStatus(m.id, e.target.value as any)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="NEW">New</option>
                    <option value="READ">Read</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
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
