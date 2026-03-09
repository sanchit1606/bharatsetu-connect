/**
 * TTS API client — calls backend /tts (ElevenLabs proxy) for "Listen to Analysis".
 * Falls back to browser SpeechSynthesis when backend is not configured or returns 503.
 */

function getBaseUrl(): string {
  const env = import.meta.env.VITE_API_URL;
  if (env?.trim()) return env.replace(/\/$/, "");
  return "";
}

export function isTtsConfigured(): boolean {
  return Boolean(getBaseUrl());
}

export interface TtsOptions {
  text: string;
  language: string;
}

/**
 * Request audio from backend TTS (ElevenLabs). Returns blob URL for playback, or null on error.
 * Backend returns JSON { audio: "<base64>" } to avoid API Gateway binary issues.
 */
export async function fetchTtsAudio(options: TtsOptions): Promise<string | null> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) return null;

  const res = await fetch(`${baseUrl}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: options.text,
      language: options.language,
    }),
  });

  if (!res.ok) return null;

  let data: { audio?: string };
  try {
    data = (await res.json()) as { audio?: string };
  } catch {
    return null;
  }
  const b64 = data?.audio;
  if (!b64 || typeof b64 !== "string") return null;

  const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const blob = new Blob([binary], { type: "audio/mpeg" });
  if (!blob.size) return null;
  return URL.createObjectURL(blob);
}
