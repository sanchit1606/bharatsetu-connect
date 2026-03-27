import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Copy, Volume2, VolumeX, Loader2 } from "lucide-react";
import type { ExplanationResult, QaAnswer } from "@/lib/rightsAssistantApi";

type TabMode = "document" | "question";

type Props = {
  tab: TabMode;
  explanation: ExplanationResult | null;
  qaAnswer: QaAnswer | null;
  copyLabel: string;
  onCopy: (text: string) => void;
  outputLanguage?: string;
  isExplainSpeaking?: boolean;
  isExplainTtsLoading?: boolean;
  onListenExplanation?: () => void;
};

export default function ResultPanel({
  tab,
  explanation,
  qaAnswer,
  copyLabel,
  onCopy,
  isExplainSpeaking = false,
  isExplainTtsLoading = false,
  onListenExplanation,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="card-elevated space-y-4 rounded-2xl bg-card p-5">
        <h3 className="font-display text-sm font-semibold text-foreground">
          {tab === "document" ? t("rights_assistant_page.document_summary_heading", { defaultValue: "Document summary" }) : t("rights_assistant_page.plain_result_heading", { defaultValue: "Plain-language result" })}
        </h3>

        {tab === "document" && explanation ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">{t("rights_assistant_page.result_format_note", { defaultValue: "In selected language, bullet points" })}</span>
              {onListenExplanation && (
                <button
                  type="button"
                  onClick={onListenExplanation}
                  disabled={isExplainTtsLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                >
                  {isExplainTtsLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isExplainSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  {isExplainTtsLoading ? t("rights_assistant_page.loading_label", { defaultValue: "Loading…" }) : isExplainSpeaking ? t("rights_assistant_page.stop_label", { defaultValue: "Stop" }) : t("rights_assistant_page.listen_label", { defaultValue: "Listen" })}
                </button>
              )}
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
              <li key="summary" className="text-foreground">{explanation.summary}</li>
              {explanation.rights.map((r, i) => (
                <li key={`r-${i}`} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{r}</span>
                </li>
              ))}
              {explanation.nextSteps.map((s, i) => (
                <li key={`s-${i}`} className="flex gap-2">
                  <span className="font-semibold text-primary shrink-0">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            {explanation.source && (
              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                  {t("rights_assistant_page.source_label", { defaultValue: "Source" })}: {explanation.source}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onCopy(
                      explanation.summary +
                        "\n\n" +
                        explanation.rights.join("\n") +
                        (explanation.nextSteps.length ? "\n\n" + t("rights_assistant_page.next_steps_label", { defaultValue: "Next steps" }) + ":\n" + explanation.nextSteps.join("\n") : "") +
                        (explanation.source ? "\n\n" + t("rights_assistant_page.source_label", { defaultValue: "Source" }) + ": " + explanation.source : "")
                    )
                  }
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[11px] font-medium hover:bg-muted"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copyLabel}
                </button>
              </div>
            )}
          </>
        ) : tab === "question" && qaAnswer ? (
          <>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {qaAnswer.answer}
            </p>
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                {t("rights_assistant_page.source_label", { defaultValue: "Source" })}: {qaAnswer.source}
              </span>
              <button
                type="button"
                onClick={() => onCopy(qaAnswer.answer + "\n\n" + t("rights_assistant_page.source_label", { defaultValue: "Source" }) + ": " + qaAnswer.source)}
                className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[11px] font-medium hover:bg-muted"
              >
                <Copy className="h-3.5 w-3.5" />
                {copyLabel}
              </button>
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            {tab === "document"
              ? t("rights_assistant_page.no_document_result_hint", { defaultValue: "Upload a document, run OCR, then click \"Explain this document\" to get a summary, your rights, and next steps." })
              : t("rights_assistant_page.no_question_result_hint", { defaultValue: "Ask a question about your legal rights or government schemes and click \"Get answer\" for a plain-language response with source citation." })}
          </p>
        )}
      </div>
    </div>
  );
}
