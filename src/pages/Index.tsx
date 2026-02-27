import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Package, Scale, Building2, Heart, ScanSearch, Megaphone, ShieldCheck, Microscope, Flower2, Lock, Globe, Smartphone, Zap, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import StatCounter from "@/components/StatCounter";
import WebGLShader from "@/components/WebGLShader";
import Footer from "@/components/Footer";

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [started, text]);

  return <>{displayed}<span className="animate-pulse">|</span></>;
};

const problemCards = [
  { icon: Package, emoji: "📦", title: "Label Blindness", stat: "90% of Indians read product labels, but only 33% check nutrition facts. Poor label literacy drives India's NCD epidemic." },
  { icon: Scale, emoji: "⚖️", title: "Legal Invisibility", stat: "Most Indians have never read their fundamental rights. Complex legal language makes justice inaccessible to those who need it most." },
  { icon: Building2, emoji: "🏙️", title: "Civic Silence", stat: "157 million Indians still lack access to basic sanitation. Not because solutions don't exist — but because complaints never reach the right desk." },
  { icon: Heart, emoji: "👩", title: "Women's Health Taboo", stat: "48% of adolescent girls in India had no knowledge of menstruation before their first period. Cultural silence costs lives." },
];

const features = [
  { icon: ScanSearch, name: "Label Auditor", tagline: "Scan. Understand. Decide.", description: "Photograph any food or cosmetic label. Get instant plain-language analysis of ingredients, health risks, and misleading claims — personalized to your health condition.", anchor: "label-auditor" },
  { icon: Megaphone, name: "CivicSense", tagline: "Report It. Route It. Resolve It.", description: "Describe a civic issue in your own words or language. CivicSense identifies the right authority, drafts a professional complaint, and gives you multiple ways to submit it.", anchor: "civicsense" },
  { icon: ShieldCheck, name: "Rights Assistant", tagline: "Legal Clarity. Without the Lawyer.", description: "Upload any government document, contract, or notice. Our AI explains it in plain language, tells you your rights, and guides your next steps — in your language.", anchor: "rights-assistant" },
  { icon: Microscope, name: "Lab Report Analyzer", tagline: "Your Reports. Finally Explained.", description: "Upload your medical lab report and get a simple, visual breakdown of every value — compared against healthy ranges — with diet suggestions. Zero data stored.", anchor: "lab-analyzer" },
  { icon: Flower2, name: "GynaeCare", tagline: "Safe. Private. Stigma-Free.", description: "A private, anonymous chatbot for women's health — menstruation, PCOS, pregnancy, and general wellness — sourced from WHO and NHS. No data. No judgment.", anchor: "gynaecare" },
];

const steps = [
  { num: "01", title: "Speak or Type", desc: "Use your voice or type in Hindi, English, or your regional language. No forms. No jargon." },
  { num: "02", title: "AI Understands", desc: "Our AI reads, analyzes, and cross-references trusted sources — FSSAI, WHO, IndiaCode — instantly." },
  { num: "03", title: "You Decide", desc: "Get clear, personalized, actionable information. In your language. On your phone." },
];

const trustBadges = [
  { icon: Lock, label: "Zero Data Stored" },
  { icon: Globe, label: "10+ Languages" },
  { icon: Smartphone, label: "Works on Any Phone" },
  { icon: Zap, label: "Free Forever" },
];

const personas = [
  { emoji: "👨‍🌾", name: "Ravi, Farmer, Nagpur", quote: "Finally understood what chemicals are in the fertilizer bags I buy." },
  { emoji: "👩‍🏫", name: "Meena, Teacher, Jaipur", quote: "Used the Rights Assistant when my landlord tried to illegally evict me." },
  { emoji: "🧑‍🎓", name: "Arjun, Student, Chennai", quote: "My lab report scared me until BharatSetu explained every value simply." },
  { emoji: "👩", name: "Priya, College Student, Pune", quote: "GynaeCare answered questions I was too scared to Google." },
  { emoji: "👴", name: "Suresh, Retired, Lucknow", quote: "Filed a complaint about the broken road near my house. It was fixed in 3 days." },
];

const techBlocks = [
  { title: "Privacy First", desc: "Sensitive features like Lab Report Analyzer and GynaeCare store zero personal data. All processing happens in-memory and is deleted the moment your session ends.", icon: Lock },
  { title: "AMD-Powered Scale", desc: "Backend inference runs on AMD Developer Cloud with ROCm-optimized open-source LLMs, enabling fast, affordable responses for millions of users.", icon: Zap },
  { title: "Open Source Core", desc: "Built on LLaMA, ChromaDB, FastAPI, and other open-source tools. Transparent, auditable, and community-driven.", icon: Globe },
];

const Index = () => {
  // Force dark theme on home page, restore user preference on unmount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const wasDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.add("dark");

    return () => {
      if (savedTheme === "light" || (!savedTheme && !wasDark)) {
        document.documentElement.classList.remove("dark");
      }
    };
  }, []);
  return (
    <div className="min-h-screen relative">
      {/* WebGL Shader Background — fixed behind everything */}
      <WebGLShader />

      {/* All page content sits above the shader */}
      <div className="relative z-10">

        {/* Hero */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="container-content px-4 sm:px-6 lg:px-8 text-center relative z-10 pt-20">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-foreground leading-tight mb-4">
              <TypewriterText text="Your Rights. Your Health. Your Voice." />
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-primary font-medium mt-4 opacity-0 animate-fade-up" style={{ animationDelay: "1.8s", animationFillMode: "forwards" }}>
              Now powered by AI. Finally accessible to all.
            </p>
            <p className="max-w-2xl mx-auto text-muted-foreground mt-6 text-sm sm:text-base leading-relaxed opacity-0 animate-fade-up" style={{ animationDelay: "2s", animationFillMode: "forwards" }}>
              BharatSetu is a free, multilingual AI platform that helps every Indian citizen understand their health reports, know their legal rights, report civic issues, and access the information that was always meant for them.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 opacity-0 animate-fade-up" style={{ animationDelay: "2.2s", animationFillMode: "forwards" }}>
              <Link to="/features" className="h-12 px-8 inline-flex items-center rounded-xl font-semibold hero-gradient-bg text-primary-foreground btn-press text-sm gap-2">
                Explore Features <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#how-it-works" className="h-12 px-8 inline-flex items-center rounded-xl font-semibold border border-border text-foreground hover:bg-muted btn-press text-sm">
                How It Works
              </a>
            </div>
            <div className="grid grid-cols-3 gap-6 sm:gap-10 max-w-lg mx-auto mt-14 opacity-0 animate-fade-up" style={{ animationDelay: "2.5s", animationFillMode: "forwards" }}>
              <StatCounter end={5} label="AI-Powered Tools" />
              <StatCounter end={10} suffix="+" label="Indian Languages" />
              <StatCounter end={0} label="Data Stored or Sold" />
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle text-muted-foreground">
            <ChevronDown className="w-6 h-6" />
          </div>
        </section>

        {/* Problem Section */}
        <section className="section-padding">
          <div className="container-content">
            <ScrollReveal className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground">Millions of Indians. <span className="hero-gradient-text">Avoidable Gaps.</span></h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Not because the information doesn't exist. But because no one made it accessible.</p>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {problemCards.map((card, i) => (
                <ScrollReveal key={card.title} delay={i * 100}>
                  <div className="bg-background/30 backdrop-blur-md rounded-2xl p-6 lg:p-8 card-elevated h-full border border-white/5">
                    <span className="text-3xl mb-4 block">{card.emoji}</span>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{card.stat}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Features Snapshot */}
        <section className="section-padding">
          <div className="container-content">
            <ScrollReveal className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground">Five Tools. <span className="hero-gradient-text">One Mission.</span></h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Each feature is built around a real problem faced by real Indians every day.</p>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {features.map((f, i) => (
                <ScrollReveal key={f.name} delay={i * 80}>
                  <Link to={`/features#${f.anchor}`} className="block bg-card/30 backdrop-blur-md rounded-2xl p-6 lg:p-8 card-elevated h-full group border border-white/5 hover:bg-card/40 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <f.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-1">{f.name}</h3>
                    <p className="text-sm font-medium text-primary mb-3">{f.tagline}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.description}</p>
                    <span className="text-sm font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      See How <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="section-padding">
          <div className="container-content">
            <ScrollReveal className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground">Built for <span className="hero-gradient-text">Bharat.</span></h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Every design decision — from voice input to zero data storage — was made with the average Indian citizen in mind.</p>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
              {/* Connector line (desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-20" />
              {steps.map((step, i) => (
                <ScrollReveal key={step.num} delay={i * 200} className="text-center relative">
                  <div className="w-16 h-16 rounded-2xl hero-gradient-bg flex items-center justify-center mx-auto mb-4 text-primary-foreground font-display font-bold text-lg">{step.num}</div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </ScrollReveal>
              ))}
            </div>
            {/* Trust badges */}
            <ScrollReveal delay={400}>
              <div className="flex flex-wrap items-center justify-center gap-6 mt-14">
                {trustBadges.map((b) => (
                  <div key={b.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <b.icon className="w-4 h-4 text-primary" />
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Technology */}
        <section className="section-padding">
          <div className="container-content">
            <ScrollReveal className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground">Open. Responsible. <span className="hero-gradient-text">Fast.</span></h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">BharatSetu is built on open-source AI, scalable on AMD Developer Cloud infrastructure, and designed to operate at zero cost to citizens.</p>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {techBlocks.map((b, i) => (
                <ScrollReveal key={b.title} delay={i * 100}>
                  <div className="bg-card/30 backdrop-blur-md rounded-2xl p-6 lg:p-8 card-elevated h-full border border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                      <b.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-display font-bold text-foreground mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>


        {/* Final CTA */}
        <section className="relative section-padding overflow-hidden">
          <div className="container-content relative z-10 text-center">
            <ScrollReveal>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
                The information was always yours.<br /><span className="hero-gradient-text">Now it's accessible.</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Free. Private. Multilingual. Built for 1.4 billion Indians.</p>
              <Link to="/features" className="inline-flex h-12 px-8 items-center rounded-xl font-semibold hero-gradient-bg text-primary-foreground btn-press text-sm gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </ScrollReveal>
          </div>
        </section>

        <Footer />
      </div>{/* end content wrapper */}
    </div>
  );
};

export default Index;
