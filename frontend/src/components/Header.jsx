import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Globe, UserCircle } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import TickerBanner from "@/components/TickerBanner";

const LOGO_URL = "/omniscent-logo.png";

export default function Header({ variant = "landing" }) {
  const { t, lang, toggle } = useLang();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: t.nav.method, anchor: "#method" },
    { label: t.nav.services, anchor: "#services" },
    { label: t.nav.plans, route: "/piani", badge: variant !== "plans" },
    { label: t.nav.results, anchor: "#stats" },
    { label: t.nav.about, anchor: "#about" },
    { label: t.nav.faq, anchor: "#faq" },
  ];

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* HashRouter usa già l'hash per la rotta, quindi "#/#method" non funziona:
     dalle altre pagine si torna prima alla home, poi si scrolla a montaggio avvenuto. */
  const scrollTo = (anchor) => document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth" });

  const go = (link) => {
    setMobileOpen(false);
    if (link.route) {
      window.location.hash = link.route;
      return;
    }
    if (variant === "landing") {
      scrollTo(link.anchor);
    } else {
      window.location.hash = "/";
      setTimeout(() => scrollTo(link.anchor), 250);
    }
  };

  const goContact = () => {
    setMobileOpen(false);
    if (variant === "landing") scrollTo("#contact");
    else {
      window.location.hash = "/";
      setTimeout(() => scrollTo("#contact"), 250);
    }
  };

  const authLink = user
    ? { href: "#/dashboard", label: t.nav.dashboard, icon: true }
    : { href: "#/login", label: t.nav.login, icon: false };

  return (
    <header data-testid="site-header" className="fixed top-0 left-0 right-0 z-50 glass-header">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-[84px]">
          <a
            href={variant === "plans" ? "#/" : "#hero"}
            data-testid="nav-logo"
            onClick={() => variant === "landing" && window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center shrink-0"
          >
            <img src={LOGO_URL} alt="OMNISCENT® — Finance & Education" className="header-logo-img" />
          </a>

          <nav className="hidden lg:flex items-center gap-8" data-testid="desktop-nav">
            {navLinks.map((link) => (
              <button
                key={link.label}
                data-testid={`nav-${(link.anchor || "#piani").replace("#", "")}-link`}
                onClick={() => go(link)}
                className={`nav-link text-[13.5px] font-medium py-1.5 ${
                  variant === "plans" && link.route ? "active" : ""
                }`}
              >
                {link.label}
                {link.badge && <span className="badge-new ml-2 align-middle">nuovo</span>}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:gap-4">
            <button
              data-testid="lang-toggle"
              onClick={toggle}
              aria-label={lang === "it" ? "Switch to English" : "Passa all'italiano"}
              className="mono flex items-center gap-1.5 text-[11px] tracking-[0.1em] text-[var(--fg-dim)] hover:text-[var(--fg)] border border-[var(--line)] hover:border-[var(--line-hi)] rounded-md px-2.5 min-h-[34px] transition-colors"
            >
              <Globe size={12} />
              {lang === "it" ? "EN" : "IT"}
            </button>

            <a
              href={authLink.href}
              data-testid="nav-auth-link"
              className={`btn-auth hidden lg:inline-flex items-center gap-2 min-h-[42px] px-4 rounded-[9px] text-[13px] font-medium ${
                user ? "text-[var(--violet-text)] border-[rgba(139,92,246,0.35)]" : ""
              }`}
            >
              {authLink.icon && <UserCircle size={15} />}
              {authLink.label}
            </a>

            <button
              onClick={goContact}
              data-testid="nav-cta-button"
              className="btn-primary hidden lg:inline-flex items-center gap-2 min-h-[42px] px-5 rounded-[10px] text-[13px] font-semibold"
            >
              {t.nav.cta} <ArrowRight size={14} />
            </button>

            <button
              data-testid="mobile-menu-toggle"
              aria-label="Menu"
              aria-expanded={mobileOpen}
              className="lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px]"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} className="text-[var(--fg)]" /> : <Menu size={22} className="text-[var(--fg)]" />}
            </button>
          </div>
        </div>
      </div>

      <TickerBanner />

      {mobileOpen && (
        <div
          data-testid="mobile-menu"
          className="lg:hidden bg-[rgba(11,11,15,0.97)] backdrop-blur-xl border-t border-[var(--line)] px-6 py-5 max-h-[calc(100vh-110px)] overflow-y-auto"
        >
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <button
                key={link.label}
                data-testid={`mobile-nav-${(link.anchor || "#piani").replace("#", "")}-link`}
                onClick={() => go(link)}
                className="text-base font-medium text-[var(--fg)] text-left py-3.5 min-h-[44px] border-b border-[var(--line)] flex items-center"
              >
                {link.label}
                {link.badge && <span className="badge-new ml-2">nuovo</span>}
              </button>
            ))}

            <div className="flex flex-col gap-2.5 mt-5">
              <button
                onClick={goContact}
                data-testid="mobile-nav-cta-button"
                className="btn-primary min-h-[48px] px-6 rounded-[10px] text-sm font-semibold inline-flex items-center gap-2 justify-center"
              >
                {t.nav.cta} <ArrowRight size={14} />
              </button>
              <a
                href={authLink.href}
                onClick={() => setMobileOpen(false)}
                data-testid="mobile-nav-auth-link"
                className={`btn-auth inline-flex items-center gap-2 justify-center min-h-[48px] px-6 rounded-[10px] text-sm font-medium ${
                  user ? "text-[var(--violet-text)] border-[rgba(139,92,246,0.35)]" : ""
                }`}
              >
                {authLink.icon && <UserCircle size={15} />}
                {authLink.label}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
