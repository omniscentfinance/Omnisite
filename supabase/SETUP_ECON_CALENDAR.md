# Calendario economico custom (Financial Modeling Prep)

Sostituisce il widget TradingView con una tabella pulita (Ora · Paese · Evento ·
Precedente · Consenso · Effettivo), solo eventi ad alto impatto.

## 1. API key gratuita
- Registrati su https://site.financialmodelingprep.com/developer/docs
- Copia la tua **API key** dal dashboard.

## 2. Deploy della Edge Function
Supabase → **Edge Functions** → nuova function `econ-calendar` → incolla il
contenuto di `functions/econ-calendar/index.ts` → **Deploy**.

## 3. Secret
Edge Functions → **Secrets** → aggiungi:
- `FMP_API_KEY` = la tua chiave FMP

## Note
- La function prende gli eventi dei prossimi 14 giorni e tiene solo quelli con
  `impact = High`.
- Il campo **Consenso** usa `estimate` di FMP (la previsione di consenso);
  **Effettivo** è colorato verde/rosso se batte o manca il consenso.
- ⚠️ L'endpoint `economic_calendar` su alcuni piani FMP è a pagamento: se la
  chiave gratuita restituisce un errore, la tabella mostrerà "Dati non
  disponibili" e valuteremo un'alternativa.
