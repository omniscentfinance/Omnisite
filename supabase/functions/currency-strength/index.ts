// Supabase Edge Function — currency-strength
//
// Calcola la forza relativa delle 8 valute major (USD, EUR, GBP, JPY, CHF,
// AUD, CAD, NZD) dalla variazione % giornaliera di 28 coppie incrociate
// (Twelve Data), salva uno snapshot storico e lo serve al frontend.
//
// Due modalità, distinte dal body della richiesta (non dal metodo HTTP,
// perché supabase.functions.invoke usa sempre POST):
// - body { action: "refresh" } + header x-cron-secret: chiamata dal cron ogni
//   2 minuti. Il piano free di Twelve Data non permette di ottenere le 28
//   coppie in un'unica chiamata veloce (rate-limit), e pg_net abbandona la
//   richiesta dopo pochi secondi se la function è lenta. Quindi ogni run
//   prende SOLO un gruppo di 8 simboli (a rotazione, deterministica in base
//   all'orario) e lo salva in una tabella di appoggio (currency_pair_change).
//   Quando tutti i 28 simboli risultano "freschi" (aggiornati di recente),
//   calcola la forza delle 8 valute e salva un nuovo snapshot storico.
// - nessun body / action diversa: legge lo storico già salvato (chiamata dal
//   frontend, nessuna richiesta a Twelve Data => nessun limite di rate).
//
// Secrets richiesti: TWELVE_DATA_API_KEY, CRON_SECRET

import { createClient } from "npm:@supabase/supabase-js@2";

const TWELVE_DATA_KEY = Deno.env.get("TWELVE_DATA_API_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD"];

// Le 28 combinazioni possibili tra le 8 valute major (C(8,2)), in notazione
// di mercato dove disponibile per massimizzare la copertura su Twelve Data.
const PAIRS: [string, string][] = [
  ["EUR", "USD"], ["GBP", "USD"], ["AUD", "USD"], ["NZD", "USD"],
  ["USD", "JPY"], ["USD", "CHF"], ["USD", "CAD"],
  ["EUR", "GBP"], ["EUR", "JPY"], ["EUR", "CHF"], ["EUR", "AUD"], ["EUR", "CAD"], ["EUR", "NZD"],
  ["GBP", "JPY"], ["GBP", "CHF"], ["GBP", "AUD"], ["GBP", "CAD"], ["GBP", "NZD"],
  ["AUD", "JPY"], ["AUD", "CHF"], ["AUD", "CAD"], ["AUD", "NZD"],
  ["NZD", "JPY"], ["NZD", "CHF"], ["NZD", "CAD"],
  ["CHF", "JPY"], ["CAD", "JPY"], ["CAD", "CHF"],
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function fetchQuoteGroup(group: string[]): Promise<Record<string, number>> {
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(group.join(","))}&apikey=${TWELVE_DATA_KEY}`;
  const res = await fetch(url);
  const raw = await res.json();
  const out: Record<string, number> = {};
  for (const sym of group) {
    // Con un solo simbolo Twelve Data risponde con l'oggetto diretto invece
    // che mappato per chiave; qui i gruppi hanno sempre >1 simbolo tranne
    // eventualmente l'ultimo.
    const q = group.length === 1 ? raw : raw[sym];
    if (q && q.status !== "error" && q.percent_change != null) {
      out[sym] = Number(q.percent_change);
    }
  }
  return out;
}

const SYMBOLS = PAIRS.map(([base, quote]) => `${base}/${quote}`);
const SYMBOL_CHUNKS = chunk(SYMBOLS, 8);

// Il cron chiama questa function ogni CHUNK_INTERVAL_MS: ad ogni chiamata
// scegliamo il prossimo gruppo di 8 simboli in modo deterministico in base
// all'orario (nessuno stato da tenere), così a rotazione tutti i 28 simboli
// vengono coperti in un giro completo.
const CHUNK_INTERVAL_MS = 2 * 60 * 1000; // deve combaciare con lo schedule del cron ("*/2 * * * *")
const ROTATION_SPAN_MS = SYMBOL_CHUNKS.length * CHUNK_INTERVAL_MS;
// Finestra di "freschezza": un simbolo conta solo se aggiornato entro
// l'ultimo giro completo di rotazione + un margine per eventuali run saltate.
const FRESH_WINDOW_MS = ROTATION_SPAN_MS + 4 * CHUNK_INTERVAL_MS;
// Una volta che i 28 simboli sono tutti freschi, salviamo un nuovo snapshot
// storico solo se è passato abbastanza tempo dall'ultimo (mantiene una
// cadenza ~oraria invece di uno snapshot ogni 2 minuti).
const MIN_SNAPSHOT_GAP_MS = 55 * 60 * 1000;

function currentChunkIndex(): number {
  return Math.floor(Date.now() / CHUNK_INTERVAL_MS) % SYMBOL_CHUNKS.length;
}

// Ogni valuta compare in 7 delle 28 coppie: senza tutte e 7 il dato non è
// affidabile, meglio ometterlo che salvare un falso "0%".
const PAIRS_PER_CURRENCY = 7;

// Forza di ogni valuta = media delle variazioni % delle coppie in cui compare
// (+ come base, - come quotata). Ritorna solo le valute con dati completi.
function computeStrength(changes: Record<string, number>) {
  const totals: Record<string, number> = {};
  const counts: Record<string, number> = {};
  for (const c of CURRENCIES) { totals[c] = 0; counts[c] = 0; }
  for (const [base, quote] of PAIRS) {
    const pct = changes[`${base}/${quote}`];
    if (pct == null) continue;
    totals[base] += pct; counts[base] += 1;
    totals[quote] -= pct; counts[quote] += 1;
  }
  return CURRENCIES
    .filter((currency) => counts[currency] === PAIRS_PER_CURRENCY)
    .map((currency) => ({
      currency,
      strength: Math.round((totals[currency] / counts[currency]) * 100) / 100,
    }));
}

async function refresh(supabase: ReturnType<typeof createClient>) {
  // 1) Prende SOLO il gruppo di 8 simboli di turno (veloce, un'unica
  // richiesta a Twelve Data) e lo salva nella tabella di appoggio.
  const group = SYMBOL_CHUNKS[currentChunkIndex()];
  const fetched = await fetchQuoteGroup(group);
  const now = new Date().toISOString();
  if (Object.keys(fetched).length > 0) {
    const { error } = await supabase
      .from("currency_pair_change")
      .upsert(
        Object.entries(fetched).map(([symbol, pct]) => ({ symbol, pct, updated_at: now })),
        { onConflict: "symbol" },
      );
    if (error) throw error;
  }

  // 2) Controlla se tutti i 28 simboli sono freschi (coperti dall'ultimo
  // giro completo di rotazione).
  const since = new Date(Date.now() - FRESH_WINDOW_MS).toISOString();
  const { data: staged, error: stagedError } = await supabase
    .from("currency_pair_change")
    .select("symbol, pct, updated_at")
    .gte("updated_at", since);
  if (stagedError) throw stagedError;

  const changes: Record<string, number> = {};
  for (const row of staged ?? []) changes[row.symbol] = Number(row.pct);
  const haveAllSymbols = SYMBOLS.every((sym) => sym in changes);
  if (!haveAllSymbols) {
    return { snapshotSaved: false, reason: "in attesa che tutti i 28 simboli siano freschi" };
  }

  // 3) Dati completi: salva un nuovo snapshot solo se è passato abbastanza
  // tempo dall'ultimo (evita uno snapshot ogni 2 minuti).
  const { data: lastSnap } = await supabase
    .from("currency_strength_snapshot")
    .select("taken_at")
    .order("taken_at", { ascending: false })
    .limit(1);
  const lastTakenAt = lastSnap?.[0]?.taken_at ? new Date(lastSnap[0].taken_at).getTime() : 0;
  if (Date.now() - lastTakenAt < MIN_SNAPSHOT_GAP_MS) {
    return { snapshotSaved: false, reason: "snapshot recente, salto questo giro" };
  }

  const strengths = computeStrength(changes);
  if (strengths.length === 0) throw new Error("Nessuna valuta con dati completi da Twelve Data: snapshot saltato.");
  const taken_at = new Date().toISOString();
  const { error: insertError } = await supabase
    .from("currency_strength_snapshot")
    .insert(strengths.map((s) => ({ ...s, taken_at })));
  if (insertError) throw insertError;
  return { snapshotSaved: true, strengths };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* nessun body: lettura storico */ }

  if (body?.action === "refresh") {
    if (req.headers.get("x-cron-secret") !== CRON_SECRET) {
      return json({ error: "Non autorizzato" }, 401);
    }
    try {
      const result = await refresh(supabase);
      return json({ ok: true, ...result });
    } catch (e) {
      return json({ error: String((e as Error)?.message || e) }, 502);
    }
  }

  // Lettura storico (ultime 48h) + ranking corrente per il frontend.
  const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const { data, error } = await supabase
    .from("currency_strength_snapshot")
    .select("currency, strength, taken_at")
    .gte("taken_at", since)
    .order("taken_at", { ascending: true });
  if (error) return json({ error: error.message }, 500);

  const series: Record<string, { t: string; v: number }[]> = {};
  for (const c of CURRENCIES) series[c] = [];
  for (const row of data ?? []) {
    (series[row.currency] ||= []).push({ t: row.taken_at, v: Number(row.strength) });
  }
  const latest = CURRENCIES
    .map((currency) => {
      const points = series[currency];
      return { currency, strength: points.length ? points[points.length - 1].v : 0 };
    })
    .sort((a, b) => b.strength - a.strength);

  return json({ latest, series });
});
