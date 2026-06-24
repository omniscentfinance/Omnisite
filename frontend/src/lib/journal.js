import { supabase } from "@/lib/supabase";

export const BUCKET = "journal";

function ymd(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Trade del mese. Se userId è passato (admin che guarda uno studente) filtra
// per quell'utente; altrimenti RLS limita ai propri trade.
export async function listMonthTrades(year, month, userId = null) {
  const start = ymd(new Date(year, month, 1));
  const end = ymd(new Date(year, month + 1, 1));
  let q = supabase
    .from("trades")
    .select("*")
    .gte("trade_date", start)
    .lt("trade_date", end)
    .order("created_at", { ascending: true });
  if (userId) q = q.eq("user_id", userId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// Tutti i trade (solo data e risultato) per costruire la equity curve.
export async function getAllTrades(userId = null) {
  let q = supabase
    .from("trades")
    .select("trade_date, pnl_amount")
    .order("trade_date", { ascending: true })
    .order("created_at", { ascending: true });
  if (userId) q = q.eq("user_id", userId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// Balance iniziale del conto (dal profilo dell'utente).
export async function getStartBalance(userId) {
  const { data } = await supabase
    .from("profiles")
    .select("journal_start_balance")
    .eq("id", userId)
    .single();
  return Number(data?.journal_start_balance || 0);
}

// Imposta il balance iniziale dell'utente corrente.
export async function setStartBalance(amount) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("profiles")
    .update({ journal_start_balance: amount })
    .eq("id", user.id);
  if (error) throw error;
}

// Elenco studenti (per il selettore admin).
export async function listStudents() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("full_name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createTrade(trade) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("trades").insert({ ...trade, user_id: user.id });
  if (error) throw error;
}

export async function deleteTrade(id) {
  const { error } = await supabase.from("trades").delete().eq("id", id);
  if (error) throw error;
}

// Carica uno screenshot nel bucket e restituisce l'URL pubblico.
export async function uploadImage(file) {
  const { data: { user } } = await supabase.auth.getUser();
  const ext = file.name.split(".").pop();
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function dateKey(date) {
  return ymd(date);
}
