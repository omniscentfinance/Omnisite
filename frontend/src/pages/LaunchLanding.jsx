import { useState, useEffect, useCallback } from "react";
import { ArrowRight, X } from "lucide-react";
import { LangProvider, useLang } from "@/context/LangContext";
import OrderBookLadder from "@/components/OrderBookLadder";
import WaitlistForm from "@/components/WaitlistForm";
import { useCountdown } from "@/hooks/useCountdown";
import { LAUNCH_AT, launchDateLabel } from "@/lib/launch";

const LOGO_URL = "/omniscent-logo.png";
const pad = (n) => String(n).padStart(2, "0");

/** Countdown grande, al centro della pagina. */
function BigCountdown() {
  const { t } = useLang();
  const u = t.launch.units;
  const c = useCountdown(LAUNCH_AT);

  const cells = [
    { v: c.days, l: u.days, pad: false },
    { v: c.hours, l: u.hours, pad: true },
    { v: c.minutes, l: u.minutes, pad: true },
    { v: c.seconds, l: u.seconds, pad: true },
  ];

  return (
    <div
      className="grid grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-[620px] mx-auto"
      data-testid="launch-countdown"
      role="timer"
      aria-label={`${c.days} ${u.days}, ${c.hours} ${u.hours}, ${c.minutes} ${u.minutes}`}
    >
      {cells.map((cell) => (
        <div key={cell.l} className="launch-tile px-1 py-5 sm:py-7 text-center">
          <span className="mono block text-[clamp(2rem,8vw,4rem)] font-extralight leading-none tracking-[-0.04em] text-white">
            {cell.pad ? pad(cell.v) : cell.v}
          </span>
          <span className="mono block text-[8.5px] sm:text-[10px] tracking-[0.18em] uppercase text-[var(--fg-dim)] mt-3 sm:mt-4">
            {cell.l}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Modale con il form: la home resta una schermata sola. */
function WaitlistModal({ open, onClose }) {
  const onKey = useCallback((e) => e.key === "Escape" && onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onKey]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[rgba(6,6,9,0.82)] backdrop-blur-sm"
      onClick={onClose}
      data-testid="waitlist-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[470px] my-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Chiudi"
          data-testid="waitlist-modal-close"
          className="absolute -top-1 right-2 z-10 w-10 h-10 flex items-center justify-center text-[var(--fg-muted)] hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        <WaitlistForm source="home" />
      </div>
    </div>
  );
}

function LaunchLandingContent() {
  const { t, lang } = useLang();
  const L = t.launch;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = L.pageTitle;
  }, [L.pageTitle]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] grain flex flex-col" data-testid="launch-landing">
      {/* Niente navbar: solo il marchio e il tasto di iscrizione. */}
      <header className="relative z-20 w-full">
        <div className="max-w-[1180px] mx-auto px-6 lg:px-10 h-[86px] flex items-center justify-between gap-4">
          <img src={LOGO_URL} alt="OMNISCENT®" className="header-logo-img" />
          <button
            onClick={() => setOpen(true)}
            data-testid="launch-nav-cta"
            className="btn-secondary min-h-[42px] px-5 rounded-[9px] text-[13px] font-semibold inline-flex items-center gap-2"
          >
            {L.navCta}
          </button>
        </div>
      </header>

      <main className="relative flex-1 flex items-center overflow-hidden pt-4 pb-20">
        <div className="grid-bg" />
        <div className="blob blob-violet -top-[22%] -left-[14%]" />
        <div className="blob blob-cyan -bottom-[26%] -right-[10%]" />

        <div className="relative z-10 w-full max-w-[1180px] mx-auto px-6 lg:px-10">
          {/* Titolo */}
          <div className="text-center">
            <p className="overline fade-in-up justify-center">
              <span className="dot" />
              {L.overline} · {launchDateLabel(lang)}
            </p>

            <h1
              className="display-xl fade-in-up delay-100 mt-6 text-[clamp(3rem,9vw,6.4rem)]"
              data-testid="hero-tagline"
            >
              {t.hero.tagline}
              <br />
              <span className="display-gradient">{t.hero.taglineAccent}</span>
            </h1>

            <p className="fade-in-up delay-200 mt-7 mx-auto max-w-[56ch] text-base lg:text-lg leading-[1.7] text-[var(--fg-muted)]">
              {L.landingLead}
            </p>
          </div>

          {/* Countdown al centro + tasto grande */}
          <div className="fade-in-up delay-300 mt-14 lg:mt-16">
            <BigCountdown />

            <div className="mt-9 flex flex-col items-center">
              <button
                onClick={() => setOpen(true)}
                data-testid="launch-primary-cta"
                className="btn-primary w-full max-w-[460px] min-h-[64px] px-10 rounded-[14px] text-[1.05rem] sm:text-[1.15rem] font-semibold inline-flex items-center justify-center gap-3"
              >
                {L.tierCta} <ArrowRight size={19} />
              </button>
              <p className="mono mt-4 text-[9.5px] tracking-[0.14em] uppercase text-[var(--fg-dim)]">
                {L.noPayment}
              </p>
            </div>
          </div>

          {/* Il book: unica cosa "viva" in pagina */}
          <div className="fade-in-up delay-500 mt-16 lg:mt-20 max-w-[480px] mx-auto">
            <OrderBookLadder />
          </div>
        </div>
      </main>

      {/* Disclaimer di rischio: su un sito di formazione finanziaria resta anche in pagina di lancio. */}
      <footer className="relative z-10 border-t border-[var(--line)]">
        <div className="max-w-[1180px] mx-auto px-6 lg:px-10 py-7 flex flex-col gap-3">
          <p className="text-[11px] leading-[1.65] text-[var(--fg-dim)] max-w-[110ch]">{t.footer.risk}</p>
          <p className="mono text-[9.5px] tracking-[0.13em] uppercase text-[var(--fg-dim)]">
            © {new Date().getFullYear()} OMNISCENT® · {t.footer.rights}
          </p>
        </div>
      </footer>

      <WaitlistModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default function LaunchLanding() {
  return (
    <LangProvider>
      <LaunchLandingContent />
    </LangProvider>
  );
}
