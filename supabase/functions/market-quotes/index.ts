// Supabase Edge Function — market-quotes
// Proxy verso Twelve Data per le quotazioni del ticker sul sito pubblico.
//
// Secret richiesto: TWELVE_DATA_API_KEY

const TWELVE_DATA_KEY = Deno.env.get("TWELVE_DATA_API_KEY")!;

// Simboli consentiti (allowlist) -> evita che il proxy venga usato per altro.
// Alcuni indici (es. DXY spot, XAG/USD) non sono nel piano free di
// Twelve Data: usiamo ETF/coppie equivalenti disponibili gratuitamente.
const SYMBOLS: Record<string, { symbol: string; label: string }> = {
  nasdaq: { symbol: "QQQ", label: "Nasdaq" },
  sp500: { symbol: "SPY", label: "S&P 500" },
  dowjones: { symbol: "DIA", label: "Dow Jones" },
  gold: { symbol: "XAU/USD", label: "Gold/USD" },
  silver: { symbol: "SLV", label: "Silver/USD" },
  eurusd: { symbol: "EUR/USD", label: "EUR/USD" },
  dxy: { symbol: "UUP", label: "DXY" },
  wti: { symbol: "USO", label: "WTI" },
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const symbolParam = Object.values(SYMBOLS).map((s) => s.symbol).join(",");
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbolParam)}&apikey=${TWELVE_DATA_KEY}`;

  let raw;
  try {
    const res = await fetch(url);
    raw = await res.json();
  } catch {
    return json({ error: "Errore nella richiesta a Twelve Data" }, 502);
  }

  // Con un solo simbolo Twelve Data restituisce l'oggetto diretto invece
  // che mappato per chiave: qui però ne chiediamo sempre più di uno.
  const quotes = Object.entries(SYMBOLS).map(([key, { symbol, label }]) => {
    const q = raw[symbol];
    if (!q || q.status === "error") return { key, label, symbol, price: null, changePercent: null };
    return {
      key,
      label,
      symbol,
      price: Number(q.close),
      changePercent: Number(q.percent_change),
    };
  });

  return json({ quotes });
});
