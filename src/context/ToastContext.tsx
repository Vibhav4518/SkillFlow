"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  success: (msg: string) => void;
  error: (msg: string) => void;
  warning: (msg: string) => void;
  info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<ToastVariant, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES: Record<ToastVariant, string> = {
  success:
    "bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 border-l-4 border-l-emerald-500 text-gray-900 dark:text-slate-100",
  error:
    "bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 border-l-4 border-l-red-500 text-gray-900 dark:text-slate-100",
  warning:
    "bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 border-l-4 border-l-amber-500 text-gray-900 dark:text-slate-100",
  info:
    "bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 border-l-4 border-l-indigo-500 text-gray-900 dark:text-slate-100",
};

const ICON_STYLES: Record<ToastVariant, string> = {
  success: "text-emerald-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-indigo-500",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = ICONS[toast.variant];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`flex items-start gap-3 min-w-[280px] max-w-[380px] rounded-xl shadow-lg border border-gray-100 px-4 py-3 ${
        STYLES[toast.variant]
      } animate-slide-in`}
    >
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${ICON_STYLES[toast.variant]}`} />
      <p className="text-sm font-medium flex-1 leading-relaxed">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-gray-400 hover:text-gray-600 transition"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message: string, variant: ToastVariant) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, variant }]);
  }, []);

  const ctx: ToastContextValue = {
    success: (msg) => add(msg, "success"),
    error: (msg) => add(msg, "error"),
    warning: (msg) => add(msg, "warning"),
    info: (msg) => add(msg, "info"),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast container - top-right */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>");
  return ctx;
}
