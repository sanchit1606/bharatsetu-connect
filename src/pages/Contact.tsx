import { useState } from "react";
import { Send, CheckCircle2, Handshake, School, Landmark, Newspaper, Bug, ChevronDown } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const subjectOptions = ["General Inquiry", "Collaboration", "Report a Bug", "Press & Media", "Other"];

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
  const [form, setForm] = useState({ name: "", email: "", org: "", subject: "General Inquiry", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="section-padding pb-8">
        <div className="container-content text-center">
          <ScrollReveal>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">Get In <span className="hero-gradient-text">Touch</span></h1>
            <p className="text-muted-foreground max-w-lg mx-auto">Whether you're a student, researcher, NGO, or government body — we'd love to connect.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Form + Info */}
      <section className="section-padding pt-0">
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Form */}
            <ScrollReveal>
              {submitted ? (
                <div className="bg-card rounded-2xl p-8 card-elevated text-center">
                  <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-4" />
                  <h3 className="font-display font-bold text-xl text-foreground mb-2">Message sent!</h3>
                  <p className="text-muted-foreground text-sm">We'll be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 lg:p-8 card-elevated space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email Address</label>
                    <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Organization / College <span className="text-muted-foreground">(optional)</span></label>
                    <input value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Subject</label>
                    <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow appearance-none">
                      {subjectOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                    <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow resize-none" />
                  </div>
                  <button type="submit" className="w-full h-12 rounded-xl font-semibold hero-gradient-bg text-primary-foreground btn-press text-sm inline-flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </form>
              )}
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
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">Frequently Asked <span className="hero-gradient-text">Questions</span></h2>
          </ScrollReveal>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <div className="bg-background rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left btn-press"
                  >
                    <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                    <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
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
