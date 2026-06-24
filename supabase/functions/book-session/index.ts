// Supabase Edge Function — book-session
// Crea una prenotazione mentorship: verifica piano + slot libero su Google
// Calendar, applica il limite 2h/mese (trigger DB) e crea l'evento.
//
// Secrets richiesti (Edge Functions > Secrets):
//   GOOGLE_SERVICE_ACCOUNT_JSON -> contenuto completo del file .json del service account
//   GOOGLE_CALENDAR_ID          -> es. "omniscent.finance@gmail.com"
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono iniettate automaticamente.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CALENDAR_ID = Deno.env.get("GOOGLE_CALENDAR_ID")!;
const SA = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON")!);

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

// --- Google service account auth ---
function pemToArrayBuffer(pem: string) {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
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
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(SA.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1. Utente autenticato
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return json({ error: "Non autenticato" }, 401);
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return json({ error: "Sessione non valida" }, 401);

  // 2. Verifica piano: mentorship attiva o admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, mentorship_expires_at, full_name, email")
    .eq("id", user.id)
    .single();
  const mentorActive = profile?.is_admin ||
    (profile?.mentorship_expires_at && new Date(profile.mentorship_expires_at) > new Date());
  if (!mentorActive) return json({ error: "Piano Master Mentor non attivo" }, 403);

  // 3. Input
  const { starts_at, duration_min = 60 } = await req.json();
  const start = new Date(starts_at);
  if (isNaN(start.getTime()) || start < new Date()) {
    return json({ error: "Orario non valido" }, 400);
  }
  const end = new Date(start.getTime() + duration_min * 60000);

  // 4. Slot già preso da un altro cliente?
  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("starts_at", start.toISOString())
    .maybeSingle();
  if (existing) return json({ error: "Slot non più disponibile" }, 409);

  // 5. Verifica disponibilità sul Google Calendar (free/busy)
  let accessToken: string;
  try {
    accessToken = await getGoogleToken();
  } catch {
    return json({ error: "Errore di connessione al calendario" }, 500);
  }

  const fb = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      items: [{ id: CALENDAR_ID }],
    }),
  });
  const fbData = await fb.json();
  const busy = fbData?.calendars?.[CALENDAR_ID]?.busy ?? [];
  if (busy.length > 0) return json({ error: "Orario non disponibile" }, 409);

  // 6. Inserisci la prenotazione (il trigger DB applica il limite 2h/mese)
  const { data: inserted, error: insErr } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      email: profile?.email ?? user.email,
      starts_at: start.toISOString(),
      duration_min,
    })
    .select("id")
    .single();
  if (insErr) {
    const msg = insErr.message?.includes("Limite mensile")
      ? "Hai raggiunto il limite di 2 ore al mese."
      : "Impossibile completare la prenotazione.";
    return json({ error: msg }, 400);
  }

  // 7. Crea l'evento su Google Calendar
  const evRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: `Mentorship 1to1 — ${profile?.full_name ?? profile?.email ?? "Cliente"}`,
        description: `Sessione Master Mentor prenotata da ${profile?.email ?? user.email}`,
        start: { dateTime: start.toISOString(), timeZone: "Europe/Rome" },
        end: { dateTime: end.toISOString(), timeZone: "Europe/Rome" },
      }),
    },
  );

  if (!evRes.ok) {
    // rollback: rimuovi la prenotazione se l'evento non è stato creato
    await supabase.from("bookings").delete().eq("id", inserted.id);
    return json({ error: "Errore nella creazione dell'evento. Riprova." }, 500);
  }

  const event = await evRes.json();
  await supabase.from("bookings").update({ google_event_id: event.id }).eq("id", inserted.id);

  return json({ ok: true, event_id: event.id });
});
