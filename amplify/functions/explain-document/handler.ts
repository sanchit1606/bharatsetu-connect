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

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English", hi: "Hindi", mr: "Marathi", gu: "Gujarati", ta: "Tamil", te: "Telugu",
};

interface ExplainDocumentRequest {
  document_text: string;
  user_query?: string;
  output_language?: string;
}

interface ExplanationResult {
  summary: string;
  rights: string[];
  source: string;
  nextSteps: string[];
}

export const handler: APIGatewayProxyHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  let body: ExplainDocumentRequest;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const documentText = (body.document_text ?? "").trim();
  const userQuery = (body.user_query ?? "").trim();
  const langCode = (body.output_language ?? "en").toLowerCase().slice(0, 2);
  const responseLanguage = LANGUAGE_NAMES[langCode] ?? "English";

  if (!documentText) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "document_text is required" }),
    };
  }

  const prompt = `You are a legal rights assistant for Indian citizens. Simplify the given document in plain language and list the user's rights and next steps.

CRITICAL: Write the ENTIRE response in ${responseLanguage} only. All of "summary", "rights", and "nextSteps" must be in ${responseLanguage}.

Input:
- Document text (extracted via OCR): 
${documentText.slice(0, 12000)}
${userQuery ? `\n- User's question about the document: ${userQuery}\n` : ""}

Tasks:
1. Write a short "summary" (2-4 sentences) explaining what the document is about and, if the user asked a question, answer it. Use ${responseLanguage} only.
2. List 3-6 key "rights" the user has based on the document (or general document-signing rights if not a legal contract). Each item one sentence in ${responseLanguage}.
3. Set "source" to a short citation, e.g. "Document provided by user" or the act/section if identifiable. Use ${responseLanguage} where appropriate.
4. List 3-5 "nextSteps" (actionable steps the user should take). Each item one sentence in ${responseLanguage}.

Respond with a valid JSON object only (no markdown, no code fence). Use this exact structure:
{
  "summary": "string (in ${responseLanguage})",
  "rights": [ "string", "string", ... ],
  "source": "string",
  "nextSteps": [ "string", "string", ... ]
}

Output only the JSON object. All text fields must be in ${responseLanguage}.`;

  try {
    const response = await client.send(
      new ConverseCommand({
        modelId: MODEL_ID,
        messages: [{ role: "user", content: [{ text: prompt }] }],
        inferenceConfig: { maxTokens: 2048, temperature: 0.3, topP: 0.9 },
      })
    );

    const messageContent = response.output?.message?.content ?? [];
    const textBlock = messageContent.find((b: { text?: string }) => typeof b?.text === "string");
    const outputText = (textBlock?.text ?? (messageContent[0] as { text?: string } | undefined)?.text ?? "").trim();

    let result: ExplanationResult;
    try {
      const cleaned = outputText.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/m, "$1");
      const parsed = JSON.parse(cleaned) as ExplanationResult;
      result = {
        summary: typeof parsed.summary === "string" ? parsed.summary : "",
        rights: Array.isArray(parsed.rights) ? parsed.rights.filter((r): r is string => typeof r === "string") : [],
        source: typeof parsed.source === "string" ? parsed.source : "Document provided by user",
        nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps.filter((s): s is string => typeof s === "string") : [],
      };
    } catch {
      result = {
        summary: outputText || "Could not generate summary. Please try again.",
        rights: [],
        source: "Document provided by user",
        nextSteps: [],
      };
    }

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result) };
  } catch (err) {
    console.error("explain-document error:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: "Explain failed",
        message: err instanceof Error ? err.message : "Unknown error",
      }),
    };
  }
};
