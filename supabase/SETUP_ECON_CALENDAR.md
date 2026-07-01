# Calendario economico custom (gratuito, senza API key)

Tabella pulita (Ora · Paese · Evento · Precedente · Consenso · Effettivo), solo
eventi ad alto impatto. Fonte: feed ForexFactory (FairEconomy) — **gratis, senza
chiave**.

## Deploy della Edge Function
Supabase → **Edge Functions** → nuova function `econ-calendar` → incolla il
contenuto di `functions/econ-calendar/index.ts` → **Deploy**.

Nessun secret da impostare: il feed è pubblico.

## Note
- Prende gli eventi di questa e della prossima settimana e tiene solo `impact = High`.
- **Consenso** = forecast del feed; **Effettivo** viene colorato verde/rosso
  se batte o manca il consenso (disponibile dopo la pubblicazione del dato).
