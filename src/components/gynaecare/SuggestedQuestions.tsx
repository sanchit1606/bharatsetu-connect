import React from "react";
import type { AgeGroup } from "@/utils/ageFilter";
import type { GynaeLanguage } from "@/utils/gynaecareFormatters";

type Props = {
  language: GynaeLanguage;
  ageGroup: AgeGroup | null;
  onQuestionClick: (question: string) => void;
};

const QUESTIONS: Record<NonNullable<AgeGroup>, { en: string[]; hi: string[] }> = {
  "10-14": {
    en: [
      "What is menstruation?",
      "When will I get my first period?",
      "Why do periods hurt?",
      "How to use a sanitary pad?",
      "Is it normal to have irregular periods?",
    ],
    hi: [
      "मासिक धर्म क्या है?",
      "मुझे पहली बार पीरियड कब आएगा?",
      "पीरियड में दर्द क्यों होता है?",
      "सैनिटरी पैड का उपयोग कैसे करें?",
      "अनियमित पीरियड होना सामान्य है क्या?",
    ],
  },
  "15-25": {
    en: [
      "What is PCOS?",
      "How to manage period pain?",
      "What are normal period symptoms?",
      "Can I exercise during periods?",
      "What is PMS?",
      "How to track my menstrual cycle?",
    ],
    hi: [
      "PCOS क्या है?",
      "पीरियड के दर्द को कैसे प्रबंधित करें?",
      "सामान्य पीरियड के लक्षण क्या हैं?",
      "क्या मैं पीरियड के दौरान व्यायाम कर सकती हूं?",
      "PMS क्या है?",
      "मासिक धर्म चक्र को कैसे ट्रैक करें?",
    ],
  },
  "25-40": {
    en: [
      "What are early pregnancy symptoms?",
      "How does PCOS affect fertility?",
      "What is endometriosis?",
      "When should I see a gynecologist?",
      "What are fibroids?",
      "How to improve reproductive health?",
    ],
    hi: [
      "प्रारंभिक गर्भावस्था के लक्षण क्या हैं?",
      "PCOS प्रजनन क्षमता को कैसे प्रभावित करता है?",
      "एंडोमेट्रियोसिस क्या है?",
      "मुझे स्त्री रोग विशेषज्ञ से कब मिलना चाहिए?",
      "फाइब्रॉइड क्या हैं?",
      "प्रजनन स्वास्थ्य में सुधार कैसे करें?",
    ],
  },
  unspecified: {
    en: [
      "What is menstrual health?",
      "What is PCOS?",
      "How to maintain menstrual hygiene?",
      "Common period myths",
      "When to consult a doctor?",
    ],
    hi: [
      "मासिक धर्म स्वास्थ्य क्या है?",
      "PCOS क्या है?",
      "मासिक धर्म स्वच्छता कैसे बनाए रखें?",
      "सामान्य पीरियड मिथक",
      "डॉक्टर से कब परामर्श करें?",
    ],
  },
};

export default function SuggestedQuestions({ language, ageGroup, onQuestionClick }: Props) {
  const group = ageGroup || "unspecified";
  const questions = QUESTIONS[group][language];

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        {language === "en" ? "Try asking:" : "कोशिश करें:"}
      </p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onQuestionClick(q)}
            className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
