import { TrendingUp, LineChart, Wallet, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const TRADING_IMG = "https://images.pexels.com/photos/5833747/pexels-photo-5833747.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const SERVICES_BG = "https://static.prod-images.emergentagent.com/jobs/3b2e6497-db95-4d04-a9ed-c34309b6d69c/images/46d1a36e6306bba3357abf9d95a9f324bb4dd50d8d559fe0011002a779c27118.png";

export default function Services() {
  const sectionRef = useScrollReveal();

  return (
    <section
      id="services"
      data-testid="services-section"
      className="relative py-24 lg:py-32"
      ref={sectionRef}
    >
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-30 bg-cover bg-center"
        style={{ backgroundImage: `url(${SERVICES_BG})` }}
      />
      <div className="absolute inset-0 bg-[#09090B]/95" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 lg:mb-20 scroll-reveal">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400 mb-4"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            Cosa offriamo
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white"
            style={{ fontFamily: "'Outfit', sans-serif" }}
            data-testid="services-title"
          >
            I Nostri Servizi
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1 - Orderflow Analysis (spans 2 cols) */}
          <div
            data-testid="service-orderflow-card"
            className="service-card rounded-xl overflow-hidden lg:col-span-2 group scroll-reveal delay-1"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 lg:p-12 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-violet-900/30 flex items-center justify-center mb-6">
                    <TrendingUp className="text-violet-400" size={24} />
                  </div>
                  <h3
                    className="text-2xl sm:text-3xl font-medium tracking-tight text-violet-300 mb-4"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Analisi dell'Orderflow
                  </h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    Percorsi formativi basati sull'analisi dell'orderflow per comprendere le dinamiche
                    reali del mercato. Strategie sia per swing trading che per scalping.
                  </p>
                </div>
                <a
                  href="mailto:support@omniscent.space?subject=Richiesta%20corso%20Orderflow"
                  data-testid="service-orderflow-cta"
                  className="inline-flex items-center gap-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors group-hover:gap-3"
                >
                  Richiedi informazioni <ArrowRight size={14} />
                </a>
              </div>
              <div className="relative h-64 md:h-auto overflow-hidden">
                <img
                  src={TRADING_IMG}
                  alt="Trading setup con analisi orderflow"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>

          {/* Card 2 - Sviluppo Strategie */}
          <div
            data-testid="service-strategy-card"
            className="service-card rounded-xl p-8 lg:p-12 flex flex-col justify-between scroll-reveal delay-2"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-violet-900/30 flex items-center justify-center mb-6">
                <LineChart className="text-violet-400" size={24} />
              </div>
              <h3
                className="text-2xl font-medium tracking-tight text-violet-300 mb-4"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Sviluppo Strategie Personali
              </h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                Sviluppiamo insieme la tua strategia di trading personalizzata, adattata al tuo
                profilo di rischio e ai tuoi obiettivi.
              </p>
            </div>
            <a
              href="mailto:support@omniscent.space?subject=Richiesta%20sviluppo%20strategia"
              data-testid="service-strategy-cta"
              className="inline-flex items-center gap-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
            >
              Scopri di più <ArrowRight size={14} />
            </a>
          </div>

          {/* Card 3 - PAMM (full width, blue accent) */}
          <div
            data-testid="service-pamm-card"
            className="service-card rounded-xl p-8 lg:p-12 lg:col-span-3 blue-glow group scroll-reveal delay-3"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2">
                <div className="w-12 h-12 rounded-lg bg-sky-900/30 flex items-center justify-center mb-6">
                  <Wallet className="text-sky-400" size={24} />
                </div>
                <h3
                  className="text-2xl sm:text-3xl font-medium tracking-tight text-violet-300 mb-4"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Creazione Fondi PAMM
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Ti guidiamo nella creazione e gestione di fondi PAMM (Percent Allocation Management Module),
                  permettendoti di gestire capitali di terzi con trasparenza e professionalità.
                </p>
              </div>
              <div className="flex lg:justify-end">
                <a
                  href="mailto:support@omniscent.space?subject=Richiesta%20creazione%20PAMM"
                  data-testid="service-pamm-cta"
                  className="btn-primary px-8 py-4 rounded-md text-sm font-medium inline-flex items-center gap-2"
                >
                  Crea il tuo PAMM <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
