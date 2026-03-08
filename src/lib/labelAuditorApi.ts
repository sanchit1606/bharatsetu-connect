/**
 * Label Auditor API client — calls Amplify-deployed REST API (Lambda + Bedrock).
 */

export interface LabelAnalysisResult {
  product_name: string;
  manufacturer: string;
  serving_size: string;
  safety_badge: "SAFE_TO_CONSUME" | "CONSUME_WITH_CAUTION" | "NOT_RECOMMENDED";
  nutrition: Record<string, number>;
  daily_limits: Record<string, number>;
  ai_response: string;
  key_concerns: Array<{ type: string; title: string; detail: string }>;
  false_claims: Array<{ claim: string; flag: string; explanation: string }>;
}

export interface AnalyzeLabelRequest {
  ocr_text?: string;
  image_base64?: string;
  /** e.g. "image/jpeg" or "image/png" — used when sending image to vision model */
  image_media_type?: string;
  query: string;
  language: string;
}

function getBaseUrl(): string {
  const env = import.meta.env.VITE_API_URL;
  if (env?.trim()) return env.replace(/\/$/, "");
  return "";
}

export async function analyzeLabel(
  payload: AnalyzeLabelRequest
): Promise<LabelAnalysisResult> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("VITE_API_URL is not set. Add it to .env or Amplify env.");
  }

  const res = await fetch(`${baseUrl}/analyze-label`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = text || `Analysis failed: ${res.status}`;
    try {
      const json = JSON.parse(text) as { error?: string; message?: string };
      if (json.message) message = json.message;
      else if (json.error) message = `${json.error}${json.message ? `: ${json.message}` : ""}`;
    } catch {
      // use text as-is
    }
    throw new Error(message);
  }

  return res.json() as Promise<LabelAnalysisResult>;
}

export function isBackendConfigured(): boolean {
  return Boolean(getBaseUrl());
}
