import React, { useRef } from "react";
import { FileText, Upload, X, Loader2, ArrowRight, Image as ImageIcon } from "lucide-react";

type Props = {
  documentFile: File | null;
  documentPaste: string;
  isOcrLoading: boolean;
  isExplainLoading: boolean;
  onFileChange: (file: File | null) => void;
  onPasteChange: (value: string) => void;
  onExtractText: () => void;
  onExplain: () => void;
  canExplain: boolean;
};

export default function DocumentPanel({
  documentFile,
  documentPaste,
  isOcrLoading,
  isExplainLoading,
  onFileChange,
  onPasteChange,
  onExtractText,
  onExplain,
  canExplain,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Please upload a file smaller than 10MB.");
      return;
    }
    onFileChange(file);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFileChange(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold text-foreground">
        Upload or paste document
      </h2>

      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <ImageIcon className="h-3.5 w-3.5 text-primary" />
          Image of document (photo or scan)
        </label>
        <label className="flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-5 hover:border-primary/40 hover:bg-muted/50">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="pointer-events-none absolute h-0 w-0 opacity-0"
            onChange={handleFileInputChange}
          />
          {documentFile ? (
            <div className="flex w-full max-w-sm items-center gap-2">
              <FileText className="h-5 w-5 shrink-0 text-primary" />
              <span className="truncate text-sm font-medium">{documentFile.name}</span>
              <button
                type="button"
                onClick={removeFile}
                className="ml-auto rounded p-1 hover:bg-muted"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-6 w-6 text-primary" />
              <span className="text-sm text-muted-foreground">Drop image or browse</span>
            </>
          )}
        </label>
        {documentFile && (
          <button
            type="button"
            onClick={onExtractText}
            disabled={isOcrLoading}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            {isOcrLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isOcrLoading ? "Extracting text…" : "Extract text from image"}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Or paste document text</label>
        <textarea
          value={documentPaste}
          onChange={(e) => onPasteChange(e.target.value)}
          placeholder="Paste text from a rental agreement, notice, contract, or any document you want explained…"
          rows={6}
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        />
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
        {isExplainLoading ? "Explaining…" : "Explain this document"}
      </button>
    </div>
  );
}
