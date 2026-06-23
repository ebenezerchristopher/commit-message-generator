import CommitGenerator from "@/components/CommitGenerator";

export default function Home() {
  return (
    <div className="flex w-full flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-base font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
              ⎇
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              AI Commit Message Generator
            </h1>
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Paste a git diff. Get a clean Conventional Commit message back.
            Bring your own OpenAI-compatible API key — it stays in your browser.
          </p>
        </header>
        <CommitGenerator />
        <footer className="mt-auto pt-6 text-center text-xs text-zinc-500">
          Open source. Your key, your diff, your call.
        </footer>
      </main>
    </div>
  );
}
