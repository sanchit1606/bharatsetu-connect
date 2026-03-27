import React from "react";
import { useTranslation } from "react-i18next";
import { SUGGESTED_QUESTIONS } from "@/lib/rightsAssistantApi";

type Props = {
  onSelect: (question: string) => void;
};

export default function SuggestedQuestions({ onSelect }: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{t("rights_assistant_page.suggested_questions_label", { defaultValue: "Try asking:" })}</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(q)}
            className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-muted/50 hover:border-primary/40 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
