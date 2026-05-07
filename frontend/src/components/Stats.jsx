import { useScrollReveal } from "@/hooks/useScrollReveal";

const STATS_IMG = "https://static.prod-images.emergentagent.com/jobs/3b2e6497-db95-4d04-a9ed-c34309b6d69c/images/4349f73d0e469cb080a14412f173b7680c92ad27742e7d261fca435e56e58a3f.png";

const stats = [
  { value: "+85%", label: "Tasso di successo studenti", sublabel: "Obiettivi raggiunti" },
  { value: "200+", label: "Studenti formati", sublabel: "In costante crescita" },
  { value: "15+", label: "PAMM attivi", sublabel: "Fondi gestiti" },
  { value: "3+", label: "Anni di esperienza", sublabel: "Nel settore" },
];

export default function Stats() {
  const sectionRef = useScrollReveal();

  return (
    <section
      id="stats"
      data-testid="stats-section"
      className="py-24 lg:py-32 section-alt"
      ref={sectionRef}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 lg:mb-20 scroll-reveal">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400 mb-4"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            I numeri parlano
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white"
            style={{ fontFamily: "'Outfit', sans-serif" }}
            data-testid="stats-title"
          >
            Statistiche e Risultati
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Stats grid */}
          <div className="lg:col-span-2 grid grid-cols-2 border border-[#1E1E2A] rounded-xl overflow-hidden bg-[#111113] scroll-reveal delay-1">
            {stats.map((stat, i) => (
              <div
                key={i}
                data-testid={`stat-item-${i}`}
                className="stat-item p-8 lg:p-12"
              >
                <p
                  className="text-4xl lg:text-5xl font-light tracking-tight text-violet-400 mb-2"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-slate-200 mb-1">{stat.label}</p>
                <p className="text-xs text-slate-500">{stat.sublabel}</p>
              </div>
            ))}
          </div>

          {/* Visual */}
          <div className="hidden lg:block rounded-xl overflow-hidden h-full min-h-[320px] relative scroll-reveal delay-2">
            <img
              src={STATS_IMG}
              alt="Data visualization"
              className="absolute inset-0 w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
