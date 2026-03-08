import React from "react";
import { CheckCircle2, Copy } from "lucide-react";
import type { ExplanationResult, QaAnswer } from "@/lib/rightsAssistantApi";

type TabMode = "document" | "question";

type Props = {
  tab: TabMode;
  explanation: ExplanationResult | null;
  qaAnswer: QaAnswer | null;
  copyLabel: string;
  onCopy: (text: string) => void;
};

export default function ResultPanel({
  tab,
  explanation,
  qaAnswer,
  copyLabel,
  onCopy,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="card-elevated space-y-4 rounded-2xl bg-card p-5">
        <h3 className="font-display text-sm font-semibold text-foreground">
          Plain-language result
        </h3>

        {tab === "document" && explanation ? (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground">{explanation.summary}</p>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Your rights</p>
              <ul className="space-y-1.5">
                {explanation.rights.map((r, i) => (
                  <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                Source: {explanation.source}
              </span>
              <button
                type="button"
                onClick={() =>
                  onCopy(
                    explanation.summary +
                      "\n\n" +
                      explanation.rights.join("\n") +
                      "\n\nSource: " +
                      explanation.source
                  )
                }
                className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[11px] font-medium hover:bg-muted"
              >
                <Copy className="h-3.5 w-3.5" />
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
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {qaAnswer.answer}
            </p>
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                Source: {qaAnswer.source}
              </span>
              <button
                type="button"
                onClick={() => onCopy(qaAnswer.answer + "\n\nSource: " + qaAnswer.source)}
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
              ? 'Upload or paste a document and click "Explain this document" to get a summary, your rights, and next steps.'
              : 'Ask a question about your legal rights or government schemes and click "Get answer" for a plain-language response with source citation.'}
          </p>
        )}
      </div>
    </div>
  );
}
