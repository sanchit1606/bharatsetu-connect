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

interface CivicSenseRequest {
  /** User's description of the civic issue */
  issue: string;
  /** Complainant's full name */
  name?: string;
  /** Complainant's contact number */
  contact_number?: string;
  /** Selected state (e.g. "Maharashtra") */
  state?: string;
  /** Selected city (e.g. "Mumbai") */
  city?: string;
  /** Area / landmark / region */
  region?: string;
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

  let body: CivicSenseRequest;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const { issue, name, contact_number, state, city, region } = body;
  if (!issue?.trim()) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "issue is required" }),
    };
  }

  const locationParts = [state, city, region].filter(Boolean);
  const locationLine = locationParts.length > 0 ? locationParts.join(", ") : "India";
  const complainantName = (name?.trim() || "[Your Name]");
  const complainantContact = (contact_number?.trim() || "[Your Contact Number]");

  const prompt = `You are a civic grievance assistant for Indian citizens. The user has described a civic issue and their location.

User's issue:
${issue.trim()}

User's location (State, City, Area/landmark): ${locationLine}

Complainant's name (to appear at end of letter): ${complainantName}
Complainant's contact number (to appear at end of letter): ${complainantContact}

Tasks:
1. Classify the issue into a clear category (e.g. "Road, traffic, and street infrastructure", "Garbage collection and sanitation", "Sewage and drainage", "Water supply", "Electricity", "Encroachment and public nuisance", or "General civic grievance").
2. Assess urgency: "Low", "Medium", or "High".
3. Suggest the most relevant level of government: union (central), state, or municipal/local. In one short sentence, say which portal(s) are most relevant for this issue (e.g. "State and municipal portals are most relevant for this local sanitation issue.").
4. Draft a formal complaint letter that the user can send to the appropriate authority. Structure:
   - To: (appropriate authority e.g. The Municipal Commissioner, Pune Municipal Corporation, Pune, Maharashtra)
   - Subject: Complaint Regarding [brief issue] – [area], [city]
   - Respected Sir/Madam,
   - Body: clear description of the issue and location, request for action.
   - You MUST include this exact line before the closing: "I've hereby attach the proof of the same."
   - Then: "Thank you for your time and attention to this important issue."
   - End with: "Sincerely," then on the next line the complainant's name (use: ${complainantName}), then on the next line the contact number (use: ${complainantContact}), then "Date: [today's date in DD Mon YYYY format]".
   Use the user's exact location (state, city, region) in the draft. Keep the tone professional and concise.

Respond with a valid JSON object only (no markdown, no code fence). Use this exact structure:
{
  "category": "string",
  "urgency": "Low" | "Medium" | "High",
  "suggested_authority": {
    "level": "string (e.g. Municipal Corporation / State Government)",
    "department": "string",
    "example_name": "string (e.g. Municipal Commissioner)"
  },
  "portal_relevance_note": "string (one short sentence: which portal(s) are most relevant for this issue)",
  "complaint_draft": "string (full complaint letter text, with line breaks. MUST include 'I've hereby attach the proof of the same.' and end with Sincerely, then name, then contact number, then Date)"
}

Output only the JSON object.`;

  try {
    const response = await client.send(
      new ConverseCommand({
        modelId: MODEL_ID,
        messages: [{ role: "user", content: [{ text: prompt }] }],
        inferenceConfig: {
          maxTokens: 2048,
          temperature: 0.3,
          topP: 0.9,
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
        category: "General civic grievance",
        urgency: "Medium",
        suggested_authority: {
          level: "Municipal Corporation / Nagar Palika",
          department: "General Public Grievance Cell",
          example_name: "Municipal Commissioner",
        },
        portal_relevance_note: "State and municipal portals are typically best for local civic issues.",
        complaint_draft: outputText || "Could not generate draft. Please try again or rephrase your issue.",
      };
    }

    if (!result.complaint_draft || typeof result.complaint_draft !== "string") {
      result.complaint_draft = outputText || "Complaint draft could not be generated.";
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error("CivicSense Bedrock/Lambda error:", err);
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
