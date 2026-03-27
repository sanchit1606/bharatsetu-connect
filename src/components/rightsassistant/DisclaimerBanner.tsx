import React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

export default function DisclaimerBanner() {
  const { t } = useTranslation();
  return (
    <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
      <p className="text-xs text-muted-foreground">
        {t("rights_assistant_page.disclaimer_part1", { defaultValue: "This tool is for " })}<span className="font-semibold text-foreground">{t("rights_assistant_page.disclaimer_awareness", { defaultValue: "awareness only" })}</span>{t("rights_assistant_page.disclaimer_part2", { defaultValue: ". It does not replace legal advice. For your specific case, consult a lawyer or contact your District Legal Services Authority (DLSA) for free legal aid." })}
      </p>
    </div>
  );
}
