import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useLang } from "@/context/LangContext";

const STATS_IMG = "https://static.prod-images.emergentagent.com/jobs/3b2e6497-db95-4d04-a9ed-c34309b6d69c/images/4349f73d0e469cb080a14412f173b7680c92ad27742e7d261fca435e56e58a3f.png";

export default function Stats() {
  const sectionRef = useScrollReveal();
  const { t } = useLang();

  return (
    <section id="stats" data-testid="stats-section" className="py-24 lg:py-32 bg-white" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16 lg:mb-20 scroll-reveal">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600 mb-4" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {t.stats.overline}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid="stats-title">
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

          <div className="hidden lg:block rounded-xl overflow-hidden h-full min-h-[320px] relative scroll-reveal delay-2">
            <img src={STATS_IMG} alt="Data visualization" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
