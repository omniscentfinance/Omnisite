import { TrendingUp, BarChart3, CreditCard, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useLang } from "@/context/LangContext";

/** Volume profile + curva: astratto, ma è letteralmente ciò che insegniamo a leggere. */
function OrderflowVisual() {
  const { bars, line } = useMemo(() => {
    const b = Array.from({ length: 34 }, (_, k) => ({
      y: k * 7 + 3,
      w: 20 + Math.random() * 118,
      o: (0.07 + Math.random() * 0.17).toFixed(2),
    }));
    const w = 300, h = 240, n = 34;
    let y = h * 0.6;
    const pts = [];
    for (let i = 0; i < n; i++) {
      y += Math.sin(i * 0.42) * h * 0.1 + (Math.random() - 0.5) * h * 0.09;
      y = Math.max(h * 0.14, Math.min(h * 0.86, y));
      pts.push([i * (w / (n - 1)), y]);
    }
    return {
      bars: b,
      line: pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" "),
    };
  }, []);

  return (
    <svg
      viewBox="0 0 300 240"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="svcFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity=".28" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {bars.map((b, i) => (
        <rect key={i} x="0" y={b.y} width={b.w.toFixed(0)} height="4" rx="1" fill="#8B5CF6" opacity={b.o} />
      ))}
      <path d={`${line} L300 240 L0 240 Z`} fill="url(#svcFill)" />
      <path d={line} fill="none" stroke="#A78BFA" strokeWidth="1.6" />
    </svg>
  );
}

function Tags({ items }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {items.map((tag) => (
        <span key={tag} className="tag">{tag}</span>
      ))}
    </div>
  );
}

export default function Services() {
  const sectionRef = useScrollReveal();
  const { t } = useLang();
  const scrollToContact = () =>
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="services"
      data-testid="services-section"
      className="relative py-24 lg:py-32 section-alt"
      ref={sectionRef}
    >
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
        <div className="mb-16 scroll-reveal">
          <p className="overline"><span className="dot" />{t.services.overline}</p>
          <h2
            className="mt-4 text-[clamp(2rem,4.2vw,3.4rem)] font-light tracking-[-0.03em] leading-[1.02] text-white"
            data-testid="services-title"
          >
            {t.services.title}
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Orderflow — card larga con visual */}
          <article
            data-testid="service-orderflow-card"
            className="service-card rounded-[14px] lg:col-span-2 grid md:grid-cols-2 scroll-reveal delay-1"
          >
            <div className="p-8 lg:p-9 flex flex-col justify-between">
              <div>
                <div className="w-[46px] h-[46px] rounded-xl bg-[rgba(139,92,246,0.13)] border border-[rgba(139,92,246,0.22)] flex items-center justify-center mb-6 text-[var(--violet-text)]">
                  <TrendingUp size={21} strokeWidth={1.6} />
                </div>
                <h3 className="text-2xl lg:text-[1.75rem] font-normal tracking-tight text-white mb-3.5">
                  {t.services.orderflow.title}
                </h3>
                <p className="text-[14.5px] leading-[1.7] text-[var(--fg-muted)] mb-6">
                  {t.services.orderflow.desc}
                </p>
                <Tags items={t.services.orderflow.tags} />
              </div>
              <button
                onClick={scrollToContact}
                data-testid="service-orderflow-cta"
                className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[var(--violet-text)] min-h-[44px] self-start transition-all hover:gap-3"
              >
                {t.services.orderflow.cta} <ArrowRight size={14} />
              </button>
            </div>
            <div className="relative min-h-[230px] overflow-hidden bg-[linear-gradient(140deg,#151520,#0C0C11)]">
              <OrderflowVisual />
            </div>
          </article>

          {/* Strategia */}
          <article
            data-testid="service-strategy-card"
            className="service-card rounded-[14px] p-8 lg:p-9 flex flex-col justify-between scroll-reveal delay-2"
          >
            <div>
              <div className="w-[46px] h-[46px] rounded-xl bg-[rgba(139,92,246,0.13)] border border-[rgba(139,92,246,0.22)] flex items-center justify-center mb-6 text-[var(--violet-text)]">
                <BarChart3 size={21} strokeWidth={1.6} />
              </div>
              <h3 className="text-2xl font-normal tracking-tight text-white mb-3.5">
                {t.services.strategy.title}
              </h3>
              <p className="text-[14.5px] leading-[1.7] text-[var(--fg-muted)] mb-6">
                {t.services.strategy.desc}
              </p>
              <Tags items={t.services.strategy.tags} />
            </div>
            <button
              onClick={scrollToContact}
              data-testid="service-strategy-cta"
              className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[var(--violet-text)] min-h-[44px] self-start transition-all hover:gap-3"
            >
              {t.services.strategy.cta} <ArrowRight size={14} />
            </button>
          </article>

          {/* PAMM — banda intera */}
          <article
            data-testid="service-pamm-card"
            className="service-card blue-glow rounded-[14px] p-8 lg:p-9 lg:col-span-3 scroll-reveal delay-3"
          >
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="w-[46px] h-[46px] rounded-xl bg-[rgba(56,189,248,0.12)] border border-[rgba(56,189,248,0.24)] flex items-center justify-center mb-6 text-[var(--cyan)]">
                  <CreditCard size={21} strokeWidth={1.6} />
                </div>
                <h3 className="text-2xl lg:text-[1.75rem] font-normal tracking-tight text-white mb-3.5">
                  {t.services.pamm.title}
                </h3>
                <p className="text-[14.5px] leading-[1.7] text-[var(--fg-muted)] mb-6 max-w-[64ch]">
                  {t.services.pamm.desc}
                </p>
                <Tags items={t.services.pamm.tags} />
              </div>
              <button
                onClick={scrollToContact}
                data-testid="service-pamm-cta"
                className="btn-primary min-h-[48px] px-[26px] rounded-[10px] text-sm font-semibold inline-flex items-center gap-2.5 justify-self-start"
              >
                {t.services.pamm.cta} <ArrowRight size={15} />
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
