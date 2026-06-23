# AI Commit Message Generator

Paste a git diff. Get a clean Conventional Commit message back from AI.

- Textarea for a git diff
- Calls any **OpenAI-compatible** chat-completions endpoint (OpenAI, OpenRouter, Groq, Together, Ollama, etc.)
- Returns a Conventional Commit message (`type(scope?): subject` + optional body)
- One-click copy, header-length warning, loading + error states
- Responsive, dark-mode aware, deploys to Vercel with zero env vars

### How it works

The browser POSTs `{ settings, diff }` to `/api/commit`, a serverless function on Vercel. That function calls `${baseUrl}/chat/completions` on the user's behalf (no CORS, works with any provider), then returns the model's reply. The API key travels browser → Vercel function → provider, is held in memory only for the duration of the single request, and is never stored or logged.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Open the **Settings** panel, paste your API key, base URL, and model name. They are stored only in your browser's `localStorage` and are never sent to a server.

Defaults: base URL `https://api.openai.com/v1`, model `gpt-4o-mini`.

## Deploy to Vercel

The app is purely client-side. **No environment variables are required.**

### Option A — via the Vercel dashboard (easiest)

1. Push the repo to GitHub.
2. Go to <https://vercel.com/new>, click **Import Git Repository**, select this repo.
3. Leave all settings at defaults. Click **Deploy**.
4. Vercel builds with `npm run build` and gives you a `https://<project>.vercel.app` URL.

### Option B — via the Vercel CLI

```bash
npm i -g vercel   # if you don't have it
vercel login
vercel            # first run: accept the defaults, it will deploy a preview URL
vercel --prod     # promote to production
```

## Project layout

```
app/
  layout.tsx          - root layout, metadata, fonts
  page.tsx            - main page (server component)
  globals.css         - tailwind v4 + base styles
components/
  CommitGenerator.tsx - client component: state, request lifecycle
  SettingsPanel.tsx   - API key + base URL + model, persisted to localStorage
  CommitOutput.tsx    - parsed commit render + copy-to-clipboard
lib/
  types.ts            - shared types
  prompts.ts          - system prompt + parse/format helpers
  openai.ts           - OpenAI-compatible fetch helper
```

## How it works

The browser `POST`s directly to `<baseUrl>/chat/completions` with the user's `Authorization: Bearer <key>`. The response is parsed into a conventional commit header (type / scope / subject) and optional body, then displayed with a one-click copy. The model is asked for plain text only — any code-fenced reply is stripped before display.
