/**
 * STT API client — calls backend /stt (ElevenLabs Scribe proxy) for "Speak Your Query".
 * Falls back to browser SpeechRecognition when backend is not configured.
 */

function getBaseUrl(): string {
  const env = import.meta.env.VITE_API_URL;
  if (env?.trim()) return env.replace(/\/$/, "");
  return "";
}

export function isSttConfigured(): boolean {
  return Boolean(getBaseUrl());
}

export interface SttOptions {
  /** Audio blob (e.g. from MediaRecorder) */
  audioBlob: Blob;
  language: string;
}

/**
 * Send audio to backend STT (ElevenLabs Scribe). Returns transcript text or null on error.
 */
export async function fetchSttTranscript(options: SttOptions): Promise<string | null> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) return null;

  const base64 = await blobToBase64(options.audioBlob);
  if (!base64) return null;

  const res = await fetch(`${baseUrl}/stt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audio_base64: base64,
      content_type: options.audioBlob.type || "audio/webm",
      language: options.language,
    }),
  });

  if (!res.ok) return null;

  let data: { text?: string };
  try {
    data = (await res.json()) as { text?: string };
  } catch {
    return null;
  }
  const text = data?.text?.trim();
  return text ?? null;
}

function blobToBase64(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      if (!dataUrl || typeof dataUrl !== "string") {
        resolve(null);
        return;
      }
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] ?? "" : dataUrl;
      resolve(base64 || null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}
