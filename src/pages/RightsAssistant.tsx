import React, { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  FileText,
  MessageCircle,
  Loader2,
  BookOpen,
  Scale,
} from "lucide-react";
import { createWorker } from "tesseract.js";
import ScrollReveal from "@/components/ScrollReveal";
import { matchQuestion, mockExplainDocument, type ExplanationResult, type QaAnswer } from "@/lib/rightsAssistantApi";
import DocumentPanel from "@/components/rightsassistant/DocumentPanel";
import QuestionPanel from "@/components/rightsassistant/QuestionPanel";
import ResultPanel from "@/components/rightsassistant/ResultPanel";
import DisclaimerBanner from "@/components/rightsassistant/DisclaimerBanner";

type TabMode = "document" | "question";

export default function RightsAssistant() {
  const [tab, setTab] = useState<TabMode>("document");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPaste, setDocumentPaste] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isExplainLoading, setIsExplainLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [qaAnswer, setQaAnswer] = useState<QaAnswer | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<{ start(): void; stop(): void } | null>(null);

  useEffect(() => {
    const Win = window as unknown as {
      SpeechRecognition?: new () => unknown;
      webkitSpeechRecognition?: new () => unknown;
    };
    const SR = Win.SpeechRecognition || Win.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR() as {
      start(): void;
      stop(): void;
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onresult: ((e: { results: Array<{ 0: { transcript: string } }> }) => void) | null;
      onend: (() => void) | null;
    };
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-IN";
    rec.onresult = (event: { results: Array<{ 0: { transcript: string } }> }) => {
      const transcript = event.results.map((r) => r[0].transcript).join("");
      setQuestionText(transcript);
    };
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
  }, []);

  const effectiveDocText = extractedText.trim() || documentPaste.trim();

  const handleFileChange = (file: File | null) => {
    setDocumentFile(file);
    if (!file) setExtractedText("");
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

  const handleSuggestedQuestion = (question: string) => {
    setQuestionText(question);
    const result = matchQuestion(question);
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

  const handleCopy = async (text: string) => {
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
        <div className="container-content grid items-center gap-8 lg:grid-cols-[3fr,2fr]">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
              Feature 03 — Rights Assistant
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              Legal documents in <span className="hero-gradient-text">plain language</span>.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Upload a document (agreement, notice, form) or ask any question about your legal
              rights and government schemes. Get a simple summary, your rights in plain language,
              and source citations — no lawyer required to get started.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5">
                <BookOpen className="h-3.5 w-3.5 text-accent" />
                For awareness only; not legal advice
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5">
                <Scale className="h-3.5 w-3.5 text-accent" />
                Acts & sections cited
              </span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div className="card-elevated rounded-2xl bg-card p-6 lg:p-8">
              <h3 className="mb-4 font-display text-sm font-semibold text-foreground">How it works</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full hero-gradient-bg text-xs font-bold text-primary-foreground">
                    1
                  </div>
                  <p>
                    <span className="font-semibold text-foreground">Upload a document</span> (image)
                    or <span className="font-semibold text-foreground">ask a question</span> in text
                    or voice.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full hero-gradient-bg text-xs font-bold text-primary-foreground">
                    2
                  </div>
                  <p>
                    We extract text (OCR) or match your question to rights and schemes.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full hero-gradient-bg text-xs font-bold text-primary-foreground">
                    3
                  </div>
                  <p>
                    You get a{" "}
                    <span className="font-semibold text-foreground">plain-language summary</span> with
                    source (act/section) and next steps.
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
          <div className="mb-6 flex w-fit gap-2 rounded-xl border border-border bg-muted/50 p-1">
            <button
              type="button"
              onClick={() => setTab("document")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === "document"
                  ? "border border-border bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-4 w-4" />
              Explain a document
            </button>
            <button
              type="button"
              onClick={() => setTab("question")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === "question"
                  ? "border border-border bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              Ask about rights
            </button>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[1.2fr,1fr]">
            <ScrollReveal>
              <div className="card-elevated space-y-6 rounded-2xl bg-card p-6 lg:p-8">
                {tab === "document" ? (
                  <DocumentPanel
                    documentFile={documentFile}
                    documentPaste={documentPaste}
                    isOcrLoading={isOcrLoading}
                    isExplainLoading={isExplainLoading}
                    onFileChange={handleFileChange}
                    onPasteChange={setDocumentPaste}
                    onExtractText={runOcr}
                    onExplain={handleExplainDocument}
                    canExplain={!!effectiveDocText}
                  />
                ) : (
                  <QuestionPanel
                    questionText={questionText}
                    isRecording={isRecording}
                    onQuestionChange={setQuestionText}
                    onAsk={handleAskQuestion}
                    onToggleRecording={toggleRecording}
                    onSuggestedQuestion={handleSuggestedQuestion}
                  />
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <ResultPanel
                tab={tab}
                explanation={explanation}
                qaAnswer={qaAnswer}
                copyLabel={copyLabel}
                onCopy={handleCopy}
              />
              <div className="mt-4">
                <DisclaimerBanner />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
