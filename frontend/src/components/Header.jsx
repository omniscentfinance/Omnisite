import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_orderflow-academy/artifacts/64cx6deb_1.png";

const navLinks = [
  { label: "Servizi", href: "#services" },
  { label: "Risultati", href: "#stats" },
  { label: "Testimonianze", href: "#testimonials" },
  { label: "Chi Siamo", href: "#about" },
  { label: "FAQ", href: "#faq" },
  { label: "Contatti", href: "#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-header shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a
            href="#hero"
            data-testid="nav-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3"
          >
            <img
              src={LOGO_URL}
              alt="OMNISCENT®"
              className="header-logo-img"
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8" data-testid="desktop-nav">
            {navLinks.map((link) => (
              <button
                key={link.href}
                data-testid={`nav-${link.href.replace("#", "")}-link`}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium text-slate-400 hover:text-violet-400 transition-colors tracking-wide"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                {link.label}
              </button>
            ))}
            <a
              href="mailto:support@omniscent.space"
              data-testid="nav-cta-button"
              className="btn-primary px-6 py-2.5 rounded-md text-sm font-medium inline-flex items-center gap-2"
            >
              Inizia ora <ArrowRight size={14} />
            </a>
          </nav>

          {/* Mobile toggle */}
          <button
            data-testid="mobile-menu-toggle"
            className="lg:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} className="text-slate-300" /> : <Menu size={24} className="text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          data-testid="mobile-menu"
          className="lg:hidden bg-[#09090B]/95 backdrop-blur-xl border-t border-[#1E1E2A] px-6 py-6"
        >
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                data-testid={`mobile-nav-${link.href.replace("#", "")}-link`}
                onClick={() => handleNavClick(link.href)}
                className="text-base font-medium text-slate-300 hover:text-violet-400 text-left py-2 transition-colors"
              >
                {link.label}
              </button>
            ))}
            <a
              href="mailto:support@omniscent.space"
              data-testid="mobile-nav-cta-button"
              className="btn-primary px-6 py-3 rounded-md text-sm font-medium inline-flex items-center gap-2 justify-center mt-2"
            >
              Inizia ora <ArrowRight size={14} />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
