import { ArrowRight } from "lucide-react";
import { useLang } from "@/context/LangContext";
import OrderBookLadder from "@/components/OrderBookLadder";

export default function Hero() {
  const { t } = useLang();

  return (
    <section
      id="hero"
      data-testid="hero-section"
      className="relative min-h-screen flex items-center overflow-hidden pt-[170px] pb-[90px]"
    >
      <div className="grid-bg" />
      <div className="blob blob-violet -top-[14%] -left-[16%]" />
      <div className="blob blob-cyan -bottom-[18%] -right-[12%]" />

      <div className="relative z-10 w-full max-w-[1240px] mx-auto px-6 lg:px-10 grid gap-16 lg:gap-24 lg:grid-cols-[1.08fr_0.92fr] items-center">
        <div>
          <p className="overline fade-in-up">
            <span className="dot" />
            {t.hero.overline}
          </p>

          <h1
            className="display-xl fade-in-up delay-100 mt-6 text-[clamp(3.2rem,8.4vw,6.6rem)]"
            data-testid="hero-tagline"
          >
            {t.hero.tagline}
            <br />
            <span className="display-gradient">{t.hero.taglineAccent}</span>
          </h1>

          <p
            className="fade-in-up delay-200 mt-7 text-base lg:text-lg leading-[1.7] text-[var(--fg-muted)] max-w-[60ch]"
            data-testid="hero-subtitle"
          >
            {t.hero.subtitle}
          </p>

          <div className="fade-in-up delay-300 mt-10 flex flex-wrap gap-3.5">
            <button
              onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
              data-testid="hero-cta-button"
              className="btn-primary min-h-[48px] px-[26px] rounded-[10px] text-sm font-semibold inline-flex items-center gap-2.5"
            >
              {t.hero.cta} <ArrowRight size={15} />
            </button>
            <button
              data-testid="hero-discover-button"
              onClick={() => document.querySelector("#method")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-secondary min-h-[48px] px-[26px] rounded-[10px] text-sm font-semibold"
            >
              {t.hero.discover}
            </button>
          </div>

          <div className="fade-in-up delay-500 mt-11 pt-6 hairline flex flex-wrap gap-x-7 gap-y-4">
            {t.hero.cred.map((c) => (
              <div key={c.l} className="flex flex-col gap-0.5">
                <span className="font-[var(--font-heading)] text-2xl font-light tracking-tight text-white">{c.n}</span>
                <span className="mono text-[9.5px] tracking-[0.16em] uppercase text-[var(--fg-dim)]">{c.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ladder orderflow — dice cosa facciamo prima ancora che si legga il testo */}
        <OrderBookLadder className="fade-in-up delay-200" />

      </div>
    </section>
  );
}
