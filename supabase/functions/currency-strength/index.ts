// Supabase Edge Function — currency-strength
//
// Calcola la forza relativa delle 8 valute major (USD, EUR, GBP, JPY, CHF,
// AUD, CAD, NZD) dalla variazione % giornaliera di 28 coppie incrociate
// (Twelve Data), salva uno snapshot storico e lo serve al frontend.
//
// Due modalità, distinte dal body della richiesta (non dal metodo HTTP,
// perché supabase.functions.invoke usa sempre POST):
// - body { action: "refresh" } + header x-cron-secret: interroga Twelve Data,
//   calcola la forza e salva uno snapshot (chiamata dal cron schedulato).
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

// Twelve Data: variazione % giornaliera (percent_change) per ogni coppia,
// in gruppi da 8 simboli per rispettare il piano free.
async function fetchPercentChanges(): Promise<Record<string, number>> {
  const symbols = PAIRS.map(([base, quote]) => `${base}/${quote}`);
  const changes: Record<string, number> = {};
  for (const group of chunk(symbols, 8)) {
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(group.join(","))}&apikey=${TWELVE_DATA_KEY}`;
    const res = await fetch(url);
    const raw = await res.json();
    for (const sym of group) {
      // Con un solo simbolo Twelve Data risponde con l'oggetto diretto invece
      // che mappato per chiave; qui i gruppi hanno sempre >1 simbolo tranne
      // eventualmente l'ultimo.
      const q = group.length === 1 ? raw : raw[sym];
      if (q && q.status !== "error" && q.percent_change != null) {
        changes[sym] = Number(q.percent_change);
      }
    }
  }
  return changes;
}

// Ogni valuta compare in 7 delle 28 coppie: senza tutte e 7 il dato non è
// affidabile (es. dopo un rate-limit parziale di Twelve Data), meglio
// ometterlo che salvare un falso "0%".
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
  const changes = await fetchPercentChanges();
  const strengths = computeStrength(changes);
  if (strengths.length === 0) throw new Error("Nessuna valuta con dati completi da Twelve Data: snapshot saltato.");
  const taken_at = new Date().toISOString();
  const { error } = await supabase
    .from("currency_strength_snapshot")
    .insert(strengths.map((s) => ({ ...s, taken_at })));
  if (error) throw error;
  return strengths;
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
      const strengths = await refresh(supabase);
      return json({ ok: true, strengths });
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
