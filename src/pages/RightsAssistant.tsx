import React, { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  FileText,
  MessageCircle,
  Loader2,
  BookOpen,
  Scale,
  Scan,
  Volume2,
  VolumeX,
} from "lucide-react";
import { createWorker } from "tesseract.js";
import mammoth from "mammoth";
import ScrollReveal from "@/components/ScrollReveal";
import { matchQuestion, mockExplainDocument, explainDocument, isRightsExplainConfigured, type ExplanationResult, type QaAnswer } from "@/lib/rightsAssistantApi";
import { fetchTtsAudio, isTtsConfigured } from "@/lib/ttsApi";
import { fetchSttTranscript, isSttConfigured } from "@/lib/sttApi";
import DocumentPanel from "@/components/rightsassistant/DocumentPanel";
import QuestionPanel from "@/components/rightsassistant/QuestionPanel";
import ResultPanel from "@/components/rightsassistant/ResultPanel";
import DisclaimerBanner from "@/components/rightsassistant/DisclaimerBanner";

type TabMode = "document" | "question";

const OUTPUT_LANG_OPTIONS: { value: string; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "mr", label: "Marathi" },
  { value: "gu", label: "Gujarati" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
];

const TTS_LOCALE: Record<string, string> = {
  en: "en-IN", hi: "hi-IN", mr: "mr-IN", ta: "ta-IN", te: "te-IN", gu: "gu-IN",
};

/** Simple script-based language hint for detected text. */
function detectLanguageHint(text: string): string {
  if (!text.trim()) return "—";
  const t = text.slice(0, 500);
  if (/[\u0900-\u097F]/.test(t)) return "Hindi / Devanagari";
  if (/[\u0B80-\u0BFF]/.test(t)) return "Tamil";
  if (/[\u0C00-\u0C7F]/.test(t)) return "Telugu";
  if (/[\u0A80-\u0AFF]/.test(t)) return "Gujarati";
  return "English (or similar)";
}

export default function RightsAssistant() {
  const [tab, setTab] = useState<TabMode>("document");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [outputLanguage, setOutputLanguage] = useState("en");
  const [ocrData, setOcrData] = useState<{ text: string; words: unknown[]; lines: unknown[]; confidence: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [documentQuery, setDocumentQuery] = useState("");
  const [isDocumentRecording, setIsDocumentRecording] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isExplainLoading, setIsExplainLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [qaAnswer, setQaAnswer] = useState<QaAnswer | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [isRecording, setIsRecording] = useState(false);
  const [isExplainSpeaking, setIsExplainSpeaking] = useState(false);
  const [isExplainTtsLoading, setIsExplainTtsLoading] = useState(false);
  const [hasVoiceInput, setHasVoiceInput] = useState(false);
  const [isDocumentTranscribing, setIsDocumentTranscribing] = useState(false);
  const [isQuestionTranscribing, setIsQuestionTranscribing] = useState(false);
  const recognitionRef = useRef<{ start(): void; stop(): void } | null>(null);
  const recordingModeRef = useRef<"document" | "question">("question");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTargetRef = useRef<"document" | "question">("document");
  const explainTtsAudioRef = useRef<HTMLAudioElement | null>(null);
  const explainTtsBlobUrlRef = useRef<string | null>(null);

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
      if (recordingModeRef.current === "document") setDocumentQuery(transcript);
      else setQuestionText(transcript);
    };
    rec.onend = () => {
      setIsRecording(false);
      setIsDocumentRecording(false);
    };
    recognitionRef.current = rec;
    setHasVoiceInput(Boolean(rec) || isSttConfigured());
  }, []);
  useEffect(() => {
    if (isSttConfigured()) setHasVoiceInput(true);
  }, []);

  const effectiveDocText = extractedText.trim();
  const isImage = (file: File) => file.type.startsWith("image/");

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      if (explainTtsBlobUrlRef.current) URL.revokeObjectURL(explainTtsBlobUrlRef.current);
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [previewUrl]);

  const handleFileChange = (file: File | null) => {
    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setDocumentFile(file);
    setExtractedText("");
    setOcrData(null);
    setPreviewUrl(null);
    setImageDimensions(null);
    setDetectedLang("");
    if (!file) return;
    if (isImage(file)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      const img = new window.Image();
      img.onload = () => setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = url;
    }
  };

  const isPdf = (file: File) =>
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  /** PDF.js worker URL and first-page render for document preview (like Lab Report Analyzer). */
  const PDF_WORKER_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.5.207/build/pdf.worker.min.mjs";
  const pdfFirstPageToImage = async (file: File): Promise<{ dataUrl: string; width: number; height: number }> => {
    const pdfjs = await import("pdfjs-dist");
    const { getDocument, GlobalWorkerOptions } = pdfjs;
    if (!GlobalWorkerOptions.workerSrc) GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    await page.render({ canvasContext: ctx, viewport } as never).promise;
    return {
      dataUrl: canvas.toDataURL("image/jpeg", 0.85),
      width: viewport.width,
      height: viewport.height,
    };
  };

  useEffect(() => {
    if (!documentFile || !isPdf(documentFile)) return;
    let cancelled = false;
    pdfFirstPageToImage(documentFile)
      .then(({ dataUrl, width, height }) => {
        if (!cancelled) {
          setPreviewUrl(dataUrl);
          setImageDimensions({ width, height });
        }
      })
      .catch(() => {
        if (!cancelled) setPreviewUrl(null);
      });
    return () => { cancelled = true; };
  }, [documentFile]);

  const isWordDoc = (file: File) => {
    const n = file.name.toLowerCase();
    return (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword" ||
      n.endsWith(".docx") ||
      n.endsWith(".doc")
    );
  };

  /** Render a PDF page to an image data URL for OCR (handles scanned/image PDFs and non-Latin scripts like Marathi). */
  const renderPdfPageToImage = async (
    page: { getViewport: (opts: { scale: number }) => { width: number; height: number }; render: (ctx: unknown) => { promise: Promise<void> } },
    scale: number
  ): Promise<string> => {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D not available");
    const renderContext = {
      canvasContext: ctx,
      viewport,
    };
    await page.render(renderContext as never).promise;
    return canvas.toDataURL("image/png");
  };

  /** Run OCR on a PDF; returns full text and first-page words/lines for box overlay. */
  const ocrPdf = async (file: File): Promise<{ text: string; confidence: number; words: unknown[]; lines: unknown[] }> => {
    const pdfjs = await import("pdfjs-dist");
    const { getDocument, GlobalWorkerOptions } = pdfjs;
    if (!GlobalWorkerOptions.workerSrc) {
      GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.5.207/build/pdf.worker.min.mjs";
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    const worker = await createWorker("mar+eng", undefined, { logger: () => {} });
    const parts: string[] = [];
    let lastConfidence = 0;
    let firstPageWords: unknown[] = [];
    let firstPageLines: unknown[] = [];
    try {
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const imageDataUrl = await renderPdfPageToImage(page, 2);
        const { data } = await worker.recognize(imageDataUrl, {}, { blocks: true });
        parts.push(data.text || "");
        lastConfidence = data.confidence ?? 0;
        if (i === 1) {
          const blocks = (data.blocks ?? []) as Array<{ paragraphs?: Array<{ lines?: unknown[] }> }>;
          firstPageLines = blocks.flatMap((b) => b.paragraphs ?? []).flatMap((p) => p.lines ?? []);
          firstPageWords = firstPageLines.flatMap((l: { words?: unknown[] }) => l.words ?? []);
        }
      }
    } finally {
      await worker.terminate();
    }
    const text = parts.join("\n\n");
    return { text, confidence: lastConfidence, words: firstPageWords, lines: firstPageLines };
  };

  const extractTextFromWord = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || "";
  };

  const runExtractText = async () => {
    if (!documentFile) return;
    setIsOcrLoading(true);
    setExtractedText("");
    setOcrData(null);
    setDetectedLang("");
    try {
      if (isPdf(documentFile)) {
        if (!previewUrl) {
          const first = await pdfFirstPageToImage(documentFile);
          setPreviewUrl(first.dataUrl);
          setImageDimensions({ width: first.width, height: first.height });
        }
        const { text, confidence, words, lines } = await ocrPdf(documentFile);
        setExtractedText(text);
        setDetectedLang(detectLanguageHint(text));
        setOcrData({ text, words, lines, confidence });
      } else if (isWordDoc(documentFile)) {
        const text = await extractTextFromWord(documentFile);
        setExtractedText(text);
        setDetectedLang(detectLanguageHint(text));
      } else {
        const worker = await createWorker("mar+eng", undefined, { logger: () => {} });
        const { data } = await worker.recognize(documentFile, {}, { blocks: true });
        const blocks = (data.blocks ?? []) as Array<{ paragraphs?: Array<{ lines?: unknown[] }> }>;
        const lines = blocks.flatMap((b) => b.paragraphs ?? []).flatMap((p) => p.lines ?? []);
        const words = lines.flatMap((l: { words?: unknown[] }) => l.words ?? []);
        setExtractedText(data.text || "");
        setDetectedLang(detectLanguageHint(data.text || ""));
        setOcrData({ text: data.text || "", words, lines, confidence: data.confidence ?? 0 });
        await worker.terminate();
      }
    } catch (err) {
      console.error(err);
      setExtractedText("");
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleExplainDocument = async () => {
    if (!effectiveDocText) return;
    setIsExplainLoading(true);
    setExplanation(null);
    try {
      if (isRightsExplainConfigured()) {
        const result = await explainDocument({
          document_text: effectiveDocText,
          user_query: documentQuery.trim() || undefined,
          output_language: outputLanguage,
        });
        setExplanation(result);
      } else {
        setExplanation(
          mockExplainDocument(effectiveDocText, documentQuery.trim() || undefined, outputLanguage)
        );
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      setExplanation({
        summary: `Could not get summary from backend. ${message}`,
        rights: [],
        source: "",
        nextSteps: [],
      });
    } finally {
      setIsExplainLoading(false);
    }
  };

  const getExplanationFullText = (ex: ExplanationResult): string => {
    const parts = [ex.summary, ...ex.rights, "Next steps:", ...ex.nextSteps];
    return parts.join(". ");
  };

  const speakExplanation = async () => {
    if (!explanation) return;
    const text = getExplanationFullText(explanation);
    if (isExplainSpeaking) {
      if (explainTtsAudioRef.current) explainTtsAudioRef.current.pause();
      explainTtsAudioRef.current = null;
      if (explainTtsBlobUrlRef.current) URL.revokeObjectURL(explainTtsBlobUrlRef.current);
      explainTtsBlobUrlRef.current = null;
      window.speechSynthesis.cancel();
      setIsExplainSpeaking(false);
      return;
    }
    if (isTtsConfigured()) {
      setIsExplainTtsLoading(true);
      try {
        const url = await fetchTtsAudio({ text, language: outputLanguage });
        if (url) {
          explainTtsBlobUrlRef.current = url;
          const audio = new Audio(url);
          explainTtsAudioRef.current = audio;
          audio.onended = () => {
            if (explainTtsBlobUrlRef.current) URL.revokeObjectURL(explainTtsBlobUrlRef.current);
            explainTtsBlobUrlRef.current = null;
            explainTtsAudioRef.current = null;
            setIsExplainSpeaking(false);
          };
          audio.onerror = () => {
            if (explainTtsBlobUrlRef.current) URL.revokeObjectURL(explainTtsBlobUrlRef.current);
            explainTtsBlobUrlRef.current = null;
            explainTtsAudioRef.current = null;
            setIsExplainSpeaking(false);
          };
          await audio.play();
          setIsExplainSpeaking(true);
          return;
        }
      } catch {
        // fallback to browser
      } finally {
        setIsExplainTtsLoading(false);
      }
    }
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = TTS_LOCALE[outputLanguage] ?? "en-IN";
    const voices = synth.getVoices();
    const preferred = voices.find((v) => v.lang === utterance.lang || v.lang.replace(/_/g, "-").startsWith((utterance.lang || "").slice(0, 2)));
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => setIsExplainSpeaking(false);
    synth.speak(utterance);
    setIsExplainSpeaking(true);
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

  const startSttRecording = (target: "document" | "question") => {
    recordingTargetRef.current = target;
    chunksRef.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current = null;
        const target_ = recordingTargetRef.current;
        if (target_ === "document") setIsDocumentRecording(false);
        else setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (blob.size > 0) {
          if (target_ === "document") setIsDocumentTranscribing(true);
          else setIsQuestionTranscribing(true);
          const lang = target_ === "document" ? outputLanguage : "en";
          fetchSttTranscript({ audioBlob: blob, language: lang }).then((text) => {
            if (text) {
              if (target_ === "document") setDocumentQuery((prev) => (prev ? `${prev} ${text}` : text).trim());
              else setQuestionText((prev) => (prev ? `${prev} ${text}` : text).trim());
            }
          }).finally(() => {
            if (target_ === "document") setIsDocumentTranscribing(false);
            else setIsQuestionTranscribing(false);
          });
        }
      };
      recorder.start();
      if (target === "document") setIsDocumentRecording(true);
      else setIsRecording(true);
    }).catch((err) => {
      console.error("Microphone error:", err);
      alert("Microphone access is needed for voice input.");
    });
  };

  const stopSttRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
  };

  const toggleDocumentRecording = () => {
    if (isSttConfigured()) {
      if (isDocumentRecording || isDocumentTranscribing) {
        stopSttRecording();
        return;
      }
      startSttRecording("document");
      return;
    }
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isDocumentRecording) {
      rec.stop();
      setIsDocumentRecording(false);
    } else {
      recordingModeRef.current = "document";
      rec.start();
      setIsDocumentRecording(true);
    }
  };

  const toggleRecording = () => {
    if (isSttConfigured()) {
      if (isRecording || isQuestionTranscribing) {
        stopSttRecording();
        return;
      }
      startSttRecording("question");
      return;
    }
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isRecording) {
      rec.stop();
      setIsRecording(false);
    } else {
      recordingModeRef.current = "question";
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
                    <span className="font-semibold text-foreground">Upload a document</span> (image, PDF, Word)
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
          <div className="mx-auto mb-6 flex w-fit gap-2 rounded-xl border border-border bg-muted/50 p-1">
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
                    previewUrl={previewUrl}
                    previewDimensions={imageDimensions}
                    outputLanguage={outputLanguage}
                    onOutputLanguageChange={setOutputLanguage}
                    outputLangOptions={OUTPUT_LANG_OPTIONS}
                    isOcrLoading={isOcrLoading}
                    isExplainLoading={isExplainLoading}
                    onFileChange={handleFileChange}
                    onExtractText={runExtractText}
                    onExplain={handleExplainDocument}
                    canExplain={!!effectiveDocText}
                    documentQuery={documentQuery}
                    onDocumentQueryChange={setDocumentQuery}
                    isDocumentRecording={isDocumentRecording}
                    isDocumentTranscribing={isDocumentTranscribing}
                    onToggleDocumentRecording={toggleDocumentRecording}
                    hasVoiceInput={hasVoiceInput}
                  />
                ) : (
                  <QuestionPanel
                    questionText={questionText}
                    isRecording={isRecording}
                    isQuestionTranscribing={isQuestionTranscribing}
                    onQuestionChange={setQuestionText}
                    onAsk={handleAskQuestion}
                    onToggleRecording={toggleRecording}
                    onSuggestedQuestion={handleSuggestedQuestion}
                  />
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="space-y-4">
                {tab === "document" && (extractedText || ocrData) && (
                  <div className="card-elevated rounded-2xl border border-border bg-card p-5">
                    <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                      <Scan className="h-4 w-4 text-primary" />
                      OCR result
                    </h3>
                    {/* Document preview with recognised text boxes (when we have image + box data) */}
                    {previewUrl && imageDimensions && (
                      <div
                        className="relative mb-4 overflow-hidden rounded-xl border border-border bg-black/5"
                        style={{ aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}` }}
                      >
                        <img src={previewUrl} alt="Document" className="absolute inset-0 h-full w-full object-contain" />
                        {ocrData && (ocrData.words?.length > 0 || ocrData.lines?.length > 0) && (
                          <svg
                            className="absolute inset-0 h-full w-full pointer-events-none"
                            viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
                            preserveAspectRatio="xMidYMid meet"
                          >
                            {(ocrData.lines as Array<{ bbox?: { x0?: number; y0?: number; x1?: number; y1?: number } }>).map((line, i) => {
                              const b = line.bbox ?? {};
                              const w = (b.x1 ?? b.x0 ?? 0) - (b.x0 ?? 0);
                              const h = (b.y1 ?? b.y0 ?? 0) - (b.y0 ?? 0);
                              if (w <= 0 || h <= 0) return null;
                              return (
                                <rect key={`l-${i}`} x={b.x0} y={b.y0} width={w} height={h} fill="rgba(239,68,68,0.12)" stroke="#dc2626" strokeWidth={2} strokeDasharray="4 2" />
                              );
                            })}
                            {(ocrData.words as Array<{ bbox?: { x0?: number; y0?: number; x1?: number; y1?: number } }>).map((word, i) => {
                              const b = word.bbox ?? {};
                              const w = (b.x1 ?? b.x0 ?? 0) - (b.x0 ?? 0);
                              const h = (b.y1 ?? b.y0 ?? 0) - (b.y0 ?? 0);
                              if (w <= 0 || h <= 0) return null;
                              return (
                                <rect key={`w-${i}`} x={b.x0} y={b.y0} width={w} height={h} fill="rgba(239,68,68,0.15)" stroke="#b91c1c" strokeWidth={1.5} />
                              );
                            })}
                          </svg>
                        )}
                      </div>
                    )}
                    {/* Confidence (Tesseract returns 0–100; some APIs use 0–1) */}
                    {ocrData && typeof ocrData.confidence === "number" && (
                      <p className="mb-3 text-xs font-medium text-muted-foreground">
                        Confidence: <span className="text-foreground">{Math.min(100, Math.round(ocrData.confidence <= 1 ? ocrData.confidence * 100 : ocrData.confidence))}%</span>
                      </p>
                    )}
                    {/* Plain text below */}
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Plain text</p>
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-border/50 bg-muted/30 p-3 text-sm font-mono text-foreground/90 whitespace-pre-wrap">
                      {extractedText || ocrData?.text || "No text extracted."}
                    </div>
                  </div>
                )}
                <ResultPanel
                  tab={tab}
                  explanation={explanation}
                  qaAnswer={qaAnswer}
                  copyLabel={copyLabel}
                  onCopy={handleCopy}
                  outputLanguage={outputLanguage}
                  isExplainSpeaking={isExplainSpeaking}
                  isExplainTtsLoading={isExplainTtsLoading}
                  onListenExplanation={speakExplanation}
                />
              </div>
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
