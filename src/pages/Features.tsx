import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { ScanSearch, Megaphone, ShieldCheck, Microscope, Flower2, ArrowRight, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const featureTabs = [
  { id: "label-auditor", label: "Label Auditor", icon: ScanSearch },
  { id: "civicsense", label: "CivicSense", icon: Megaphone },
  { id: "rights-assistant", label: "Rights Assistant", icon: ShieldCheck },
  { id: "lab-analyzer", label: "Lab Report Analyzer", icon: Microscope },
  { id: "gynaecare", label: "GynaeCare", icon: Flower2 },
];

const FeatureSection = ({
  id, badge, headline, description, steps, results, reversed, privacy, disclaimer,
}: {
  id: string; badge: string; headline: string; description: string;
  steps: string[]; results: string[]; reversed?: boolean; privacy?: string; disclaimer?: string;
}) => (
  <section id={id} className="section-padding scroll-mt-28">
    <div className="container-content">
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start ${reversed ? "lg:direction-rtl" : ""}`}>
        <div className={reversed ? "lg:order-2" : ""}>
          <ScrollReveal>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">{badge}</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-4 mb-4">{headline}</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{description}</p>
            {disclaimer && (
              <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 text-sm text-muted-foreground">
                <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>{disclaimer}</span>
              </div>
            )}
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h4 className="font-display font-semibold text-foreground mb-4">How It Works</h4>
            <div className="space-y-3 mb-6">
              {steps.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg hero-gradient-bg flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <h4 className="font-display font-semibold text-foreground mb-3">What You Get</h4>
            <ul className="space-y-2 mb-6">
              {results.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            {privacy && (
              <div className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-xl p-4 text-sm text-muted-foreground">
                <Lock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span>{privacy}</span>
              </div>
            )}
          </ScrollReveal>
        </div>
        <div className={reversed ? "lg:order-1" : ""}>
          <ScrollReveal delay={150} direction={reversed ? "left" : "right"}>
            <div className="bg-card rounded-2xl p-8 lg:p-10 card-elevated aspect-[4/3] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  {id === "label-auditor" && <ScanSearch className="w-8 h-8 text-primary" />}
                  {id === "civicsense" && <Megaphone className="w-8 h-8 text-primary" />}
                  {id === "rights-assistant" && <ShieldCheck className="w-8 h-8 text-primary" />}
                  {id === "lab-analyzer" && <Microscope className="w-8 h-8 text-primary" />}
                  {id === "gynaecare" && <Flower2 className="w-8 h-8 text-primary" />}
                </div>
                <p className="text-sm">Interactive demo coming soon</p>
              </div>
            </div>
            <button disabled className="mt-4 w-full h-12 rounded-xl font-semibold bg-muted text-muted-foreground cursor-not-allowed text-sm" title="Coming soon — backend integration in progress">
              Try It → (Coming Soon)
            </button>
          </ScrollReveal>
        </div>
      </div>
    </div>
  </section>
);

const comparisonData = [
  { feature: "Label Auditor", input: "Image / Camera", languages: "10+", data: "None", output: "Health Report", who: "Everyone" },
  { feature: "CivicSense", input: "Text / Voice / Image", languages: "10+", data: "None", output: "Complaint Draft", who: "Citizens" },
  { feature: "Rights Assistant", input: "Document / Text / Voice", languages: "10+", data: "None", output: "Legal Explanation", who: "Everyone" },
  { feature: "Lab Report Analyzer", input: "PDF / Image", languages: "10+", data: "None", output: "Visual Report", who: "Patients" },
  { feature: "GynaeCare", input: "Text / Voice", languages: "10+", data: "None", output: "Health Guidance", who: "Women" },
];

const Features = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const el = document.getElementById(location.hash.slice(1));
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="section-padding pb-8" style={{ minHeight: "50vh", display: "flex", alignItems: "center" }}>
        <div className="container-content text-center">
          <ScrollReveal>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4">
              Everything BharatSetu <span className="hero-gradient-text">Can Do For You</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              Five AI-powered tools built around the real challenges of Indian life. Each one free, multilingual, and private by design.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Sticky Tab Bar */}
      <div className="sticky top-16 z-40 glass-header border-b border-border">
        <div className="container-content px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none snap-x max-w-full">
            {featureTabs.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors whitespace-nowrap snap-center btn-press"
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Sections */}
      <FeatureSection
        id="label-auditor"
        badge="Feature 01 — Label Auditor"
        headline="Know What You're Really Eating."
        description="Photograph any food or cosmetic product label on your phone. BharatSetu's AI reads the label using OCR, extracts every ingredient and nutritional value, cross-references it against FSSAI and WHO standards, and gives you a simple, personalized health summary — in your language."
        steps={[
          "Tell us about any health conditions (diabetes, hypertension, allergies) — optional",
          "Take or upload a photo of the product label",
          "AI extracts ingredients, nutrition values, additives, and health claims",
          "Receive a plain-language report with flags for concerns",
        ]}
        results={[
          "Visual bar charts of nutritional content per 100g",
          "Health alerts for excessive sugar, sodium, trans fat",
          "Flags for misleading label claims",
          "Response in your preferred language",
        ]}
      />

      <div className="border-t border-border" />

      <FeatureSection
        id="civicsense"
        badge="Feature 02 — CivicSense"
        headline="Your Complaint. The Right Desk. Every Time."
        description="Describe any civic problem — in your own words, in any language, with or without a photo. CivicSense identifies the issue type, maps it to the correct government department for your city, drafts a professional complaint on your behalf, and shows you exactly how to submit it."
        reversed
        steps={[
          "Describe the issue (voice or text) and optionally attach a photo",
          "AI detects language, classifies the issue, and determines urgency",
          "System maps your location and issue to the correct authority",
          "Receive a drafted complaint with submission links, WhatsApp pre-fills, and escalation options",
        ]}
        results={[
          "Professional complaint text ready to send",
          "Direct WhatsApp / Email / Web portal submission options",
          "Pre-filled forms wherever possible",
          "Escalation path if the first authority doesn't respond",
        ]}
      />

      <div className="border-t border-border" />

      <FeatureSection
        id="rights-assistant"
        badge="Feature 03 — Rights Assistant"
        headline="Legal Documents in Plain Language. Finally."
        description="Upload any document — a rental agreement, government notice, employment contract, or ration card form — and ask BharatSetu to explain it. Or ask any question about your legal rights, entitlements, or government schemes. Our RAG-powered assistant cross-references Indian law from IndiaCode and gives you a cited, plain-language answer."
        steps={[
          "Upload a document or type/speak your legal question",
          "OCR extracts text from the document",
          "AI cross-references against legal knowledge base and IndiaCode",
          "Receive a plain-language explanation with source citations",
        ]}
        results={[
          "Simplified document summary",
          "Your rights clearly stated",
          "Step-by-step guidance for claiming entitlements",
          "Source: act name and section cited for every answer",
          "Available in Hindi and regional languages",
        ]}
      />

      <div className="border-t border-border" />

      <FeatureSection
        id="lab-analyzer"
        badge="Feature 04 — Lab Report Analyzer"
        headline="Understand Your Health. Without the Medical Degree."
        description="Upload your pathology or blood test report as a PDF or image. BharatSetu extracts every test value, compares it against age- and gender-specific WHO and ICMR reference ranges, and shows you a simple visual chart — color-coded Green, Yellow, or Red. India-specific diet suggestions are included. Zero data is stored."
        reversed
        disclaimer="This tool is for educational comparison only. It does not diagnose conditions or replace medical consultation. Always consult a qualified doctor."
        steps={[
          "Enter your age, gender, and any known conditions (optional)",
          "Upload your lab report (PDF, JPG, or PNG)",
          "AI extracts values and compares against standard ranges",
          "View a visual, color-coded report with wellness suggestions",
        ]}
        results={[
          "Color-coded values (Green = normal, Yellow = borderline, Red = outside range)",
          "Visual bar charts per test value",
          "India-specific diet suggestions (palak, amla, dal, etc.)",
          "Downloadable summary (stored locally on your device only)",
          "Critical value alerts if anything needs urgent attention",
        ]}
        privacy="Zero Data Policy — Your lab report is processed in memory and immediately discarded. Nothing is stored on our servers."
      />

      <div className="border-t border-border" />

      <FeatureSection
        id="gynaecare"
        badge="Feature 05 — GynaeCare"
        headline="Women's Health. Answered. Without Judgment."
        description="GynaeCare is a completely anonymous, stigma-free chatbot for women's health questions. Ask about menstrual cycles, PCOS, pregnancy, or general wellness. Every answer is sourced from WHO, UNICEF, NHS, and National Health Mission India. No account. No data. No judgment."
        disclaimer="This module is educational and does not provide medical diagnosis. Emergency symptoms trigger immediate helpline referrals."
        steps={[
          "Ask any question — in Hindi, English, or your regional language",
          "AI retrieves verified answers from WHO/NHS/UNICEF knowledge base",
          "Receive an empathetic, age-appropriate response with source references",
          "Emergency symptoms or crisis keywords automatically surface helplines",
        ]}
        results={[
          "Menstrual health education and myth-busting",
          "PCOS awareness and symptom checker",
          "Pregnancy trimester guidance",
          "Period tracker (stored only on your device)",
          "Helpline numbers: Medical (108), Women's Helpline (181), Mental Health (1860-2662-345)",
        ]}
        privacy="Completely Anonymous — No questions are logged. No identity required. Your conversation disappears when you close the tab."
      />

      {/* Comparison Table */}
      <section className="section-padding bg-card">
        <div className="container-content">
          <ScrollReveal className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">All Features <span className="hero-gradient-text">at a Glance</span></h2>
          </ScrollReveal>
          <ScrollReveal>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left px-4 py-3 font-display font-semibold text-foreground">Feature</th>
                    <th className="text-left px-4 py-3 font-display font-semibold text-foreground">Input</th>
                    <th className="text-left px-4 py-3 font-display font-semibold text-foreground">Languages</th>
                    <th className="text-left px-4 py-3 font-display font-semibold text-foreground">Data Stored</th>
                    <th className="text-left px-4 py-3 font-display font-semibold text-foreground">Output</th>
                    <th className="text-left px-4 py-3 font-display font-semibold text-foreground">For</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, i) => (
                    <tr key={row.feature} className={`border-t border-border ${i % 2 === 0 ? "bg-background" : "bg-card"}`}>
                      <td className="px-4 py-3 font-medium text-foreground">{row.feature}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.input}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.languages}</td>
                      <td className="px-4 py-3"><span className="text-accent font-semibold">{row.data}</span></td>
                      <td className="px-4 py-3 text-muted-foreground">{row.output}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.who}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="section-padding">
        <div className="container-content text-center">
          <ScrollReveal>
            <p className="text-muted-foreground mb-4">Have questions? Want to collaborate?</p>
            <Link to="/contact" className="inline-flex h-12 px-8 items-center rounded-xl font-semibold hero-gradient-bg text-primary-foreground btn-press text-sm gap-2">
              Contact Us <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Features;
