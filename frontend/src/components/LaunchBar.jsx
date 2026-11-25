import { ArrowRight } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { useCountdown } from "@/hooks/useCountdown";
import { LAUNCH_AT, launchShortLabel } from "@/lib/launch";

const pad = (n) => String(n).padStart(2, "0");

/**
 * Striscia fissa in cima al sito: dice che la piattaforma non è ancora
 * disponibile e quanto manca. Vive dentro <Header>, sopra la riga del logo.
 *
 * `onJoin` porta alla sezione #lancio (la gestisce l'Header, che sa se siamo
 * sulla home o su un'altra rotta).
 */
export default function LaunchBar({ onJoin }) {
  const { t, lang } = useLang();
  const L = t.launch;
  const c = useCountdown(LAUNCH_AT);

  const digits = [
    { v: c.days, u: "g" },
    { v: c.hours, u: "h" },
    { v: c.minutes, u: "m" },
    { v: c.seconds, u: "s" },
  ];

  return (
    <div className="launch-bar" data-testid="launch-bar">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10 h-[34px] flex items-center justify-center gap-3 sm:gap-4">
        <span className="flex items-center gap-2 shrink-0">
          <i className="pulse-dot w-[5px] h-[5px] rounded-full bg-[var(--gold)] shadow-[0_0_9px_var(--gold)]" />
          <span className="mono text-[9.5px] font-semibold tracking-[0.17em] uppercase text-[var(--gold)] whitespace-nowrap">
            {c.done ? L.openTitle : L.barLabel}
          </span>
        </span>

        {!c.done && (
          <>
            <span className="mono hidden sm:inline text-[9.5px] tracking-[0.14em] uppercase text-[var(--fg-dim)] whitespace-nowrap">
              {L.barOn} {launchShortLabel(lang)}
            </span>
            <span className="hidden sm:block w-px h-3 bg-[var(--line-hi)]" />
            <span
              className="mono flex items-baseline gap-[3px] text-[11px] text-[var(--fg)] whitespace-nowrap"
              data-testid="launch-bar-countdown"
              aria-label={`${c.days} ${L.units.days}, ${c.hours} ${L.units.hours}, ${c.minutes} ${L.units.minutes}`}
            >
              {digits.map((d, i) => (
                <span key={d.u} className="flex items-baseline">
                  {i > 0 && <span className="text-[var(--fg-dim)] px-[3px]">:</span>}
                  {pad(d.v)}
                  <span className="text-[8.5px] text-[var(--fg-dim)] ml-[1px]">{d.u}</span>
                </span>
              ))}
            </span>
          </>
        )}

        <button
          onClick={onJoin}
          data-testid="launch-bar-cta"
          className="mono ml-auto sm:ml-1 inline-flex items-center gap-1.5 text-[9.5px] font-semibold tracking-[0.14em] uppercase text-[var(--fg)] hover:text-[var(--gold)] transition-colors whitespace-nowrap"
        >
          {c.done ? L.openCta : L.barCta}
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}
