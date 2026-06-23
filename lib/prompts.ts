import { COMMIT_TYPES, CommitType, ParsedCommit } from "./types";

export const SYSTEM_PROMPT = `You are an expert at writing Conventional Commit messages from git diffs.

Rules:
- Output ONLY the commit message. No commentary, no code fences, no explanation, no labels like "Here is the message:".
- First line: <type>(<scope>?): <subject>
  - type is one of: ${COMMIT_TYPES.map((t) => t.value).join(", ")}
  - scope is optional; lowercase, short noun in parentheses (e.g. api, ui, auth). Omit parentheses if unsure.
  - subject is imperative mood, present tense, lowercase first letter, no trailing period, MAX 72 characters total for the first line.
- After a blank line, a short body (optional). Wrap body lines at ~72 characters. Explain the WHAT and WHY, not the HOW. Use bullet points (- ) if listing multiple changes.
- If the diff is ambiguous, pick the most likely type and subject. Do not ask questions.
- If the diff is empty or contains no changes, output: chore: no changes`;

export function buildUserPrompt(diff: string): string {
  const trimmed = diff.trim();
  return `Generate a Conventional Commit message for the following git diff:\n\n${trimmed}`;
}

export function stripCodeFences(text: string): string {
  let out = text.trim();
  const fenceMatch = out.match(/^```(?:[a-zA-Z]*)?\n([\s\S]*?)\n```\s*$/);
  if (fenceMatch) out = fenceMatch[1].trim();
  if (out.startsWith("```")) {
    out = out.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
  }
  return out;
}

const TYPE_SET = new Set<string>(COMMIT_TYPES.map((t) => t.value));

export function parseCommit(message: string): ParsedCommit {
  const cleaned = stripCodeFences(message);
  const lines = cleaned.split(/\r?\n/);
  const header = lines[0] ?? "";
  const rest = lines.slice(1).join("\n").trim();

  const match = header.match(/^([a-zA-Z]+)(?:\(([^)]+)\))?:\s*(.+)$/);
  if (!match) {
    return { type: "chore", subject: cleaned };
  }
  const rawType = match[1].toLowerCase();
  const type: CommitType = (TYPE_SET.has(rawType) ? rawType : "chore") as CommitType;
  const scope = match[2]?.trim() || undefined;
  const subject = match[3].trim();
  const body = rest.length > 0 ? rest : undefined;
  return { type, scope, subject, body };
}

export function formatCommit(parsed: ParsedCommit): string {
  const header = parsed.scope
    ? `${parsed.type}(${parsed.scope}): ${parsed.subject}`
    : `${parsed.type}: ${parsed.subject}`;
  if (!parsed.body) return header;
  return `${header}\n\n${parsed.body}`;
}
