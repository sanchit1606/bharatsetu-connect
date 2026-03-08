import React, { useState } from "react";

export type GynaeLanguage = "en" | "hi";

type Props = { language: GynaeLanguage };

export default function DisclaimerBanner({ language }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚠️</span>
        <p className="flex-1 text-xs text-muted-foreground">
          {language === "en"
            ? "Educational information only — NOT medical diagnosis or treatment"
            : "केवल शैक्षिक जानकारी — चिकित्सा निदान या उपचार नहीं"}
        </p>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="rounded p-1 text-muted-foreground hover:bg-amber-500/10"
          aria-expanded={expanded}
        >
          {expanded ? "−" : "+"}
        </button>
      </div>
      {expanded && (
        <p className="mt-2 border-t border-amber-500/20 pt-2 text-xs text-muted-foreground">
          {language === "en"
            ? "GynaeCare provides general health education based on trusted sources. For symptoms, diagnosis, or treatment, you MUST consult a qualified doctor or gynecologist. This chatbot cannot replace professional medical care."
            : "GynaeCare विश्वसनीय स्रोतों के आधार पर सामान्य स्वास्थ्य शिक्षा प्रदान करता है। लक्षणों, निदान या उपचार के लिए एक योग्य डॉक्टर या स्त्री रोग विशेषज्ञ से परामर्श करें। यह चैटबॉट पेशेवर चिकित्सा देखभाल की जगह नहीं ले सकता।"}
        </p>
      )}
    </div>
  );
}
