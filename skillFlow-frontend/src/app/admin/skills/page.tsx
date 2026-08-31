"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { adminApi } from "@/services/admin.api";
import { useToast } from "@/context/ToastContext";
import { Code2, ArrowLeft, Plus, Edit2, Trash2, Search, X } from "lucide-react";

function AdminSkillsContent() {
  const toast = useToast();
  const [skills, setSkills] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
        setSelectedIds([]);
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

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === skills.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(skills.map((s) => s.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected skills?`)) {
      try {
        await Promise.all(selectedIds.map((id) => adminApi.deleteSkill(id)));
        toast.success(`${selectedIds.length} skills deleted successfully.`);
        setSkills((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
        setSelectedIds([]);
      } catch {
        toast.error("Failed to delete selected skills.");
      }
    }
  };

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
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Add New Skill
          </button>
        </div>

        {/* Search & Bulk Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search skills by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={inputStyle}
            />
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-red-600/10 border border-red-500/30 text-red-500 text-xs font-bold hover:bg-red-600 hover:text-white transition"
            >
              <Trash2 className="h-4 w-4" /> Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>

        {/* Table View */}
        <div className="rounded-3xl border overflow-hidden shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading skills directory...</div>
          ) : skills.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No skills found. Click "Add New Skill" to create one.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b uppercase text-[10px] tracking-wider text-slate-400" style={{ borderColor: "var(--color-border)" }}>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === skills.length && skills.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-slate-700"
                      />
                    </th>
                    <th className="p-4 font-bold">Skill Name</th>
                    <th className="p-4 font-bold">ID</th>
                    <th className="p-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                  {skills.map((skill) => (
                    <tr key={skill.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(skill.id)}
                          onChange={() => handleToggleSelect(skill.id)}
                          className="rounded border-slate-700"
                        />
                      </td>
                      <td className="p-4 font-bold text-slate-200">{skill.name}</td>
                      <td className="p-4 font-mono text-[10px] text-slate-500">{skill.id}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSkill(skill);
                            setEditSkillName(skill.name);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
                          title="Edit Skill"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(skill.id, skill.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                          title="Delete Skill"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Code2 className="h-5 w-5 text-indigo-500" /> Add New Skill
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSkill} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PyTorch, GraphQL, Kubernetes"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-500 shadow-md"
                >
                  {submittingAdd ? "Saving..." : "Create Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Skill Modal */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white">Edit Skill</h2>
              <button onClick={() => setEditingSkill(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSkill} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={editSkillName}
                  onChange={(e) => setEditSkillName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSkill(null)}
                  className="rounded-xl border border-slate-700 px-4 py-2 font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-500 shadow-md"
                >
                  {submittingEdit ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
