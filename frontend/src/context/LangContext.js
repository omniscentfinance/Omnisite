import { createContext, useContext, useState } from "react";

const translations = {
  it: {
    nav: {
      services: "Servizi",
      results: "Risultati",
      testimonials: "Testimonianze",
      about: "Chi Siamo",
      faq: "FAQ",
      contact: "Contatti",
      cta: "Inizia ora",
    },
    hero: {
      overline: "OMNISCENT®",
      tagline: "a step forward",
      subtitle: "Formazione privata di trading. Analisi dell'orderflow e sviluppo personale di strategie. Creazione di fondi PAMM.",
      cta: "Inizia il tuo percorso",
      discover: "Scopri di più",
    },
    services: {
      overline: "Cosa offriamo",
      title: "I Nostri Servizi",
      orderflow: {
        title: "Analisi dell'Orderflow",
        desc: "Percorsi formativi basati sull'analisi dell'orderflow per comprendere le dinamiche reali del mercato. Strategie sia per swing trading che per scalping.",
        cta: "Richiedi informazioni",
      },
      strategy: {
        title: "Sviluppo Strategie Personali",
        desc: "Sviluppiamo insieme la tua strategia di trading personalizzata, adattata al tuo profilo di rischio e ai tuoi obiettivi.",
        cta: "Scopri di più",
      },
      pamm: {
        title: "Creazione Fondi PAMM",
        desc: "Ti guidiamo nella creazione e gestione di fondi PAMM (Percent Allocation Management Module), permettendoti di gestire capitali di terzi con trasparenza e professionalità.",
        cta: "Crea il tuo PAMM",
      },
    },
    stats: {
      overline: "I numeri parlano",
      title: "Statistiche e Risultati",
      items: [
        { value: "+85%", label: "Tasso di successo studenti", sublabel: "Obiettivi raggiunti" },
        { value: "200+", label: "Studenti formati", sublabel: "In costante crescita" },
        { value: "15+", label: "PAMM attivi", sublabel: "Fondi gestiti" },
        { value: "3+", label: "Anni di esperienza", sublabel: "Nel settore" },
      ],
    },
    testimonials: {
      overline: "Le voci dei nostri studenti",
      title: "Testimonianze",
      items: [
        { text: "Grazie a OMNISCENT ho finalmente capito come leggere il mercato attraverso l'orderflow. I risultati sono arrivati in poche settimane.", author: "Marco R.", role: "Swing Trader" },
        { text: "Il percorso personalizzato mi ha permesso di sviluppare una strategia solida e replicabile. Il supporto del team è stato eccezionale.", author: "Luca P.", role: "Scalper" },
        { text: "La creazione del mio fondo PAMM è stata semplice e guidata passo passo. Ora gestisco capitali con fiducia e trasparenza.", author: "Alessandro M.", role: "Fund Manager" },
        { text: "Professionalità e competenza ai massimi livelli. OMNISCENT ha cambiato il mio approccio al trading completamente.", author: "Davide S.", role: "Trader Indipendente" },
      ],
    },
    about: {
      overline: "La nostra missione",
      title: "Chi Siamo",
      p1: "OMNISCENT® nasce dalla passione per i mercati finanziari e dalla convinzione che ogni trader meriti una formazione di livello istituzionale. Il nostro approccio si basa sull'analisi dell'orderflow, uno strumento potente che permette di leggere le intenzioni reali del mercato.",
      p2: "Non ci limitiamo a insegnare una strategia: lavoriamo con te per sviluppare un metodo personalizzato, adatto al tuo stile di trading — che sia swing o scalping. Inoltre, offriamo la possibilità di creare e gestire fondi PAMM, aprendo la strada alla gestione professionale del capitale.",
      p3: "Il nostro obiettivo è semplice: portarti un passo avanti.",
      cta: "Contattaci",
    },
    faq: {
      overline: "Hai domande?",
      title: "Domande Frequenti",
      items: [
        { q: "Come funzionano i percorsi formativi?", a: "I nostri percorsi sono completamente personalizzati e basati sull'analisi dell'orderflow. Dopo un primo colloquio conoscitivo, definiamo insieme obiettivi, tempistiche e modalità. Ogni percorso include sessioni one-to-one, materiale didattico e supporto continuo." },
        { q: "Qual è la differenza tra swing trading e scalping?", a: "Lo swing trading prevede operazioni che durano da qualche giorno a qualche settimana, puntando a catturare movimenti di prezzo più ampi. Lo scalping, invece, si concentra su operazioni rapide, da pochi secondi a pochi minuti, per piccoli profitti frequenti. Offriamo formazione specifica per entrambi gli stili." },
        { q: "Cos'è un fondo PAMM e come funziona?", a: "PAMM (Percent Allocation Management Module) è un sistema che permette a un trader esperto di gestire il capitale di più investitori attraverso un unico conto. I profitti e le perdite vengono distribuiti proporzionalmente. Ti guidiamo nella creazione, configurazione e gestione del tuo fondo PAMM." },
        { q: "Quali sono i requisiti per iniziare?", a: "Non sono richieste competenze pregresse per i percorsi formativi. Per la creazione di un fondo PAMM, è consigliabile avere già esperienza nel trading. In ogni caso, valutiamo ogni richiesta individualmente per garantire il percorso più adatto." },
        { q: "Come posso richiedere informazioni o iscrivermi?", a: "È semplicissimo: invia una mail a support@omniscent.space specificando il servizio di tuo interesse. Ti risponderemo entro 24 ore con tutte le informazioni necessarie e, se lo desideri, fisseremo un colloquio conoscitivo gratuito." },
        { q: "I percorsi sono online o in presenza?", a: "Offriamo entrambe le modalità. Le sessioni formative si svolgono prevalentemente online tramite videochiamata, ma è possibile organizzare incontri in presenza su richiesta. La flessibilità è uno dei nostri punti di forza." },
      ],
    },
    contact: {
      overline: "Pronto a iniziare?",
      title: "Contattaci",
      desc: "Inviaci un messaggio per richiedere informazioni sui nostri percorsi formativi o per la creazione del tuo fondo PAMM. Ti risponderemo entro 24 ore.",
      formTitle: "Scrivici direttamente",
      formDesc: "Compila il form e ti ricontatteremo entro 24 ore.",
      name: "Nome",
      email: "Email",
      service: "Servizio",
      message: "Messaggio",
      namePlaceholder: "Il tuo nome",
      emailPlaceholder: "la-tua@email.com",
      messagePlaceholder: "Descrivi la tua richiesta...",
      submit: "Invia messaggio",
      sending: "Invio in corso...",
      successTitle: "Messaggio inviato!",
      successDesc: "Ti risponderemo entro 24 ore.",
      error: "Si è verificato un errore. Riprova o scrivi a support@omniscent.space.",
      serviceOptions: [
        { value: "orderflow", label: "Corso Analisi Orderflow" },
        { value: "strategy", label: "Sviluppo Strategia Personale" },
        { value: "pamm", label: "Creazione Fondo PAMM" },
        { value: "info", label: "Informazioni Generali" },
      ],
    },
    footer: {
      quickLinks: "Link rapidi",
      rights: "Tutti i diritti riservati.",
    },
  },
  en: {
    nav: {
      services: "Services",
      results: "Results",
      testimonials: "Testimonials",
      about: "About Us",
      faq: "FAQ",
      contact: "Contact",
      cta: "Get started",
    },
    hero: {
      overline: "OMNISCENT®",
      tagline: "a step forward",
      subtitle: "Private trading education. Orderflow analysis and personal strategy development. PAMM fund creation.",
      cta: "Start your journey",
      discover: "Learn more",
    },
    services: {
      overline: "What we offer",
      title: "Our Services",
      orderflow: {
        title: "Orderflow Analysis",
        desc: "Training programs based on orderflow analysis to understand real market dynamics. Strategies for both swing trading and scalping.",
        cta: "Request information",
      },
      strategy: {
        title: "Personal Strategy Development",
        desc: "We develop your personalized trading strategy together, tailored to your risk profile and goals.",
        cta: "Learn more",
      },
      pamm: {
        title: "PAMM Fund Creation",
        desc: "We guide you in creating and managing PAMM funds (Percent Allocation Management Module), enabling you to manage third-party capital with transparency and professionalism.",
        cta: "Create your PAMM",
      },
    },
    stats: {
      overline: "The numbers speak",
      title: "Statistics & Results",
      items: [
        { value: "+85%", label: "Student success rate", sublabel: "Goals achieved" },
        { value: "200+", label: "Students trained", sublabel: "Constantly growing" },
        { value: "15+", label: "Active PAMMs", sublabel: "Managed funds" },
        { value: "3+", label: "Years of experience", sublabel: "In the industry" },
      ],
    },
    testimonials: {
      overline: "What our students say",
      title: "Testimonials",
      items: [
        { text: "Thanks to OMNISCENT I finally understood how to read the market through orderflow. Results came within weeks.", author: "Marco R.", role: "Swing Trader" },
        { text: "The personalized path allowed me to develop a solid and replicable strategy. The team support was exceptional.", author: "Luca P.", role: "Scalper" },
        { text: "Creating my PAMM fund was simple and guided step by step. I now manage capital with confidence and transparency.", author: "Alessandro M.", role: "Fund Manager" },
        { text: "Professionalism and expertise at the highest level. OMNISCENT completely changed my approach to trading.", author: "Davide S.", role: "Independent Trader" },
      ],
    },
    about: {
      overline: "Our mission",
      title: "About Us",
      p1: "OMNISCENT® was born from a passion for financial markets and the belief that every trader deserves institutional-level education. Our approach is based on orderflow analysis, a powerful tool that reveals the real intentions behind market movements.",
      p2: "We don't just teach a strategy: we work with you to develop a personalized method, suited to your trading style — whether swing or scalping. Additionally, we offer the opportunity to create and manage PAMM funds, paving the way for professional capital management.",
      p3: "Our goal is simple: take you a step forward.",
      cta: "Contact us",
    },
    faq: {
      overline: "Got questions?",
      title: "Frequently Asked Questions",
      items: [
        { q: "How do the training programs work?", a: "Our programs are fully personalized and based on orderflow analysis. After an initial consultation, we define goals, timelines, and methods together. Each program includes one-on-one sessions, educational materials, and ongoing support." },
        { q: "What's the difference between swing trading and scalping?", a: "Swing trading involves operations lasting from a few days to a few weeks, aiming to capture larger price movements. Scalping focuses on rapid operations, from seconds to minutes, for small frequent profits. We offer specific training for both styles." },
        { q: "What is a PAMM fund and how does it work?", a: "PAMM (Percent Allocation Management Module) is a system that allows an expert trader to manage the capital of multiple investors through a single account. Profits and losses are distributed proportionally. We guide you through the creation, configuration, and management of your PAMM fund." },
        { q: "What are the requirements to get started?", a: "No prior experience is required for training programs. For PAMM fund creation, some trading experience is recommended. In any case, we evaluate each request individually to ensure the most suitable path." },
        { q: "How can I request information or sign up?", a: "It's simple: send an email to support@omniscent.space specifying the service you're interested in. We'll respond within 24 hours with all necessary information, and if you wish, we'll schedule a free introductory call." },
        { q: "Are the programs online or in-person?", a: "We offer both. Training sessions are primarily conducted online via video call, but in-person meetings can be arranged upon request. Flexibility is one of our strengths." },
      ],
    },
    contact: {
      overline: "Ready to start?",
      title: "Contact Us",
      desc: "Send us a message to request information about our training programs or PAMM fund creation. We'll respond within 24 hours.",
      formTitle: "Write to us directly",
      formDesc: "Fill out the form and we'll get back to you within 24 hours.",
      name: "Name",
      email: "Email",
      service: "Service",
      message: "Message",
      namePlaceholder: "Your name",
      emailPlaceholder: "your@email.com",
      messagePlaceholder: "Describe your request...",
      submit: "Send message",
      sending: "Sending...",
      successTitle: "Message sent!",
      successDesc: "We'll respond within 24 hours.",
      error: "An error occurred. Please try again or write to support@omniscent.space.",
      serviceOptions: [
        { value: "orderflow", label: "Orderflow Analysis Course" },
        { value: "strategy", label: "Personal Strategy Development" },
        { value: "pamm", label: "PAMM Fund Creation" },
        { value: "info", label: "General Information" },
      ],
    },
    footer: {
      quickLinks: "Quick links",
      rights: "All rights reserved.",
    },
  },
};

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState("it");
  const t = translations[lang];
  const toggle = () => setLang((prev) => (prev === "it" ? "en" : "it"));
  return (
    <LangContext.Provider value={{ lang, t, toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
