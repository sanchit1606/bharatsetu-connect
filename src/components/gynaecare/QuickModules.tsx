import React, { useState } from "react";
import { Lightbulb, ListChecks, Calendar, ArrowLeft } from "lucide-react";
import type { AgeGroup } from "@/utils/ageFilter";
import type { GynaeLanguage } from "@/utils/gynaecareFormatters";
import MythBuster from "./MythBuster";
import PCOSSymptomChecker from "./PCOSSymptomChecker";
import PeriodTracker from "./PeriodTracker";

type Props = { ageGroup: AgeGroup | null; language: GynaeLanguage };

type ModuleId = "myth-buster" | "pcos-checker" | "period-tracker" | null;

const MODULES: Array<{
  id: ModuleId;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  icon: React.ElementType;
  ageRestriction?: AgeGroup[];
}> = [
  {
    id: "myth-buster",
    titleEn: "Myth Buster",
    titleHi: "मिथक भंजक",
    descEn: "Separate facts from myths about periods and women's health",
    descHi: "पीरियड और महिलाओं के स्वास्थ्य के बारे में मिथकों से तथ्य अलग करें",
    icon: Lightbulb,
  },
  {
    id: "pcos-checker",
    titleEn: "PCOS Symptom Checker",
    titleHi: "PCOS लक्षण जांचकर्ता",
    descEn: "Interactive checklist to understand PCOS symptoms",
    descHi: "PCOS लक्षणों को समझने के लिए इंटरएक्टिव चेकलिस्ट",
    icon: ListChecks,
    ageRestriction: ["15-25", "25-40", "unspecified"],
  },
  {
    id: "period-tracker",
    titleEn: "Period Tracker",
    titleHi: "पीरियड ट्रैकर",
    descEn: "Track your menstrual cycle — data stays on YOUR device only",
    descHi: "अपने मासिक धर्म चक्र को ट्रैक करें — डेटा केवल आपके डिवाइस पर",
    icon: Calendar,
  },
];

export default function QuickModules({ ageGroup, language }: Props) {
  const [active, setActive] = useState<ModuleId>(null);

  const available = MODULES.filter(
    (m) => !m.ageRestriction || (ageGroup && m.ageRestriction.includes(ageGroup))
  );
  const isEn = language === "en";

  if (active) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActive(null)}
          className="flex items-center gap-2 text-sm font-medium text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEn ? "Back to Tools" : "टूल पर वापस जाएं"}
        </button>
        {active === "myth-buster" && <MythBuster language={language} ageGroup={ageGroup} />}
        {active === "pcos-checker" && <PCOSSymptomChecker language={language} ageGroup={ageGroup} />}
        {active === "period-tracker" && <PeriodTracker language={language} />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        {isEn ? "Interactive Tools" : "इंटरएक्टिव टूल"}
      </h2>
      <p className="text-sm text-muted-foreground">
        {isEn ? "Explore these tools to learn more about women's health" : "महिलाओं के स्वास्थ्य के बारे में अधिक जानने के लिए इन टूल का उपयोग करें"}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {available.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActive(m.id)}
              className="flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">{isEn ? m.titleEn : m.titleHi}</h3>
              <p className="text-xs text-muted-foreground">{isEn ? m.descEn : m.descHi}</p>
              <span className="text-xs font-medium text-primary">{isEn ? "Try it →" : "कोशिश करें →"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
