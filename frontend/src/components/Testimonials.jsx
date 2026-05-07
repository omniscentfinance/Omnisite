import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const testimonials = [
  {
    text: "Grazie a OMNISCENT ho finalmente capito come leggere il mercato attraverso l'orderflow. I risultati sono arrivati in poche settimane.",
    author: "Marco R.",
    role: "Swing Trader",
  },
  {
    text: "Il percorso personalizzato mi ha permesso di sviluppare una strategia solida e replicabile. Il supporto del team è stato eccezionale.",
    author: "Luca P.",
    role: "Scalper",
  },
  {
    text: "La creazione del mio fondo PAMM è stata semplice e guidata passo passo. Ora gestisco capitali con fiducia e trasparenza.",
    author: "Alessandro M.",
    role: "Fund Manager",
  },
  {
    text: "Professionalità e competenza ai massimi livelli. OMNISCENT ha cambiato il mio approccio al trading completamente.",
    author: "Davide S.",
    role: "Trader Indipendente",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const sectionRef = useScrollReveal();

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section
      id="testimonials"
      data-testid="testimonials-section"
      className="py-24 lg:py-32"
      ref={sectionRef}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 lg:mb-20 scroll-reveal">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400 mb-4"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            Le voci dei nostri studenti
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white"
            style={{ fontFamily: "'Outfit', sans-serif" }}
            data-testid="testimonials-title"
          >
            Testimonianze
          </h2>
        </div>

        {/* Testimonial display */}
        <div className="max-w-3xl scroll-reveal delay-1">
          <div className="testimonial-quote pl-6 lg:pl-8 min-h-[200px] flex flex-col justify-center">
            <p
              className="text-xl lg:text-2xl font-light leading-relaxed text-slate-300 mb-8"
              style={{ fontFamily: "'Outfit', sans-serif" }}
              data-testid="testimonial-text"
            >
              {testimonials[current].text}
            </p>
            <div>
              <p
                className="text-sm font-semibold text-white"
                data-testid="testimonial-author"
              >
                {testimonials[current].author}
              </p>
              <p className="text-xs text-slate-500">{testimonials[current].role}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4 mt-8 pl-6 lg:pl-8">
            <button
              data-testid="testimonial-prev-button"
              onClick={prev}
              className="w-10 h-10 rounded-full border border-[#1E1E2A] flex items-center justify-center text-slate-400 hover:border-violet-500 hover:text-violet-400 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              data-testid="testimonial-next-button"
              onClick={next}
              className="w-10 h-10 rounded-full border border-[#1E1E2A] flex items-center justify-center text-slate-400 hover:border-violet-500 hover:text-violet-400 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
            <span className="text-xs text-slate-400 ml-2">
              {current + 1} / {testimonials.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
