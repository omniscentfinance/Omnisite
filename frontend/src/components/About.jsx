import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useLang } from "@/context/LangContext";

const TEAM_IMG = "/team_photo.jpg";

export default function About() {
  const sectionRef = useScrollReveal();
  const { t } = useLang();

  return (
    <section id="about" data-testid="about-section" className="py-24 lg:py-32 section-alt" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16 lg:mb-20 scroll-reveal">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400 mb-4" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {t.about.overline}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid="about-title">
            {t.about.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative rounded-xl overflow-hidden aspect-[4/5] max-h-[500px] scroll-reveal delay-1">
            <img src={TEAM_IMG} alt="OMNISCENT Team" className="w-full h-full object-cover object-[center_70%]" data-testid="about-image" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-8">
              <p className="text-white text-xs font-bold uppercase tracking-[0.2em]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                OMNISCENT® Team
              </p>
            </div>
          </div>

          <div className="scroll-reveal delay-2">
            <p className="text-base lg:text-lg leading-relaxed text-slate-400 mb-6">{t.about.p1}</p>
            <p className="text-base lg:text-lg leading-relaxed text-slate-400 mb-6">{t.about.p2}</p>
            <p className="text-base lg:text-lg leading-relaxed text-slate-400 mb-8">{t.about.p3}</p>
            <button onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })} data-testid="about-cta-button" className="btn-primary px-8 py-4 rounded-md text-sm font-medium inline-flex items-center gap-2">
              {t.about.cta} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
