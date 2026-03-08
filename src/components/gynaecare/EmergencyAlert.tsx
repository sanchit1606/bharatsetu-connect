import React from "react";
import { Phone } from "lucide-react";
import { getEmergencyPhoneHref } from "@/utils/emergencyDetection";

export type GynaeLanguage = "en" | "hi";

type EmergencyType = "severe_pain" | "heavy_bleeding" | "pregnancy_emergency" | "mental_health" | "violence" | null;

type Props = {
  language: GynaeLanguage;
  emergencyType: EmergencyType;
  onClose: () => void;
};

const CONTENT: Record<
  string,
  { titleEn: string; titleHi: string; messageEn: string; messageHi: string; actionEn: string; actionHi: string }
> = {
  severe_pain: {
    titleEn: "⚠️ Severe Pain Detected",
    titleHi: "⚠️ गंभीर दर्द का पता चला",
    messageEn:
      "Severe abdominal or pelvic pain could indicate a serious condition. This requires immediate medical attention.",
    messageHi: "गंभीर पेट या श्रोणि दर्द गंभीर स्थिति का संकेत दे सकता है। इसके लिए तत्काल चिकित्सा ध्यान की आवश्यकता है।",
    actionEn: "Call 108 (Medical Emergency) NOW",
    actionHi: "अभी 108 (चिकित्सा आपातकाल) पर कॉल करें",
  },
  heavy_bleeding: {
    titleEn: "⚠️ Heavy Bleeding Detected",
    titleHi: "⚠️ भारी रक्तस्राव का पता चला",
    messageEn: "Soaking through a pad every hour or bleeding that doesn't stop may indicate a serious problem. Seek immediate medical care.",
    messageHi: "हर घंटे पैड भीगना या रक्तस्राव जो बंद नहीं होता, गंभीर समस्या का संकेत हो सकता है। तत्काल चिकित्सा देखभाल लें।",
    actionEn: "Call 108 (Medical Emergency) NOW",
    actionHi: "अभी 108 (चिकित्सा आपातकाल) पर कॉल करें",
  },
  pregnancy_emergency: {
    titleEn: "⚠️ Potential Pregnancy Emergency",
    titleHi: "⚠️ संभावित गर्भावस्था आपातकाल",
    messageEn: "Severe pain, heavy bleeding, or complications during pregnancy require immediate medical attention.",
    messageHi: "गर्भावस्था के दौरान गंभीर दर्द, भारी रक्तस्राव या जटिलताओं के लिए तत्काल चिकित्सा ध्यान की आवश्यकता होती है।",
    actionEn: "Call 108 (Medical Emergency) NOW",
    actionHi: "अभी 108 (चिकित्सा आपातकाल) पर कॉल करें",
  },
  mental_health: {
    titleEn: "💙 We Care About You",
    titleHi: "💙 हम आपकी परवाह करते हैं",
    messageEn: "If you're experiencing thoughts of self-harm or suicide, please reach out for help immediately. Support is available 24/7.",
    messageHi: "यदि आप आत्म-नुकसान या आत्महत्या के विचारों का अनुभव कर रहे हैं, तो कृपया तुरंत मदद के लिए संपर्क करें। 24/7 सहायता उपलब्ध है।",
    actionEn: "Call 1860-2662-345 (Mental Health) NOW",
    actionHi: "अभी 1860-2662-345 (मानसिक स्वास्थ्य) पर कॉल करें",
  },
  violence: {
    titleEn: "🛡️ Help is Available",
    titleHi: "🛡️ मदद उपलब्ध है",
    messageEn: "If you're experiencing violence, abuse, or harassment, please know that help is available. You deserve to be safe.",
    messageHi: "यदि आप हिंसा, दुर्व्यवहार या उत्पीड़न का अनुभव कर रहे हैं, तो कृपया जान लें कि मदद उपलब्ध है। आप सुरक्षित रहने के योग्य हैं।",
    actionEn: "Call 181 (Women's Helpline) NOW",
    actionHi: "अभी 181 (महिला हेल्पलाइन) पर कॉल करें",
  },
};

const defaultContent = {
  titleEn: "⚠️ Seek Medical Help",
  titleHi: "⚠️ चिकित्सा सहायता लें",
  messageEn: "This situation may require professional medical attention. Please consult a doctor.",
  messageHi: "इस स्थिति के लिए पेशेवर चिकित्सा ध्यान की आवश्यकता हो सकती है। कृपया डॉक्टर से परामर्श करें।",
  actionEn: "Find a Doctor",
  actionHi: "डॉक्टर खोजें",
};

export default function EmergencyAlert({ language, emergencyType, onClose }: Props) {
  const content = (emergencyType && CONTENT[emergencyType]) ? CONTENT[emergencyType] : defaultContent;
  const href = getEmergencyPhoneHref(emergencyType);
  const isEn = language === "en";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-foreground">
          {isEn ? content.titleEn : content.titleHi}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {isEn ? content.messageEn : content.messageHi}
        </p>
        <div className="mt-4 space-y-2">
          <a
            href={href}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/90 px-4 py-3 font-semibold text-destructive-foreground hover:bg-destructive"
          >
            <Phone className="h-4 w-4" />
            {isEn ? content.actionEn : content.actionHi}
          </a>
          <p className="text-xs text-muted-foreground">
            {isEn ? "Other helplines: 108 (Medical) | 181 (Women's) | 1860-2662-345 (Mental Health)" : "अन्य: 108 (चिकित्सा) | 181 (महिला) | 1860-2662-345 (मानसिक स्वास्थ्य)"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-border py-2 text-sm font-medium hover:bg-muted"
        >
          {isEn ? "I Understand" : "मैं समझता/समझती हूं"}
        </button>
      </div>
    </div>
  );
}
