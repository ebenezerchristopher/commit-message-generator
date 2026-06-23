"use client";

import { useEffect, useRef, useState } from "react";
import CommitOutput from "./CommitOutput";
import SettingsPanel, { loadSettings, saveSettings } from "./SettingsPanel";
import { generateCommitMessage, ApiError } from "@/lib/openai";
import { ProviderSettings } from "@/lib/types";

const SAMPLE_DIFF = `diff --git a/src/auth.ts b/src/auth.ts
index 1234567..89abcdef 100644
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -1,5 +1,12 @@
+import bcrypt from "bcrypt";
+
 export async function login(email: string, password: string) {
-  const user = await db.users.findOne({ email });
-  return user;
+  const user = await db.users.findOne({ email });
+  if (!user) throw new Error("Invalid credentials");
+  const ok = await bcrypt.compare(password, user.passwordHash);
+  if (!ok) throw new Error("Invalid credentials");
+  return signJwt({ sub: user.id });
 }`;

export default function CommitGenerator() {
  const [settings, setSettings] = useState<ProviderSettings>(() => loadSettings());
  const [diff, setDiff] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const onGenerate = async () => {
    if (loading) return;
    if (!settings.apiKey) {
      setError("Add an API key in Settings first.");
      return;
    }
    if (!diff.trim()) {
      setError("Paste a git diff first.");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    abortRef.current = new AbortController();
    try {
      const text = await generateCommitMessage(settings, diff, abortRef.current.signal);
      setResult(text);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (err instanceof ApiError) {
        setError(`${err.status > 0 ? `HTTP ${err.status}: ` : ""}${err.message}`);
      } else {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const onCancel = () => {
    abortRef.current?.abort();
  };

  const onClear = () => {
    setDiff("");
    setResult(null);
    setError(null);
  };

  const useSample = () => setDiff(SAMPLE_DIFF);

  const charCount = diff.length;
  const canSubmit = Boolean(settings.apiKey) && diff.trim().length > 0 && !loading;

  return (
    <div className="flex w-full flex-col gap-4">
      <SettingsPanel value={settings} onChange={setSettings} />

      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Git diff
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={useSample}
              className="rounded-md border border-zinc-300 px-2 py-1 font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Use sample
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={!diff && !result && !error}
              className="rounded-md border border-zinc-300 px-2 py-1 font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="px-4 py-3">
          <textarea
            value={diff}
            onChange={(e) => setDiff(e.target.value)}
            placeholder="Paste a git diff here, e.g. the output of:&#10;  git diff&#10;  git diff --staged&#10;  git diff main..feature"
            spellCheck={false}
            rows={14}
            className="block w-full resize-y rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:bg-zinc-950 dark:focus:ring-zinc-800"
            aria-label="Git diff input"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
            <span>{charCount.toLocaleString()} chars</span>
            <span>Tip: include file paths for better scopes.</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          {loading ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          ) : null}
          <button
            type="button"
            onClick={onGenerate}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? (
              <>
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
                    strokeOpacity="0.3"
                    strokeWidth="3"
                  />
                  <path
                    d="M22 12a10 10 0 0 1-10 10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                Generating…
              </>
            ) : (
              "Generate commit message"
            )}
          </button>
        </div>
      </section>

      <CommitOutput raw={result} loading={loading} error={error} />
    </div>
  );
}
