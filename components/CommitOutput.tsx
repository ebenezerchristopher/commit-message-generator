"use client";

import { useState } from "react";
import { formatCommit, parseCommit } from "@/lib/prompts";
import { ParsedCommit } from "@/lib/types";

type Props = {
  raw: string | null;
  loading: boolean;
  error: string | null;
};

const TYPE_STYLES: Record<string, string> = {
  feat: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  fix: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  refactor: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  perf: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  docs: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  test: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  build: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  ci: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
  style: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300",
  chore: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  revert: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

function HeaderLine({ parsed }: { parsed: ParsedCommit }) {
  const tagStyle = TYPE_STYLES[parsed.type] ?? TYPE_STYLES.chore;
  return (
    <div className="flex flex-wrap items-baseline gap-2 font-mono text-sm leading-relaxed sm:text-base">
      <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${tagStyle}`}>
        {parsed.type}
      </span>
      {parsed.scope && (
        <span className="rounded-md bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {parsed.scope}
        </span>
      )}
      <span className="text-zinc-900 dark:text-zinc-100">{parsed.subject}</span>
    </div>
  );
}

export default function CommitOutput({ raw, loading, error }: Props) {
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="3"
            />
            <path
              d="M22 12a10 10 0 0 1-10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          Generating commit message…
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        role="alert"
        className="rounded-xl border border-rose-300 bg-rose-50 p-4 shadow-sm dark:border-rose-900 dark:bg-rose-950/50"
      >
        <div className="text-sm font-semibold text-rose-800 dark:text-rose-300">
          Generation failed
        </div>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-xs text-rose-700 dark:text-rose-300">
          {error}
        </pre>
      </section>
    );
  }

  if (!raw) return null;

  const parsed = parseCommit(raw);
  const full = formatCommit(parsed);
  const firstLineLen = `${parsed.type}${parsed.scope ? `(${parsed.scope})` : ""}: ${parsed.subject}`.length;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
    }
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Suggested commit
          {firstLineLen > 72 && (
            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              header {firstLineLen} chars (&gt; 72)
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 10l4 4 8-8" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="6" y="6" width="10" height="11" rx="2" />
                <path d="M4 13V5a2 2 0 0 1 2-2h8" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <div className="space-y-3 px-4 py-4">
        <HeaderLine parsed={parsed} />
        {parsed.body && (
          <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {parsed.body}
          </pre>
        )}
      </div>
    </section>
  );
}
