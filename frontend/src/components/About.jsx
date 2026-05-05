import { ArrowRight } from "lucide-react";

const TEAM_IMG = "https://images.unsplash.com/photo-1665224752561-85f4da9a5658?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwYnVzaW5lc3MlMjBwb3J0cmFpdCUyMG9mZmljZXxlbnwwfHx8fDE3Nzc5ODUxNDJ8MA&ixlib=rb-4.1.0&q=85";

export default function About() {
  return (
    <section
      id="about"
      data-testid="about-section"
      className="py-24 lg:py-32 section-alt"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 lg:mb-20">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600 mb-4"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            La nostra missione
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-slate-900"
            style={{ fontFamily: "'Outfit', sans-serif" }}
            data-testid="about-title"
          >
            Chi Siamo
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative rounded-xl overflow-hidden aspect-[4/5] max-h-[500px]">
            <img
              src={TEAM_IMG}
              alt="Il team OMNISCENT"
              className="w-full h-full object-cover"
              data-testid="about-image"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-8">
              <p
                className="text-white text-xs font-bold uppercase tracking-[0.2em]"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                OMNISCENT® Team
              </p>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-base lg:text-lg leading-relaxed text-slate-600 mb-6">
              OMNISCENT® nasce dalla passione per i mercati finanziari e dalla convinzione che
              ogni trader meriti una formazione di livello istituzionale. Il nostro approccio si
              basa sull'analisi dell'orderflow, uno strumento potente che permette di leggere
              le intenzioni reali del mercato.
            </p>
            <p className="text-base lg:text-lg leading-relaxed text-slate-600 mb-6">
              Non ci limitiamo a insegnare una strategia: lavoriamo con te per sviluppare un
              metodo personalizzato, adatto al tuo stile di trading — che sia swing o scalping.
              Inoltre, offriamo la possibilità di creare e gestire fondi PAMM, aprendo la strada
              alla gestione professionale del capitale.
            </p>
            <p className="text-base lg:text-lg leading-relaxed text-slate-600 mb-8">
              Il nostro obiettivo è semplice: portarti un passo avanti.
            </p>
            <a
              href="mailto:support@omniscent.space?subject=Richiesta%20informazioni"
              data-testid="about-cta-button"
              className="btn-primary px-8 py-4 rounded-md text-sm font-medium inline-flex items-center gap-2"
            >
              Contattaci <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
