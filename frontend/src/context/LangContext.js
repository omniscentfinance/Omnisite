import { createContext, useContext, useState } from "react";

const translations = {
  it: {
    nav: {
      method: "Metodo",
      services: "Servizi",
      plans: "Piani",
      results: "Risultati",
      testimonials: "Testimonianze",
      about: "Chi Siamo",
      faq: "FAQ",
      contact: "Contatti",
      cta: "Inizia ora",
      login: "Accedi",
      dashboard: "Area Riservata",
      backToSite: "Torna al sito",
    },
    hero: {
      overline: "Formazione privata · Orderflow · PAMM",
      tagline: "a step",
      taglineAccent: "forward",
      subtitle:
        "Leggiamo il mercato dove si forma davvero il prezzo: nel flusso degli ordini. Percorsi one-to-one per costruire un metodo tuo — swing o scalping — e la struttura per gestire capitale di terzi con un fondo PAMM.",
      cta: "Inizia il tuo percorso",
      discover: "Scopri il metodo",
      scroll: "Scroll",
      cred: [
        { n: "200+", l: "Studenti" },
        { n: "15+", l: "PAMM attivi" },
        { n: "3+", l: "Anni" },
        { n: "24h", l: "Risposta" },
      ],
      ladder: {
        title: "EUR / USD · Depth",
        live: "Live",
        bid: "Bid",
        price: "Prezzo",
        ask: "Ask",
        spread: "spread",
        delta: "Delta cumulato",
        imbalance: "Imbalance",
      },
    },
    method: {
      overline: "Il metodo",
      title: "Tre passi, un metodo che è tuo.",
      lead:
        "Non vendiamo segnali né una strategia preconfezionata. Costruiamo con te un processo replicabile, misurabile e adatto al tuo profilo di rischio.",
      items: [
        {
          num: "01 — LEGGERE",
          title: "Il flusso degli ordini",
          desc:
            "Impari a leggere delta, imbalance e assorbimenti. Smetti di inseguire il grafico e inizi a vedere chi sta realmente muovendo il prezzo.",
        },
        {
          num: "02 — COSTRUIRE",
          title: "La tua strategia",
          desc:
            "Definiamo regole di ingresso, gestione e uscita sul tuo orizzonte temporale. Backtest, journal e revisione settimanale fino alla consistenza.",
        },
        {
          num: "03 — SCALARE",
          title: "Gestire capitale",
          desc:
            "Quando il metodo regge, apriamo la strada al fondo PAMM: struttura, broker, reportistica e rapporto con gli investitori.",
        },
      ],
    },
    services: {
      overline: "Cosa offriamo",
      title: "I Nostri Servizi",
      orderflow: {
        title: "Analisi dell'Orderflow",
        desc:
          "Percorsi formativi basati sull'analisi dell'orderflow per comprendere le dinamiche reali del mercato. Strategie sia per swing trading che per scalping.",
        cta: "Richiedi informazioni",
        tags: ["Footprint", "Delta", "Volume profile", "Assorbimenti"],
      },
      strategy: {
        title: "Sviluppo Strategie Personali",
        desc:
          "Sviluppiamo insieme la tua strategia di trading personalizzata, adattata al tuo profilo di rischio e ai tuoi obiettivi.",
        cta: "Scopri di più",
        tags: ["1:1", "Backtest", "Journal"],
      },
      pamm: {
        title: "Creazione Fondi PAMM",
        desc:
          "Ti guidiamo nella creazione e gestione di fondi PAMM (Percent Allocation Management Module), permettendoti di gestire capitali di terzi con trasparenza e professionalità.",
        cta: "Crea il tuo PAMM",
        tags: ["Setup broker", "Allocazione", "Reportistica", "Investor relations"],
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
      p3: "Il nostro obiettivo è semplice: portarti",
      p3Accent: "un passo avanti",
      cta: "Contattaci",
      panel: [
        { k: "Formato", d: "One-to-one in videochiamata, con possibilità di incontri in presenza su richiesta." },
        { k: "Mercati", d: "Forex, indici, futures. Swing trading e scalping." },
        { k: "Supporto", d: "Materiale didattico, revisione del journal e supporto continuo lungo tutto il percorso." },
        { k: "Contatto", d: "Risposta entro 24 ore · colloquio conoscitivo gratuito." },
      ],
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
    plans: {
      overline: "Piani e percorsi",
      title: "Tre livelli.",
      titleAccent: "Una scala.",
      lead:
        "Si parte dalle fondamenta e si sale solo quando ha senso. Ogni livello è completo in sé — nessuno ti obbliga al successivo, ma ognuno rende il successivo più efficace.",
      scope: [
        "Formazione e analisi generale",
        "Nessun segnale operativo",
        "Nessuna consulenza personalizzata",
      ],
      tiers: [
        {
          level: "Livello 01",
          name: "Corso d'ingresso",
          what: "Le fondamenta",
          price: "399 €",
          per: "una tantum",
          note: "Pagamento singolo · accesso permanente",
          desc:
            "Il metodo dalle basi: come si legge il mercato, come si costruisce uno screening ripetibile e come si gestisce il rischio. Una volta per tutte.",
          feats: [
            "Struttura di mercato e lettura degli strumenti",
            "Sistema di screening ripetibile: setup TradingView, framework breadth / VIX / credit spread",
            "Gestione del rischio e position sizing",
            "Modulo su bias cognitivi e disciplina: overconfidence, avversione alle perdite, disposition effect",
          ],
          featsOff: [],
          cta: "Inizia dal corso",
          foot: "Nessun prerequisito",
          featured: false,
        },
        {
          level: "Livello 02",
          name: "Sezione Advanced",
          what: "Accesso ai contenuti",
          price: "90 €",
          per: "/ mese",
          note: "Abbonamento · disdici quando vuoi",
          desc:
            "Il contesto di mercato aggiornato con continuità, settimana dopo settimana. Non include il corso d'ingresso.",
          feats: [
            "Analisi settimanale di contesto di mercato + watchlist",
            "Community moderata",
            "Q&A di gruppo mensile",
          ],
          featsOff: [
            "Corso d'ingresso non incluso",
            "Nessuna revisione individuale dei tuoi trade",
          ],
          cta: "Attiva l'abbonamento",
          foot: "Nessun prerequisito",
          featured: true,
          badge: "Più scelto",
        },
        {
          level: "Livello 03",
          name: "Coaching privato",
          what: "Accesso alla persona",
          price: "1.500 €",
          per: "/ trimestre",
          note: "Rinnovabile · posti limitati per ciclo",
          desc:
            "Lavoro uno-a-uno sul tuo operato reale: i tuoi trade, il tuo diario, i tuoi schemi ricorrenti. È l'unico livello in cui compri il mio tempo.",
          feats: [
            "Revisione dei tuoi trade e del tuo diario reali",
            "Feedback sui tuoi pattern psicologici individuali",
            "Adattamento del sistema al tuo capitale e alla tua tolleranza al rischio",
            "Accountability strutturata",
          ],
          featsOff: ["Corso d'ingresso non incluso"],
          cta: "Candidati al coaching",
          foot: "Corso d'ingresso richiesto, a parte",
          featured: false,
        },
      ],
      founding: {
        label: "Offerta founding member · finestra limitata",
        title: "Tutti e tre i livelli, in un pagamento unico",
        desc:
          "È l'unica formula che mette insieme fondamenta, contesto continuo e lavoro uno-a-uno. Un solo pagamento: entri dal primo giorno con tutto quello che serve, senza costruire il percorso un pezzo alla volta.",
        includes: [
          "Corso d'ingresso completo — le fondamenta, accesso permanente",
          "Sezione Advanced a vita — analisi settimanale, watchlist, community, Q&A",
          "Un ciclo di coaching privato da 3 mesi — sessioni 1-to-1 sul tuo operato reale",
        ],
        excluded:
          "Dal secondo ciclo il coaching si rinnova a listino — corso e Advanced restano tuoi per sempre",
        closing:
          "Comprando i tre livelli separatamente il primo anno spenderesti 2.979 € (399 + 1.500 + 12 × 90). L'offerta chiude alla fine della finestra di lancio e non verrà riproposta.",
        price: "2.500 €",
        priceNote: "Pagamento unico · tutti e tre i livelli",
        cta: "Blocca il posto",
      },
      cmp: {
        overline: "Confronto",
        title: "Cosa include ogni livello",
        lead:
          "La differenza vera non è la quantità di contenuti, ma se stai comprando accesso ai contenuti o accesso alla persona.",
        cols: ["Corso", "Advanced", "Coaching"],
        hint: "← Scorri la tabella orizzontalmente →",
        rows: [
          { label: "Modello di pagamento", corso: "Una tantum", adv: "Mensile", coach: "Trimestrale", type: "note" },
          { label: "Fondamenta del metodo", sub: "Struttura di mercato, screening, rischio", corso: true, adv: false, coach: false, coachSub: "Prerequisito, da acquistare a parte" },
          { label: "Modulo bias cognitivi e disciplina", corso: true, adv: false, coach: false },
          { label: "Analisi settimanale + watchlist", corso: false, adv: true, coach: true },
          { label: "Community moderata", corso: false, adv: true, coach: true },
          { label: "Q&A di gruppo mensile", corso: false, adv: true, coach: true },
          { label: "Revisione dei tuoi trade e del diario", corso: false, adv: false, coach: true },
          { label: "Feedback sui tuoi pattern psicologici", corso: false, adv: false, coach: true },
          { label: "Sistema adattato a capitale e rischio", corso: false, adv: false, coach: true },
          { label: "Accountability strutturata", corso: false, adv: false, coach: true },
          { label: "Prerequisito", corso: "Nessuno", adv: "Nessuno", coach: "Corso d'ingresso", type: "note" },
        ],
      },
      path: {
        overline: "Come si sale",
        title: "Il percorso, in ordine",
        lead: "Non serve partire dall'alto. Serve partire dal punto giusto per te.",
        steps: [
          { n: "01 — FONDAMENTA", title: "Impari il metodo", desc: "Il corso ti dà la struttura: come leggere il mercato, come filtrare, come dimensionare il rischio. È la base comune di tutto il resto." },
          { n: "02 — CONTINUITÀ", title: "Resti nel contesto", desc: "Con l'Advanced il metodo non invecchia: ogni settimana vedi come si applica al mercato reale, con una community intorno." },
          { n: "03 — PERSONALIZZAZIONE", title: "Lo adatti a te", desc: "Nel coaching lavoriamo sui tuoi trade e sui tuoi schemi. È qui che il metodo smette di essere generale e diventa tuo." },
        ],
      },
      faq: {
        overline: "Prima di scegliere",
        title: "Domande sui piani",
        items: [
          { q: "Devo per forza fare il corso prima del coaching?", a: "Sì. Il coaching privato è tempo uno-a-uno, e non ha senso spenderlo a insegnare fondamenta che il corso copre una volta per tutte. Chi arriva al coaching avendo già la base usa ogni sessione per il lavoro che conta davvero: i propri trade, i propri schemi. L'Advanced invece non ha prerequisiti." },
          { q: "Il corso è incluso nell'Advanced o nel Coaching?", a: "No. Il corso d'ingresso si acquista separatamente e resta tuo per sempre. L'unica eccezione è l'offerta founding member a pagamento unico, che comprende corso, Advanced a vita e un ciclo di coaching." },
          { q: "Qual è la differenza reale tra Advanced e Coaching?", a: "Con l'Advanced compri accesso ai contenuti: analisi, watchlist, community, Q&A di gruppo. Sono gli stessi per tutti. Con il coaching compri accesso alla persona: il lavoro è sul tuo materiale, non è replicabile e non è condiviso con nessun altro. Sono due cose diverse, non due taglie dello stesso prodotto." },
          { q: "Il coaching si rinnova automaticamente?", a: "No. La quota è trimestrale e scade: per continuare va rinnovata esplicitamente. Non esiste una formula a vita per il coaching, perché il vincolo non è il prezzo — è il tempo disponibile, e i posti per ciclo sono limitati." },
          { q: "Posso disdire l'Advanced quando voglio?", a: "Sì, è un abbonamento mensile senza vincolo di durata. L'offerta founding member a pagamento unico è invece definitiva e limitata alla finestra di lancio: una volta chiusa non viene riproposta." },
          { q: "Ricevo segnali operativi o dritte su cosa comprare?", a: "No, e su questo non facciamo eccezioni. Tutti i livelli sono formazione e analisi generale di contesto. Non forniamo segnali operativi né raccomandazioni personalizzate di acquisto o vendita: quella è consulenza in investimenti, è un'attività regolamentata, e non è ciò che facciamo. Quello che impari è un metodo per decidere da solo." },
          { q: "Come pago e cosa succede dopo?", a: "Scrivici a support@omniscent.space indicando il livello che ti interessa. Ti rispondiamo entro 24 ore con le modalità di pagamento e i tempi di accesso. Per il coaching fissiamo prima un colloquio conoscitivo gratuito: serve a capire se in questo momento è il passo giusto per te — a volte la risposta è no, e te lo diciamo." },
        ],
      },
      cta: {
        overline: "Non sai da dove partire?",
        title: "Un colloquio, poi decidi.",
        desc: "Quindici minuti per capire a che punto sei e quale livello ha senso — senza impegno e senza vendita forzata.",
        primary: "Prenota il colloquio",
        secondary: "Rivedi il metodo",
      },
    },
    launch: {
      // Barra fissa in cima al sito
      barLabel: "Piattaforma in arrivo",
      barOn: "dal",
      barCta: "Iscriviti",
      // Home di lancio
      pageTitle: "Omniscent — la piattaforma apre il 31 gennaio",
      landingLead:
        "Stiamo ricostruendo Omniscent da zero. Al momento non c'è nessun servizio attivo e nulla da acquistare: la piattaforma apre il 31 gennaio, e si entra solo dalla lista.",
      // Sezione #lancio
      overline: "Lancio",
      title: "La piattaforma non è ancora aperta.",
      titleAccent: "Apre il 31 gennaio.",
      lead:
        "Stiamo ricostruendo Omniscent da zero. Non un'altra libreria di video: un sistema che legge la tua operatività reale e ti dice, in euro, dove stai perdendo. Fino all'apertura non c'è nulla da comprare — si entra solo dalla lista.",
      bullets: [
        {
          t: "Referto operativo",
          d: "Carichi lo storico del tuo broker e ottieni la diagnosi: qualità di ingressi e uscite, consistenza del sizing, revenge trading, quanto ti è costato ogni errore ricorrente.",
        },
        {
          t: "Contratto pre-trade",
          d: "Le tue regole applicate prima di entrare, non raccontate dopo. Tesi, invalidazione, rischio massimo. Se stai violando il tuo stesso metodo, lo leggi in quel momento.",
        },
        {
          t: "Drill su mercato storico",
          d: "Ripetizioni misurate sulla singola decisione, con correzione immediata e la tua percentuale di accuratezza. Si impara facendo, non guardando.",
        },
        {
          t: "Process Score",
          d: "Un punteggio sull'aderenza al processo, non sui rendimenti: il P&L a tre mesi è rumore, il processo si misura in due settimane.",
        },
      ],
      units: { days: "giorni", hours: "ore", minutes: "minuti", seconds: "secondi" },
      openTitle: "La piattaforma è aperta.",
      openDesc: "Il lancio è avvenuto. Entra con il tuo account o scrivici per l'accesso.",
      openCta: "Vai al login",
      // Form
      formTitle: "Iscriviti al lancio",
      formDesc:
        "Una sola email, il giorno dell'apertura. Chi è in lista entra prima e a condizioni riservate ai primi iscritti.",
      // Avvisi di iscrizione reale (formulazione senza genere)
      justJoined: "nuova iscrizione",
      name: "Nome (facoltativo)",
      namePlaceholder: "Come ti chiami",
      email: "Email",
      emailPlaceholder: "la-tua@email.it",
      interest: "Cosa ti interessa di più",
      interests: [
        { value: "referto", label: "Il referto sulla mia operatività" },
        { value: "corso", label: "Imparare il metodo da zero" },
        { value: "advanced", label: "Contesto di mercato continuo" },
        { value: "coaching", label: "Lavoro uno-a-uno" },
        { value: "curioso", label: "Sto solo guardando" },
      ],
      consent:
        "Acconsento a ricevere un'email quando la piattaforma apre. Nessun altro uso del mio indirizzo.",
      submit: "Iscrivimi alla lista",
      sending: "Invio…",
      noPayment: "Nessun pagamento ora · nessuna carta richiesta",
      successTitle: "Sei in lista.",
      successDesc:
        "Ti scrivo il 31 gennaio, all'apertura. Nessuna email nel frattempo — è una promessa, non una formula.",
      alreadyTitle: "C'eri già.",
      alreadyDesc: "Questo indirizzo è in lista da prima. Ti avviso all'apertura.",
      invalidEmail: "Controlla l'indirizzo email.",
      needConsent: "Serve il consenso per iscriverti.",
      errorMsg: "Iscrizione non riuscita. Riprova tra poco o scrivi a support@omniscent.space.",
      privacy:
        "Usiamo l'indirizzo solo per avvisarti dell'apertura, e non lo mostriamo mai in pagina. Se lasci il nome, il solo nome di battesimo può comparire tra le iscrizioni recenti: lascia il campo vuoto se preferisci di no. Puoi chiedere la cancellazione in qualsiasi momento scrivendo a support@omniscent.space.",
      // Piani in stato non acquistabile
      tierBadge: "Al lancio",
      tierCta: "Iscriviti al lancio",
      tierNote: "Non acquistabile ora",
      scopeNote: "Non ancora disponibile",
      plansNotice:
        "Questi sono i livelli previsti all'apertura del 31 gennaio. Oggi non sono acquistabili: i prezzi sono indicativi e chi è in lista avrà condizioni riservate.",
      // CTA sparse
      navCta: "Iscriviti al lancio",
      heroCta: "Iscriviti al lancio",
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
      plansCol: "Piani",
      legalCol: "Legale",
      legal: ["Privacy policy", "Termini di servizio", "Cookie policy", "Risk disclaimer"],
      rights: "Tutti i diritti riservati.",
      tagline: "a step forward",
      blurb: "Formazione privata di trading. Analisi dell'orderflow, sviluppo di strategie personali e creazione di fondi PAMM.",
      risk:
        "I servizi OMNISCENT® hanno finalità esclusivamente formative e di analisi generale. Non costituiscono consulenza in materia di investimenti, raccomandazioni personalizzate né sollecitazione all'acquisto o alla vendita di strumenti finanziari. Il trading comporta un elevato livello di rischio e può comportare la perdita del capitale investito; le performance passate non sono indicative di risultati futuri. Prezzi IVA esclusa ove applicabile.",
    },
  },

  en: {
    nav: {
      method: "Method",
      services: "Services",
      plans: "Plans",
      results: "Results",
      testimonials: "Testimonials",
      about: "About Us",
      faq: "FAQ",
      contact: "Contact",
      cta: "Get started",
      login: "Sign in",
      dashboard: "Member Area",
      backToSite: "Back to site",
    },
    hero: {
      overline: "Private education · Orderflow · PAMM",
      tagline: "a step",
      taglineAccent: "forward",
      subtitle:
        "We read the market where price is actually made: in the order flow. One-to-one programs to build a method that is yours — swing or scalping — and the structure to manage third-party capital with a PAMM fund.",
      cta: "Start your journey",
      discover: "Explore the method",
      scroll: "Scroll",
      cred: [
        { n: "200+", l: "Students" },
        { n: "15+", l: "Active PAMMs" },
        { n: "3+", l: "Years" },
        { n: "24h", l: "Response" },
      ],
      ladder: {
        title: "EUR / USD · Depth",
        live: "Live",
        bid: "Bid",
        price: "Price",
        ask: "Ask",
        spread: "spread",
        delta: "Cumulative delta",
        imbalance: "Imbalance",
      },
    },
    method: {
      overline: "The method",
      title: "Three steps to a method of your own.",
      lead:
        "We don't sell signals or an off-the-shelf strategy. We build a repeatable, measurable process with you, matched to your risk profile.",
      items: [
        {
          num: "01 — READ",
          title: "The order flow",
          desc:
            "You learn to read delta, imbalance and absorption. You stop chasing the chart and start seeing who is actually moving price.",
        },
        {
          num: "02 — BUILD",
          title: "Your strategy",
          desc:
            "We define entry, management and exit rules on your timeframe. Backtesting, journalling and weekly review until it holds up.",
        },
        {
          num: "03 — SCALE",
          title: "Managing capital",
          desc:
            "Once the method holds, we open the path to a PAMM fund: structure, broker, reporting and investor relations.",
        },
      ],
    },
    services: {
      overline: "What we offer",
      title: "Our Services",
      orderflow: {
        title: "Orderflow Analysis",
        desc:
          "Training programs based on orderflow analysis to understand real market dynamics. Strategies for both swing trading and scalping.",
        cta: "Request information",
        tags: ["Footprint", "Delta", "Volume profile", "Absorption"],
      },
      strategy: {
        title: "Personal Strategy Development",
        desc:
          "We develop your personalized trading strategy together, tailored to your risk profile and goals.",
        cta: "Learn more",
        tags: ["1:1", "Backtest", "Journal"],
      },
      pamm: {
        title: "PAMM Fund Creation",
        desc:
          "We guide you in creating and managing PAMM funds (Percent Allocation Management Module), enabling you to manage third-party capital with transparency and professionalism.",
        cta: "Create your PAMM",
        tags: ["Broker setup", "Allocation", "Reporting", "Investor relations"],
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
      p3: "Our goal is simple: to take you",
      p3Accent: "a step forward",
      cta: "Contact us",
      panel: [
        { k: "Format", d: "One-to-one over video call, with in-person sessions available on request." },
        { k: "Markets", d: "Forex, indices, futures. Swing trading and scalping." },
        { k: "Support", d: "Learning materials, journal review and continuous support throughout the program." },
        { k: "Contact", d: "Reply within 24 hours · free introductory call." },
      ],
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
    plans: {
      overline: "Plans and paths",
      title: "Three levels.",
      titleAccent: "One ladder.",
      lead:
        "You start from the foundations and move up only when it makes sense. Each level stands on its own — none of them forces you into the next, but each one makes the next more effective.",
      scope: [
        "Education and general analysis",
        "No trade signals",
        "No personalized advice",
      ],
      tiers: [
        {
          level: "Level 01",
          name: "Entry course",
          what: "The foundations",
          price: "€399",
          per: "one-off",
          note: "Single payment · permanent access",
          desc:
            "The method from the ground up: how to read the market, how to build a repeatable screening process and how to manage risk. Once and for all.",
          feats: [
            "Market structure and reading the instruments",
            "Repeatable screening system: TradingView setup, breadth / VIX / credit spread framework",
            "Risk management and position sizing",
            "Module on cognitive bias and discipline: overconfidence, loss aversion, disposition effect",
          ],
          featsOff: [],
          cta: "Start with the course",
          foot: "No prerequisite",
          featured: false,
        },
        {
          level: "Level 02",
          name: "Advanced section",
          what: "Access to the content",
          price: "€90",
          per: "/ month",
          note: "Subscription · cancel anytime",
          desc:
            "Market context kept current, week after week. Does not include the entry course.",
          feats: [
            "Weekly market context analysis + watchlist",
            "Moderated community",
            "Monthly group Q&A",
          ],
          featsOff: [
            "Entry course not included",
            "No individual review of your trades",
          ],
          cta: "Start the subscription",
          foot: "No prerequisite",
          featured: true,
          badge: "Most chosen",
        },
        {
          level: "Level 03",
          name: "Private coaching",
          what: "Access to the person",
          price: "€1,500",
          per: "/ quarter",
          note: "Renewable · limited seats per cycle",
          desc:
            "One-to-one work on what you actually do: your trades, your journal, your recurring patterns. It is the only level where you buy my time.",
          feats: [
            "Review of your real trades and journal",
            "Feedback on your individual psychological patterns",
            "Adapting the system to your capital and risk tolerance",
            "Structured accountability",
          ],
          featsOff: ["Entry course not included"],
          cta: "Apply for coaching",
          foot: "Entry course required, purchased separately",
          featured: false,
        },
      ],
      founding: {
        label: "Founding member offer · limited window",
        title: "All three levels, in a single payment",
        desc:
          "It is the only package that brings together the foundations, continuous context and one-to-one work. A single payment: from day one you have everything you need, without assembling the path piece by piece.",
        includes: [
          "Complete entry course — the foundations, permanent access",
          "Advanced section for life — weekly analysis, watchlist, community, Q&A",
          "One 3-month private coaching cycle — 1-to-1 sessions on your real trading",
        ],
        excluded:
          "From the second cycle coaching renews at list price — the course and Advanced stay yours forever",
        closing:
          "Buying the three levels separately would cost €2,979 in the first year (399 + 1,500 + 12 × 90). The offer closes at the end of the launch window and will not be repeated.",
        price: "€2,500",
        priceNote: "Single payment · all three levels",
        cta: "Claim your seat",
      },
      cmp: {
        overline: "Comparison",
        title: "What each level includes",
        lead:
          "The real difference is not how much content you get, but whether you are buying access to the content or access to the person.",
        cols: ["Course", "Advanced", "Coaching"],
        hint: "← Scroll the table horizontally →",
        rows: [
          { label: "Payment model", corso: "One-off", adv: "Monthly", coach: "Quarterly", type: "note" },
          { label: "Foundations of the method", sub: "Market structure, screening, risk", corso: true, adv: false, coach: false, coachSub: "Prerequisite, purchased separately" },
          { label: "Cognitive bias and discipline module", corso: true, adv: false, coach: false },
          { label: "Weekly analysis + watchlist", corso: false, adv: true, coach: true },
          { label: "Moderated community", corso: false, adv: true, coach: true },
          { label: "Monthly group Q&A", corso: false, adv: true, coach: true },
          { label: "Review of your trades and journal", corso: false, adv: false, coach: true },
          { label: "Feedback on your psychological patterns", corso: false, adv: false, coach: true },
          { label: "System adapted to capital and risk", corso: false, adv: false, coach: true },
          { label: "Structured accountability", corso: false, adv: false, coach: true },
          { label: "Prerequisite", corso: "None", adv: "None", coach: "Entry course", type: "note" },
        ],
      },
      path: {
        overline: "How you move up",
        title: "The path, in order",
        lead: "You don't need to start at the top. You need to start at the right point for you.",
        steps: [
          { n: "01 — FOUNDATIONS", title: "You learn the method", desc: "The course gives you the structure: how to read the market, how to filter, how to size risk. It is the common base for everything else." },
          { n: "02 — CONTINUITY", title: "You stay in context", desc: "With Advanced the method doesn't go stale: every week you see how it applies to the real market, with a community around you." },
          { n: "03 — PERSONALIZATION", title: "You adapt it to yourself", desc: "In coaching we work on your trades and your patterns. This is where the method stops being general and becomes yours." },
        ],
      },
      faq: {
        overline: "Before you choose",
        title: "Questions about the plans",
        items: [
          { q: "Do I have to take the course before coaching?", a: "Yes. Private coaching is one-to-one time, and it makes no sense to spend it teaching foundations the course covers once and for all. Those who arrive with the base already in place use every session for the work that matters: their own trades, their own patterns. Advanced, on the other hand, has no prerequisite." },
          { q: "Is the course included in Advanced or Coaching?", a: "No. The entry course is purchased separately and stays yours forever. The only exception is the founding member single-payment offer, which includes the course, Advanced for life and one coaching cycle." },
          { q: "What is the real difference between Advanced and Coaching?", a: "With Advanced you buy access to the content: analysis, watchlist, community, group Q&A. It is the same for everyone. With coaching you buy access to the person: the work is on your material, it is not replicable and it is not shared with anyone else. They are two different things, not two sizes of the same product." },
          { q: "Does coaching renew automatically?", a: "No. The fee is quarterly and it expires: continuing requires an explicit renewal. There is no lifetime option for coaching, because the constraint is not price — it is available time, and seats per cycle are limited." },
          { q: "Can I cancel Advanced whenever I want?", a: "Yes, it is a monthly subscription with no minimum term. The founding member single-payment offer, by contrast, is final and limited to the launch window: once it closes it will not be offered again." },
          { q: "Do I get trade signals or tips on what to buy?", a: "No, and we make no exceptions here. Every level is education and general context analysis. We do not provide trade signals or personalized buy or sell recommendations: that is investment advice, it is a regulated activity, and it is not what we do. What you learn is a method for deciding on your own." },
          { q: "How do I pay and what happens next?", a: "Write to support@omniscent.space telling us which level you are interested in. We reply within 24 hours with payment details and access times. For coaching we first arrange a free introductory call: it is there to work out whether this is the right step for you right now — sometimes the answer is no, and we say so." },
        ],
      },
      cta: {
        overline: "Not sure where to start?",
        title: "One call, then you decide.",
        desc: "Fifteen minutes to work out where you are and which level makes sense — no commitment and no hard sell.",
        primary: "Book the call",
        secondary: "Revisit the method",
      },
    },
    launch: {
      barLabel: "Platform coming",
      barOn: "on",
      barCta: "Join",
      pageTitle: "Omniscent — the platform opens 31 January",
      landingLead:
        "We are rebuilding Omniscent from scratch. There is no active service right now and nothing to buy: the platform opens on 31 January, and the only way in is the list.",
      overline: "Launch",
      title: "The platform isn't open yet.",
      titleAccent: "It opens 31 January.",
      lead:
        "We are rebuilding Omniscent from scratch. Not another video library: a system that reads your real trading record and tells you, in euros, where you are losing money. Nothing is for sale until opening day — the only way in is the list.",
      bullets: [
        {
          t: "Trading audit",
          d: "Upload your broker history and get the diagnosis: entry and exit quality, sizing consistency, revenge trading, and what each recurring mistake has actually cost you.",
        },
        {
          t: "Pre-trade contract",
          d: "Your rules applied before you enter, not recounted afterwards. Thesis, invalidation, maximum risk. If you are breaking your own method, you read it right then.",
        },
        {
          t: "Historical market drills",
          d: "Measured repetitions on a single decision, with immediate correction and your own accuracy rate. Skill comes from doing, not watching.",
        },
        {
          t: "Process Score",
          d: "A score on process adherence, not returns: three months of P&L is noise, process can be measured in two weeks.",
        },
      ],
      units: { days: "days", hours: "hours", minutes: "minutes", seconds: "seconds" },
      openTitle: "The platform is open.",
      openDesc: "Launch has happened. Sign in with your account or write to us for access.",
      openCta: "Go to login",
      formTitle: "Join the launch list",
      formDesc:
        "One email, on opening day. People on the list get in first, on terms reserved for early members.",
      justJoined: "just joined",
      name: "Name (optional)",
      namePlaceholder: "Your name",
      email: "Email",
      emailPlaceholder: "your@email.com",
      interest: "What interests you most",
      interests: [
        { value: "referto", label: "The audit of my own trading" },
        { value: "corso", label: "Learning the method from scratch" },
        { value: "advanced", label: "Continuous market context" },
        { value: "coaching", label: "One-to-one work" },
        { value: "curioso", label: "Just looking" },
      ],
      consent:
        "I agree to receive one email when the platform opens. No other use of my address.",
      submit: "Add me to the list",
      sending: "Sending…",
      noPayment: "No payment now · no card required",
      successTitle: "You're on the list.",
      successDesc:
        "I'll write on 31 January, at opening. Nothing in between — that's a promise, not a formula.",
      alreadyTitle: "You were already in.",
      alreadyDesc: "This address joined earlier. We'll let you know at opening.",
      invalidEmail: "Please check the email address.",
      needConsent: "Consent is required to join.",
      errorMsg: "Sign-up failed. Try again shortly or write to support@omniscent.space.",
      privacy:
        "We use your address only to tell you about the opening, and never show it on the page. If you leave a name, your first name alone may appear among recent sign-ups: leave the field empty if you would rather it did not. You can ask for removal at any time by writing to support@omniscent.space.",
      tierBadge: "At launch",
      tierCta: "Join the launch list",
      tierNote: "Not purchasable yet",
      scopeNote: "Not available yet",
      plansNotice:
        "These are the levels planned for the 31 January opening. They cannot be bought today: prices are indicative and people on the list will get reserved terms.",
      navCta: "Join the launch",
      heroCta: "Join the launch",
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
      plansCol: "Plans",
      legalCol: "Legal",
      legal: ["Privacy policy", "Terms of service", "Cookie policy", "Risk disclaimer"],
      rights: "All rights reserved.",
      tagline: "a step forward",
      blurb: "Private trading education. Orderflow analysis, personal strategy development and PAMM fund creation.",
      risk:
        "OMNISCENT® services are strictly educational and provide general analysis only. They do not constitute investment advice, personalized recommendations, or a solicitation to buy or sell financial instruments. Trading carries a high level of risk and can result in the loss of your invested capital; past performance is not indicative of future results. Prices exclude VAT where applicable.",
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
