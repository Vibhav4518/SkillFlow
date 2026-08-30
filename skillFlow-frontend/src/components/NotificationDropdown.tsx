"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { notificationApi } from "@/services/notification.api";
import { Bell, CheckCheck } from "lucide-react";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications();
      if (res?.success && res?.data) {
        setNotifications(res.data);
      }
    } catch {
      // Silently fail for notification polling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const unreadCount = unreadNotifications.length;

  const handleMarkAllRead = async () => {
    await notificationApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkSingle = async (id: string) => {
    await notificationApi.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800 dark:hover:bg-slate-800 transition focus:outline-none"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white shadow">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border p-4 shadow-xl z-50"
          style={{
            backgroundColor: "var(--color-bg-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <div
            className="flex items-center justify-between border-b pb-3 mb-2"
            style={{ borderColor: "var(--color-border)" }}
          >
            <h3 className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
              Notifications ({unreadCount})
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1">
            {unreadNotifications.length === 0 ? (
              <div className="py-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                No unread notifications
              </div>
            ) : (
              unreadNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkSingle(notif.id)}
                  className="p-3 text-sm rounded-xl cursor-pointer transition hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40"
                  style={{
                    backgroundColor: "rgba(99,102,241,0.05)",
                  }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600 mr-1.5 align-middle" />
                  <p className="font-semibold inline" style={{ color: "var(--color-text)" }}>{notif.title}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{notif.message}</p>
                  <span className="text-[10px] mt-1.5 block" style={{ color: "var(--color-text-subtle)" }}>
                    {new Date(notif.createdAt).toLocaleDateString()} at{" "}
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>

          <div
            className="border-t pt-2 text-center mt-2"
            style={{ borderColor: "var(--color-border)" }}
          >
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium transition"
              style={{ color: "var(--color-text-muted)" }}
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
