import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Globe, UserCircle } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_orderflow-academy/artifacts/64cx6deb_1.png";

export default function Header() {
  const { t, lang, toggle } = useLang();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: t.nav.services, href: "#services" },
    { label: t.nav.results, href: "#stats" },
    { label: t.nav.testimonials, href: "#testimonials" },
    { label: t.nav.about, href: "#about" },
    { label: t.nav.faq, href: "#faq" },
    { label: t.nav.contact, href: "#contact" },
  ];

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
          <a
            href="#hero"
            data-testid="nav-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3"
          >
            <img src={LOGO_URL} alt="OMNISCENT®" className="header-logo-img" />
          </a>

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
            <button
              data-testid="lang-toggle"
              onClick={toggle}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-white transition-colors uppercase tracking-wider border border-[#1E1E2A] px-3 py-1.5 rounded-md hover:border-violet-500/30"
            >
              <Globe size={13} />
              {lang === "it" ? "EN" : "IT"}
            </button>
            {user ? (
              <a
                href="#/dashboard"
                className="flex items-center gap-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors border border-violet-500/30 px-4 py-2 rounded-md"
              >
                <UserCircle size={16} /> Area Riservata
              </a>
            ) : (
              <a
                href="#/login"
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors border border-[#1E1E2A] px-4 py-2 rounded-md hover:border-violet-500/30"
              >
                Accedi
              </a>
            )}
            <button
              onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="nav-cta-button"
              className="btn-primary px-6 py-2.5 rounded-md text-sm font-medium inline-flex items-center gap-2"
            >
              {t.nav.cta} <ArrowRight size={14} />
            </button>
          </nav>

          <div className="lg:hidden flex items-center gap-3">
            <button
              data-testid="lang-toggle-mobile"
              onClick={toggle}
              className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors uppercase tracking-wider border border-[#1E1E2A] px-2.5 py-1.5 rounded-md"
            >
              <Globe size={12} />
              {lang === "it" ? "EN" : "IT"}
            </button>
            <button
              data-testid="mobile-menu-toggle"
              className="lg:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} className="text-slate-300" /> : <Menu size={24} className="text-slate-300" />}
            </button>
          </div>
        </div>
      </div>

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
            <button
              onClick={() => { setMobileOpen(false); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }}
              data-testid="mobile-nav-cta-button"
              className="btn-primary px-6 py-3 rounded-md text-sm font-medium inline-flex items-center gap-2 justify-center mt-2"
            >
              {t.nav.cta} <ArrowRight size={14} />
            </button>
            {user ? (
              <a href="#/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 justify-center text-sm font-medium text-violet-400 border border-violet-500/30 px-6 py-3 rounded-md">
                <UserCircle size={16} /> Area Riservata
              </a>
            ) : (
              <a href="#/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center text-sm font-medium text-slate-300 border border-[#1E1E2A] px-6 py-3 rounded-md">
                Accedi
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
