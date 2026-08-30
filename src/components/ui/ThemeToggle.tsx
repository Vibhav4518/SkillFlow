"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, Theme } from "@/context/ThemeContext";

const options: { value: Theme; label: string; Icon: React.ElementType }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  if (compact) {
    const current = options.find((o) => o.value === theme)!;
    const Icon = current.Icon;
    const next = options[(options.indexOf(current) + 1) % options.length];
    return (
      <button
        onClick={() => setTheme(next.value)}
        className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] transition"
        aria-label={`Switch to ${next.label} mode`}
        title={`Switch to ${next.label} mode`}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-bg-muted)] border border-[var(--color-border)]">
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            theme === value
              ? "bg-[var(--color-bg-card)] text-[var(--color-primary)] shadow-sm"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
          aria-label={`${label} mode`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
