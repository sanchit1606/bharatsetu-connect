import type { APIGatewayProxyHandler } from "aws-lambda";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION ?? "ap-south-1" });

/** Nova Lite inference profile for on-demand (ap-south-1). ID: apac.amazon.nova-lite-v1:0; ARN format: arn:aws:bedrock:ap-south-1:ACCOUNT:inference-profile/apac.amazon.nova-lite-v1:0 */
const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? "apac.amazon.nova-lite-v1:0";

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

/** Map MIME type to Nova image format (jpeg, png, gif, webp). */
function toNovaImageFormat(mediaType: string): string {
  if (/^image\/(jpeg|jpg)$/i.test(mediaType)) return "jpeg";
  if (/^image\/png$/i.test(mediaType)) return "png";
  if (/^image\/gif$/i.test(mediaType)) return "gif";
  if (/^image\/webp$/i.test(mediaType)) return "webp";
  return "jpeg";
}

/** Build Nova user message content: image (if provided) + text. */
function buildNovaMessageContent(
  imageBase64: string | undefined,
  imageMediaType: string,
  textPrompt: string
): Array<{ image?: { format: string; source: { bytes: string } }; text?: string }> {
  const content: Array<{ image?: { format: string; source: { bytes: string } }; text?: string }> = [];
  if (imageBase64?.trim()) {
    content.push({
      image: {
        format: toNovaImageFormat(imageMediaType),
        source: { bytes: imageBase64.trim() },
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

  const instruction = hasImage
    ? "Look at the product label image attached and the user query below. Extract all visible information (product name, manufacturer, nutrition facts, ingredients, claims) from the image. Then answer the user's health/context question based on the label and respond with a valid JSON object only (no markdown, no extra text)."
    : "You are a food and cosmetics label analyst for Indian consumers (FSSAI-aware). Use the label text and user query below to produce the response.";

  const prompt = `${instruction}
Respond with this exact JSON structure only:
{
  "product_name": "string",
  "manufacturer": "string",
  "serving_size": "string",
  "safety_badge": "SAFE_TO_CONSUME" | "CONSUME_WITH_CAUTION" | "NOT_RECOMMENDED",
  "nutrition": { "protein": number, "carbohydrates": number, "sugar": number, "total_fat": number, "saturated_fat": number, "dietary_fiber": number, "sodium": number, "other": number },
  "daily_limits": { "protein": 50, "carbohydrates": 300, "sugar": 50, "total_fat": 65, "saturated_fat": 20, "dietary_fiber": 25, "sodium": 2300 },
  "ai_response": "string (detailed analysis in the user's language, default ${lang === "hi" ? "Hindi" : "English"})",
  "key_concerns": [{"type": "warning"|"ok", "title": "string", "detail": "string"}],
  "false_claims": [{"claim": "string", "flag": "MISLEADING"|"ACCURATE"|"UNVERIFIED", "explanation": "string"}]
}
Infer nutrition and daily_limits from the label where possible; use 0 for missing values. Keep ai_response concise and helpful.
${labelText ? `\nLabel text (if any):\n${labelText}\n` : ""}
User query: ${userQuery}

Respond with only the JSON object.`;

  const messageContent = buildNovaMessageContent(
    image_base64,
    image_media_type ?? "image/jpeg",
    prompt
  );

  try {
    const response = await client.send(
      new InvokeModelCommand({
        modelId: MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          schemaVersion: "messages-v1",
          messages: [{ role: "user", content: messageContent }],
          inferenceConfig: { maxTokens: 2048, temperature: 0.3, topP: 0.9, topK: 50 },
        }),
      })
    );

    const rawBody = response.body;
    if (!rawBody) {
      throw new Error("Empty Bedrock response");
    }
    const text = new TextDecoder().decode(rawBody);
    const parsed = JSON.parse(text);
    const outputText =
      parsed?.output?.message?.content?.[0]?.text ??
      parsed?.content?.[0]?.text ??
      parsed?.completion ??
      text;

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
