// Supabase Edge Function — econ-calendar
// Calendario economico gratuito (feed ForexFactory via FairEconomy), senza API key.
// Restituisce gli eventi ad alto impatto di questa e della prossima settimana,
// con forecast (consenso), previous (precedente) e actual (effettivo).

const FEEDS = [
  "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
  "https://nfs.faireconomy.media/ff_calendar_nextweek.json",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let all: any[] = [];
  try {
    for (const url of FEEDS) {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const data = await res.json();
      if (Array.isArray(data)) all = all.concat(data);
    }
  } catch {
    return json({ events: [], error: "Dati non disponibili" }, 200);
  }

  const events = all
    .filter((e) => (e.impact || "").toLowerCase() === "high")
    .map((e) => ({
      date: e.date,
      country: e.country || "",
      currency: e.country || "",
      event: e.title || "",
      previous: e.previous || null,
      estimate: e.forecast || null,
      actual: e.actual || null,
      impact: e.impact || "",
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return json({ events });
});
