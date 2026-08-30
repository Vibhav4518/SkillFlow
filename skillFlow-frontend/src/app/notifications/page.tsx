"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { notificationApi } from "@/services/notification.api";
import { useToast } from "@/context/ToastContext";
import { Bell, CheckCheck, Trash2 } from "lucide-react";

function NotificationsContent() {
  const toast = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications();
      if (res?.success && res?.data) setNotifications(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} selected notifications?`)) {
      try {
        await Promise.all(selectedIds.map((id) => notificationApi.deleteNotification(id)));
        toast.success(`Deleted ${selectedIds.length} notifications.`);
        setSelectedIds([]);
        fetchNotifs();
      } catch {
        toast.error("Failed to delete notifications.");
      }
    }
  };

  const handleMarkAllRead = async () => {
    const res = await notificationApi.markAllAsRead();
    if (res?.success !== false) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
    }
  };

  const handleMarkRead = async (id: string) => {
    const res = await notificationApi.markAsRead(id);
    if (res?.success !== false) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n)));
    }
  };

  const handleDelete = async (id: string) => {
    const res = await notificationApi.deleteNotification(id);
    if (res?.success !== false) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.info("Notification removed.");
    }
  };

  const unreadCount = notifications.filter((n) => !(n.isRead ?? n.read)).length;

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>Notifications History</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All notifications retained in history"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition"
              style={{ backgroundColor: "rgba(99,102,241,0.1)", color: "var(--color-primary)" }}
            >
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          )}
        </div>

        {/* Multi-Select Toolbar */}
        {notifications.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: "var(--color-text)" }}>
              <input
                type="checkbox"
                checked={selectedIds.length === notifications.length && notifications.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Select All ({selectedIds.length} / {notifications.length} selected)</span>
            </label>

            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition shadow-sm"
              >
                <Trash2 className="h-4 w-4" /> Delete Selected ({selectedIds.length})
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border p-5 animate-pulse" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                <div className="h-4 w-48 rounded" style={{ backgroundColor: "var(--color-bg-muted)" }} />
                <div className="h-3 w-64 rounded mt-2" style={{ backgroundColor: "var(--color-bg-muted)" }} />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border p-12 text-center" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <Bell className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-text-subtle)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>You&apos;re all caught up!</p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>No notifications in history.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const isUnread = !(n.isRead ?? n.read);
              const isSelected = selectedIds.includes(n.id);

              return (
                <div
                  key={n.id}
                  className={`flex items-start justify-between rounded-2xl border p-5 shadow-sm transition ${
                    isSelected ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20" : ""
                  }`}
                  style={{
                    backgroundColor: isSelected ? undefined : isUnread ? "rgba(99,102,241,0.04)" : "var(--color-bg-card)",
                    borderColor: isSelected ? undefined : isUnread ? "rgba(99,102,241,0.2)" : "var(--color-border)",
                  }}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(n.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      {isUnread && (
                        <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mb-2" />
                      )}
                      <h3 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>{n.title}</h3>
                      <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{n.message}</p>
                      <span className="text-[10px] mt-2 block" style={{ color: "var(--color-text-subtle)" }}>
                        {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {isUnread && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="rounded-lg border px-2.5 py-1 text-xs font-medium transition"
                        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)", color: "var(--color-primary)" }}
                      >
                        Mark read
                      </button>
                    )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 rounded-lg transition text-red-400 hover:text-red-600"
                    aria-label="Delete notification"
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

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}
