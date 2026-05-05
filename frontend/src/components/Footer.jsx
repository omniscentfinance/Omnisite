import { Mail, Instagram, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer
      id="contact"
      data-testid="contact-section"
      className="relative py-24 lg:py-32 bg-slate-900"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
          {/* Left - CTA */}
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400 mb-4"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Pronto a iniziare?
            </p>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mb-6"
              style={{ fontFamily: "'Outfit', sans-serif" }}
              data-testid="contact-title"
            >
              Contattaci
            </h2>
            <p className="text-base leading-relaxed text-slate-400 mb-8 max-w-md">
              Inviaci una mail per richiedere informazioni sui nostri percorsi formativi
              o per la creazione del tuo fondo PAMM. Ti risponderemo entro 24 ore.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:support@omniscent.space"
                data-testid="contact-email-button"
                className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                <Mail size={16} />
                support@omniscent.space
              </a>
              <a
                href="https://www.instagram.com/omniscent_group"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="contact-instagram-button"
                className="inline-flex items-center gap-3 border border-slate-700 text-white px-8 py-4 rounded-md text-sm font-medium hover:border-slate-500 transition-colors"
              >
                <Instagram size={16} />
                @omniscent_group
                <ArrowUpRight size={12} />
              </a>
            </div>
          </div>

          {/* Right - Quick links */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">
                Link rapidi
              </p>
              <nav className="grid grid-cols-2 gap-3">
                {[
                  { label: "Servizi", href: "#services" },
                  { label: "Risultati", href: "#stats" },
                  { label: "Testimonianze", href: "#testimonials" },
                  { label: "Chi Siamo", href: "#about" },
                  { label: "FAQ", href: "#faq" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    data-testid={`footer-${link.href.replace("#", "")}-link`}
                    className="text-sm text-slate-400 hover:text-white transition-colors py-1"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={scrollToTop}
            data-testid="footer-logo"
            className="text-lg font-semibold tracking-[0.2em] text-white hover:text-slate-300 transition-colors"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            OMNISCENT<sup className="text-xs">®</sup>
          </button>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} OMNISCENT®. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
}
