import type { APIGatewayProxyHandler } from "aws-lambda";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY ?? "";

/** Text-to-Speech model. Override with ELEVENLABS_TTS_MODEL_ID. Options: eleven_multilingual_v2 (default), eleven_flash_v2_5, eleven_turbo_v2_5, eleven_v3 */
const TTS_MODEL_ID = process.env.ELEVENLABS_TTS_MODEL_ID ?? "eleven_multilingual_v2";
/** Voice ID from ElevenLabs. Override with ELEVENLABS_VOICE_ID. */
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb";
/** Output format: mp3_44100_128 (default), mp3_22050_32, opus_48000_64, etc. Override with ELEVENLABS_TTS_OUTPUT_FORMAT. */
const OUTPUT_FORMAT = process.env.ELEVENLABS_TTS_OUTPUT_FORMAT ?? "mp3_44100_128";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

interface TtsRequest {
  text: string;
  language?: string;
}

/** ISO 639-1 for ElevenLabs language_code (improves pronunciation). */
const LANGUAGE_CODE: Record<string, string> = {
  en: "en",
  hi: "hi",
  mr: "mr",
  gu: "gu",
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
      body: JSON.stringify({ error: "TTS not configured. Set ELEVENLABS_API_KEY." }),
    };
  }

  let body: TtsRequest;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const text = (body.text ?? "").trim();
  if (!text) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "text is required" }),
    };
  }

  const lang = (body.language ?? "en").toLowerCase();
  const language_code = LANGUAGE_CODE[lang] ?? "en";

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=${OUTPUT_FORMAT}`;
  const payload = {
    text,
    model_id: TTS_MODEL_ID,
    language_code,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("ElevenLabs error:", res.status, errText);
      return {
        statusCode: res.status,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "TTS request failed",
          message: res.status === 401 ? "Invalid API key" : errText.slice(0, 200),
        }),
      };
    }

    const audioBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString("base64");

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ audio: base64 }),
    };
  } catch (err) {
    console.error("TTS Lambda error:", err);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "TTS failed",
        message: err instanceof Error ? err.message : "Unknown error",
      }),
    };
  }
};
