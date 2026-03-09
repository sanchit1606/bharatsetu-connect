/**
 * Lab Report Analyzer API client — calls Amplify-deployed REST API (Lambda + Bedrock).
 */

export interface LabReportParameter {
  name: string;
  value: number;
  unit: string;
  reference_low: number;
  reference_high: number;
  status: "normal" | "low" | "high" | "borderline";
}

export interface LabReportSuggestion {
  parameter: string;
  suggestion: string;
}

export interface LabReportAnalysisResult {
  parameters: LabReportParameter[];
  summary: string;
  suggestions: LabReportSuggestion[];
}

export interface AnalyzeLabReportRequest {
  image_base64?: string;
  image_media_type?: string;
  ocr_text?: string;
  age: number;
  gender: string;
  language?: string;
}

function getBaseUrl(): string {
  const env = import.meta.env.VITE_API_URL;
  if (env?.trim()) return env.replace(/\/$/, "");
  return "";
}

export async function analyzeLabReport(
  payload: AnalyzeLabReportRequest
): Promise<LabReportAnalysisResult> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("VITE_API_URL is not set. Add it to .env or Amplify env.");
  }

  const res = await fetch(`${baseUrl}/analyze-lab-report`, {
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

  return res.json() as Promise<LabReportAnalysisResult>;
}

export function isLabReportBackendConfigured(): boolean {
  return Boolean(getBaseUrl());
}
