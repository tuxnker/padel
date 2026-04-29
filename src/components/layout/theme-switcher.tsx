"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const THEMES = [
  { id: "padel-connect", label: "Padel Connect", swatch: "#006941" },
  { id: "om-player", label: "OM Player", swatch: "#00e6b2" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

const STORAGE_KEY = "om-player:theme";
const DEFAULT_THEME: ThemeId = "padel-connect";

function applyTheme(theme: ThemeId) {
  const root = document.documentElement;
  if (theme === DEFAULT_THEME) {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (stored && THEMES.some((t) => t.id === stored)) {
      // Reading persisted theme from localStorage on mount; SSR can't see
      // localStorage so the initial render uses DEFAULT_THEME.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(stored);
    }
  }, []);

  const handleSelect = (next: ThemeId) => {
    setTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    setOpen(false);
  };

  const active = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="rounded-2xl bg-surface-container-lowest p-2 shadow-lg ambient-shadow flex flex-col gap-1 min-w-[180px]">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelect(t.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition",
                t.id === theme
                  ? "bg-primary text-on-primary"
                  : "text-on-surface hover:bg-surface-container",
              )}
            >
              <span
                aria-hidden="true"
                className="h-4 w-4 rounded-full border border-outline-variant"
                style={{ background: t.swatch }}
              />
              <span className="flex-1">{t.label}</span>
              {t.id === theme && (
                <span className="material-symbols-outlined text-base">
                  check
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Switch color scheme"
        className="flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 text-sm font-headline font-bold shadow-lg ambient-shadow text-on-surface"
      >
        <span
          aria-hidden="true"
          className="h-4 w-4 rounded-full border border-outline-variant"
          style={{ background: active.swatch }}
        />
        {active.label}
        <span className="material-symbols-outlined text-base">
          {open ? "expand_more" : "palette"}
        </span>
      </button>
    </div>
  );
}
