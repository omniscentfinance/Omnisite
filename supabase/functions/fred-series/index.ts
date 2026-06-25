// Supabase Edge Function — fred-series
// Proxy verso l'API FRED (Federal Reserve Economic Data) per aggirare il CORS.
// Restituisce le osservazioni di una serie, opzionalmente trasformate in
// variazione percentuale year-over-year (per CPI / Core CPI).
//
// Secret richiesto: FRED_API_KEY

const FRED_KEY = Deno.env.get("FRED_API_KEY")!;

// Serie consentite (allowlist) -> evita che il proxy venga usato per altro.
const SERIES: Record<string, { id: string; yoy?: boolean }> = {
  fed_funds: { id: "FEDFUNDS" },
  cpi_yoy: { id: "CPIAUCSL", yoy: true },
  core_cpi_yoy: { id: "CPILFESL", yoy: true },
  unemployment: { id: "UNRATE" },
  gdp_growth: { id: "A191RL1Q225SBEA" },
  payrolls: { id: "PAYEMS" },
  consumer_sentiment: { id: "UMCSENT" },
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

  const { key } = await req.json();
  const series = SERIES[key];
  if (!series) return json({ error: "Serie non valida" }, 400);

  // Ultimi ~10 anni
  const start = new Date();
  start.setFullYear(start.getFullYear() - 10);
  const obsStart = start.toISOString().slice(0, 10);

  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series.id}&api_key=${FRED_KEY}&file_type=json&observation_start=${obsStart}`;

  let raw;
  try {
    const res = await fetch(url);
    raw = await res.json();
  } catch {
    return json({ error: "Errore nella richiesta a FRED" }, 502);
  }

  let points = (raw.observations ?? [])
    .filter((o: { value: string }) => o.value !== ".")
    .map((o: { date: string; value: string }) => ({ date: o.date, value: Number(o.value) }));

  // Variazione % year-over-year per gli indici di prezzo (CPI mensile -> 12 periodi)
  if (series.yoy) {
    const yoy = [];
    for (let i = 12; i < points.length; i++) {
      const prev = points[i - 12].value;
      const cur = points[i].value;
      if (prev) yoy.push({ date: points[i].date, value: Math.round(((cur - prev) / prev) * 1000) / 10 });
    }
    points = yoy;
  }

  return json({ points });
});
