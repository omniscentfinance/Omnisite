import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import emailjs from "@emailjs/browser";
import { useLang } from "@/context/LangContext";

const EMAILJS_SERVICE_ID = "service_t060r7s";
const EMAILJS_TEMPLATE_ID = "template_zw256co";
const EMAILJS_PUBLIC_KEY = "Uk8xcFa3VjvjRAgAQ";

const SCRIPTS = {
  it: {
    welcome: "Ciao! Sono l'assistente virtuale di OMNISCENT®. Come posso aiutarti?",
    quickReplies: [
      { id: "services", label: "📊 I nostri servizi" },
      { id: "pamm", label: "💼 Fondi PAMM" },
      { id: "faq", label: "❓ Domande frequenti" },
      { id: "contact", label: "✉️ Parla con noi" },
    ],
    answers: {
      services:
        "Offriamo tre servizi principali:\n\n• **Analisi dell'Orderflow** — Percorsi formativi per comprendere le dinamiche reali del mercato, sia per swing trading che scalping.\n• **Sviluppo Strategia Personale** — Costruiamo insieme una strategia adattata al tuo profilo di rischio.\n• **Creazione Fondi PAMM** — Ti guidiamo nella gestione professionale di capitali di terzi.\n\nVuoi saperne di più su uno di questi?",
      pamm:
        "Un fondo PAMM (Percent Allocation Management Module) ti permette di gestire il capitale di più investitori attraverso un unico conto. Profitti e perdite vengono distribuiti proporzionalmente.\n\nTi guidiamo in ogni fase: creazione, configurazione e gestione. È consigliabile avere già esperienza nel trading per iniziare.\n\nVuoi fissare un colloquio conoscitivo gratuito?",
      faq:
        "Ecco alcune delle domande più frequenti:\n\n• I percorsi sono **completamente personalizzati** e includono sessioni one-to-one.\n• Offriamo formazione sia **online** (videochiamata) che **in presenza**.\n• Non sono richieste competenze pregresse per i corsi base.\n• Rispondiamo entro **24 ore** a ogni richiesta.\n\nHai altre domande specifiche?",
    },
    contactFlow: {
      start: "Perfetto! Raccogli i tuoi dati per metterti in contatto con il nostro team.",
      askName: "Come ti chiami?",
      askEmail: "Qual è la tua email?",
      askService: "Quale servizio ti interessa?",
      askMessage: "Scrivici un breve messaggio (es. la tua esperienza, i tuoi obiettivi):",
      sending: "Invio in corso...",
      success: "Messaggio inviato! Ti risponderemo entro 24 ore. A presto! 👋",
      error: "Si è verificato un errore. Scrivi a support@omniscent.space.",
      serviceOptions: [
        { value: "orderflow", label: "Corso Orderflow" },
        { value: "strategy", label: "Strategia Personale" },
        { value: "pamm", label: "Fondo PAMM" },
        { value: "info", label: "Informazioni generali" },
      ],
    },
    followUp: [
      { id: "contact", label: "✉️ Contattaci" },
      { id: "services", label: "📊 Altri servizi" },
    ],
    placeholder: "Scrivi un messaggio...",
    title: "Assistente OMNISCENT",
    subtitle: "Solitamente risponde in pochi secondi",
  },
  en: {
    welcome: "Hello! I'm OMNISCENT®'s virtual assistant. How can I help you?",
    quickReplies: [
      { id: "services", label: "📊 Our services" },
      { id: "pamm", label: "💼 PAMM Funds" },
      { id: "faq", label: "❓ FAQ" },
      { id: "contact", label: "✉️ Talk to us" },
    ],
    answers: {
      services:
        "We offer three main services:\n\n• **Orderflow Analysis** — Training programs to understand real market dynamics, for both swing trading and scalping.\n• **Personal Strategy Development** — We build a strategy tailored to your risk profile.\n• **PAMM Fund Creation** — We guide you in professionally managing third-party capital.\n\nWould you like to know more about any of these?",
      pamm:
        "A PAMM fund (Percent Allocation Management Module) lets you manage multiple investors' capital through a single account. Profits and losses are distributed proportionally.\n\nWe guide you through every step: creation, configuration, and management. Some trading experience is recommended.\n\nWould you like to schedule a free introductory call?",
      faq:
        "Here are some frequently asked questions:\n\n• Our programs are **fully personalized** and include one-on-one sessions.\n• We offer both **online** (video call) and **in-person** training.\n• No prior experience is required for basic courses.\n• We respond within **24 hours** to every request.\n\nDo you have other specific questions?",
    },
    contactFlow: {
      start: "Great! Let me collect your details to connect you with our team.",
      askName: "What's your name?",
      askEmail: "What's your email address?",
      askService: "Which service are you interested in?",
      askMessage: "Write us a brief message (e.g. your experience, your goals):",
      sending: "Sending...",
      success: "Message sent! We'll get back to you within 24 hours. See you soon! 👋",
      error: "An error occurred. Please write to support@omniscent.space.",
      serviceOptions: [
        { value: "orderflow", label: "Orderflow Course" },
        { value: "strategy", label: "Personal Strategy" },
        { value: "pamm", label: "PAMM Fund" },
        { value: "info", label: "General Information" },
      ],
    },
    followUp: [
      { id: "contact", label: "✉️ Contact us" },
      { id: "services", label: "📊 Other services" },
    ],
    placeholder: "Write a message...",
    title: "OMNISCENT Assistant",
    subtitle: "Usually replies in seconds",
  },
};

function formatText(text) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={i}>
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    );
  });
}

export default function Chatbot() {
  const { lang } = useLang();
  const s = SCRIPTS[lang];

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState("idle"); // idle | name | email | service | message | sending
  const [lead, setLead] = useState({ name: "", email: "", service: "", message: "" });
  const [unread, setUnread] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Init welcome message
  useEffect(() => {
    setMessages([
      { from: "bot", text: s.welcome, quickReplies: s.quickReplies },
    ]);
    setStep("idle");
    setLead({ name: "", email: "", service: "", message: "" });
  }, [lang, s.welcome, s.quickReplies]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const addMessage = (from, text, quickReplies = null) => {
    setMessages((prev) => [...prev, { from, text, quickReplies }]);
    if (from === "bot" && !open) setUnread(true);
  };

  const botReply = (text, quickReplies = null) => {
    setTimeout(() => addMessage("bot", text, quickReplies), 400);
  };

  const handleQuickReply = (id) => {
    if (id === "contact") {
      addMessage("user", s.quickReplies.find((q) => q.id === "contact")?.label || "Contattaci");
      botReply(s.contactFlow.start);
      setTimeout(() => botReply(s.contactFlow.askName), 900);
      setStep("name");
      return;
    }
    const label = s.quickReplies.find((q) => q.id === id)?.label || id;
    addMessage("user", label);
    botReply(s.answers[id] || "...", s.followUp);
  };

  const handleServiceSelect = (value, label) => {
    setLead((prev) => ({ ...prev, service: value }));
    addMessage("user", label);
    botReply(s.contactFlow.askMessage);
    setStep("message");
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    addMessage("user", text);

    if (step === "name") {
      setLead((prev) => ({ ...prev, name: text }));
      botReply(s.contactFlow.askEmail);
      setStep("email");
      return;
    }
    if (step === "email") {
      setLead((prev) => ({ ...prev, email: text }));
      setTimeout(() => {
        addMessage("bot", s.contactFlow.askService, null, "service");
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { ...prev[prev.length - 1], serviceSelect: true },
        ]);
      }, 400);
      setStep("service");
      return;
    }
    if (step === "message") {
      const finalLead = { ...lead, message: text };
      setLead(finalLead);
      setStep("sending");
      botReply(s.contactFlow.sending);
      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            name: finalLead.name,
            email: finalLead.email,
            service: finalLead.service,
            message: `[Chatbot] ${finalLead.message}`,
          },
          { publicKey: EMAILJS_PUBLIC_KEY }
        );
        botReply(s.contactFlow.success);
      } catch {
        botReply(s.contactFlow.error);
      }
      setStep("done");
      return;
    }
    // Free text fallback
    botReply(
      lang === "it"
        ? "Grazie per il messaggio! Per una risposta dettagliata, ti consiglio di contattarci direttamente."
        : "Thanks for your message! For a detailed answer, I recommend contacting us directly.",
      s.followUp
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-violet-600 hover:bg-violet-500 transition-colors shadow-lg shadow-violet-900/40 flex items-center justify-center"
        aria-label="Chat"
      >
        {open ? (
          <X size={22} className="text-white" />
        ) : (
          <>
            <MessageCircle size={22} className="text-white" />
            {unread && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#09090B]" />
            )}
          </>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] max-w-[calc(100vw-24px)] rounded-2xl border border-[#1E1E2A] bg-[#111113] shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
          style={{ height: "480px" }}>
          {/* Header */}
          <div className="px-4 py-3 bg-[#16161A] border-b border-[#1E1E2A] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {s.title}
              </p>
              <p className="text-xs text-emerald-400">{s.subtitle}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%] space-y-2">
                  <div
                    className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${
                      msg.from === "user"
                        ? "bg-violet-600 text-white rounded-br-none"
                        : "bg-[#1E1E2A] text-slate-200 rounded-bl-none"
                    }`}
                  >
                    {msg.from === "bot" ? formatText(msg.text) : msg.text}
                  </div>

                  {/* Quick reply buttons */}
                  {msg.quickReplies && i === messages.length - 1 && step === "idle" && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.quickReplies.map((qr) => (
                        <button
                          key={qr.id}
                          onClick={() => handleQuickReply(qr.id)}
                          className="text-xs px-3 py-1.5 rounded-full border border-violet-500/40 text-violet-300 hover:bg-violet-500/10 transition-colors"
                        >
                          {qr.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Service select */}
                  {msg.serviceSelect && i === messages.length - 1 && step === "service" && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {s.contactFlow.serviceOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleServiceSelect(opt.value, opt.label)}
                          className="text-xs px-3 py-1.5 rounded-full border border-violet-500/40 text-violet-300 hover:bg-violet-500/10 transition-colors"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {step !== "done" && step !== "sending" && step !== "service" && (
            <div className="px-3 py-3 border-t border-[#1E1E2A] flex gap-2 items-center">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={s.placeholder}
                className="flex-1 bg-[#09090B] border border-[#1E1E2A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          )}

          {step === "sending" && (
            <div className="px-3 py-3 border-t border-[#1E1E2A] flex justify-center">
              <Loader2 size={18} className="animate-spin text-violet-400" />
            </div>
          )}
        </div>
      )}
    </>
  );
}
