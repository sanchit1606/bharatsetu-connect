import type { APIGatewayProxyHandler } from "aws-lambda";

const ELEVENLABS_API_KEY = (process.env.ELEVENLABS_API_KEY ?? "").trim();

/** Speech-to-Text model. Override with ELEVENLABS_STT_MODEL_ID. Options: scribe_v2 (default, 90+ languages), scribe_v1 */
const STT_MODEL_ID = process.env.ELEVENLABS_STT_MODEL_ID ?? "scribe_v2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

interface SttRequest {
  audio_base64: string;
  content_type?: string;
  language?: string;
}

const LANGUAGE_CODE: Record<string, string> = {
  en: "en",
  hi: "hi",
  mr: "mr",
  ta: "ta",
  te: "te",
};

export const handler: APIGatewayProxyHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  if (!ELEVENLABS_API_KEY.trim()) {
    return {
      statusCode: 503,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "STT not configured. Set ELEVENLABS_API_KEY." }),
    };
  }

  let body: SttRequest;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const audioBase64 = (body.audio_base64 ?? "").trim();
  if (!audioBase64) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "audio_base64 is required" }),
    };
  }

  const contentType = body.content_type ?? "audio/webm";
  const lang = (body.language ?? "en").toLowerCase();
  const languageCode = LANGUAGE_CODE[lang] ?? "en";

  let audioBuffer: Buffer;
  try {
    audioBuffer = Buffer.from(audioBase64, "base64");
  } catch {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid base64 audio" }),
    };
  }

  if (audioBuffer.length === 0) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Audio is empty" }),
    };
  }

  const extension = contentType.includes("webm") ? "webm" : "audio";
  const form = new FormData();
  const file = new File([audioBuffer], `audio.${extension}`, { type: contentType });
  form.append("file", file);
  form.append("model_id", STT_MODEL_ID);
  form.append("language_code", languageCode);

  try {
    const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY.trim(),
      },
      body: form,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("ElevenLabs STT error:", res.status, errText);
      return {
        statusCode: res.status,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "STT request failed",
          message: res.status === 401 ? "Invalid API key" : errText.slice(0, 200),
        }),
      };
    }

    const data = (await res.json()) as { text?: string; transcripts?: Array<{ text?: string }> };
    const text = (data?.text ?? data?.transcripts?.[0]?.text ?? "").trim();

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    console.error("STT Lambda error:", err);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "STT failed",
        message: err instanceof Error ? err.message : "Unknown error",
      }),
    };
  }
};
