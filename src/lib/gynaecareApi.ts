export type AgeGroup = "10-14" | "15-25" | "25-40" | "unspecified";
export type GynaeLanguage = "en" | "hi";

export type AskQuestionParams = {
  question: string;
  language: GynaeLanguage;
  age_group: AgeGroup | null;
  session_id: string | null;
};

export type AskQuestionResponse = {
  success: boolean;
  data?: {
    answer: string;
    sources?: string[];
    requires_disclaimer?: boolean;
    emergency_detected?: boolean;
    emergency_type?: string | null;
  };
  error?: string;
};

// Mock responses for common topics (RAG/API would replace this)
const MOCK_ANSWERS: { keywords: string[]; answerEn: string; answerHi: string; source: string }[] = [
  {
    keywords: ["menstruation", "period", "मासिक", "पीरियड"],
    answerEn:
      "Menstruation is when the uterus sheds its lining each month (roughly every 21–35 days). It's a normal part of reproductive health. Bleeding usually lasts 3–7 days. If you have heavy pain, very irregular cycles, or bleeding that doesn't stop, see a doctor. Source: WHO, National Health Mission India.",
    answerHi:
      "मासिक धर्म तब होता है जब गर्भाशय हर महीने अपनी परत को बहाता है (लगभग हर 21-35 दिन)। यह प्रजनन स्वास्थ्य का एक सामान्य हिस्सा है। रक्तस्राव आमतौर पर 3-7 दिनों तक रहता है। गंभीर दर्द, बहुत अनियमित चक्र या रक्तस्राव जो बंद नहीं होता हो तो डॉक्टर से मिलें। स्रोत: WHO, राष्ट्रीय स्वास्थ्य मिशन भारत।",
    source: "WHO; National Health Mission India",
  },
  {
    keywords: ["pcos", "पीसीओएस"],
    answerEn:
      "PCOS (Polycystic Ovary Syndrome) is a hormonal condition affecting many women. Common signs include irregular periods, extra hair growth, acne, and weight gain. It can affect fertility but is manageable with lifestyle changes and medical care. Only a doctor can diagnose PCOS through tests. Source: NHS, WHO.",
    answerHi:
      "PCOS (पॉलीसिस्टिक ओवरी सिंड्रोम) एक हार्मोनल स्थिति है जो कई महिलाओं को प्रभावित करती है। अनियमित पीरियड, अतिरिक्त बाल, मुंहासे और वजन बढ़ना आम लक्षण हैं। यह प्रजनन क्षमता को प्रभावित कर सकता है लेकिन जीवनशैली और चिकित्सा देखभाल से प्रबंधनीय है। केवल डॉक्टर परीक्षणों के माध्यम से PCOS का निदान कर सकता है। स्रोत: NHS, WHO।",
    source: "NHS; WHO",
  },
  {
    keywords: ["pregnancy", "गर्भावस्था"],
    answerEn:
      "Early pregnancy signs can include missed period, nausea, tiredness, and breast tenderness. Every pregnancy is different. For confirmation, use a home test or visit a doctor. For severe pain, bleeding, or any emergency during pregnancy, call 108 immediately. Source: UNICEF, WHO.",
    answerHi:
      "प्रारंभिक गर्भावस्था के लक्षणों में मिस्ड पीरियड, मतली, थकान और स्तन कोमलता शामिल हो सकते हैं। हर गर्भावस्था अलग होती है। पुष्टि के लिए होम टेस्ट या डॉक्टर से मिलें। गर्भावस्था के दौरान गंभीर दर्द, रक्तस्राव या किसी आपातकाल के लिए तुरंत 108 पर कॉल करें। स्रोत: UNICEF, WHO।",
    source: "UNICEF; WHO",
  },
  {
    keywords: ["hygiene", "स्वच्छता", "pad", "पैड"],
    answerEn:
      "During periods, change pads or tampons every 4–6 hours (or when needed). Wash hands before and after. Use clean underwear and avoid tight clothes. Wash the genital area with water; avoid soaps inside. If you use reusable cloth pads, wash and dry them well. Source: WHO, National Health Mission.",
    answerHi:
      "पीरियड के दौरान पैड या टैम्पोन हर 4-6 घंटे में बदलें (या जरूरत होने पर)। पहले और बाद में हाथ धोएं। साफ अंडरवियर पहनें और तंग कपड़े से बचें। जननांग क्षेत्र को पानी से धोएं; अंदर साबुन से बचें। स्रोत: WHO, राष्ट्रीय स्वास्थ्य मिशन।",
    source: "WHO; National Health Mission India",
  },
  {
    keywords: ["myth", "मिथक", "exercise", "व्यायाम", "swim", "तैराकी"],
    answerEn:
      "You can exercise and swim during periods—it's safe and can help with cramps. Gentle exercise like walking or yoga may reduce pain. Use a tampon or menstrual cup for swimming if you prefer. There's no medical reason to avoid normal activities. Source: WHO, NHS.",
    answerHi:
      "आप पीरियड के दौरान व्यायाम और तैराकी कर सकती हैं—यह सुरक्षित है और ऐंठन में मदद कर सकता है। चलना या योग जैसे हल्के व्यायाम से दर्द कम हो सकता है। तैराकी के लिए टैम्पोन या मेन्स्ट्रुअल कप इस्तेमाल कर सकती हैं। सामान्य गतिविधियों से बचने का कोई चिकित्सीय कारण नहीं है। स्रोत: WHO, NHS।",
    source: "WHO; NHS",
  },
];

function findMockAnswer(question: string, language: GynaeLanguage): { answer: string; sources: string[] } {
  const q = question.toLowerCase().trim();
  for (const row of MOCK_ANSWERS) {
    if (row.keywords.some((k) => q.includes(k.toLowerCase()))) {
      return {
        answer: language === "hi" ? row.answerHi : row.answerEn,
        sources: row.source.split(";").map((s) => s.trim()),
      };
    }
  }
  return {
    answer:
      language === "en"
        ? "This is general health education. For your specific situation, please consult a gynecologist or doctor. GynaeCare provides information from WHO, UNICEF, and NHS—not medical diagnosis or treatment."
        : "यह सामान्य स्वास्थ्य शिक्षा है। आपकी विशिष्ट स्थिति के लिए कृपया स्त्री रोग विशेषज्ञ या डॉक्टर से परामर्श करें। GynaeCare WHO, UNICEF और NHS से जानकारी प्रदान करता है—चिकित्सा निदान या उपचार नहीं।",
    sources: ["WHO", "NHS", "National Health Mission India"],
  };
}

export async function askGynaeCareQuestion(params: AskQuestionParams): Promise<AskQuestionResponse> {
  const { question, language, session_id } = params;
  if (!question.trim()) {
    return { success: false, error: "Question is required" };
  }

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 600));

  const { answer, sources } = findMockAnswer(question, language);
  const requiresDisclaimer =
    /symptom|pain|bleeding|pregnancy|diagnos|treatment|medicine|दर्द|लक्षण|निदान|उपचार|गर्भावस्था/i.test(
      question
    );

  return {
    success: true,
    data: {
      answer,
      sources,
      requires_disclaimer: requiresDisclaimer,
      emergency_detected: false,
      emergency_type: null,
    },
  };
}
