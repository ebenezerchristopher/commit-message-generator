export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function generateCommitMessage(
  settings: { apiKey: string; baseUrl: string; model: string },
  diff: string,
  signal?: AbortSignal,
): Promise<string> {
  if (!settings.apiKey) throw new ApiError("Missing API key", 401);
  if (!settings.model) throw new ApiError("Missing model name", 400);
  if (!settings.baseUrl) throw new ApiError("Missing base URL", 400);

  let response: Response;
  try {
    response = await fetch("/api/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings, diff }),
      signal,
      cache: "no-store",
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    const msg = err instanceof Error ? err.message : "Network request failed";
    throw new ApiError(`Could not reach the server. ${msg}.`, 0);
  }

  let data: { message?: string; error?: string };
  try {
    data = await response.json();
  } catch {
    throw new ApiError(`Server returned non-JSON (HTTP ${response.status})`, response.status || 500);
  }

  if (!response.ok) {
    throw new ApiError(data?.error || `Request failed with ${response.status}`, response.status);
  }

  if (!data?.message) {
    throw new ApiError("Server returned an empty response.", 502);
  }
  return data.message;
}
