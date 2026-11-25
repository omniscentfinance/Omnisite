import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Lock } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { launchDateLabel, isEmail, joinWaitlist, WAITLIST_JOINED_EVENT } from "@/lib/launch";

/**
 * Form di iscrizione alla lista di lancio.
 * `source` distingue da dove arriva l'iscrizione (home, piani, …): finisce
 * nella colonna omonima della tabella waitlist e serve a capire cosa converte.
 */
export default function WaitlistForm({ source = "site", className = "" }) {
  const { t, lang } = useLang();
  const L = t.launch;

  const [form, setForm] = useState({ name: "", email: "", interest: "", consent: false });
  const [status, setStatus] = useState("idle"); // idle | loading | success | already | error
  const [message, setMessage] = useState("");

  const set = (k) => (e) =>
    setForm((prev) => ({ ...prev, [k]: k === "consent" ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!isEmail(form.email)) {
      setStatus("error");
      setMessage(L.invalidEmail);
      return;
    }
    if (!form.consent) {
      setStatus("error");
      setMessage(L.needConsent);
      return;
    }

    setStatus("loading");
    setMessage("");
    const res = await joinWaitlist({
      email: form.email,
      name: form.name,
      interest: form.interest,
      lang,
      source,
    });

    if (res.ok) {
      setStatus(res.already ? "already" : "success");
      setForm({ name: "", email: "", interest: "", consent: false });
      // Il ticker ricarica subito, così la propria iscrizione compare davvero.
      if (!res.already) window.dispatchEvent(new CustomEvent(WAITLIST_JOINED_EVENT));
      return;
    }
    setStatus("error");
    setMessage(L.errorMsg);
  };

  if (status === "success" || status === "already") {
    const done = status === "success";
    return (
      <div
        data-testid="waitlist-success"
        className={`launch-panel px-7 py-12 flex flex-col items-center justify-center text-center min-h-[340px] ${className}`}
        role="status"
      >
        <CheckCircle2 size={40} className="text-[var(--up)] mb-5" />
        <h3 className="text-xl font-normal tracking-tight text-white mb-2.5">
          {done ? L.successTitle : L.alreadyTitle}
        </h3>
        <p className="text-sm leading-[1.7] text-[var(--fg-muted)] max-w-[38ch]">
          {done ? L.successDesc : L.alreadyDesc}
        </p>
        <p className="mono text-[9.5px] tracking-[0.14em] uppercase text-[var(--fg-dim)] mt-7">
          {launchDateLabel(lang)}
        </p>
      </div>
    );
  }

  const loading = status === "loading";

  return (
    <form
      onSubmit={submit}
      data-testid="waitlist-form"
      className={`launch-panel px-6 sm:px-7 py-7 text-left ${className}`}
    >
      <h3 className="text-lg font-normal tracking-tight text-white mb-2">{L.formTitle}</h3>
      <p className="text-[13px] leading-[1.65] text-[var(--fg-muted)] mb-7">{L.formDesc}</p>

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor={`wl-email-${source}`} className="launch-label">
            {L.email}
          </label>
          <input
            id={`wl-email-${source}`}
            type="email"
            name="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            placeholder={L.emailPlaceholder}
            data-testid="waitlist-email"
            className="launch-input"
          />
        </div>

        <div>
          <label htmlFor={`wl-name-${source}`} className="launch-label">
            {L.name}
          </label>
          <input
            id={`wl-name-${source}`}
            type="text"
            name="name"
            autoComplete="given-name"
            value={form.name}
            onChange={set("name")}
            placeholder={L.namePlaceholder}
            data-testid="waitlist-name"
            className="launch-input"
          />
        </div>

        <div>
          <label htmlFor={`wl-interest-${source}`} className="launch-label">
            {L.interest}
          </label>
          <select
            id={`wl-interest-${source}`}
            name="interest"
            value={form.interest}
            onChange={set("interest")}
            data-testid="waitlist-interest"
            className="launch-input"
          >
            <option value="">—</option>
            {L.interests.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex gap-3 items-start cursor-pointer mt-1">
          <input
            type="checkbox"
            name="consent"
            checked={form.consent}
            onChange={set("consent")}
            data-testid="waitlist-consent"
            className="mt-[3px] w-4 h-4 shrink-0 accent-[var(--violet-accent)] cursor-pointer"
          />
          <span className="text-[12.5px] leading-[1.6] text-[var(--fg-muted)]">{L.consent}</span>
        </label>
      </div>

      {status === "error" && (
        <p data-testid="waitlist-error" role="alert" className="text-[12.5px] text-[var(--down)] mt-5">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        data-testid="waitlist-submit"
        className="btn-primary w-full min-h-[50px] rounded-[10px] text-sm font-semibold inline-flex items-center justify-center gap-2.5 mt-7 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            {L.sending}
          </>
        ) : (
          <>
            {L.submit} <ArrowRight size={15} />
          </>
        )}
      </button>

      <p className="mono flex items-center justify-center gap-2 text-[9px] tracking-[0.13em] uppercase text-[var(--fg-dim)] mt-4">
        <Lock size={10} />
        {L.noPayment}
      </p>
      <p className="text-[11.5px] leading-[1.6] text-[var(--fg-dim)] mt-5 pt-5 border-t border-[var(--line)]">
        {L.privacy}
      </p>
    </form>
  );
}
