import React, { useState } from "react";
import type { AgeGroup } from "@/utils/ageFilter";
import type { GynaeLanguage } from "@/utils/gynaecareFormatters";

type Props = { language: GynaeLanguage; ageGroup: AgeGroup | null };

type MythItem = {
  statement: { en: string; hi: string };
  correct: "myth" | "fact";
  explanation: { en: string; hi: string };
};

const MYTHS: Record<string, MythItem[]> = {
  "10-14": [
    {
      statement: { en: "You cannot swim or bathe during periods", hi: "पीरियड के दौरान आप तैर या नहा नहीं सकते" },
      correct: "myth",
      explanation: {
        en: "MYTH! You can swim and bathe during periods. Water doesn't enter your body. Staying clean is important for hygiene.",
        hi: "मिथक! आप पीरियड के दौरान तैर और नहा सकते हैं। पानी शरीर में प्रवेश नहीं करता। स्वच्छ रहना महत्वपूर्ण है।",
      },
    },
    {
      statement: { en: "It's normal for periods to be irregular in the first 2 years", hi: "पहले 2 वर्षों में पीरियड का अनियमित होना सामान्य है" },
      correct: "fact",
      explanation: {
        en: "FACT! It's normal for periods to be irregular when you first start. Your body is still adjusting.",
        hi: "तथ्य! जब आप पहली बार शुरू करते हैं तो अनियमित होना सामान्य है। आपका शरीर अभी समायोजित हो रहा है।",
      },
    },
    {
      statement: { en: "Eating sour foods causes period cramps", hi: "खट्टे खाद्य पदार्थ खाने से पीरियड में ऐंठन होती है" },
      correct: "myth",
      explanation: {
        en: "MYTH! Foods don't cause cramps. Cramps are from uterine contractions. Stay hydrated and eat balanced meals.",
        hi: "मिथक! खाद्य पदार्थ ऐंठन का कारण नहीं बनते। ऐंठन गर्भाशय के संकुचन से होती है। हाइड्रेटेड रहें।",
      },
    },
  ],
  "15-25": [
    {
      statement: { en: "PCOS means you can never get pregnant", hi: "PCOS का मतलब है कि आप कभी गर्भवती नहीं हो सकती" },
      correct: "myth",
      explanation: {
        en: "MYTH! PCOS can make it harder to conceive, but many women with PCOS have successful pregnancies with treatment and lifestyle changes.",
        hi: "मिथक! PCOS गर्भधारण को कठिन बना सकता है, लेकिन कई महिलाएं उपचार और जीवनशैली से सफल गर्भधारण करती हैं।",
      },
    },
    {
      statement: { en: "Exercise makes period cramps worse", hi: "व्यायाम से पीरियड की ऐंठन बदतर हो जाती है" },
      correct: "myth",
      explanation: {
        en: "MYTH! Gentle exercise helps reduce cramps by releasing endorphins. Try yoga, walking, or stretching.",
        hi: "मिथक! हल्का व्यायाम एंडोर्फिन जारी करके ऐंठन कम करने में मदद करता है। योग, चलना आजमाएं।",
      },
    },
  ],
  "25-40": [
    {
      statement: { en: "You cannot get pregnant after 35", hi: "35 के बाद आप गर्भवती नहीं हो सकती" },
      correct: "myth",
      explanation: {
        en: "MYTH! Fertility declines with age, but many women conceive naturally after 35. Consult a doctor if trying to conceive.",
        hi: "मिथक! उम्र के साथ प्रजनन क्षमता कम होती है, लेकिन कई महिलाएं 35 के बाद गर्भधारण करती हैं। डॉक्टर से परामर्श करें।",
      },
    },
  ],
  unspecified: [
    {
      statement: { en: "You cannot swim during periods", hi: "पीरियड के दौरान तैर नहीं सकते" },
      correct: "myth",
      explanation: { en: "MYTH! You can swim. Use a tampon or menstrual cup if you prefer.", hi: "मिथक! आप तैर सकती हैं।" },
    },
  ],
};

export default function MythBuster({ language, ageGroup }: Props) {
  const group = ageGroup || "unspecified";
  const list = MYTHS[group]?.length ? MYTHS[group] : MYTHS.unspecified;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<"myth" | "fact" | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  const item = list[index];
  const isEn = language === "en";

  const handleAnswer = (answer: "myth" | "fact") => {
    setSelected(answer);
    setShowExplanation(true);
    if (answer === item.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (index < list.length - 1) {
      setIndex((i) => i + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
  };

  const done = index === list.length - 1 && showExplanation;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{isEn ? "Question" : "प्रश्न"} {index + 1} / {list.length}</span>
      </div>

      {!done ? (
        <>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold text-foreground">{item.statement[language]}</h3>
            {!showExplanation ? (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAnswer("myth")}
                  className="flex-1 rounded-xl border border-amber-500/50 bg-amber-500/10 py-2 text-sm font-medium text-amber-700 dark:text-amber-400"
                >
                  {isEn ? "MYTH" : "मिथक"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswer("fact")}
                  className="flex-1 rounded-xl border border-emerald-500/50 bg-emerald-500/10 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400"
                >
                  {isEn ? "FACT" : "तथ्य"}
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`mt-3 rounded-lg p-2 text-sm ${
                    selected === item.correct ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {selected === item.correct ? (isEn ? "✓ Correct!" : "✓ सही!") : (isEn ? "✗ Incorrect" : "✗ गलत")}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.explanation[language]}</p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="mt-4 w-full rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground"
                >
                  {isEn ? "Next Question →" : "अगला प्रश्न →"}
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <h3 className="font-semibold text-foreground">{isEn ? "Quiz Complete!" : "प्रश्नोत्तरी पूर्ण!"}</h3>
          <p className="mt-2 text-2xl font-bold text-primary">{score} / {list.length}</p>
          <button
            type="button"
            onClick={handleRestart}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {isEn ? "Try Again" : "फिर से कोशिश करें"}
          </button>
        </div>
      )}
    </div>
  );
}
