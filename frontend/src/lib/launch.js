import { supabase } from "@/lib/supabase";

/* ─────────────────────────────────────────────────────────────
   Stato di lancio della piattaforma — unica fonte di verità.

   LAUNCH_MODE = false riapre il sito: sparisce la barra in alto,
   sparisce la sezione lancio e i piani tornano acquistabili.
   Non serve toccare nient'altro.
   ───────────────────────────────────────────────────────────── */

export const LAUNCH_MODE = true;

// 31 gennaio 2027, 18:00 ora italiana (gennaio = CET, UTC+1).
export const LAUNCH_AT = new Date("2027-01-31T18:00:00+01:00");

const LOCALE = { it: "it-IT", en: "en-GB" };

/** "31 gennaio 2027" / "31 January 2027" */
export const launchDateLabel = (lang = "it") =>
  LAUNCH_AT.toLocaleDateString(LOCALE[lang] || LOCALE.it, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** "31 gen" / "31 Jan" — per la barra in alto, dove lo spazio è poco. */
export const launchShortLabel = (lang = "it") =>
  LAUNCH_AT.toLocaleDateString(LOCALE[lang] || LOCALE.it, {
    day: "numeric",
    month: "short",
  }).replace(".", "");

/** Il lancio è già passato? Letto a ogni chiamata, non congelato al bundle. */
export const hasLaunched = () => Date.now() >= LAUNCH_AT.getTime();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
export const isEmail = (v) => EMAIL_RE.test(String(v || "").trim());

/**
 * Iscrive un indirizzo alla lista di lancio.
 *
 * La tabella è insert-only per la chiave anon (che è pubblica, sta nel bundle):
 * si può scrivere ma non rileggere, così la lista email non è sfogliabile
 * da chiunque apra il sito. La lettura avviene solo dal pannello Supabase
 * o da un account admin.
 */
export async function joinWaitlist({ email, name = "", interest = "", lang = "it", source = "site" }) {
  const { error } = await supabase.from("waitlist").insert({
    email: String(email).trim().toLowerCase(),
    name: String(name).trim() || null,
    interest: interest || null,
    lang,
    source,
  });

  if (!error) return { ok: true, already: false };

  // 23505 = unique_violation → era già in lista: per chi compila è un successo.
  if (error.code === "23505") return { ok: true, already: true };

  return { ok: false, already: false, error };
}
