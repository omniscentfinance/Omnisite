import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const faqs = [
  {
    question: "Come funzionano i percorsi formativi?",
    answer:
      "I nostri percorsi sono completamente personalizzati e basati sull'analisi dell'orderflow. Dopo un primo colloquio conoscitivo, definiamo insieme obiettivi, tempistiche e modalità. Ogni percorso include sessioni one-to-one, materiale didattico e supporto continuo.",
  },
  {
    question: "Qual è la differenza tra swing trading e scalping?",
    answer:
      "Lo swing trading prevede operazioni che durano da qualche giorno a qualche settimana, puntando a catturare movimenti di prezzo più ampi. Lo scalping, invece, si concentra su operazioni rapide, da pochi secondi a pochi minuti, per piccoli profitti frequenti. Offriamo formazione specifica per entrambi gli stili.",
  },
  {
    question: "Cos'è un fondo PAMM e come funziona?",
    answer:
      "PAMM (Percent Allocation Management Module) è un sistema che permette a un trader esperto di gestire il capitale di più investitori attraverso un unico conto. I profitti e le perdite vengono distribuiti proporzionalmente. Ti guidiamo nella creazione, configurazione e gestione del tuo fondo PAMM.",
  },
  {
    question: "Quali sono i requisiti per iniziare?",
    answer:
      "Non sono richieste competenze pregresse per i percorsi formativi. Per la creazione di un fondo PAMM, è consigliabile avere già esperienza nel trading. In ogni caso, valutiamo ogni richiesta individualmente per garantire il percorso più adatto.",
  },
  {
    question: "Come posso richiedere informazioni o iscrivermi?",
    answer:
      "È semplicissimo: invia una mail a support@omniscent.space specificando il servizio di tuo interesse. Ti risponderemo entro 24 ore con tutte le informazioni necessarie e, se lo desideri, fisseremo un colloquio conoscitivo gratuito.",
  },
  {
    question: "I percorsi sono online o in presenza?",
    answer:
      "Offriamo entrambe le modalità. Le sessioni formative si svolgono prevalentemente online tramite videochiamata, ma è possibile organizzare incontri in presenza su richiesta. La flessibilità è uno dei nostri punti di forza.",
  },
];

export default function FAQ() {
  const sectionRef = useScrollReveal();

  return (
    <section id="faq" data-testid="faq-section" className="py-24 lg:py-32" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 lg:mb-20 scroll-reveal">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400 mb-4"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            Hai domande?
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white"
            style={{ fontFamily: "'Outfit', sans-serif" }}
            data-testid="faq-title"
          >
            Domande Frequenti
          </h2>
        </div>

        <div className="max-w-3xl scroll-reveal delay-1">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-[#1E1E2A]"
                data-testid={`faq-item-${i}`}
              >
                <AccordionTrigger
                  className="text-left text-base font-medium text-slate-200 hover:text-violet-400 hover:no-underline py-6"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  data-testid={`faq-trigger-${i}`}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent
                  className="text-sm leading-relaxed text-slate-400 pb-6"
                  data-testid={`faq-content-${i}`}
                >
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
