import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { AgeGroup } from "@/utils/ageFilter";
import type { GynaeLanguage } from "@/utils/gynaecareFormatters";

type Props = {
  onAccept: () => void;
  onAgeSelect: (age: AgeGroup) => void;
  language: GynaeLanguage;
  onLanguageChange: (lang: GynaeLanguage) => void;
};

type ExpandSection = "provides" | "dont-provide" | "privacy" | null;

export default function WelcomeScreen({
  onAccept,
  onAgeSelect,
  language,
  onLanguageChange,
}: Props) {
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [expanded, setExpanded] = useState<ExpandSection>(null);

  const isEn = language === "en";

  const toggle = (section: ExpandSection) => {
    setExpanded((e) => (e === section ? null : section));
  };

  const handleContinue = () => {
    if (!termsAccepted || !selectedAge) return;
    onAgeSelect(selectedAge);
    onAccept();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold text-foreground">GynaeCare</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isEn
            ? "Safe, judgment-free space for women's health information"
            : "महिलाओं के स्वास्थ्य की जानकारी के लिए सुरक्षित, निर्णय-मुक्त स्थान"}
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold text-foreground">
          {isEn ? "What is GynaeCare?" : "GynaeCare क्या है?"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isEn
            ? "An educational chatbot providing verified information about menstrual health, PCOS, pregnancy basics, and general women's wellness. Information sourced from WHO, UNICEF, NHS, and National Health Mission India."
            : "मासिक धर्म स्वास्थ्य, PCOS, गर्भावस्था की मूल बातें और सामान्य महिला कल्याण के बारे में सत्यापित जानकारी प्रदान करने वाला एक शैक्षिक चैटबॉट।"}
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card">
        <button
          type="button"
          className="flex w-full items-center justify-between p-4 text-left"
          onClick={() => toggle("provides")}
        >
          <h3 className="font-semibold text-foreground">
            {isEn ? "What we provide:" : "हम क्या प्रदान करते हैं:"}
          </h3>
          {expanded === "provides" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expanded === "provides" && (
          <ul className="list-inside list-disc space-y-1 border-t border-border px-4 pb-4 pt-2 text-sm text-muted-foreground">
            <li>{isEn ? "Accurate health information from trusted sources" : "विश्वसनीय स्रोतों से सटीक स्वास्थ्य जानकारी"}</li>
            <li>{isEn ? "Myth-busting about periods and women's health" : "मासिक धर्म और महिलाओं के स्वास्थ्य के बारे में मिथकों का भंडाफोड़"}</li>
            <li>{isEn ? "Simple explanations in Hindi and English" : "हिंदी और अंग्रेजी में सरल व्याख्या"}</li>
            <li>{isEn ? "Anonymous, stigma-free Q&A" : "गुमनाम, कलंक-मुक्त प्रश्नोत्तर"}</li>
            <li>{isEn ? "Period tracker and PCOS symptom checker" : "पीरियड ट्रैकर और PCOS लक्षण चेकर"}</li>
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-amber-500/30 bg-amber-500/5">
        <button
          type="button"
          className="flex w-full items-center justify-between p-4 text-left"
          onClick={() => toggle("dont-provide")}
        >
          <h3 className="font-semibold text-foreground">
            {isEn ? "What we DON'T provide:" : "हम क्या प्रदान नहीं करते:"}
          </h3>
          {expanded === "dont-provide" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expanded === "dont-provide" && (
          <ul className="list-inside list-disc space-y-1 border-t border-amber-500/20 px-4 pb-4 pt-2 text-sm text-muted-foreground">
            <li>{isEn ? "Medical diagnosis" : "चिकित्सा निदान"}</li>
            <li>{isEn ? "Prescription of medicines" : "दवाओं का प्रिस्क्रिप्शन"}</li>
            <li>{isEn ? "Emergency medical help" : "आपातकालीन चिकित्सा सहायता"}</li>
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold text-foreground">
          {isEn ? "Your Privacy - 100% Guaranteed:" : "आपकी गोपनीयता - 100% गारंटीकृत:"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {isEn
            ? "Completely anonymous. No login, no phone, no email. Zero data retention—your questions are NOT stored. Period tracker data stays ONLY on your device."
            : "पूरी तरह से गुमनाम। कोई लॉगिन नहीं, कोई फोन नहीं, कोई ईमेल नहीं। आपके प्रश्न संग्रहीत नहीं किए जाते। पीरियड ट्रैकर डेटा केवल आपके डिवाइस पर रहता है।"}
        </p>
      </section>

      <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <h3 className="font-semibold text-foreground">
          {isEn ? "Important Medical Disclaimer:" : "महत्वपूर्ण चिकित्सा अस्वीकरण:"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          <strong>{isEn ? "This is NOT medical advice." : "यह चिकित्सा सलाह नहीं है।"}</strong>{" "}
          {isEn
            ? "We provide general health education. For symptoms, diagnosis, or treatment, consult a qualified doctor or gynecologist."
            : "लक्षणों, निदान या उपचार के लिए एक योग्य डॉक्टर या स्त्री रोग विशेषज्ञ से परामर्श करें।"}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-foreground">
          {isEn ? "Select Your Age Group:" : "अपना आयु वर्ग चुनें:"}
        </h3>
        <p className="text-xs text-muted-foreground">
          {isEn
            ? "Helps us provide age-appropriate information. If under 18, we encourage involving a trusted adult."
            : "उम्र के अनुसार उपयुक्त जानकारी प्रदान करने में मदद करता है।"}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["10-14", "15-25", "25-40", "unspecified"] as const).map((age) => (
            <button
              key={age}
              type="button"
              onClick={() => setSelectedAge(age)}
              className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                selectedAge === age
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {age === "unspecified"
                ? isEn ? "Prefer not to say" : "नहीं बताना चाहते"
                : `${age} ${isEn ? "years" : "वर्ष"}`}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold text-foreground">
          {isEn ? "Emergency Resources:" : "आपातकालीन संसाधन:"}
        </h3>
        <div className="mt-2 grid gap-2 text-sm">
          <p><strong>108</strong> — {isEn ? "Medical Emergency" : "चिकित्सा आपातकाल"}</p>
          <p><strong>181</strong> — {isEn ? "Women's Helpline" : "महिला हेल्पलाइन"}</p>
          <p><strong>1860-2662-345</strong> — {isEn ? "Mental Health" : "मानसिक स्वास्थ्य"}</p>
        </div>
      </section>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onLanguageChange(language === "en" ? "hi" : "en")}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          {language === "en" ? "हिंदी" : "English"}
        </button>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm text-muted-foreground">
          {isEn
            ? "I understand this is educational information, NOT medical diagnosis or treatment. For health concerns, I will consult a qualified doctor."
            : "मैं समझता/समझती हूं कि यह शैक्षिक जानकारी है, चिकित्सा निदान या उपचार नहीं। स्वास्थ्य संबंधी चिंताओं के लिए मैं एक योग्य डॉक्टर से परामर्श करूंगा/करूंगी।"}
        </span>
      </label>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!termsAccepted || !selectedAge}
          className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-50"
        >
          {isEn ? "I Understand - Continue to GynaeCare" : "मैं समझता/समझती हूं - GynaeCare पर जाएं"}
        </button>
        <Link
          to="/"
          className="block w-full rounded-xl border border-border py-2.5 text-center text-sm font-medium hover:bg-muted"
        >
          {isEn ? "Go Back to Home" : "होम पर वापस जाएं"}
        </Link>
      </div>
    </div>
  );
}
