import { useState, useEffect, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { LAUNCH_MODE } from "@/lib/launch";

const BASE = 1.08470;
const ROWS = 6;
const TICK = 0.00012;

/** Livelli di profondità: i volumi si aggiornano, i prezzi restano fissi. */
function useDepth() {
  const reduce = useMemo(
    () => typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const gen = () =>
    Array.from({ length: ROWS * 2 }, () => Math.round(40 + Math.random() * 160));
  const [vols, setVols] = useState(gen);
  const [delta, setDelta] = useState(1284);
  const [imb, setImb] = useState(62);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setVols(gen());
      setDelta(Math.round(800 + Math.random() * 900));
      setImb(Math.round(52 + Math.random() * 18));
    }, 2200);
    return () => clearInterval(id);
  }, [reduce]);

  return { vols, delta, imb };
}

function Sparkline() {
  const d = useMemo(() => {
    const w = 130, h = 34, n = 26;
    let y = h * 0.62;
    const pts = [];
    for (let i = 0; i < n; i++) {
      y += Math.sin(i * 0.55) * h * 0.1 + (Math.random() - 0.52) * h * 0.13;
      y = Math.max(h * 0.12, Math.min(h * 0.88, y));
      pts.push([i * (w / (n - 1)), y]);
    }
    return pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  }, []);

  return (
    <svg viewBox="0 0 130 34" preserveAspectRatio="none" className="h-[34px] flex-1 max-w-[130px]" aria-hidden="true">
      <defs>
        <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity=".38" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L130 34 L0 34 Z`} fill="url(#heroSpark)" />
      <path d={d} fill="none" stroke="#A78BFA" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export default function Hero() {
  const { t } = useLang();
  const { vols, delta, imb } = useDepth();
  const L = t.hero.ladder;

  const width = (v) => `${Math.min(96, 14 + v / 2.1)}%`;

  return (
    <section
      id="hero"
      data-testid="hero-section"
      className={`relative min-h-screen flex items-center overflow-hidden pb-[90px] ${
        LAUNCH_MODE ? "pt-[204px]" : "pt-[170px]"
      }`}
    >
      <div className="grid-bg" />
      <div className="blob blob-violet -top-[14%] -left-[16%]" />
      <div className="blob blob-cyan -bottom-[18%] -right-[12%]" />

      <div className="relative z-10 w-full max-w-[1240px] mx-auto px-6 lg:px-10 grid gap-16 lg:gap-24 lg:grid-cols-[1.08fr_0.92fr] items-center">
        <div>
          <p className="overline fade-in-up">
            <span className="dot" />
            {t.hero.overline}
          </p>

          <h1
            className="display-xl fade-in-up delay-100 mt-6 text-[clamp(3.2rem,8.4vw,6.6rem)]"
            data-testid="hero-tagline"
          >
            {t.hero.tagline}
            <br />
            <span className="display-gradient">{t.hero.taglineAccent}</span>
          </h1>

          <p
            className="fade-in-up delay-200 mt-7 text-base lg:text-lg leading-[1.7] text-[var(--fg-muted)] max-w-[60ch]"
            data-testid="hero-subtitle"
          >
            {t.hero.subtitle}
          </p>

          <div className="fade-in-up delay-300 mt-10 flex flex-wrap gap-3.5">
            <button
              onClick={() =>
                document
                  .querySelector(LAUNCH_MODE ? "#lancio" : "#contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              data-testid="hero-cta-button"
              className="btn-primary min-h-[48px] px-[26px] rounded-[10px] text-sm font-semibold inline-flex items-center gap-2.5"
            >
              {LAUNCH_MODE ? t.launch.heroCta : t.hero.cta} <ArrowRight size={15} />
            </button>
            <button
              data-testid="hero-discover-button"
              onClick={() => document.querySelector("#method")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-secondary min-h-[48px] px-[26px] rounded-[10px] text-sm font-semibold"
            >
              {t.hero.discover}
            </button>
          </div>

          <div className="fade-in-up delay-500 mt-11 pt-6 hairline flex flex-wrap gap-x-7 gap-y-4">
            {t.hero.cred.map((c) => (
              <div key={c.l} className="flex flex-col gap-0.5">
                <span className="font-[var(--font-heading)] text-2xl font-light tracking-tight text-white">{c.n}</span>
                <span className="mono text-[9.5px] tracking-[0.16em] uppercase text-[var(--fg-dim)]">{c.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ladder orderflow — dice cosa facciamo prima ancora che si legga il testo */}
        <div className="ladder fade-in-up delay-200 p-[22px]" aria-hidden="true" data-testid="hero-ladder">
          <div className="flex justify-between items-center pb-4 mb-2 border-b border-[var(--line)]">
            <span className="mono text-[11px] tracking-[0.14em] uppercase text-[var(--fg-muted)]">{L.title}</span>
            <span className="mono flex items-center gap-1.5 text-[9.5px] tracking-[0.14em] uppercase text-[var(--up)]">
              <i className="pulse-dot w-1.5 h-1.5 rounded-full bg-[var(--up)] shadow-[0_0_9px_var(--up)]" />
              {L.live}
            </span>
          </div>

          <div className="mono grid grid-cols-[1fr_82px_1fr] text-[9px] tracking-[0.14em] uppercase text-[var(--fg-dim)] pt-2.5 pb-2">
            <span className="text-left">{L.bid}</span>
            <span className="text-center">{L.price}</span>
            <span className="text-right">{L.ask}</span>
          </div>

          {Array.from({ length: ROWS }, (_, i) => {
            const idx = ROWS - 1 - i;
            const v = vols[idx];
            return (
              <div className="ladder-row" key={`ask-${idx}`}>
                <span />
                <span className="text-center text-[10.5px] text-[var(--fg-muted)]">
                  {(BASE + (ROWS - i) * TICK).toFixed(5)}
                </span>
                <span className="ladder-bar ask">
                  <span className="ladder-fill" style={{ width: width(v) }} />
                  <span className="relative z-[2] px-2 text-[10px] text-[var(--fg-muted)]">{v}</span>
                </span>
              </div>
            );
          })}

          <div className="ladder-row mid">
            <span />
            <span className="text-center leading-tight">
              <span className="block text-[13px] font-semibold text-white [text-shadow:0_0_18px_var(--violet-glow)]">
                {BASE.toFixed(5)}
              </span>
              <span className="block text-[9px] tracking-[0.1em] text-[var(--violet-text)] mt-0.5">
                {L.spread} 0.4
              </span>
            </span>
            <span />
          </div>

          {Array.from({ length: ROWS }, (_, i) => {
            const v = vols[ROWS + i];
            return (
              <div className="ladder-row" key={`bid-${i}`}>
                <span className="ladder-bar bid">
                  <span className="ladder-fill" style={{ width: width(v) }} />
                  <span className="relative z-[2] px-2 text-[10px] text-[var(--fg-muted)]">{v}</span>
                </span>
                <span className="text-center text-[10.5px] text-[var(--fg-muted)]">
                  {(BASE - (i + 1) * TICK).toFixed(5)}
                </span>
                <span />
              </div>
            );
          })}

          <div className="mt-4 pt-4 border-t border-[var(--line)] flex justify-between items-end gap-4">
            <div>
              <span className="mono block text-[9px] tracking-[0.14em] uppercase text-[var(--fg-dim)] mb-1.5">{L.delta}</span>
              <span className="mono text-[13px] text-[var(--up)]">+{delta.toLocaleString("it-IT")}</span>
            </div>
            <div>
              <span className="mono block text-[9px] tracking-[0.14em] uppercase text-[var(--fg-dim)] mb-1.5">{L.imbalance}</span>
              <span className="mono text-[13px] text-[var(--fg)]">{imb} / {100 - imb}</span>
            </div>
            <Sparkline />
          </div>
        </div>
      </div>
    </section>
  );
}
