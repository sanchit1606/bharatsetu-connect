import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Upload, X, Loader2, ArrowRight, Image as ImageIcon, Scan, Mic, MicOff } from "lucide-react";

type Props = {
  documentFile: File | null;
  previewUrl: string | null;
  previewDimensions: { width: number; height: number } | null;
  outputLanguage: string;
  onOutputLanguageChange: (value: string) => void;
  outputLangOptions: { value: string; label: string }[];
  isOcrLoading: boolean;
  isExplainLoading: boolean;
  onFileChange: (file: File | null) => void;
  onExtractText: () => void;
  onExplain: () => void;
  canExplain: boolean;
  documentQuery: string;
  onDocumentQueryChange: (value: string) => void;
  isDocumentRecording: boolean;
  isDocumentTranscribing?: boolean;
  onToggleDocumentRecording: () => void;
  hasVoiceInput: boolean;
};

export default function DocumentPanel({
  documentFile,
  previewUrl,
  previewDimensions,
  outputLanguage,
  onOutputLanguageChange,
  outputLangOptions,
  isOcrLoading,
  isExplainLoading,
  onFileChange,
  onExtractText,
  onExplain,
  canExplain,
  documentQuery,
  onDocumentQueryChange,
  isDocumentRecording,
  isDocumentTranscribing = false,
  onToggleDocumentRecording,
  hasVoiceInput,
}: Props) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert(t("rights_assistant_page.file_size_error", { defaultValue: "Please upload a file smaller than 10MB." }));
      return;
    }
    onFileChange(file);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFileChange(null);
  };

  const isPdf = documentFile?.type === "application/pdf" || documentFile?.name?.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {t("rights_assistant_page.document_details_heading", { defaultValue: "Document & details" })}
      </h2>

      {/* Upload area — Lab Report style */}
      {!documentFile ? (
        <label className="flex flex-col items-center justify-center w-full min-h-[120px] border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 hover:border-primary/40 transition-colors px-4 py-5">
          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground text-center">
            {t("rights_assistant_page.upload_drop_text", { defaultValue: "Drop image or PDF here, or click to browse" })}
          </span>
          <span className="text-xs text-muted-foreground mt-1">{t("rights_assistant_page.upload_file_types", { defaultValue: "Image, PDF, DOC/DOCX" })}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </label>
      ) : (
        <div className="space-y-2">
          <div
            className={`relative rounded-xl overflow-hidden border border-border bg-black/5 ${!previewDimensions ? "min-h-[100px]" : ""}`}
            style={previewDimensions ? { aspectRatio: `${previewDimensions.width} / ${previewDimensions.height}` } : undefined}
          >
            {previewUrl ? (
              <>
                {previewDimensions ? (
                  <img
                    src={previewUrl}
                    alt="Document preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Document preview"
                    className="w-full h-full object-contain max-h-48 min-h-[100px]"
                  />
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <FileText className="h-10 w-10 text-primary" />
                <span className="text-sm font-medium text-foreground truncate max-w-full px-2">{documentFile.name}</span>
              </div>
            )}
            {isPdf && (
              <div className="absolute top-2 left-2 px-2 py-1 rounded bg-primary/90 text-primary-foreground text-xs font-medium flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> PDF
              </div>
            )}
            <button
              type="button"
              onClick={removeFile}
              className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-background/90 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onExtractText}
              disabled={isOcrLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {isOcrLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
              {isOcrLoading ? t("rights_assistant_page.ocr_running", { defaultValue: "Running OCR…" }) : t("rights_assistant_page.run_ocr_button", { defaultValue: "Run OCR" })}
            </button>
          </div>
        </div>
      )}

      {/* Language dropdown */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">{t("rights_assistant_page.simplify_language_label", { defaultValue: "Simplify document in" })}</label>
        <select
          value={outputLanguage}
          onChange={(e) => onOutputLanguageChange(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground"
        >
          {outputLangOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* User query: type or speak */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">{t("rights_assistant_page.query_label", { defaultValue: "Your query (optional)" })}</label>
        <p className="text-xs text-muted-foreground">{t("rights_assistant_page.query_hint", { defaultValue: "Ask something about the document; the summary will use the document and your question." })}</p>
        <div className="relative">
          <textarea
            value={documentQuery}
            onChange={(e) => onDocumentQueryChange(e.target.value)}
            placeholder={t("rights_assistant_page.query_placeholder", { defaultValue: "e.g. What are my main obligations? Is there a notice period?" })}
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 pr-12 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          />
          {hasVoiceInput && (
            <button
              type="button"
              onClick={onToggleDocumentRecording}
              disabled={isDocumentTranscribing}
              className="absolute right-3 bottom-3 inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 text-[11px] font-medium hover:bg-muted disabled:opacity-50"
              title={isDocumentTranscribing ? t("rights_assistant_page.transcribing_label", { defaultValue: "Transcribing…" }) : isDocumentRecording ? t("rights_assistant_page.stop_label", { defaultValue: "Stop" }) : t("rights_assistant_page.voice_input_title", { defaultValue: "Voice input (ElevenLabs when configured)" })}
            >
              {isDocumentTranscribing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isDocumentRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              {isDocumentTranscribing ? "…" : isDocumentRecording ? t("rights_assistant_page.stop_label", { defaultValue: "Stop" }) : t("rights_assistant_page.voice_label", { defaultValue: "Voice" })}
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onExplain}
        disabled={!canExplain || isExplainLoading}
        className="btn-press inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold hero-gradient-bg text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isExplainLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        {isExplainLoading ? t("rights_assistant_page.explaining_label", { defaultValue: "Explaining…" }) : t("rights_assistant_page.explain_document_button", { defaultValue: "Explain this document" })}
      </button>
    </div>
  );
}
