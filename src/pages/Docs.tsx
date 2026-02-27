import { Link } from "react-router-dom";
import { FileText, ArrowRight, Mail } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const Docs = () => {
  return (
    <div className="min-h-screen pt-16 flex items-center">
      <div className="container-content section-padding text-center">
        <ScrollReveal>
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-float">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">Documentation</h1>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Detailed technical documentation, API references, and integration guides for BharatSetu are coming soon.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/features" className="inline-flex h-12 px-8 items-center rounded-xl font-semibold hero-gradient-bg text-primary-foreground btn-press text-sm gap-2">
              Explore Features <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Notify me */}
          <div className="mt-12 max-w-md mx-auto">
            <p className="text-sm text-muted-foreground mb-3">Get notified when docs are ready</p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                />
              </div>
              <button className="h-11 px-6 rounded-xl font-semibold hero-gradient-bg text-primary-foreground btn-press text-sm whitespace-nowrap">
                Notify Me
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Docs;
