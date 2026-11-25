import { useState, useEffect, useRef, useCallback } from "react";
import { UserPlus } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { fetchRecentSignups, WAITLIST_JOINED_EVENT } from "@/lib/launch";

const REFRESH_MS = 60_000; // ogni quanto si rilegge la lista
const VISIBLE_MS = 5_000; // quanto resta a schermo un avviso
const GAP_MS = 7_000; // pausa fra un avviso e il successivo
const JUST_NOW_S = 120; // sotto i 2 minuti è "appena iscritto"

/**
 * Da quanto è arrivata l'iscrizione, detto com'è davvero. Torna null se è
 * freschissima: in quel caso il testo diventa "nuova iscrizione".
 *
 * La formulazione è volutamente senza genere ("in lista da…" e non
 * "si è iscritto/a"): il nome può essere di chiunque.
 */
function ago(date, lang) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < JUST_NOW_S) return null;

  const en = lang === "en";
  const m = Math.floor(s / 60);
  if (m < 60) return en ? `joined ${m} min ago` : `in lista da ${m} min`;

  const h = Math.floor(m / 60);
  if (h < 24) return en ? `joined ${h}h ago` : `in lista da ${h}h`;

  const d = Math.floor(h / 24);
  if (d === 1) return en ? "joined yesterday" : "in lista da ieri";
  return en ? `joined ${d} days ago` : `in lista da ${d} giorni`;
}

/**
 * Avvisi di iscrizione in alto, alimentati dalle iscrizioni REALI della tabella
 * waitlist. Niente nomi inventati: se non si è ancora iscritto nessuno, non
 * compare nulla. Mostra solo il nome di battesimo e il tempo reale trascorso.
 */
export default function SignupTicker() {
  const { t, lang } = useLang();
  const L = t.launch;

  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(null);
  const idx = useRef(0);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const load = useCallback(async () => {
    const rows = await fetchRecentSignups(8);
    setItems(rows);
  }, []);

  // Primo caricamento, aggiornamento periodico e refresh quando qualcuno si iscrive.
  useEffect(() => {
    let alive = true;
    const run = () => alive && load();

    run();
    const id = setInterval(run, REFRESH_MS);
    window.addEventListener(WAITLIST_JOINED_EVENT, run);

    return () => {
      alive = false;
      clearInterval(id);
      window.removeEventListener(WAITLIST_JOINED_EVENT, run);
    };
  }, [load]);

  // Rotazione: un avviso per volta, con pausa in mezzo.
  useEffect(() => {
    clearTimers();
    setCurrent(null);
    if (!items.length) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const show = () => {
      const item = items[idx.current % items.length];
      idx.current += 1;
      setCurrent(item);
      timers.current.push(setTimeout(() => setCurrent(null), VISIBLE_MS));
      timers.current.push(setTimeout(show, GAP_MS));
    };

    // Un attimo di respiro prima del primo avviso: non salta addosso al caricamento.
    timers.current.push(setTimeout(show, reduce ? 1500 : 2600));
    return clearTimers;
  }, [items]);

  if (!current) return null;

  const when = ago(current.at, lang);

  return (
    <div
      className="signup-toast"
      data-testid="signup-toast"
      role="status"
      aria-live="polite"
    >
      <span className="signup-toast-icon">
        <UserPlus size={13} />
      </span>
      <span className="text-[13px] leading-tight text-[var(--fg)]">
        <strong className="font-semibold text-white">{current.name}</strong>
        <span className="text-[var(--fg-dim)]"> · </span>
        <span className={when ? "text-[12px] text-[var(--fg-muted)]" : "text-[var(--up)]"}>
          {when || L.justJoined}
        </span>
      </span>
    </div>
  );
}
