import React, { useState } from "react";
import { Phone } from "lucide-react";
import type { AgeGroup } from "@/utils/ageFilter";
import type { GynaeLanguage } from "@/utils/gynaecareFormatters";

type Props = { ageGroup: AgeGroup | null; language: GynaeLanguage };

const CATEGORIES = [
  { id: "all", en: "All Resources", hi: "सभी संसाधन" },
  { id: "menstruation", en: "Menstruation", hi: "मासिक धर्म" },
  { id: "pcos", en: "PCOS", hi: "PCOS" },
  { id: "pregnancy", en: "Pregnancy", hi: "गर्भावस्था" },
  { id: "helplines", en: "Helplines", hi: "हेल्पलाइन" },
];

const ARTICLES = [
  { id: 1, titleEn: "Understanding Your Menstrual Cycle", titleHi: "अपने मासिक धर्म चक्र को समझना", category: "menstruation", source: "WHO", ageGroups: ["10-14", "15-25", "25-40", "unspecified"] as AgeGroup[] },
  { id: 2, titleEn: "PCOS: What You Need to Know", titleHi: "PCOS: आपको क्या जानने की आवश्यकता है", category: "pcos", source: "NHS", ageGroups: ["15-25", "25-40", "unspecified"] as AgeGroup[] },
  { id: 3, titleEn: "Pregnancy Basics: First Trimester", titleHi: "गर्भावस्था की मूल बातें: पहली तिमाही", category: "pregnancy", source: "UNICEF", ageGroups: ["25-40"] as AgeGroup[] },
  { id: 4, titleEn: "Menstrual Hygiene Management", titleHi: "मासिक धर्म स्वच्छता प्रबंधन", category: "menstruation", source: "National Health Mission", ageGroups: ["10-14", "15-25", "25-40", "unspecified"] as AgeGroup[] },
];

const HELPLINES = [
  { nameEn: "Medical Emergency", nameHi: "चिकित्सा आपातकाल", number: "108", descEn: "Ambulance, severe pain, pregnancy complications", descHi: "एम्बुलेंस, गंभीर दर्द, गर्भावस्था जटिलताएं", available: "24/7" },
  { nameEn: "Women's Helpline", nameHi: "महिला हेल्पलाइन", number: "181", descEn: "Violence, abuse, harassment", descHi: "हिंसा, दुर्व्यवहार, उत्पीड़न", available: "24/7" },
  { nameEn: "Mental Health (Vandrevala)", nameHi: "मानसिक स्वास्थ्य (वंद्रेवाला)", number: "1860-2662-345", descEn: "Anxiety, depression, emotional support", descHi: "चिंता, अवसाद, भावनात्मक समर्थन", available: "24/7" },
];

export default function ResourceLibrary({ ageGroup, language }: Props) {
  const [category, setCategory] = useState("all");
  const isEn = language === "en";
  const group = ageGroup || "unspecified";

  const filteredArticles = ARTICLES.filter(
    (a) => a.ageGroups.includes(group) && (category === "all" || category === a.category)
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        {isEn ? "Resource Library" : "संसाधन पुस्तकालय"}
      </h2>
      <p className="text-sm text-muted-foreground">
        {isEn ? "Trusted information from WHO, UNICEF, NHS" : "WHO, UNICEF, NHS से विश्वसनीय जानकारी"}
      </p>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              category === c.id ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"
            }`}
          >
            {isEn ? c.en : c.hi}
          </button>
        ))}
      </div>

      {(category === "all" || category !== "helplines") && filteredArticles.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold">{isEn ? "Articles & Guides" : "लेख और गाइड"}</h3>
          <div className="mt-2 space-y-2">
            {filteredArticles.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
              >
                <div>
                  <p className="font-medium text-foreground">{isEn ? a.titleEn : a.titleHi}</p>
                  <p className="text-[10px] text-muted-foreground">{a.source}</p>
                </div>
                <span className="text-xs text-primary">{isEn ? "Read more →" : "और पढ़ें →"}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {(category === "all" || category === "helplines") && (
        <section>
          <h3 className="text-sm font-semibold">{isEn ? "Emergency Helplines" : "आपातकालीन हेल्पलाइन"}</h3>
          <div className="mt-2 space-y-2">
            {HELPLINES.map((h) => (
              <div
                key={h.number}
                className="rounded-xl border border-border bg-card p-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{isEn ? h.nameEn : h.nameHi}</h4>
                  <span className="text-[10px] text-muted-foreground">{h.available}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{isEn ? h.descEn : h.descHi}</p>
                <a
                  href={`tel:${h.number.replace(/-/g, "")}`}
                  className="mt-2 flex w-fit items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {h.number}
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {filteredArticles.length === 0 && category !== "helplines" && (
        <p className="text-sm text-muted-foreground">
          {isEn ? "No resources in this category for your age group." : "आपके आयु वर्ग के लिए इस श्रेणी में कोई संसाधन नहीं।"}
        </p>
      )}
    </div>
  );
}
