import { ProviderSettings } from "./types";
import { SYSTEM_PROMPT, buildUserPrompt, stripCodeFences } from "./prompts";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function authHeaders(settings: ProviderSettings): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${settings.apiKey}`,
  };
}

async function readError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    const message =
      data?.error?.message ||
      data?.message ||
      (typeof data === "string" ? data : null);
    if (message) return message;
  } catch {
  }
  try {
    return await response.text();
  } catch {
    return response.statusText;
  }
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function generateCommitMessage(
  settings: ProviderSettings,
  diff: string,
  signal?: AbortSignal,
): Promise<string> {
  if (!settings.apiKey) throw new ApiError("Missing API key", 401);
  if (!settings.model) throw new ApiError("Missing model name", 400);
  if (!settings.baseUrl) throw new ApiError("Missing base URL", 400);

  const url = `${normalizeBaseUrl(settings.baseUrl)}/chat/completions`;
  const body = {
    model: settings.model,
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(diff) },
    ] satisfies ChatMessage[],
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: authHeaders(settings),
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    const msg = err instanceof Error ? err.message : "Network request failed";
    throw new ApiError(
      `Could not reach ${url}. ${msg}. Check the base URL and CORS settings of your provider.`,
      0,
    );
  }

  if (!response.ok) {
    const text = await readError(response);
    throw new ApiError(text || `Request failed with ${response.status}`, response.status);
  }

  const data = await response.json();
  const content: string | undefined =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    data?.message?.content;
  if (!content) {
    throw new ApiError("Provider returned an empty response.", 502);
  }
  return stripCodeFences(content);
}
