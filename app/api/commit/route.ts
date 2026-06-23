import { NextResponse } from "next/server";
import { SYSTEM_PROMPT, buildUserPrompt, stripCodeFences } from "@/lib/prompts";
import { ProviderSettings } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestBody = {
  settings: ProviderSettings;
  diff: string;
};

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
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

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const settings = body?.settings;
  const diff = body?.diff;
  if (!settings || typeof diff !== "string") {
    return NextResponse.json(
      { error: "Missing settings or diff" },
      { status: 400 },
    );
  }
  if (!settings.apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 400 });
  }
  if (!settings.model) {
    return NextResponse.json({ error: "Missing model" }, { status: 400 });
  }
  if (!settings.baseUrl) {
    return NextResponse.json({ error: "Missing base URL" }, { status: 400 });
  }

  const url = `${normalizeBaseUrl(settings.baseUrl)}/chat/completions`;
  const upstreamBody = {
    model: settings.model,
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(diff) },
    ],
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify(upstreamBody),
      cache: "no-store",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network request failed";
    return NextResponse.json(
      { error: `Could not reach ${url}. ${msg}.` },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const text = await readError(response);
    return NextResponse.json(
      { error: text || `Provider returned ${response.status}` },
      { status: response.status },
    );
  }

  let data: {
    choices?: Array<{ message?: { content?: string }; text?: string }>;
    message?: { content?: string };
  };
  try {
    data = await response.json();
  } catch {
    return NextResponse.json(
      { error: "Provider returned invalid JSON" },
      { status: 502 },
    );
  }

  const content =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    data?.message?.content;
  if (!content) {
    return NextResponse.json(
      { error: "Provider returned an empty response." },
      { status: 502 },
    );
  }

  return NextResponse.json({ message: stripCodeFences(content) });
}
