import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  { label: "Docs", to: "/docs" },
  { label: "Contact", to: "/contact" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass-header shadow-sm" : "bg-transparent"
        }`}
    >
      <div className="container-content flex items-center justify-between h-16 sm:h-18 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 btn-press">
          <div className="w-8 h-8 rounded-lg hero-gradient-bg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
              <path d="M4 18C4 18 4 14 12 14C20 14 20 18 20 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="4" cy="12" r="2" fill="white" />
              <circle cx="20" cy="12" r="2" fill="white" />
              <path d="M12 14V8" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="6" r="2" fill="white" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-foreground">BharatSetu</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {location.pathname !== "/" && <ThemeToggle />}
          <Link
            to="/features"
            className="hidden sm:inline-flex h-9 px-4 items-center rounded-lg text-sm font-semibold hero-gradient-bg text-primary-foreground btn-press transition-opacity hover:opacity-90"
          >
            Explore Platform
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <nav className="glass-header px-4 pb-4 pt-2 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/features"
            className="mt-2 h-10 flex items-center justify-center rounded-lg text-sm font-semibold hero-gradient-bg text-primary-foreground btn-press"
          >
            Explore Platform
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
