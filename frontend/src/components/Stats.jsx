import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useLang } from "@/context/LangContext";

const LOGO_IMG = "/omniscent_logo_big.png";

export default function Stats() {
  const sectionRef = useScrollReveal();
  const { t } = useLang();

  return (
    <section id="stats" data-testid="stats-section" className="py-24 lg:py-32 bg-[#09090B]" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16 lg:mb-20 scroll-reveal">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400 mb-4" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {t.stats.overline}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid="stats-title">
            {t.stats.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 grid grid-cols-2 border border-slate-200 rounded-xl overflow-hidden bg-white scroll-reveal delay-1">
            {t.stats.items.map((stat, i) => (
              <div key={i} data-testid={`stat-item-${i}`} className="stat-item-light p-8 lg:p-12">
                <p className="text-4xl lg:text-5xl font-light tracking-tight text-violet-700 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-slate-900 mb-1">{stat.label}</p>
                <p className="text-xs text-slate-500">{stat.sublabel}</p>
              </div>
            ))}
          </div>

          <div className="hidden lg:flex rounded-xl overflow-hidden h-full min-h-[320px] items-center justify-center bg-[#09090B] scroll-reveal delay-2">
            <img src={LOGO_IMG} alt="OMNISCENT®" className="w-4/5 max-w-[280px] object-contain" />
          </div>
        </div>
      </div>
    </section>
  );
}
