"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { adminApi } from "@/services/admin.api";
import { useToast } from "@/context/ToastContext";
import { Code2, ArrowLeft, Plus, Edit2, Trash2, Search, X, Sparkles } from "lucide-react";

function AdminSkillsContent() {
  const toast = useToast();
  const [skills, setSkills] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [submittingAdd, setSubmittingAdd] = useState(false);

  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [editSkillName, setEditSkillName] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSkills({ search });
      if (res?.success && res?.data) {
        setSkills(res.data.items || res.data.skills || (Array.isArray(res.data) ? res.data : []));
      } else {
        setSkills([]);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load skills list.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkillName.trim();
    if (!trimmed) {
      toast.error("Skill name is required.");
      return;
    }
    try {
      setSubmittingAdd(true);
      const res = await adminApi.createSkill(trimmed);
      if (res?.success) {
        toast.success(`Skill "${trimmed}" created successfully!`);
        setNewSkillName("");
        setShowAddModal(false);
        fetchSkills();
      } else {
        toast.error(res?.message || "Failed to create skill.");
      }
    } catch {
      toast.error("Error creating skill.");
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleUpdateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;
    const trimmed = editSkillName.trim();
    if (!trimmed) {
      toast.error("Skill name cannot be empty.");
      return;
    }
    try {
      setSubmittingEdit(true);
      const res = await adminApi.updateSkill(editingSkill.id, trimmed);
      if (res?.success) {
        toast.success("Skill updated successfully!");
        setEditingSkill(null);
        fetchSkills();
      } else {
        toast.error(res?.message || "Failed to update skill.");
      }
    } catch {
      toast.error("Error updating skill.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteSkill = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete skill "${name}"?`)) {
      try {
        const res = await adminApi.deleteSkill(id);
        if (res?.success) {
          toast.success(`Skill "${name}" deleted.`);
          setSkills((prev) => prev.filter((s) => s.id !== id));
        } else {
          toast.error(res?.message || "Failed to delete skill.");
        }
      } catch {
        toast.error("Error deleting skill.");
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/dashboard"
              className="text-xs font-semibold inline-flex items-center gap-1 mb-2 hover:opacity-80"
              style={{ color: "var(--color-text-muted)" }}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
              <Code2 className="h-7 w-7 text-indigo-600 dark:text-indigo-400" /> Skills Directory Management
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Manage global skills catalog used by candidates and job postings
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-indigo-500 transition"
          >
            <Plus className="h-4 w-4" /> Add New Skill
          </button>
        </div>

        {/* Search & Filter */}
        <div className="rounded-3xl border p-4 sm:p-6 shadow-sm space-y-4" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--color-text-muted)" }} />
            <input
              type="text"
              placeholder="Search skills by name (e.g., React, TypeScript, Python)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Skills Table */}
        <div className="rounded-3xl border shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          {loading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ backgroundColor: "var(--color-bg-muted)" }} />
              ))}
            </div>
          ) : skills.length === 0 ? (
            <div className="p-12 text-center">
              <Sparkles className="h-10 w-10 mx-auto mb-3 text-indigo-400" />
              <h3 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>No skills found</h3>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                {search ? "Try adjusting your search criteria" : "Click 'Add New Skill' to add skills to the database"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b uppercase font-bold text-[11px]" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)", backgroundColor: "var(--color-bg-muted)" }}>
                  <tr>
                    <th className="px-6 py-4">Skill Name</th>
                    <th className="px-6 py-4">Candidates Using</th>
                    <th className="px-6 py-4">Jobs Tagged</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                  {skills.map((skill) => (
                    <tr key={skill.id} className="hover:bg-slate-500/5 transition">
                      <td className="px-6 py-4 font-bold text-sm" style={{ color: "var(--color-text)" }}>
                        {skill.name}
                      </td>
                      <td className="px-6 py-4 font-medium" style={{ color: "var(--color-text-muted)" }}>
                        {skill._count?.candidateSkills ?? 0} candidates
                      </td>
                      <td className="px-6 py-4 font-medium" style={{ color: "var(--color-text-muted)" }}>
                        {skill._count?.jobSkills ?? 0} jobs
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingSkill(skill);
                            setEditSkillName(skill.name);
                          }}
                          className="p-1.5 rounded-lg border border-slate-700 hover:bg-indigo-600 hover:text-white transition"
                          title="Edit Skill"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(skill.id, skill.name)}
                          className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white transition"
                          title="Delete Skill"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Skill Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-5 text-slate-100 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="h-4 w-4 text-indigo-400" /> Create New Skill Tag
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSkill} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Skill Name</label>
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. Next.js, GraphQL, Kubernetes"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAdd}
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition disabled:opacity-50"
                  >
                    {submittingAdd ? "Creating..." : "Save Skill"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Skill Modal */}
        {editingSkill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-5 text-slate-100 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-indigo-400" /> Edit Skill Name
                </h3>
                <button onClick={() => setEditingSkill(null)} className="text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateSkill} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Skill Name</label>
                  <input
                    type="text"
                    value={editSkillName}
                    onChange={(e) => setEditSkillName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingSkill(null)}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEdit}
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition disabled:opacity-50"
                  >
                    {submittingEdit ? "Updating..." : "Update Skill"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AdminSkillsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminSkillsContent />
    </ProtectedRoute>
  );
}
