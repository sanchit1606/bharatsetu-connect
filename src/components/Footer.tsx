import { Link } from "react-router-dom";
import { TextHoverEffect, FooterBackgroundGradient } from "./ui/text-hover-effect";

const Footer = () => {
  return (
    <footer className="relative border-t border-white/5 overflow-hidden">
      <FooterBackgroundGradient />

      <div className="relative z-10">
        {/* TextHoverEffect brand */}
        <div className="h-[12rem] flex items-center justify-center">
          <TextHoverEffect text="BharatSetu" />
        </div>

        {/* Footer content */}
        <div className="container-content px-4 sm:px-6 lg:px-8 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg hero-gradient-bg flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4 18C4 18 4 14 12 14C20 14 20 18 20 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="4" cy="12" r="2" fill="white" />
                    <circle cx="20" cy="12" r="2" fill="white" />
                    <path d="M12 14V8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="6" r="2" fill="white" />
                  </svg>
                </div>
                <span className="font-display font-bold text-lg text-foreground">BharatSetu</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Bridging Every Indian to Information, Rights & Care. An AI-powered public service platform built to empower 1.4 billion citizens.
              </p>
              {/* Socials — LinkedIn & GitHub only */}
              <div className="flex items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/sanchit1606/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors group"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4 text-muted-foreground group-hover:text-[#0A66C2] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://github.com/sanchit1606"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors group"
                  aria-label="GitHub"
                >
                  <svg className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Home", to: "/" },
                  { label: "Features", to: "/features" },
                  { label: "Documentation", to: "/docs" },
                  { label: "Contact", to: "/contact" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Built On */}
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">Built On</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Powered by open-source AI and built for scale on AMD Developer Cloud.
              </p>
              <span className="inline-flex items-center gap-1 text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full font-medium">
                Built for AMD Slingshot 2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
