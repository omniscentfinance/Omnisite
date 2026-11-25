import { useState } from "react";
import { ArrowRight, Check, CheckCircle2, Loader2, Lock } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountdown } from "@/hooks/useCountdown";
import { LAUNCH_AT, launchDateLabel, isEmail, joinWaitlist } from "@/lib/launch";

const pad = (n) => String(n).padStart(2, "0");

function Countdown({ units, testId }) {
  const c = useCountdown(LAUNCH_AT);
  const cells = [
    { v: c.days, l: units.days, pad: false },
    { v: c.hours, l: units.hours, pad: true },
    { v: c.minutes, l: units.minutes, pad: true },
    { v: c.seconds, l: units.seconds, pad: true },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-2.5" data-testid={testId}>
      {cells.map((cell) => (
        <div key={cell.l} className="launch-tile px-2 py-4 sm:py-5 text-center">
          <span className="mono block text-[clamp(1.5rem,5.5vw,2.3rem)] font-light leading-none tracking-[-0.02em] text-white">
            {cell.pad ? pad(cell.v) : cell.v}
          </span>
          <span className="mono block text-[8.5px] sm:text-[9px] tracking-[0.16em] uppercase text-[var(--fg-dim)] mt-2.5">
            {cell.l}
          </span>
        </div>
      ))}
    </div>
  );
}

function WaitlistForm() {
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
      source: "site",
    });

    if (res.ok) {
      setStatus(res.already ? "already" : "success");
      setForm({ name: "", email: "", interest: "", consent: false });
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
        className="launch-panel px-7 py-12 flex flex-col items-center justify-center text-center min-h-[340px]"
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
    <form onSubmit={submit} data-testid="waitlist-form" className="launch-panel px-6 sm:px-7 py-7">
      <h3 className="text-lg font-normal tracking-tight text-white mb-2">{L.formTitle}</h3>
      <p className="text-[13px] leading-[1.65] text-[var(--fg-muted)] mb-7">{L.formDesc}</p>

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="wl-email" className="launch-label">
            {L.email}
          </label>
          <input
            id="wl-email"
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
          <label htmlFor="wl-name" className="launch-label">
            {L.name}
          </label>
          <input
            id="wl-name"
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
          <label htmlFor="wl-interest" className="launch-label">
            {L.interest}
          </label>
          <select
            id="wl-interest"
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
        <p
          data-testid="waitlist-error"
          role="alert"
          className="text-[12.5px] text-[var(--down)] mt-5"
        >
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

/**
 * Sezione di lancio: dice che la piattaforma non è disponibile, quanto manca
 * e raccoglie le iscrizioni. `#contact` resta come ancora: le vecchie CTA del
 * sito puntavano lì e continuano a funzionare.
 */
export default function Launch() {
  const { t, lang } = useLang();
  const L = t.launch;
  const ref = useScrollReveal();

  return (
    <section
      id="lancio"
      data-testid="launch-section"
      className="relative py-24 lg:py-32 overflow-hidden scroll-mt-[170px]"
      ref={ref}
    >
      {/* Vecchia ancora del sito: le CTA che puntavano a #contact continuano a funzionare. */}
      <span id="contact" className="block scroll-mt-[170px]" aria-hidden="true" />
      <div className="blob blob-violet -top-[30%] -left-[12%] opacity-70" />
      <div className="blob blob-cyan -bottom-[34%] -right-[10%] opacity-60" />

      <div className="relative z-10 max-w-[1240px] mx-auto px-6 lg:px-10 grid gap-14 lg:gap-20 lg:grid-cols-[1fr_0.86fr] lg:items-start">
        {/* Colonna sinistra: il perché */}
        <div className="scroll-reveal">
          <p className="overline">
            <span className="dot" />
            {L.overline} · {launchDateLabel(lang)}
          </p>

          <h2 className="mt-5 text-[clamp(1.9rem,4.2vw,3.1rem)] font-light tracking-[-0.03em] leading-[1.04] text-white">
            {L.title}
            <br />
            <span className="display-gradient">{L.titleAccent}</span>
          </h2>

          <p className="mt-6 max-w-[58ch] text-base lg:text-[1.05rem] leading-[1.75] text-[var(--fg-muted)]">
            {L.lead}
          </p>

          <ul className="mt-11 flex flex-col">
            {L.bullets.map((b) => (
              <li key={b.t} className="flex gap-4 py-5 border-t border-[var(--line)] last:border-b">
                <Check size={15} className="shrink-0 mt-1 text-[var(--violet-text)]" />
                <div>
                  <h3 className="text-[15px] font-medium tracking-tight text-[var(--fg)] mb-1.5">{b.t}</h3>
                  <p className="text-[13.5px] leading-[1.7] text-[var(--fg-muted)] max-w-[56ch]">{b.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Colonna destra: countdown + iscrizione */}
        {/* Niente sticky: l'overflow-hidden della sezione (serve a contenere i blob)
            lo renderebbe inerte senza dare errore. */}
        <div className="scroll-reveal delay-1 flex flex-col gap-5">
          <Countdown units={L.units} testId="launch-countdown" />
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
