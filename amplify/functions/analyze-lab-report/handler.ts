import type { APIGatewayProxyHandler } from "aws-lambda";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION ?? "ap-south-1" });
const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? "google.gemma-3-27b-it";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Content-Type": "application/json",
};

interface AnalyzeLabReportRequest {
  image_base64?: string;
  image_media_type?: string;
  ocr_text?: string;
  age: number;
  gender: string;
  language?: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English", hi: "Hindi", mr: "Marathi", gu: "Gujarati", ta: "Tamil", te: "Telugu",
};

function toConverseImageFormat(mediaType: string): "jpeg" | "png" | "gif" | "webp" {
  if (/^image\/(jpeg|jpg)$/i.test(mediaType)) return "jpeg";
  if (/^image\/png$/i.test(mediaType)) return "png";
  if (/^image\/gif$/i.test(mediaType)) return "gif";
  if (/^image\/webp$/i.test(mediaType)) return "webp";
  return "jpeg";
}

function buildContent(
  imageBase64: string | undefined,
  imageMediaType: string,
  textPrompt: string
): Array<{ image?: { format: "jpeg" | "png" | "gif" | "webp"; source: { bytes: Uint8Array } }; text?: string }> {
  const content: Array<{ image?: { format: "jpeg" | "png" | "gif" | "webp"; source: { bytes: Uint8Array } }; text?: string }> = [];
  if (imageBase64?.trim()) {
    const bytes = new Uint8Array(Buffer.from(imageBase64.trim(), "base64"));
    content.push({
      image: {
        format: toConverseImageFormat(imageMediaType),
        source: { bytes },
      },
    });
  }
  content.push({ text: textPrompt });
  return content;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  let body: AnalyzeLabReportRequest;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { image_base64, image_media_type, ocr_text, age, gender, language } = body;
  const hasImage = Boolean(image_base64?.trim());
  const reportText = (ocr_text ?? "").trim();
  const langCode = (language ?? "en").toLowerCase().slice(0, 2);
  const responseLanguage = LANGUAGE_NAMES[langCode] ?? "English";

  if (!hasImage && !reportText) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Either image_base64 or ocr_text is required" }),
    };
  }
  if (age == null || age < 1 || age > 120) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "age (1-120) is required" }),
    };
  }
  const genderLabel = (gender ?? "male").toLowerCase().includes("f") ? "female" : "male";

  const prompt = `You are a lab report analyst for Indian citizens (ICMR/WHO aware). The user has uploaded a lab report (blood or pathology) and provided their age (${age} years), gender (${genderLabel}), and preferred language: ${responseLanguage}.

CRITICAL: You must write the ENTIRE response in ${responseLanguage} only. This includes:
- "parameters[].name" (parameter names in ${responseLanguage}),
- "summary" (full summary text in ${responseLanguage}),
- "suggestions[].parameter" and "suggestions[].suggestion" (in ${responseLanguage}).

Tasks:
1. Extract every test parameter from the report: name, value, unit, and the reference/normal range shown on the report (if any). If the report does not show a reference range, use standard adult reference ranges for age ${age} and ${genderLabel} (ICMR/WHO where applicable). Output parameter "name" in ${responseLanguage}.
2. For each parameter, set "status" to one of: "normal", "low", "high", "borderline" by comparing value to reference.
3. Write a short "summary" (2-4 sentences) for the user in ${responseLanguage} only.
4. For parameters that are low, high, or borderline, suggest diet or lifestyle remedies in ${responseLanguage}. Put these in "suggestions" array with "parameter" (name in ${responseLanguage}) and "suggestion" (text in ${responseLanguage}).

Respond with a valid JSON object only (no markdown, no code fence). Use this exact structure:
{
  "parameters": [
    {
      "name": "string (in ${responseLanguage})",
      "value": number,
      "unit": "string (e.g. g/dL)",
      "reference_low": number,
      "reference_high": number,
      "status": "normal" | "low" | "high" | "borderline"
    }
  ],
  "summary": "string (in ${responseLanguage})",
  "suggestions": [
    { "parameter": "string (in ${responseLanguage})", "suggestion": "string (in ${responseLanguage})" }
  ]
}

${reportText ? `\nExtracted text from report (OCR):\n${reportText}\n` : ""}

Output only the JSON object. All text fields must be in ${responseLanguage}.`;

  const content = buildContent(
    image_base64,
    image_media_type ?? "image/jpeg",
    prompt
  );

  try {
    const response = await client.send(
      new ConverseCommand({
        modelId: MODEL_ID,
        messages: [{ role: "user", content: content as import("@aws-sdk/client-bedrock-runtime").ContentBlock[] }],
        inferenceConfig: { maxTokens: 2048, temperature: 0.2, topP: 0.85 },
      })
    );

    const messageContent = response.output?.message?.content ?? [];
    const textBlock = messageContent.find((b: { text?: string }) => typeof b?.text === "string");
    const outputText = (textBlock?.text ?? (messageContent[0] as { text?: string } | undefined)?.text ?? "").trim();

    let result: Record<string, unknown>;
    try {
      const cleaned = outputText.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/m, "$1");
      result = JSON.parse(cleaned);
    } catch {
      result = {
        parameters: [],
        summary: outputText || "Could not parse lab report. Please ensure the image is clear and contains a valid report.",
        suggestions: [],
      };
    }

    if (!Array.isArray(result.parameters)) result.parameters = [];
    if (!Array.isArray(result.suggestions)) result.suggestions = [];
    if (typeof result.summary !== "string") result.summary = "Summary not available.";

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result) };
  } catch (err) {
    console.error("analyze-lab-report error:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: "Analysis failed",
        message: err instanceof Error ? err.message : "Unknown error",
      }),
    };
  }
};
