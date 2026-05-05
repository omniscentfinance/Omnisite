import { useState } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const serviceOptions = [
  { value: "orderflow", label: "Corso Analisi Orderflow" },
  { value: "strategy", label: "Sviluppo Strategia Personale" },
  { value: "pamm", label: "Creazione Fondo PAMM" },
  { value: "info", label: "Informazioni Generali" },
];

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", service: "info", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await axios.post(`${API}/contact`, form);
      setStatus("success");
      setForm({ name: "", email: "", service: "info", message: "" });
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  if (status === "success") {
    return (
      <div
        data-testid="contact-form-success"
        className="bg-white rounded-xl border border-slate-100 p-8 lg:p-12 flex flex-col items-center justify-center min-h-[400px] text-center"
      >
        <CheckCircle className="text-emerald-500 mb-4" size={48} />
        <h3
          className="text-2xl font-medium text-slate-900 mb-2"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Messaggio inviato!
        </h3>
        <p className="text-slate-500">Ti risponderemo entro 24 ore a {form.email || "la tua email"}.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="contact-form"
      className="bg-white rounded-xl border border-slate-100 p-8 lg:p-12"
    >
      <h3
        className="text-2xl font-medium tracking-tight text-violet-900 mb-2"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        Scrivici direttamente
      </h3>
      <p className="text-sm text-slate-500 mb-8">
        Compila il form e ti ricontatteremo entro 24 ore.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
            Nome
          </label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            data-testid="contact-form-name"
            placeholder="Il tuo nome"
            className="w-full px-4 py-3 rounded-md border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-900/20 focus:border-violet-900 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            data-testid="contact-form-email"
            placeholder="la-tua@email.com"
            className="w-full px-4 py-3 rounded-md border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-900/20 focus:border-violet-900 transition-all"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
          Servizio
        </label>
        <select
          name="service"
          value={form.service}
          onChange={handleChange}
          data-testid="contact-form-service"
          className="w-full px-4 py-3 rounded-md border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-900/20 focus:border-violet-900 transition-all bg-white"
        >
          {serviceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
          Messaggio
        </label>
        <textarea
          name="message"
          required
          value={form.message}
          onChange={handleChange}
          rows={4}
          data-testid="contact-form-message"
          placeholder="Descrivi la tua richiesta..."
          className="w-full px-4 py-3 rounded-md border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-900/20 focus:border-violet-900 transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        data-testid="contact-form-submit"
        className="btn-primary w-full px-8 py-4 rounded-md text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {status === "loading" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Invio in corso...
          </>
        ) : (
          <>
            Invia messaggio <Send size={14} />
          </>
        )}
      </button>

      {status === "error" && (
        <p data-testid="contact-form-error" className="text-sm text-red-500 mt-3 text-center">
          Si è verificato un errore. Riprova o scrivi a support@omniscent.space.
        </p>
      )}
    </form>
  );
}
