/**
 * Rights Assistant — FAQ matching and document explanation.
 * Document explain calls backend when VITE_API_URL is set; otherwise uses mock.
 */

export type ExplanationResult = {
  summary: string;
  rights: string[];
  source: string;
  nextSteps: string[];
};

function getBaseUrl(): string {
  const env = import.meta.env.VITE_API_URL;
  if (env?.trim()) return env.replace(/\/$/, "");
  return "";
}

export function isRightsExplainConfigured(): boolean {
  return Boolean(getBaseUrl());
}

export interface ExplainDocumentRequest {
  document_text: string;
  user_query?: string;
  output_language?: string;
}

/**
 * Send document text and optional user query to backend; returns generated summary.
 * Backend should return { summary, rights, source, nextSteps } in the selected language.
 */
export async function explainDocument(
  payload: ExplainDocumentRequest
): Promise<ExplanationResult> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("VITE_API_URL is not set. Add it to .env or Amplify env.");
  }

  const res = await fetch(`${baseUrl}/explain-document`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = text || `Explain failed: ${res.status}`;
    try {
      const json = JSON.parse(text) as { error?: string; message?: string };
      if (json.message) message = json.message;
      else if (json.error) message = `${json.error}${json.message ? `: ${json.message}` : ""}`;
    } catch {
      // use text as-is
    }
    throw new Error(message);
  }

  const data = (await res.json()) as ExplanationResult;
  return {
    summary: data.summary ?? "",
    rights: Array.isArray(data.rights) ? data.rights : [],
    source: data.source ?? "Backend",
    nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
  };
}

export type QaAnswer = { answer: string; source: string };

const LEGAL_FAQ: { keywords: string[]; answer: string; source: string }[] = [
  {
    keywords: ["rent", "landlord", "tenant", "evict", "notice", "increase rent"],
    answer:
      "Under the Model Tenancy Act 2021 and state rent laws, a landlord cannot evict you without a valid reason and proper notice (usually 3–6 months). Rent cannot be increased arbitrarily; many states cap annual increase (e.g. 10%). You have the right to receive a written rent agreement and receipts. If your landlord is trying to evict you without notice, you can approach the Rent Control Court or District Consumer Forum.",
    source: "Model Tenancy Act 2021; State Rent Control Acts",
  },
  {
    keywords: ["employment", "salary", "pf", "gratuity", "resign", "termination", "notice period"],
    answer:
      "Under the Industrial Disputes Act and Payment of Gratuity Act, you are entitled to notice (or pay in lieu) before termination. PF (Employers' contribution) is mandatory for establishments with 20+ employees. Gratuity is payable after 5 years of continuous service. Unpaid salary can be claimed through the Labour Commissioner or labour court. Keep copies of appointment letter, payslips, and any termination notice.",
    source: "Industrial Disputes Act 1947; Payment of Gratuity Act 1972",
  },
  {
    keywords: ["consumer", "refund", "defective", "warranty", "complaint"],
    answer:
      "Under the Consumer Protection Act 2019, you have the right to replacement, refund, or compensation for defective goods or deficient services. You can file a complaint online at the National Consumer Helpline (NCH) or the Consumer Commission (District/State/National). No lawyer is required for claims up to specified limits. Keep bills, photos, and correspondence as proof.",
    source: "Consumer Protection Act 2019",
  },
  {
    keywords: ["ration", "pds", "food", "aadhaar", "entitlement"],
    answer:
      "Under the National Food Security Act (NFSA), eligible households are entitled to subsidised food grains. Denial of ration for not linking Aadhaar, or for other arbitrary reasons, can be challenged. You can complain to the District Grievance Redressal Officer (DGRO) or use the central portal. State-specific rules apply for eligibility and quantity.",
    source: "National Food Security Act 2013; State PDS orders",
  },
  {
    keywords: ["domestic violence", "dowry", "maintenance", "women", "498a"],
    answer:
      "The Protection of Women from Domestic Violence Act 2005 allows you to seek protection orders, residence orders, and maintenance. You can approach the Magistrate or a Service Provider (NGO) designated under the Act. For dowry-related harassment, IPC Section 498A and the Dowry Prohibition Act apply. Legal aid is available through District Legal Services Authority (DLSA).",
    source: "Protection of Women from Domestic Violence Act 2005; IPC 498A",
  },
  {
    keywords: ["rti", "information", "government", "transparency"],
    answer:
      "Under the Right to Information Act 2005, any citizen can request information from public authorities. The authority must reply within 30 days. You can file an RTI application to the concerned Public Information Officer (PIO). If denied or delayed, you can appeal to the First Appellate Authority and then the Information Commission. Fees are minimal.",
    source: "Right to Information Act 2005",
  },
];

export function matchQuestion(query: string): QaAnswer | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  for (const faq of LEGAL_FAQ) {
    if (faq.keywords.some((k) => q.includes(k))) {
      return { answer: faq.answer, source: faq.source };
    }
  }
  return {
    answer:
      "This is a general information response. For your specific situation, consider consulting the District Legal Services Authority (DLSA) for free legal aid, or a qualified lawyer. You can also search IndiaCode.nic.in for the exact act and section relevant to your query.",
    source: "General guidance; IndiaCode.nic.in for laws",
  };
}

export function mockExplainDocument(
  text: string,
  userQuery?: string,
  _outputLanguage?: string
): ExplanationResult {
  const hasQuery = Boolean(userQuery?.trim());
  const summaryIntro = hasQuery
    ? "Based on your document and your question, here is a simplified summary. "
    : "";
  return {
    summary:
      summaryIntro +
      "This document has been simplified for easier understanding. Key terms and obligations are summarised below. This is illustrative; for legal certainty, refer to the full document and a lawyer if needed.",
    rights: [
      "Right to receive a copy of the document you sign",
      "Right to understand the main terms before agreeing",
      "Right to seek legal aid from DLSA if you cannot afford a lawyer",
    ],
    source: "Document provided by user; interpretation for awareness only",
    nextSteps: [
      "Keep a signed copy of any agreement",
      "Note important dates (e.g. notice period, renewal)",
      "Contact DLSA or a lawyer for document-specific advice",
    ],
  };
}

export const SUGGESTED_QUESTIONS = [
  "Can my landlord evict me without notice?",
  "What are my rights if I don't get PF?",
  "How do I get a refund for a defective product?",
  "Can I get ration without Aadhaar?",
  "What can I do about domestic violence?",
  "How do I file an RTI?",
];
