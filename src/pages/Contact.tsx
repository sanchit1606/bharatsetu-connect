import { useState } from "react";
import { Mail, Github, Linkedin, Handshake, School, Landmark, Newspaper, Bug, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import ScrollReveal from "@/components/ScrollReveal";

const whoItems = [
  { icon: Handshake, text: "NGOs and social organizations interested in partnerships" },
  { icon: School, text: "Colleges and universities for campus deployment" },
  { icon: Landmark, text: "Government bodies for integration discussions" },
  { icon: Newspaper, text: "Press and media for coverage" },
  { icon: Bug, text: "Anyone who found a bug or has feedback" },
];

const faqs = [
  { q: "Is BharatSetu completely free?", a: "Yes. BharatSetu is free for all users and will remain so. It operates entirely within free-tier infrastructure." },
  { q: "Is my data safe?", a: "Absolutely. Sensitive features like Lab Report Analyzer and GynaeCare store zero personal data. All processing is in-memory and discarded immediately after your session." },
  { q: "What languages are supported?", a: "BharatSetu supports Hindi, English, and several regional Indian languages including Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Gujarati, Punjabi, and Odia." },
  { q: "Can I use BharatSetu on my mobile phone?", a: "Yes. BharatSetu is designed mobile-first and works on any Android or iOS smartphone with a browser and internet connection." },
  { q: "Is the legal or health information provided accurate?", a: "BharatSetu sources information from verified bodies — WHO, ICMR, NHS, IndiaCode, FSSAI — and always cites its sources. It is an educational tool and always recommends consulting a professional for medical or legal decisions." },
];

const Contact = () => {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const contactButtons = [
    {
      label: t("contact_page.email"),
      icon: Mail,
      href: "mailto:sanchitnipanikar@gmail.com",
      color: "from-[#EA4335] to-[#C5221F]" // Google Red
    },
    {
      label: t("contact_page.github"),
      icon: Github,
      href: "https://github.com/sanchit1606",
      color: "from-[#24292F] to-[#000000]" // Github Dark
    },
    {
      label: t("contact_page.linkedin"),
      icon: Linkedin,
      href: "https://www.linkedin.com/in/sanchit1606",
      color: "from-[#0A66C2] to-[#004182]" // LinkedIn Blue
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="section-padding pb-8">
        <div className="container-content text-center">
          <ScrollReveal>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">{t("contact_page.hero_headline").split(" ")[0]} <span className="hero-gradient-text">{t("contact_page.hero_headline").split(" ").slice(1).join(" ")}</span></h1>
            <p className="text-muted-foreground max-w-lg mx-auto">{t("contact_page.hero_subtext")}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Buttons + Info */}
      <section className="section-padding pt-0">
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Buttons */}
            <ScrollReveal>
              <div className="grid grid-cols-1 gap-4">
                {contactButtons.map((btn) => (
                  <a
                    key={btn.label}
                    href={btn.href}
                    target={btn.href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className={`group relative flex items-center justify-between p-6 rounded-2xl bg-card border border-border card-elevated btn-press overflow-hidden transition-all hover:border-primary/50`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${btn.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                        <btn.icon className="w-6 h-6" />
                      </div>
                      <span className="font-display font-bold text-lg text-foreground">{btn.label}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:translate-x-1 transition-transform relative z-10">
                      <ChevronDown className="w-5 h-5 text-primary -rotate-90" />
                    </div>
                  </a>
                ))}
              </div>
            </ScrollReveal>

            {/* Info */}
            <ScrollReveal delay={100}>
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-4">Who Should Reach Out</h3>
                  <div className="space-y-3">
                    {whoItems.map((item) => (
                      <div key={item.text} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <item.icon className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pt-1">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-card rounded-2xl p-6 card-elevated">
                  <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-full">Built for AMD Slingshot 2026</span>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    BharatSetu was built for the AMD Slingshot 2026 hackathon, demonstrating how AI can serve public good at scale using open-source tools on AMD infrastructure.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                  Made in India 🇮🇳
                </span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-card">
        <div className="container-content max-w-3xl">
          <ScrollReveal className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">{t("contact_page.faq_title").split(" ")[0]} {t("contact_page.faq_title").split(" ")[1]} <span className="hero-gradient-text">{t("contact_page.faq_title").split(" ").slice(2).join(" ")}</span></h2>
          </ScrollReveal>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((num) => (
              <ScrollReveal key={num} delay={num * 60}>
                <div className="bg-background rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === num ? null : num)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left btn-press"
                  >
                    <span className="text-sm font-semibold text-foreground pr-4">{t(`contact_page.faq_${num}_q`)}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${openFaq === num ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === num ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                    <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{t(`contact_page.faq_${num}_a`)}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
