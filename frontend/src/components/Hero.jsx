import { ArrowRight, ChevronDown } from "lucide-react";
import { useLang } from "@/context/LangContext";

const HERO_IMAGE = "https://static.prod-images.emergentagent.com/jobs/3b2e6497-db95-4d04-a9ed-c34309b6d69c/images/d178dae7be160710b478bb8b1e99d87ea0eaf5499217e784aa8cf65dfdabddf1.png";

export default function Hero() {
  const { t } = useLang();

  return (
    <section
      id="hero"
      data-testid="hero-section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />
      <div className="hero-overlay absolute inset-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center pt-20">
        <div className="fade-in-up">
          <p
            className="text-xs font-bold uppercase tracking-[0.25em] text-sky-400 mb-6"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            {t.hero.overline}
          </p>
        </div>

        <h1
          className="fade-in-up delay-100 text-5xl sm:text-6xl lg:text-[5rem] font-light tracking-tighter leading-none text-white mb-6"
          style={{ fontFamily: "'Outfit', sans-serif" }}
          data-testid="hero-tagline"
        >
          {t.hero.tagline}
        </h1>

        <p
          className="fade-in-up delay-200 text-base lg:text-lg leading-relaxed text-slate-400 max-w-2xl mx-auto mb-10"
          style={{ fontFamily: "'Manrope', sans-serif" }}
          data-testid="hero-subtitle"
        >
          {t.hero.subtitle}
        </p>

        <div className="fade-in-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:support@omniscent.space?subject=Richiesta%20informazioni%20percorso"
            data-testid="hero-cta-button"
            className="btn-primary px-8 py-4 rounded-md text-sm font-medium inline-flex items-center gap-2"
          >
            {t.hero.cta} <ArrowRight size={16} />
          </a>
          <button
            data-testid="hero-discover-button"
            onClick={() => document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-secondary px-8 py-4 rounded-md text-sm font-medium"
          >
            {t.hero.discover}
          </button>
        </div>

        <div className="fade-in-up delay-500 mt-20 flex justify-center">
          <button
            data-testid="hero-scroll-indicator"
            onClick={() => document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" })}
            className="animate-bounce text-slate-500 hover:text-violet-400 transition-colors"
          >
            <ChevronDown size={28} />
          </button>
        </div>
      </div>
    </section>
  );
}
