import React, { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  FileText,
  MessageCircle,
  Loader2,
  Mic,
  MicOff,
  Upload,
  Image as ImageIcon,
  X,
  ArrowRight,
  Scale,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { createWorker } from "tesseract.js";
import ScrollReveal from "@/components/ScrollReveal";

type TabMode = "document" | "question";

type ExplanationResult = {
  summary: string;
  rights: string[];
  source: string;
  nextSteps: string[];
};

// Mock FAQ for question mode (would be RAG/API in production)
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

function matchQuestion(query: string): { answer: string; source: string } | null {
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

// Mock document simplification (would be LLM/API in production)
function mockExplainDocument(text: string): ExplanationResult {
  const trimmed = text.trim().slice(0, 500);
  return {
    summary:
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

const RightsAssistant: React.FC = () => {
  const [tab, setTab] = useState<TabMode>("document");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPaste, setDocumentPaste] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isExplainLoading, setIsExplainLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [qaAnswer, setQaAnswer] = useState<{ answer: string; source: string } | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-IN";
      rec.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0])
          .map((r: any) => r.transcript)
          .join("");
        setQuestionText(transcript);
      };
      rec.onend = () => setIsRecording(false);
      recognitionRef.current = rec;
    }
  }, []);

  const effectiveDocText = extractedText.trim() || documentPaste.trim();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Please upload a file smaller than 10MB.");
      return;
    }
    setDocumentFile(file);
    setExtractedText("");
  };

  const runOcr = async () => {
    if (!documentFile) return;
    setIsOcrLoading(true);
    try {
      const worker = await createWorker("eng", undefined, { logger: () => {} });
      const { data } = await worker.recognize(documentFile);
      setExtractedText(data.text || "");
      await worker.terminate();
    } catch (err) {
      console.error(err);
      setExtractedText("");
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleExplainDocument = () => {
    if (!effectiveDocText) return;
    setIsExplainLoading(true);
    setExplanation(null);
    setTimeout(() => {
      setExplanation(mockExplainDocument(effectiveDocText));
      setIsExplainLoading(false);
    }, 600);
  };

  const handleAskQuestion = () => {
    const result = matchQuestion(questionText);
    setQaAnswer(result);
  };

  const toggleRecording = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isRecording) {
      rec.stop();
      setIsRecording(false);
    } else {
      rec.start();
      setIsRecording(true);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy"), 1500);
    } catch {
      setCopyLabel("Copy failed");
    }
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="section-padding pb-8">
        <div className="container-content grid gap-8 lg:grid-cols-[3fr,2fr] items-center">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              Feature 03 — Rights Assistant
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground">
              Legal documents in{" "}
              <span className="hero-gradient-text">plain language</span>.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
              Upload a document (agreement, notice, form) or ask any question about your legal rights
              and government schemes. Get a simple summary, your rights in plain language, and
              source citations — no lawyer required to get started.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30">
                <BookOpen className="w-3.5 h-3.5 text-accent" />
                For awareness only; not legal advice
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30">
                <Scale className="w-3.5 h-3.5 text-accent" />
                Acts & sections cited
              </span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div className="bg-card rounded-2xl p-6 lg:p-8 card-elevated">
              <h3 className="font-display font-semibold text-foreground mb-4 text-sm">
                How it works
              </h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full hero-gradient-bg text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                    1
                  </div>
                  <p>
                    <span className="font-semibold text-foreground">Upload a document</span> (image)
                    or <span className="font-semibold text-foreground">ask a question</span> in text
                    or voice.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full hero-gradient-bg text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                    2
                  </div>
                  <p>
                    We extract text (OCR) or match your question to rights and schemes.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full hero-gradient-bg text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                    3
                  </div>
                  <p>
                    You get a <span className="font-semibold text-foreground">plain-language
                    summary</span> with source (act/section) and next steps.
                  </p>
                </li>
              </ol>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Tabs + Main content */}
      <section className="section-padding pt-0">
        <div className="container-content">
          <div className="flex gap-2 p-1 rounded-xl bg-muted/50 border border-border w-fit mb-6">
            <button
              type="button"
              onClick={() => setTab("document")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "document"
                  ? "bg-background text-foreground shadow border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-4 h-4" />
              Explain a document
            </button>
            <button
              type="button"
              onClick={() => setTab("question")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "question"
                  ? "bg-background text-foreground shadow border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Ask about rights
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr] items-start">
            {/* Left: Input */}
            <ScrollReveal>
              <div className="bg-card rounded-2xl p-6 lg:p-8 card-elevated space-y-6">
                {tab === "document" ? (
                  <>
                    <h2 className="font-display font-semibold text-foreground text-lg">
                      Upload or paste document
                    </h2>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-primary" />
                        Image of document (photo or scan)
                      </label>
                      <label className="flex min-h-[100px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-5 cursor-pointer hover:border-primary/40 hover:bg-muted/50">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="absolute w-0 h-0 opacity-0 pointer-events-none"
                          onChange={handleFileChange}
                        />
                        {documentFile ? (
                          <div className="flex items-center gap-2 w-full max-w-sm">
                            <FileText className="w-5 h-5 text-primary shrink-0" />
                            <span className="truncate text-sm font-medium">{documentFile.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDocumentFile(null);
                                setExtractedText("");
                              }}
                              className="ml-auto p-1 rounded hover:bg-muted"
                              aria-label="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-primary" />
                            <span className="text-sm text-muted-foreground">
                              Drop image or browse
                            </span>
                          </>
                        )}
                      </label>
                      {documentFile && (
                        <button
                          type="button"
                          onClick={runOcr}
                          disabled={isOcrLoading}
                          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          {isOcrLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : null}
                          {isOcrLoading ? "Extracting text…" : "Extract text from image"}
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Or paste document text
                      </label>
                      <textarea
                        value={documentPaste}
                        onChange={(e) => setDocumentPaste(e.target.value)}
                        placeholder="Paste text from a rental agreement, notice, contract, or any document you want explained…"
                        rows={6}
                        className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleExplainDocument}
                      disabled={!effectiveDocText || isExplainLoading}
                      className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl font-semibold text-sm hero-gradient-bg text-primary-foreground btn-press disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExplainLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                      {isExplainLoading ? "Explaining…" : "Explain this document"}
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="font-display font-semibold text-foreground text-lg">
                      Ask about your rights
                    </h2>
                    <div className="relative">
                      <textarea
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="e.g. Can my landlord evict me without notice? What are my rights if I don't get PF?"
                        rows={5}
                        className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      />
                      <button
                        type="button"
                        onClick={toggleRecording}
                        className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium border border-border bg-background/80 hover:bg-muted"
                      >
                        {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        {isRecording ? "Stop" : "Voice"}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleAskQuestion}
                      disabled={!questionText.trim()}
                      className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl font-semibold text-sm hero-gradient-bg text-primary-foreground btn-press disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Get answer
                    </button>
                  </>
                )}
              </div>
            </ScrollReveal>

            {/* Right: Result */}
            <ScrollReveal delay={100}>
              <div className="space-y-4">
                <div className="bg-card rounded-2xl p-5 card-elevated space-y-4">
                  <h3 className="font-display font-semibold text-sm text-foreground">
                    Plain-language result
                  </h3>
                  {tab === "document" && explanation ? (
                    <>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {explanation.summary}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-foreground">Your rights</p>
                        <ul className="space-y-1.5">
                          {explanation.rights.map((r, i) => (
                            <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                          Source: {explanation.source}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(explanation.summary + "\n\n" + explanation.rights.join("\n") + "\n\nSource: " + explanation.source, "Copy")}
                          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium border border-border hover:bg-muted"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copyLabel}
                        </button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-foreground">Next steps</p>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {explanation.nextSteps.map((s, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="font-semibold text-primary">{i + 1}.</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : tab === "question" && qaAnswer ? (
                    <>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {qaAnswer.answer}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                          Source: {qaAnswer.source}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(qaAnswer!.answer + "\n\nSource: " + qaAnswer!.source, "Copy")}
                          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium border border-border hover:bg-muted"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copyLabel}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {tab === "document"
                        ? "Upload or paste a document and click “Explain this document” to get a summary, your rights, and next steps."
                        : "Ask a question about your legal rights or government schemes and click “Get answer” for a plain-language response with source citation."}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    This tool is for <span className="font-semibold text-foreground">awareness only</span>.
                    It does not replace legal advice. For your specific case, consult a lawyer or
                    contact your District Legal Services Authority (DLSA) for free legal aid.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RightsAssistant;
