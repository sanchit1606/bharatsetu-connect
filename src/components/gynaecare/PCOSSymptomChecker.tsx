import React, { useState } from "react";
import type { AgeGroup } from "@/utils/ageFilter";
import type { GynaeLanguage } from "@/utils/gynaecareFormatters";

type Props = { language: GynaeLanguage; ageGroup: AgeGroup | null };

type Symptom = {
  id: string;
  label: { en: string; hi: string };
  ageRestriction?: AgeGroup[];
};

const SYMPTOMS: Symptom[] = [
  { id: "irregular", label: { en: "Irregular or absent periods", hi: "अनियमित या अनुपस्थित पीरियड" } },
  { id: "hair", label: { en: "Excessive hair growth on face, chest, or back", hi: "चेहरे, छाती या पीठ पर अत्यधिक बाल" } },
  { id: "acne", label: { en: "Severe acne or oily skin", hi: "गंभीर मुंहासे या तैलीय त्वचा" } },
  { id: "weight", label: { en: "Unexplained weight gain or difficulty losing weight", hi: "अस्पष्टीकृत वजन बढ़ना या वजन कम करने में कठिनाई" } },
  { id: "hairloss", label: { en: "Thinning hair or hair loss on scalp", hi: "बालों का पतला होना या खोपड़ी पर बालों का झड़ना" } },
  { id: "dark", label: { en: "Dark patches of skin (neck, armpits, groin)", hi: "त्वचा के काले धब्बे (गर्दन, बगल, कमर)" } },
  { id: "conceive", label: { en: "Difficulty getting pregnant", hi: "गर्भवती होने में कठिनाई" }, ageRestriction: ["25-40"] },
];

export default function PCOSSymptomChecker({ language, ageGroup }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const list = SYMPTOMS.filter(
    (s) => !s.ageRestriction || (ageGroup && s.ageRestriction.includes(ageGroup))
  );
  const isEn = language === "en";

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const getMessage = () => {
    const n = selected.length;
    if (n === 0)
      return isEn
        ? "You haven't selected any symptoms. If you have concerns, consult a gynecologist."
        : "आपने कोई लक्षण नहीं चुना। यदि चिंता है तो स्त्री रोग विशेषज्ञ से परामर्श करें।";
    if (n <= 2)
      return isEn
        ? "You have 1–2 symptoms. This doesn't confirm PCOS. Consider tracking symptoms and discussing with a doctor if they persist."
        : "आपमें 1–2 लक्षण हैं। यह PCOS की पुष्टि नहीं करता। लक्षण ट्रैक करें और डॉक्टर से चर्चा करें।";
    return isEn
      ? "You selected 3+ symptoms commonly associated with PCOS. We recommend consulting a gynecologist for proper evaluation. PCOS is manageable with medical care."
      : "आपने PCOS से जुड़े 3+ लक्षण चुने। उचित मूल्यांकन के लिए स्त्री रोग विशेषज्ञ से परामर्श करें।";
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-amber-600 dark:text-amber-500">
        ⚠️ {isEn ? "This is NOT a medical diagnosis. Only a doctor can diagnose PCOS." : "यह चिकित्सा निदान नहीं है। केवल डॉक्टर PCOS का निदान कर सकते हैं।"}
      </p>

      {!showResults ? (
        <>
          <p className="text-sm text-muted-foreground">
            {isEn ? "Select symptoms you've been experiencing:" : "वे लक्षण चुनें जो आप अनुभव कर रहे हैं:"}
          </p>
          <div className="space-y-2">
            {list.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(s.id)}
                  onChange={() => toggle(s.id)}
                  className="rounded"
                />
                <span className="text-sm text-foreground">{s.label[language]}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowResults(true)}
            disabled={selected.length === 0}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {isEn ? "Check Results" : "परिणाम जांचें"}
          </button>
        </>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold text-foreground">{isEn ? "Results" : "परिणाम"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEn ? "Symptoms selected:" : "चुने गए लक्षण:"} <strong>{selected.length}</strong>
            </p>
            <p className="mt-2 text-sm text-foreground">{getMessage()}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {isEn
              ? "PCOS is a hormonal condition affecting many women. With proper care and lifestyle changes, it is manageable. Consult a gynecologist for evaluation."
              : "PCOS एक हार्मोनल स्थिति है। उचित देखभाल और जीवनशैली से प्रबंधनीय है। मूल्यांकन के लिए स्त्री रोग विशेषज्ञ से मिलें।"}
          </p>
          <button
            type="button"
            onClick={() => { setShowResults(false); setSelected([]); }}
            className="w-full rounded-xl border border-border py-2 text-sm font-medium hover:bg-muted"
          >
            {isEn ? "Check Again" : "फिर से जांचें"}
          </button>
        </>
      )}
    </div>
  );
}
