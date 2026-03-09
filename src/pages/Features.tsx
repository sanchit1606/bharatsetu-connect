import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ScanSearch, Megaphone, ShieldCheck, Microscope, Flower2, ArrowRight, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const featureTabs = [
  { id: "label-auditor", labelKey: "tab_label_auditor", icon: ScanSearch },
  { id: "civicsense", labelKey: "tab_civicsense", icon: Megaphone },
  { id: "rights-assistant", labelKey: "tab_rights", icon: ShieldCheck },
  { id: "lab-analyzer", labelKey: "tab_lab", icon: Microscope },
  { id: "gynaecare", labelKey: "tab_gynae", icon: Flower2 },
];

const FeatureSection = ({
  id, badge, headline, description, steps, results, reversed, privacy, disclaimer,
  howItWorks, whatYouGet, tryLiveLabel, tryButtonLabel, tryButtonDisabled, comingSoonTitle,
}: {
  id: string; badge: string; headline: string; description: string;
  steps: string[]; results: string[]; reversed?: boolean; privacy?: string; disclaimer?: string;
  howItWorks: string; whatYouGet: string; tryLiveLabel: string; tryButtonLabel: string; tryButtonDisabled: boolean; comingSoonTitle: string;
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
            <h4 className="font-display font-semibold text-foreground mb-4">{howItWorks}</h4>
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
            <h4 className="font-display font-semibold text-foreground mb-3">{whatYouGet}</h4>
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
                <p className="text-sm">{tryLiveLabel}</p>
              </div>
            </div>
            {!tryButtonDisabled ? (
              <Link
                to={
                  id === "label-auditor"
                    ? "/label-auditor"
                    : id === "civicsense"
                    ? "/civicsense"
                    : id === "rights-assistant"
                    ? "/rights-assistant"
                    : id === "lab-analyzer"
                    ? "/lab-report"
                    : "/gynaecare"
                }
                className="mt-4 w-full h-12 rounded-xl font-semibold hero-gradient-bg text-primary-foreground btn-press flex items-center justify-center text-sm flex-shrink-0"
              >
                {tryButtonLabel}
              </Link>
            ) : (
              <button
                disabled
                className="mt-4 w-full h-12 rounded-xl font-semibold bg-muted text-muted-foreground cursor-not-allowed text-sm"
                title={comingSoonTitle}
              >
                {tryButtonLabel}
              </button>
            )}
          </ScrollReveal>
        </div>
      </div>
    </div>
  </section>
);

const Features = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const el = document.getElementById(location.hash.slice(1));
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen pt-16" key={lang}>
      {/* Hero */}
      <section className="section-padding pb-8" style={{ minHeight: "50vh", display: "flex", alignItems: "center" }}>
        <div className="container-content text-center">
          <ScrollReveal>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4">
              {lang === "en"
                ? <> {t("features_page.hero_headline").replace("Can Do For You", "")} <span className="hero-gradient-text">Can Do For You</span></>
                : <span className="hero-gradient-text">{t("features_page.hero_headline")}</span>}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              {t("features_page.hero_subtext")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Sticky Tab Bar */}
      <div className="sticky top-16 z-40 glass-header border-b border-border">
        <div className="container-content px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="flex gap-1 overflow-x-auto overflow-y-hidden py-2 scrollbar-none snap-x max-w-full min-w-0">
            {featureTabs.map((t_item) => (
              <a
                key={t_item.id}
                href={`#${t_item.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors whitespace-nowrap snap-center btn-press"
              >
                <t_item.icon className="w-4 h-4" />
                {t(`features_page.${t_item.labelKey}`)}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Sections */}
      <FeatureSection
        id="label-auditor"
        badge={t("features_page.f1_badge")}
        headline={t("features_page.f1_headline")}
        description={t("features_page.f1_description")}
        steps={[t("features_page.f1_step_1"), t("features_page.f1_step_2"), t("features_page.f1_step_3"), t("features_page.f1_step_4")]}
        results={[t("features_page.f1_result_1"), t("features_page.f1_result_2"), t("features_page.f1_result_3"), t("features_page.f1_result_4")]}
        howItWorks={t("features_page.how_it_works")}
        whatYouGet={t("features_page.what_you_get")}
        tryLiveLabel={t("features_page.try_live_interface")}
        tryButtonLabel={t("features_page.try_it")}
        tryButtonDisabled={false}
        comingSoonTitle={t("features_page.coming_soon")}
      />

      <div className="border-t border-border" />

      <FeatureSection
        id="civicsense"
        badge={t("features_page.f2_badge")}
        headline={t("features_page.f2_headline")}
        description={t("features_page.f2_description")}
        reversed
        steps={[t("features_page.f2_step_1"), t("features_page.f2_step_2"), t("features_page.f2_step_3"), t("features_page.f2_step_4")]}
        results={[t("features_page.f2_result_1"), t("features_page.f2_result_2"), t("features_page.f2_result_3"), t("features_page.f2_result_4")]}
        howItWorks={t("features_page.how_it_works")}
        whatYouGet={t("features_page.what_you_get")}
        tryLiveLabel={t("features_page.try_live_interface")}
        tryButtonLabel={t("features_page.try_it")}
        tryButtonDisabled={false}
        comingSoonTitle={t("features_page.coming_soon")}
      />

      <div className="border-t border-border" />

      <FeatureSection
        id="rights-assistant"
        badge={t("features_page.f3_badge")}
        headline={t("features_page.f3_headline")}
        description={t("features_page.f3_description")}
        steps={[t("features_page.f3_step_1"), t("features_page.f3_step_2"), t("features_page.f3_step_3"), t("features_page.f3_step_4")]}
        results={[t("features_page.f3_result_1"), t("features_page.f3_result_2"), t("features_page.f3_result_3"), t("features_page.f3_result_4"), t("features_page.f3_result_5")]}
        howItWorks={t("features_page.how_it_works")}
        whatYouGet={t("features_page.what_you_get")}
        tryLiveLabel={t("features_page.try_live_interface")}
        tryButtonLabel={t("features_page.try_it")}
        tryButtonDisabled={false}
        comingSoonTitle={t("features_page.coming_soon")}
      />

      <div className="border-t border-border" />

      <FeatureSection
        id="lab-analyzer"
        badge={t("features_page.f4_badge")}
        headline={t("features_page.f4_headline")}
        description={t("features_page.f4_description")}
        reversed
        disclaimer={t("features_page.f4_disclaimer")}
        steps={[t("features_page.f4_step_1"), t("features_page.f4_step_2"), t("features_page.f4_step_3"), t("features_page.f4_step_4")]}
        results={[t("features_page.f4_result_1"), t("features_page.f4_result_2"), t("features_page.f4_result_3"), t("features_page.f4_result_4"), t("features_page.f4_result_5")]}
        privacy={t("features_page.f4_privacy")}
        howItWorks={t("features_page.how_it_works")}
        whatYouGet={t("features_page.what_you_get")}
        tryLiveLabel={t("features_page.try_live_interface")}
        tryButtonLabel={t("features_page.try_it")}
        tryButtonDisabled={false}
        comingSoonTitle={t("features_page.coming_soon")}
      />

      <div className="border-t border-border" />

      <FeatureSection
        id="gynaecare"
        badge={t("features_page.f5_badge")}
        headline={t("features_page.f5_headline")}
        description={t("features_page.f5_description")}
        disclaimer={t("features_page.f5_disclaimer")}
        steps={[t("features_page.f5_step_1"), t("features_page.f5_step_2"), t("features_page.f5_step_3"), t("features_page.f5_step_4")]}
        results={[t("features_page.f5_result_1"), t("features_page.f5_result_2"), t("features_page.f5_result_3"), t("features_page.f5_result_4"), t("features_page.f5_result_5")]}
        privacy={t("features_page.f5_privacy")}
        howItWorks={t("features_page.how_it_works")}
        whatYouGet={t("features_page.what_you_get")}
        tryLiveLabel={t("features_page.try_live_interface")}
        tryButtonLabel={t("features_page.try_it")}
        tryButtonDisabled={false}
        comingSoonTitle={t("features_page.coming_soon")}
      />

      {/* Footer CTA */}
      <section className="section-padding">
        <div className="container-content text-center">
          <ScrollReveal>
            <p className="text-muted-foreground mb-4">{t("features_page.footer_cta_text")}</p>
            <Link to="/contact" className="inline-flex h-12 px-8 items-center rounded-xl font-semibold hero-gradient-bg text-primary-foreground btn-press text-sm gap-2">
              {t("features_page.footer_cta_button").replace(" →", "")} <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Features;
