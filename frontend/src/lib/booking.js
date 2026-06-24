import { supabase } from "@/lib/supabase";

// Minuti massimi prenotabili al mese per cliente (2 ore)
export const MONTHLY_LIMIT_MIN = 120;
// Durata di una sessione in minuti
export const SLOT_MINUTES = 60;

// Primo e ultimo istante del mese (per query) in formato ISO
function monthRange(year, month) {
  const start = new Date(year, month, 1, 0, 0, 0);
  const end = new Date(year, month + 1, 1, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

// Intervalli occupati dal Google Calendar del mentor (riflette anche le
// cancellazioni manuali): [{ start, end }, ...] in ISO.
export async function getGoogleBusy(year, month) {
  const { start, end } = monthRange(year, month);
  const { data, error } = await supabase.functions.invoke("get-availability", {
    body: { timeMin: start, timeMax: end },
  });
  if (error) throw error;
  return data?.busy ?? [];
}

// Minuti prenotati dall'utente corrente nel mese -> per il limite 2h
export async function getMyMonthMinutes(userId, year, month) {
  const { start, end } = monthRange(year, month);
  const { data, error } = await supabase
    .from("bookings")
    .select("duration_min")
    .eq("user_id", userId)
    .gte("starts_at", start)
    .lt("starts_at", end);
  if (error) throw error;
  return (data ?? []).reduce((sum, b) => sum + (b.duration_min || 0), 0);
}

// Crea una prenotazione. La Edge Function verifica limite + crea l'evento su Google Calendar.
export async function createBooking(startsAtISO) {
  const { data, error } = await supabase.functions.invoke("book-session", {
    body: { starts_at: startsAtISO, duration_min: SLOT_MINUTES },
  });
  if (error) throw error;
  return data;
}
