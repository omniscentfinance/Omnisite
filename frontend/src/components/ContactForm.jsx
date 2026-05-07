import { useState } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { useLang } from "@/context/LangContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ContactForm() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", service: "info", message: "" });
  const [status, setStatus] = useState("idle");

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
      <div data-testid="contact-form-success" className="bg-[#111113] rounded-xl border border-[#1E1E2A] p-8 lg:p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
        <CheckCircle className="text-emerald-400 mb-4" size={48} />
        <h3 className="text-2xl font-medium text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{t.contact.successTitle}</h3>
        <p className="text-slate-400">{t.contact.successDesc}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-testid="contact-form" className="bg-[#111113] rounded-xl border border-[#1E1E2A] p-8 lg:p-12">
      <h3 className="text-2xl font-medium tracking-tight text-violet-300 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{t.contact.formTitle}</h3>
      <p className="text-sm text-slate-500 mb-8">{t.contact.formDesc}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">{t.contact.name}</label>
          <input type="text" name="name" required value={form.name} onChange={handleChange} data-testid="contact-form-name" placeholder={t.contact.namePlaceholder} className="w-full px-4 py-3 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">{t.contact.email}</label>
          <input type="email" name="email" required value={form.email} onChange={handleChange} data-testid="contact-form-email" placeholder={t.contact.emailPlaceholder} className="w-full px-4 py-3 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">{t.contact.service}</label>
        <select name="service" value={form.service} onChange={handleChange} data-testid="contact-form-service" className="w-full px-4 py-3 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all">
          {t.contact.serviceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">{t.contact.message}</label>
        <textarea name="message" required value={form.message} onChange={handleChange} rows={4} data-testid="contact-form-message" placeholder={t.contact.messagePlaceholder} className="w-full px-4 py-3 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none" />
      </div>

      <button type="submit" disabled={status === "loading"} data-testid="contact-form-submit" className="btn-primary w-full px-8 py-4 rounded-md text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60">
        {status === "loading" ? (<><Loader2 size={16} className="animate-spin" /> {t.contact.sending}</>) : (<>{t.contact.submit} <Send size={14} /></>)}
      </button>

      {status === "error" && (
        <p data-testid="contact-form-error" className="text-sm text-red-500 mt-3 text-center">{t.contact.error}</p>
      )}
    </form>
  );
}
