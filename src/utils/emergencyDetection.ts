/**
 * Detect emergency keywords in user messages.
 * Returns: { isEmergency: boolean, type: string | null }
 */
export type EmergencyResult = { isEmergency: boolean; type: string | null };

const severePainKeywords = {
  en: ["severe pain", "extreme pain", "unbearable pain", "intense pain", "sharp pain", "can't bear", "excruciating"],
  hi: ["गंभीर दर्द", "असहनीय दर्द", "तीव्र दर्द", "तेज दर्द", "बहुत दर्द"],
};

const heavyBleedingKeywords = {
  en: ["heavy bleeding", "excessive bleeding", "soaking pad", "large clots", "won't stop bleeding", "hemorrhage"],
  hi: ["भारी रक्तस्राव", "अधिक खून", "रक्तस्राव नहीं रुक रहा", "बहुत खून"],
};

const pregnancyEmergencyKeywords = {
  en: ["miscarriage", "ectopic pregnancy", "pregnancy complications", "severe pregnancy pain", "bleeding during pregnancy"],
  hi: ["गर्भपात", "गर्भावस्था जटिलताएं", "गर्भावस्था में दर्द"],
};

const mentalHealthKeywords = {
  en: ["suicide", "kill myself", "end my life", "want to die", "self harm", "cutting myself"],
  hi: ["आत्महत्या", "खुद को मार", "जीना नहीं चाहती", "खुद को नुकसान"],
};

const violenceKeywords = {
  en: ["abuse", "violence", "hitting me", "hurting me", "forced", "sexual assault", "rape"],
  hi: ["दुर्व्यवहार", "हिंसा", "मारपीट", "जबरदस्ती", "यौन हिंसा"],
};

export function detectEmergencyKeywords(text: string, language: "en" | "hi"): EmergencyResult {
  const lowerText = text.toLowerCase().trim();
  const lang = language === "hi" ? "hi" : "en";

  const checks: Array<{ type: string; keywords: string[] }> = [
    { type: "severe_pain", keywords: severePainKeywords[lang] },
    { type: "heavy_bleeding", keywords: heavyBleedingKeywords[lang] },
    { type: "pregnancy_emergency", keywords: pregnancyEmergencyKeywords[lang] },
    { type: "mental_health", keywords: mentalHealthKeywords[lang] },
    { type: "violence", keywords: violenceKeywords[lang] },
  ];

  for (const { type, keywords } of checks) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return { isEmergency: true, type };
      }
    }
  }

  return { isEmergency: false, type: null };
}

export function getEmergencyPhoneHref(type: string | null): string {
  switch (type) {
    case "severe_pain":
    case "heavy_bleeding":
    case "pregnancy_emergency":
      return "tel:108";
    case "mental_health":
      return "tel:18602662345";
    case "violence":
      return "tel:181";
    default:
      return "tel:108";
  }
}
