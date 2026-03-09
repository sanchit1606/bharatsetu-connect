/**
 * CivicSense API client — calls backend /civic-sense (Lambda + Bedrock) to generate
 * complaint draft and AI understanding from issue + location.
 */

export interface CivicSenseRequest {
  issue: string;
  name?: string;
  contact_number?: string;
  state?: string;
  city?: string;
  region?: string;
}

export interface SuggestedAuthority {
  level: string;
  department: string;
  example_name: string;
}

export interface CivicSenseResult {
  category?: string;
  urgency?: "Low" | "Medium" | "High";
  suggested_authority?: SuggestedAuthority;
  /** Short note on which portal(s) are most relevant for this issue */
  portal_relevance_note?: string;
  /** Full complaint letter text */
  complaint_draft: string;
}

function getBaseUrl(): string {
  const env = import.meta.env.VITE_API_URL;
  if (env?.trim()) return env.replace(/\/$/, "");
  return "";
}

export function isCivicSenseBackendConfigured(): boolean {
  return Boolean(getBaseUrl());
}

export async function getCivicSenseDraft(
  payload: CivicSenseRequest
): Promise<CivicSenseResult> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("VITE_API_URL is not set. Add it to .env or Amplify env.");
  }

  const res = await fetch(`${baseUrl}/civic-sense`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      issue: payload.issue?.trim() ?? "",
      name: payload.name?.trim() || undefined,
      contact_number: payload.contact_number?.trim() || undefined,
      state: payload.state?.trim() || undefined,
      city: payload.city?.trim() || undefined,
      region: payload.region?.trim() || undefined,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = text || `Request failed: ${res.status}`;
    try {
      const json = JSON.parse(text) as { error?: string; message?: string };
      if (json.message) message = json.message;
      else if (json.error) message = `${json.error}${json.message ? `: ${json.message}` : ""}`;
    } catch {
      // use text as-is
    }
    throw new Error(message);
  }

  return res.json() as Promise<CivicSenseResult>;
}
