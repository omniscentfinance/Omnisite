// Supabase Edge Function — next-live
// Legge dal Google Calendar del mentor il prossimo evento il cui titolo inizia
// con "LIVE" e ne restituisce titolo, orario e link (Meet). Così le live si
// programmano dal calendario, senza impostare il link a mano ogni volta.
//
// Secret: GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_CALENDAR_ID (gli stessi di get-availability).

const CALENDAR_ID = Deno.env.get("GOOGLE_CALENDAR_ID")!;
const SA = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON")!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function pemToArrayBuffer(pem: string) {
  const b64 = pem.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\s/g, "");
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}
function b64url(input: string | Uint8Array) {
  const str = typeof input === "string" ? input : String.fromCharCode(...input);
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
async function getGoogleToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: SA.client_email,
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const key = await crypto.subtle.importKey("pkcs8", pemToArrayBuffer(SA.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${b64url(new Uint8Array(sig))}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Google auth fallita");
  return data.access_token;
}

function eventLink(ev: any) {
  if (ev.hangoutLink) return ev.hangoutLink;
  const ep = ev.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === "video");
  if (ep?.uri) return ep.uri;
  if (ev.location && /^https?:\/\//.test(ev.location)) return ev.location;
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let token: string;
  try { token = await getGoogleToken(); } catch { return json({ live: null }); }

  // Eventi da poco prima di adesso (per includere live già iniziate) in avanti
  const timeMin = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`
    + `?timeMin=${encodeURIComponent(timeMin)}&singleEvents=true&orderBy=startTime&maxResults=10&q=LIVE`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  const items = data.items ?? [];

  const ev = items.find((e: any) => (e.summary || "").trim().toLowerCase().startsWith("live"));
  if (!ev) return json({ live: null });

  const title = (ev.summary || "").replace(/^live[\s:–-]*/i, "").trim() || "Live";
  const starts_at = ev.start?.dateTime || ev.start?.date || null;

  return json({ live: { title, starts_at, join_url: eventLink(ev) } });
});
