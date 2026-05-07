import { Mail, Instagram, ArrowUpRight } from "lucide-react";
import ContactForm from "@/components/ContactForm";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_orderflow-academy/artifacts/64cx6deb_1.png";

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer
      id="contact"
      data-testid="contact-section"
      className="relative"
    >
      {/* Contact form section */}
      <div className="py-24 lg:py-32 bg-[#09090B]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left - Info */}
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
                Inviaci un messaggio per richiedere informazioni sui nostri percorsi formativi
                o per la creazione del tuo fondo PAMM. Ti risponderemo entro 24 ore.
              </p>

              <div className="flex flex-col gap-4">
                <a
                  href="mailto:support@omniscent.space"
                  data-testid="contact-email-button"
                  className="inline-flex items-center gap-3 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <Mail size={16} />
                  support@omniscent.space
                </a>
                <a
                  href="https://www.instagram.com/omniscent_group"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="contact-instagram-button"
                  className="inline-flex items-center gap-3 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <Instagram size={16} />
                  @omniscent_group
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </div>

            {/* Right - Form */}
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Dark footer bar */}
      <div className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Logo */}
            <button
              onClick={scrollToTop}
              data-testid="footer-logo"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src={LOGO_URL} alt="OMNISCENT®" className="h-10 w-auto rounded" />
            </button>

            {/* Quick links */}
            <nav className="flex flex-wrap items-center justify-center gap-6" data-testid="footer-nav">
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
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Copyright */}
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} OMNISCENT®. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
