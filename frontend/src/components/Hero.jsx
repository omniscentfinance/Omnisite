import { ArrowRight, ChevronDown } from "lucide-react";
import { useLang } from "@/context/LangContext";

const HERO_VIDEO = "/hero_video.mp4";

export default function Hero() {
  const { t } = useLang();

  return (
    <section
      id="hero"
      data-testid="hero-section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        data-testid="hero-video"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
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
