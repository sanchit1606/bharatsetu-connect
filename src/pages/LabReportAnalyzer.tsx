import React, { useState, useRef, useEffect } from "react";
import {
  Upload, X, Loader2, Scan, FileImage, AlertCircle, CheckCircle2,
  TrendingUp, Apple, Info, Volume2, VolumeX
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchTtsAudio, isTtsConfigured } from "@/lib/ttsApi";
import { createWorker } from "tesseract.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell
} from "recharts";
import ScrollReveal from "@/components/ScrollReveal";
import {
  analyzeLabReport,
  isLabReportBackendConfigured,
  type LabReportAnalysisResult,
  type LabReportParameter,
} from "@/lib/labReportApi";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPT_TYPES = "image/jpeg,image/png,image/webp,image/gif,application/pdf";

function compressImageForApi(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxW = 1200;
      const maxH = 1200;
      let { width, height } = img;
      if (width > maxW || height > maxH) {
        if (width > height) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        } else {
          width = Math.round((width * maxH) / height);
          height = maxH;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image compression failed"));
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] ?? "" : dataUrl;
            resolve({ base64, mediaType: "image/jpeg" });
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        0.82
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image failed to load"));
    };
    img.src = url;
  });
}

/** PDF.js worker URL (same version as package) so getDocument works in the browser. */
const PDF_WORKER_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.5.207/build/pdf.worker.min.mjs";

/** Convert PDF first page to image data URL (requires pdfjs-dist). */
async function pdfFirstPageToImage(file: File): Promise<{ dataUrl: string; width: number; height: number }> {
  try {
    const pdfjs = await import("pdfjs-dist");
    const { getDocument, GlobalWorkerOptions } = pdfjs;
    if (!GlobalWorkerOptions.workerSrc) {
      GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
    }
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    const renderTask = page.render({ canvasContext: ctx, viewport });
    await renderTask.promise;
    return {
      dataUrl: canvas.toDataURL("image/jpeg", 0.85),
      width: viewport.width,
      height: viewport.height,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`PDF could not be loaded. ${msg}. Try uploading an image (screenshot) of the report instead.`);
  }
}

const TTS_LOCALE: Record<string, string> = {
  en: "en-IN", hi: "hi-IN", mr: "mr-IN", ta: "ta-IN", te: "te-IN",
  bn: "bn-IN", gu: "gu-IN", kn: "kn-IN", ml: "ml-IN", ur: "ur-IN",
};

const REPORT_LANG_OPTIONS: { value: string; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "mr", label: "Marathi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "gu", label: "Gujarati" },
  { value: "bn", label: "Bengali" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
  { value: "ur", label: "Urdu" },
];

export default function LabReportAnalyzer() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDimensions, setPreviewDimensions] = useState<{ width: number; height: number } | null>(null);
  const [ocrData, setOcrData] = useState<{
    text: string;
    words: unknown[];
    lines: unknown[];
    confidence: number;
  } | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [age, setAge] = useState<string>("30");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [reportLang, setReportLang] = useState<string>("en");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<LabReportAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSummarySpeaking, setIsSummarySpeaking] = useState(false);
  const [isSummaryTtsLoading, setIsSummaryTtsLoading] = useState(false);
  const [isSuggestionsSpeaking, setIsSuggestionsSpeaking] = useState(false);
  const [isSuggestionsTtsLoading, setIsSuggestionsTtsLoading] = useState(false);
  const summaryTtsAudioRef = useRef<HTMLAudioElement | null>(null);
  const summaryTtsBlobUrlRef = useRef<string | null>(null);
  const suggestionsTtsAudioRef = useRef<HTMLAudioElement | null>(null);
  const suggestionsTtsBlobUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (summaryTtsBlobUrlRef.current) URL.revokeObjectURL(summaryTtsBlobUrlRef.current);
      if (suggestionsTtsBlobUrlRef.current) URL.revokeObjectURL(suggestionsTtsBlobUrlRef.current);
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const isPdf = file?.type === "application/pdf";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_FILE_SIZE) {
      setError(t("lab_report_page.error_too_large", { defaultValue: "File must be under 10 MB." }));
      return;
    }
    setError(null);
    setResult(null);
    setOcrData(null);
    setFile(selected);

    if (selected.type === "application/pdf") {
      try {
        const { dataUrl } = await pdfFirstPageToImage(selected);
        setPreviewUrl(dataUrl);
        const img = new window.Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            setPreviewDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            resolve();
          };
          img.onerror = () => reject(new Error("PDF preview failed"));
          img.src = dataUrl;
        });
      } catch (err) {
        console.error("PDF render error:", err);
        setError(t("lab_report_page.error_pdf", { defaultValue: "Could not load PDF. Try uploading an image instead." }));
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
      return;
    }

    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    const img = new window.Image();
    img.onload = () => {
      setPreviewDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewDimensions(null);
    setOcrData(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOCR = async () => {
    if (!previewUrl) return;
    setIsOcrLoading(true);
    setError(null);
    try {
      const worker = await createWorker("eng");
      // Use preview image for both file uploads and PDF (first page rendered as image)
      const { data } = await worker.recognize(previewUrl, {}, { blocks: true });
      const blocks = (data.blocks ?? []) as Array<{ paragraphs?: Array<{ lines?: unknown[] }> }>;
      const lines = blocks.flatMap((b) => b.paragraphs ?? []).flatMap((p) => p.lines ?? []);
      const words = lines.flatMap((l: { words?: unknown[] }) => l.words ?? []).filter((w: { confidence?: number }) => (w.confidence ?? 0) > 50);
      setOcrData({
        text: data.text,
        words,
        lines,
        confidence: data.confidence ?? 0,
      });
      await worker.terminate();
    } catch (err) {
      console.error("OCR error:", err);
      setError(t("lab_report_page.error_ocr", { defaultValue: "OCR failed. You can still analyze with the image." }));
    } finally {
      setIsOcrLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    const ageNum = parseInt(age, 10);
    if (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError(t("lab_report_page.error_age", { defaultValue: "Please enter a valid age (1–120)." }));
      return;
    }
    if (!file && !ocrData?.text) {
      setError(t("lab_report_page.error_upload", { defaultValue: "Please upload an image or PDF, or run OCR first." }));
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    const scrollToOutput = () => document.getElementById("lab-report-output")?.scrollIntoView({ behavior: "smooth" });

    if (isLabReportBackendConfigured()) {
      try {
        let imageBase64: string | undefined;
        let imageMediaType = "image/jpeg";
        if (file) {
          if (file.type === "application/pdf") {
            const { dataUrl } = await pdfFirstPageToImage(file);
            imageBase64 = dataUrl.includes(",") ? dataUrl.split(",")[1] ?? "" : dataUrl;
          } else {
            const compressed = await compressImageForApi(file);
            imageBase64 = compressed.base64;
            imageMediaType = compressed.mediaType;
          }
        }
        const data = await analyzeLabReport({
          image_base64: imageBase64,
          image_media_type: imageMediaType,
          ocr_text: ocrData?.text,
          age: ageNum,
          gender,
          language: reportLang,
        });
        setResult(data);
        setTimeout(scrollToOutput, 100);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // Mock for demo when backend not configured
      setTimeout(() => {
        setResult({
          parameters: [
            { name: "Haemoglobin", value: 10.2, unit: "g/dL", reference_low: 12, reference_high: 16, status: "low" },
            { name: "RBC", value: 4.8, unit: "million/µL", reference_low: 4.5, reference_high: 5.5, status: "normal" },
            { name: "WBC", value: 3.2, unit: "thousand/µL", reference_low: 4, reference_high: 11, status: "low" },
            { name: "Platelets", value: 2.2, unit: "lakh/µL", reference_low: 1.5, reference_high: 4, status: "normal" },
            { name: "Fasting Glucose", value: 98, unit: "mg/dL", reference_low: 70, reference_high: 100, status: "normal" },
          ],
          summary: "Your report shows mild anaemia (low haemoglobin) and slightly low WBC. Other parameters are within normal range for your age and gender. Consider iron-rich diet and a follow-up with your doctor.",
          suggestions: [
            { parameter: "Haemoglobin", suggestion: "Eat iron-rich foods: spinach, dates, pomegranate, lentils, and green leafy vegetables. Vitamin C (citrus, amla) helps absorption. Avoid tea immediately after meals." },
            { parameter: "WBC", suggestion: "Eat a balanced diet with adequate protein and vitamins. Include yogurt, citrus fruits, and green vegetables. Ensure good sleep and hygiene. Consult a doctor if it persists." },
          ],
        });
        setIsAnalyzing(false);
        setTimeout(scrollToOutput, 100);
      }, 2000);
    }
  };

  const speakSummary = async () => {
    if (!result?.summary) return;
    if (isSummarySpeaking) {
      if (summaryTtsAudioRef.current) {
        summaryTtsAudioRef.current.pause();
        summaryTtsAudioRef.current = null;
      }
      if (summaryTtsBlobUrlRef.current) {
        URL.revokeObjectURL(summaryTtsBlobUrlRef.current);
        summaryTtsBlobUrlRef.current = null;
      }
      window.speechSynthesis.cancel();
      setIsSummarySpeaking(false);
      return;
    }
    if (isTtsConfigured()) {
      setIsSummaryTtsLoading(true);
      try {
        const url = await fetchTtsAudio({ text: result.summary, language: reportLang });
        if (url) {
          summaryTtsBlobUrlRef.current = url;
          const audio = new Audio(url);
          summaryTtsAudioRef.current = audio;
          audio.onended = () => {
            if (summaryTtsBlobUrlRef.current) URL.revokeObjectURL(summaryTtsBlobUrlRef.current);
            summaryTtsBlobUrlRef.current = null;
            summaryTtsAudioRef.current = null;
            setIsSummarySpeaking(false);
          };
          audio.onerror = () => {
            if (summaryTtsBlobUrlRef.current) URL.revokeObjectURL(summaryTtsBlobUrlRef.current);
            summaryTtsBlobUrlRef.current = null;
            summaryTtsAudioRef.current = null;
            setIsSummarySpeaking(false);
          };
          await audio.play();
          setIsSummarySpeaking(true);
          return;
        }
      } catch {
        // fall through to browser TTS
      } finally {
        setIsSummaryTtsLoading(false);
      }
    }
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(result.summary);
    utterance.lang = TTS_LOCALE[reportLang] ?? "en-IN";
    const voices = synth.getVoices();
    const preferred = voices.find((v) => v.lang === utterance.lang || v.lang.replace(/_/g, "-").startsWith((utterance.lang || "").slice(0, 2)));
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => setIsSummarySpeaking(false);
    synth.speak(utterance);
    setIsSummarySpeaking(true);
  };

  const speakSuggestions = async () => {
    if (!result?.suggestions?.length) return;
    const suggestionsText = result.suggestions
      .map((s) => `${s.parameter}: ${s.suggestion}`)
      .join(". ");
    if (isSuggestionsSpeaking) {
      if (suggestionsTtsAudioRef.current) {
        suggestionsTtsAudioRef.current.pause();
        suggestionsTtsAudioRef.current = null;
      }
      if (suggestionsTtsBlobUrlRef.current) {
        URL.revokeObjectURL(suggestionsTtsBlobUrlRef.current);
        suggestionsTtsBlobUrlRef.current = null;
      }
      window.speechSynthesis.cancel();
      setIsSuggestionsSpeaking(false);
      return;
    }
    if (isTtsConfigured()) {
      setIsSuggestionsTtsLoading(true);
      try {
        const url = await fetchTtsAudio({ text: suggestionsText, language: reportLang });
        if (url) {
          suggestionsTtsBlobUrlRef.current = url;
          const audio = new Audio(url);
          suggestionsTtsAudioRef.current = audio;
          audio.onended = () => {
            if (suggestionsTtsBlobUrlRef.current) URL.revokeObjectURL(suggestionsTtsBlobUrlRef.current);
            suggestionsTtsBlobUrlRef.current = null;
            suggestionsTtsAudioRef.current = null;
            setIsSuggestionsSpeaking(false);
          };
          audio.onerror = () => {
            if (suggestionsTtsBlobUrlRef.current) URL.revokeObjectURL(suggestionsTtsBlobUrlRef.current);
            suggestionsTtsBlobUrlRef.current = null;
            suggestionsTtsAudioRef.current = null;
            setIsSuggestionsSpeaking(false);
          };
          await audio.play();
          setIsSuggestionsSpeaking(true);
          return;
        }
      } catch {
        // fall through to browser TTS
      } finally {
        setIsSuggestionsTtsLoading(false);
      }
    }
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(suggestionsText);
    utterance.lang = TTS_LOCALE[reportLang] ?? "en-IN";
    const voices = synth.getVoices();
    const preferred = voices.find((v) => v.lang === utterance.lang || v.lang.replace(/_/g, "-").startsWith((utterance.lang || "").slice(0, 2)));
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => setIsSuggestionsSpeaking(false);
    synth.speak(utterance);
    setIsSuggestionsSpeaking(true);
  };

  const statusColor = (status: LabReportParameter["status"]) => {
    switch (status) {
      case "normal": return "text-green-600 dark:text-green-400";
      case "low": return "text-blue-600 dark:text-blue-400";
      case "high": return "text-amber-600 dark:text-amber-400";
      case "borderline": return "text-yellow-600 dark:text-yellow-400";
      default: return "text-muted-foreground";
    }
  };

  const barColor = (status: LabReportParameter["status"]) => {
    switch (status) {
      case "normal": return "#22c55e";
      case "low": return "#3b82f6";
      case "high": return "#f59e0b";
      case "borderline": return "#eab308";
      default: return "#94a3b8";
    }
  };

  const chartData = result?.parameters.map((p) => ({
    name: p.name.length > 12 ? p.name.slice(0, 10) + "…" : p.name,
    fullName: p.name,
    value: p.value,
    refLow: p.reference_low,
    refHigh: p.reference_high,
    status: p.status,
  })) ?? [];

  return (
    <div className="min-h-screen pt-16 pb-20">
      <div className="container-content px-4 sm:px-6 lg:px-8 py-8">
        <ScrollReveal>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
            {t("features_page.f4_badge", { defaultValue: "Feature 04" })}
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-4 mb-2">
            {t("lab_report_page.title", { defaultValue: "Lab Report Analyzer" })}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {t("lab_report_page.subtitle", { defaultValue: "Upload a blood or pathology report (image or PDF). We'll extract parameters, compare with healthy reference ranges for your age and gender, and suggest diet or lifestyle remedies where needed." })}
          </p>
        </ScrollReveal>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Upload + OCR + Demographics */}
          <ScrollReveal delay={50}>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                {t("lab_report_page.upload_heading", { defaultValue: "Report & details" })}
              </h2>

              {!previewUrl ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                  <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground text-center px-4">
                    {t("lab_report_page.upload_hint", { defaultValue: "Drop image or PDF here, or click to browse" })}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, GIF, PDF</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT_TYPES}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="space-y-2">
                  <div
                    className="relative rounded-xl overflow-hidden border border-border bg-black/5"
                    style={previewDimensions ? { aspectRatio: `${previewDimensions.width} / ${previewDimensions.height}` } : undefined}
                  >
                    <img
                      src={previewUrl}
                      alt="Report preview"
                      className="w-full h-full object-contain"
                    />
                    {isPdf && (
                      <div className="absolute top-2 left-2 px-2 py-1 rounded bg-primary/90 text-primary-foreground text-xs font-medium flex items-center gap-1">
                        <FileImage className="w-3 h-3" /> {t("lab_report_page.pdf_page_badge", { defaultValue: "PDF (page 1)" })}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-background/90 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                      aria-label={t("lab_report_page.remove_button_label", { defaultValue: "Remove" })}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleOCR}
                      disabled={isOcrLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      {isOcrLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                      {isOcrLoading ? t("lab_report_page.ocr_running", { defaultValue: "Extracting text…" }) : t("lab_report_page.run_ocr", { defaultValue: "Extract text (OCR)" })}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t("lab_report_page.age", { defaultValue: "Age (years)" })}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t("lab_report_page.gender", { defaultValue: "Gender" })}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "male" | "female")}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="male">{t("lab_report_page.male", { defaultValue: "Male" })}</option>
                    <option value="female">{t("lab_report_page.female", { defaultValue: "Female" })}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t("lab_report_page.language", { defaultValue: "Language" })}
                  </label>
                  <select
                    value={reportLang}
                    onChange={(e) => setReportLang(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground"
                  >
                    {REPORT_LANG_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={triggerAnalysis}
                disabled={isAnalyzing || (!file && !ocrData?.text)}
                className="w-full h-12 rounded-xl font-semibold hero-gradient-bg text-primary-foreground btn-press flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("lab_report_page.analyzing", { defaultValue: "Analyzing…" })}
                  </>
                ) : (
                  t("lab_report_page.analyze", { defaultValue: "Analyze report" })
                )}
              </button>

              {result && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      {t("lab_report_page.summary_heading", { defaultValue: "Summary" })}
                    </h3>
                    <button
                      type="button"
                      onClick={speakSummary}
                      disabled={isSummaryTtsLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                      title={isSummarySpeaking ? t("lab_report_page.listen_stop", { defaultValue: "Stop" }) : t("lab_report_page.listen_summary", { defaultValue: "Listen to summary" })}
                    >
                      {isSummarySpeaking ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                      <span className="sr-only sm:not-sr-only">
                        {isSummaryTtsLoading ? t("lab_report_page.listen_loading", { defaultValue: "Loading…" }) : isSummarySpeaking ? t("lab_report_page.listen_stop", { defaultValue: "Stop" }) : t("lab_report_page.listen_summary", { defaultValue: "Listen to summary" })}
                      </span>
                    </button>
                  </div>
                  <ul className="text-sm text-muted-foreground leading-relaxed list-disc list-inside space-y-1.5">
                    {(result.summary
                      .split(/\n+|\.\s+/)
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((s) => (s.endsWith(".") ? s : `${s}.`)) as string[]).map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Right: OCR Results only (with boxes + text) or placeholder */}
          <ScrollReveal delay={100}>
            <div className="lg:sticky lg:top-24 space-y-4">
              {ocrData && previewUrl && previewDimensions ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-xl">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Scan className="w-4 h-4 text-primary" /> {t("lab_report_page.ocr_results", { defaultValue: "OCR Results" })}
                    </h4>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      ocrData.confidence >= 80 ? "bg-green-500/10 text-green-600 border border-green-200 dark:border-green-900" :
                      ocrData.confidence >= 50 ? "bg-yellow-500/10 text-yellow-600 border border-yellow-200 dark:border-yellow-900" :
                      "bg-red-500/10 text-red-600 border border-red-200 dark:border-red-900"
                    }`}>
                      {t("lab_report_page.confidence", { defaultValue: "Confidence" })}: {Math.round(ocrData.confidence)}%
                    </span>
                  </div>
                  <div
                    className="relative rounded-xl overflow-hidden border border-border bg-black/5"
                    style={{ aspectRatio: `${previewDimensions.width} / ${previewDimensions.height}` }}
                  >
                    <img
                      src={previewUrl}
                      alt="Report with OCR regions"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none z-10"
                      viewBox={`0 0 ${previewDimensions.width} ${previewDimensions.height}`}
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {(ocrData.lines as Array<{ bbox?: { x0?: number; y0?: number; x1?: number; y1?: number } }>).map((line, i) => {
                        const b = line.bbox ?? {};
                        const w = (b.x1 ?? b.x0 ?? 0) - (b.x0 ?? 0);
                        const h = (b.y1 ?? b.y0 ?? 0) - (b.y0 ?? 0);
                        if (w <= 0 || h <= 0) return null;
                        return (
                          <rect
                            key={`line-${i}`}
                            x={b.x0}
                            y={b.y0}
                            width={w}
                            height={h}
                            fill="rgba(239, 68, 68, 0.12)"
                            stroke="#dc2626"
                            strokeWidth={Math.max(previewDimensions.width * 0.003, 2)}
                            strokeDasharray="6 4"
                          />
                        );
                      })}
                      {(ocrData.words as Array<{ bbox?: { x0?: number; y0?: number; x1?: number; y1?: number } }>).map((word, i) => {
                        const b = word.bbox ?? {};
                        const w = (b.x1 ?? b.x0 ?? 0) - (b.x0 ?? 0);
                        const h = (b.y1 ?? b.y0 ?? 0) - (b.y0 ?? 0);
                        if (w <= 0 || h <= 0) return null;
                        return (
                          <rect
                            key={`word-${i}`}
                            x={b.x0}
                            y={b.y0}
                            width={w}
                            height={h}
                            fill="rgba(239, 68, 68, 0.15)"
                            stroke="#b91c1c"
                            strokeWidth={Math.max(previewDimensions.width * 0.002, 1.5)}
                          />
                        );
                      })}
                    </svg>
                  </div>
                  <div className="p-4 bg-muted/30 border border-border rounded-xl">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                      {t("lab_report_page.recognized_text", { defaultValue: "Recognized text" })}
                    </h4>
                    <div className="text-sm text-foreground/80 font-mono bg-background/50 p-3 rounded-lg border border-border/50 max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {ocrData.text || t("lab_report_page.no_text_detected", { defaultValue: "No text detected." })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center justify-center min-h-[280px] text-center text-muted-foreground">
                  <Info className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-sm">
                    {t("lab_report_page.ocr_placeholder", { defaultValue: "Upload a report and click “Extract text (OCR)” to see detected text and boxes here." })}
                  </p>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* Full result: charts, table, suggestions (in report language) */}
        {result && (() => {
          return (
          <div id="lab-report-output" className="mt-12 space-y-10">
            {chartData.length > 0 && (
              <ScrollReveal>
                <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {t("lab_report_page.chart_heading", { defaultValue: "Your values vs reference range" })}
                </h2>
                <div className="rounded-xl border border-border bg-card p-4 overflow-x-auto">
                  <div className="min-w-[500px] h-[380px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11 }}
                          angle={-25}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-sm">
                                <p className="font-semibold">{d.fullName}</p>
                                <p>{t("lab_report_page.your_value_label", { defaultValue: "Your value" })}: <strong>{d.value}</strong></p>
                                <p>{t("lab_report_page.normal_range_label", { defaultValue: "Normal range" })}: {d.refLow} – {d.refHigh}</p>
                                <p className={statusColor(d.status)}>{t("lab_report_page.status_label", { defaultValue: "Status" })}: {d.status}</p>
                              </div>
                            );
                          }}
                        />
                        <ReferenceLine y={0} stroke="currentColor" strokeOpacity={0.3} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} name={t("lab_report_page.your_value_label", { defaultValue: "Your value" })}>
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={barColor(result.parameters[i]?.status ?? "normal")} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {result.parameters.length > 0 && (
              <ScrollReveal>
                <h2 className="text-xl font-display font-bold text-foreground mb-4">
                  {t("lab_report_page.table_heading", { defaultValue: "Parameter comparison" })}
                </h2>
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="text-left p-3 font-semibold text-foreground">{t("lab_report_page.param_label", { defaultValue: "Parameter" })}</th>
                          <th className="text-right p-3 font-semibold text-foreground">{t("lab_report_page.your_value_label", { defaultValue: "Your value" })}</th>
                          <th className="text-right p-3 font-semibold text-foreground">{t("lab_report_page.normal_range_label", { defaultValue: "Normal range" })}</th>
                          <th className="text-center p-3 font-semibold text-foreground">{t("lab_report_page.status_label", { defaultValue: "Status" })}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.parameters.map((p, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="p-3 text-foreground">{p.name}</td>
                            <td className="p-3 text-right font-medium">{p.value} {p.unit}</td>
                            <td className="p-3 text-right text-muted-foreground">{p.reference_low} – {p.reference_high} {p.unit}</td>
                            <td className="p-3 text-center">
                              <span className={`font-medium capitalize ${statusColor(p.status)}`}>{p.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {result.suggestions.length > 0 && (
              <ScrollReveal>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                      <Apple className="w-5 h-5 text-primary" />
                      {t("lab_report_page.suggestions_heading", { defaultValue: "Diet & lifestyle suggestions" })}
                    </h2>
                    <button
                      type="button"
                      onClick={speakSuggestions}
                      disabled={isSuggestionsTtsLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                      title={isSuggestionsSpeaking ? t("lab_report_page.listen_stop", { defaultValue: "Stop" }) : t("lab_report_page.listen_suggestions", { defaultValue: "Listen to suggestions" })}
                    >
                      {isSuggestionsSpeaking ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                      <span className="sr-only sm:not-sr-only">
                        {isSuggestionsTtsLoading ? t("lab_report_page.listen_loading", { defaultValue: "Loading…" }) : isSuggestionsSpeaking ? t("lab_report_page.listen_stop", { defaultValue: "Stop" }) : t("lab_report_page.listen_suggestions", { defaultValue: "Listen to suggestions" })}
                      </span>
                    </button>
                  </div>
                  <ul className="space-y-4">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <span className="font-semibold text-primary shrink-0">{s.parameter}:</span>
                        <span className="text-muted-foreground text-sm leading-relaxed">{s.suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            )}
          </div>
          );
        })()}
      </div>
    </div>
  );
}
