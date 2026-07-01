// Supabase Edge Function — econ-calendar
// Proxy verso Financial Modeling Prep per il calendario economico (con
// previous / estimate / actual / impact). Filtra sugli eventi ad alto impatto.
//
// Secret richiesto: FMP_API_KEY

const FMP_KEY = Deno.env.get("FMP_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const now = new Date();
  const to = new Date(); to.setDate(to.getDate() + 14);
  const from = now.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);

  const url = `https://financialmodelingprep.com/api/v3/economic_calendar?from=${from}&to=${toStr}&apikey=${FMP_KEY}`;

  let data: unknown;
  try {
    const res = await fetch(url);
    data = await res.json();
  } catch {
    return json({ events: [], error: "Errore nella richiesta a FMP" }, 502);
  }

  if (!Array.isArray(data)) {
    const msg = (data as Record<string, string>)?.["Error Message"] || "Dati non disponibili";
    return json({ events: [], error: msg }, 200);
  }

  const events = (data as any[])
    .filter((e) => (e.impact || "").toLowerCase() === "high")
    .map((e) => ({
      date: e.date,
      country: e.country || "",
      currency: e.currency || "",
      event: e.event || "",
      previous: e.previous ?? null,
      estimate: e.estimate ?? null,
      actual: e.actual ?? null,
      impact: e.impact || "",
    }));

  return json({ events });
});
