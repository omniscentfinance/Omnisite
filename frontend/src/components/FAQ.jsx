import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useLang } from "@/context/LangContext";

export default function FAQ() {
  const sectionRef = useScrollReveal();
  const { t } = useLang();

  return (
    <section id="faq" data-testid="faq-section" className="py-24 lg:py-32" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16 lg:mb-20 scroll-reveal">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400 mb-4" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {t.faq.overline}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid="faq-title">
            {t.faq.title}
          </h2>
        </div>

        <div className="max-w-3xl scroll-reveal delay-1">
          <Accordion type="single" collapsible className="w-full">
            {t.faq.items.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-[#1E1E2A]" data-testid={`faq-item-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium text-slate-200 hover:text-violet-400 hover:no-underline py-6" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid={`faq-trigger-${i}`}>
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-slate-400 pb-6" data-testid={`faq-content-${i}`}>
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
