export type CommitType =
  | "feat"
  | "fix"
  | "refactor"
  | "docs"
  | "test"
  | "chore"
  | "perf"
  | "build"
  | "ci"
  | "style"
  | "revert";

export const COMMIT_TYPES: ReadonlyArray<{ value: CommitType; label: string }> = [
  { value: "feat", label: "feat — new feature" },
  { value: "fix", label: "fix — bug fix" },
  { value: "refactor", label: "refactor — code change that neither fixes a bug nor adds a feature" },
  { value: "perf", label: "perf — performance improvement" },
  { value: "docs", label: "docs — documentation only" },
  { value: "test", label: "test — adding or fixing tests" },
  { value: "build", label: "build — build system or external dependencies" },
  { value: "ci", label: "ci — CI configuration" },
  { value: "style", label: "style — formatting, missing semi-colons, etc." },
  { value: "chore", label: "chore — other changes that don't modify src or test" },
  { value: "revert", label: "revert — reverts a previous commit" },
];

export type ProviderSettings = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export type ParsedCommit = {
  type: CommitType;
  scope?: string;
  subject: string;
  body?: string;
};
