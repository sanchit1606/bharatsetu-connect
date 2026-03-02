import type { APIGatewayProxyHandler } from "aws-lambda";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION ?? "us-east-1" });

/** Model ID from env or default (Claude 3 Haiku — cost-effective). */
const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? "anthropic.claude-3-haiku-20240307-v1:0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Content-Type": "application/json",
};

interface AnalyzeRequest {
  ocr_text?: string;
  image_base64?: string;
  query: string;
  language: string;
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

  const { ocr_text, query, language } = body;
  if (!query?.trim()) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "query is required" }),
    };
  }

  const labelText = (ocr_text ?? "").trim() || "(No label text provided)";
  const lang = (language ?? "en").toLowerCase();
  const userQuery = query.trim();

  const prompt = `You are a food and cosmetics label analyst for Indian consumers (FSSAI-aware). 
Given the following extracted label text and a user health/context query, respond with a valid JSON object only (no markdown, no extra text) with this exact structure:
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

Label text:
${labelText}

User query: ${userQuery}

Respond with only the JSON object.`;

  try {
    const response = await client.send(
      new InvokeModelCommand({
        modelId: MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 2048,
          messages: [{ role: "user", content: prompt }],
        }),
      })
    );

    const rawBody = response.body;
    if (!rawBody) {
      throw new Error("Empty Bedrock response");
    }
    const text = new TextDecoder().decode(rawBody);
    const parsed = JSON.parse(text);
    const outputText = parsed?.content?.[0]?.text ?? parsed?.completion ?? text;

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
