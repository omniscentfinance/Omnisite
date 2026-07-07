import { supabase } from "@/lib/supabase";

// Storico (ultime 48h) + ranking corrente delle 8 valute major.
// Non passa "action", quindi la Edge Function legge solo dal database
// (il refresh contro Twelve Data lo fa il cron schedulato lato Supabase).
export async function getCurrencyStrength() {
  const { data, error } = await supabase.functions.invoke("currency-strength");
  if (error) throw error;
  return data;
}
