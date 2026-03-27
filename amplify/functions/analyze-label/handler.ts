import type { APIGatewayProxyHandler } from "aws-lambda";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION ?? "ap-south-1" });

/** Claude Haiku 4.5 (multimodal). Override with BEDROCK_MODEL_ID. Available in ap-south-1; enable in Bedrock → Model access. */
const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? "anthropic.claude-haiku-4-5-20251001-v1:0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Content-Type": "application/json",
};

interface AnalyzeRequest {
  ocr_text?: string;
  image_base64?: string;
  image_media_type?: string;
  query: string;
  language: string;
}

/** Converse API image format: jpeg | png | gif | webp. */
function toConverseImageFormat(mediaType: string): "jpeg" | "png" | "gif" | "webp" {
  if (/^image\/(jpeg|jpg)$/i.test(mediaType)) return "jpeg";
  if (/^image\/png$/i.test(mediaType)) return "png";
  if (/^image\/gif$/i.test(mediaType)) return "gif";
  if (/^image\/webp$/i.test(mediaType)) return "webp";
  return "jpeg";
}

/** Build Converse API message content: image (if provided) + text. Image bytes must be Uint8Array. */
function buildConverseContent(
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
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let body: AnalyzeRequest;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const { ocr_text, image_base64, image_media_type, query, language } = body;
  if (!query?.trim()) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "query is required" }),
    };
  }

  const hasImage = Boolean(image_base64?.trim());
  const labelText = (ocr_text ?? "").trim();
  const lang = (language ?? "en").toLowerCase();
  const userQuery = query.trim();

  const responseLanguageName =
    ({ en: "English", hi: "Hindi", mr: "Marathi", ta: "Tamil", te: "Telugu" } as Record<string, string>)[lang] ?? "English";

  // Language-specific recommendation examples
  const exampleRecommendations: Record<string, string> = {
    en: 'e.g. "You should avoid this product" / "use with caution" / "safe to use in moderation"',
    hi: 'e.g. "आपको इस उत्पाद का उपयोग नहीं करना चाहिए" / "सावधानी से उपयोग करें" / "सीमित मात्रा में सुरक्षित"',
    mr: 'e.g. "या उत्पादन टाळा" / "सावधानीने वापरा" / "माध्यमिक प्रमाणात सुरक्षित"',
    ta: 'e.g. "இந்த பொருளைத் தவிர்க்களை" / "எச்சரிக்கையுடன் பயன்படுத்தவும்" / "நடுநிலையில் பயன்படுத்தலாம்"',
    te: 'e.g. "ఈ ఉత్పత్తిని నివారించండి" / "జాగ్రత్తగా ఉపయోగించండి" / "మధ్యస్థ స్థాయిలో సురక్షితం"'
  };
  const exampleText = exampleRecommendations[lang] ?? exampleRecommendations.en;

  const instruction = hasImage
    ? "You are a label analyst for Indian consumers. (1) From the product label image, extract product name, manufacturer, serving size, nutrition facts (with units, e.g. per 100g or per serving), ingredients, allergens, and any health claims. (2) Read the user's question carefully—they may ask 'can I use this product?' or mention age, health conditions (e.g. diabetes, allergy, heart issue), or diet goals. (3) Give a direct recommendation: whether they should use the product, use with caution, or avoid it—and explain WHY using specific numbers and facts from the label (e.g. 'this has 21g sugar per 50g serving, which is too high for someone with diabetes'). Always cite label data to justify your answer. Respond with a valid JSON object only (no markdown, no code fence)."
    : "You are a food and cosmetics label analyst for Indian consumers (FSSAI-aware). Use the label text and user query below. Give a direct recommendation (use / use with caution / avoid) and explain why using specific data from the label. Respond with a valid JSON object only (no markdown, no code fence).";

  const prompt = `${instruction}

Respond with this exact JSON structure only (no markdown, no code fence):
{
  "product_name": "string",
  "manufacturer": "string",
  "serving_size": "string",
  "safety_badge": "SAFE_TO_CONSUME" | "CONSUME_WITH_CAUTION" | "NOT_RECOMMENDED",
  "nutrition": { "protein": number, "carbohydrates": number, "sugar": number, "total_fat": number, "saturated_fat": number, "dietary_fiber": number, "sodium": number, "other": number },
  "daily_limits": { "protein": 50, "carbohydrates": 300, "sugar": 50, "total_fat": 65, "saturated_fat": 20, "dietary_fiber": 25, "sodium": 2300 },
  "ai_response": "string (see rules below)",
  "key_concerns": [{"type": "warning"|"ok", "title": "string", "detail": "string"}],
  "false_claims": [{"claim": "string", "flag": "MISLEADING"|"ACCURATE"|"UNVERIFIED", "explanation": "string"}]
}

Rules for ai_response (write in ${responseLanguageName} only):
- Directly answer the user's question with a clear recommendation: ${exampleText}.
- MUST include specific data from the label to justify your answer: quote numbers (sugar, fat, sodium per serving or per 100g), serving size, allergens, or ingredients that support your recommendation. Always provide specific figures from the label.
- If the user implies a health condition (diabetes, allergy, weight, age), tailor the answer: explain why the product is or isn’t suitable for that context using label facts.
- Suggest consulting a doctor when relevant (e.g. existing condition or uncertainty). Keep 2–4 short paragraphs; no generic filler—every sentence should add information or justification from the label.
Rules: Infer nutrition from the label; use 0 for missing values. For "other" in nutrition use 0–20 for residual only. Output only the JSON object.
${labelText ? `\nLabel text (if any):\n${labelText}\n` : ""}
User query: ${userQuery}

Respond with only the JSON object.`;

  const content = buildConverseContent(
    image_base64,
    image_media_type ?? "image/jpeg",
    prompt
  );

  try {
    const response = await client.send(
      new ConverseCommand({
        modelId: MODEL_ID,
        messages: [{ role: "user", content: content as import("@aws-sdk/client-bedrock-runtime").ContentBlock[] }],
        inferenceConfig: {
          maxTokens: 2048,
          temperature: 0.2,
          topP: 0.85,
        },
      })
    );

    const messageContent = response.output?.message?.content ?? [];
    const textBlock = messageContent.find((b: { text?: string }) => typeof b?.text === "string");
    const outputText =
      textBlock?.text ??
      (messageContent[0] as { text?: string } | undefined)?.text ??
      "";

    let result: Record<string, unknown>;
    try {
      const cleaned = outputText.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/m, "$1");
      result = JSON.parse(cleaned);
    } catch {
      result = {
        product_name: "Unknown",
        manufacturer: "Unknown",
        serving_size: "—",
        safety_badge: "CONSUME_WITH_CAUTION",
        nutrition: { protein: 0, carbohydrates: 0, sugar: 0, total_fat: 0, saturated_fat: 0, dietary_fiber: 0, sodium: 0, other: 0 },
        daily_limits: { protein: 50, carbohydrates: 300, sugar: 50, total_fat: 65, saturated_fat: 20, dietary_fiber: 25, sodium: 2300 },
        ai_response: outputText || "Could not parse model response.",
        key_concerns: [],
        false_claims: [],
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error("Bedrock/Lambda error:", err);
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
