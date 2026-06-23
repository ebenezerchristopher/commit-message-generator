"use client";

import { useState } from "react";
import { ProviderSettings } from "@/lib/types";

type Props = {
  value: ProviderSettings;
  onChange: (next: ProviderSettings) => void;
};

const DEFAULTS: ProviderSettings = {
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
};

const STORAGE_KEY = "cmg.settings.v1";

export function loadSettings(): ProviderSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<ProviderSettings>;
    return {
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
      baseUrl:
        typeof parsed.baseUrl === "string" && parsed.baseUrl.length > 0
          ? parsed.baseUrl
          : DEFAULTS.baseUrl,
      model:
        typeof parsed.model === "string" && parsed.model.length > 0
          ? parsed.model
          : DEFAULTS.model,
    };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(settings: ProviderSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
  }
}

export default function SettingsPanel({ value, onChange }: Props) {
  const [open, setOpen] = useState<boolean>(() => !value.apiKey);
  const [reveal, setReveal] = useState(false);

  const update = <K extends keyof ProviderSettings>(key: K, v: ProviderSettings[K]) => {
    onChange({ ...value, [key]: v });
  };

  const filled = Boolean(value.apiKey && value.baseUrl && value.model);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="3" />
            <path d="M10 1.6v2.4M10 16v2.4M1.6 10h2.4M16 10h2.4M4.3 4.3l1.7 1.7M14 14l1.7 1.7M4.3 15.7l1.7-1.7M14 6l1.7-1.7" />
          </svg>
          Settings
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              filled
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            }`}
          >
            {filled ? "Configured" : "Needs key"}
          </span>
        </span>
        <svg
          className={`h-4 w-4 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>

      {open && (
        <div className="grid gap-4 border-t border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              API key
            </span>
            <div className="flex gap-2">
              <input
                type={reveal ? "text" : "password"}
                value={value.apiKey}
                onChange={(e) => update("apiKey", e.target.value)}
                placeholder="sk-..."
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:ring-zinc-800"
              />
              <button
                type="button"
                onClick={() => setReveal((r) => !r)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                aria-label={reveal ? "Hide API key" : "Show API key"}
              >
                {reveal ? "Hide" : "Show"}
              </button>
            </div>
            <span className="mt-1 block text-xs text-zinc-500">
              Stored only in your browser&apos;s localStorage. Never sent to our servers.
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Base URL
            </span>
            <input
              type="url"
              value={value.baseUrl}
              onChange={(e) => update("baseUrl", e.target.value)}
              placeholder="https://api.openai.com/v1"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:ring-zinc-800"
            />
            <span className="mt-1 block text-xs text-zinc-500">
              OpenAI-compatible. Try OpenRouter, Groq, Together, or a local URL.
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Model
            </span>
            <input
              type="text"
              value={value.model}
              onChange={(e) => update("model", e.target.value)}
              placeholder="gpt-4o-mini"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:ring-zinc-800"
            />
            <span className="mt-1 block text-xs text-zinc-500">
              e.g. gpt-4o-mini, claude-3-5-haiku, llama-3.1-70b
            </span>
          </label>
        </div>
      )}
    </section>
  );
}
